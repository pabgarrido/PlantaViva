param env string
param location string
param tags object
param vnetSubnetId string

var envName = 'cae-plantaviva-${env}'
var parserWorkerName = 'ca-pv-parser-${env}'
var renderWorkerName = 'ca-pv-render-${env}'

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: 'log-plantaviva-${env}'
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: env == 'prod' ? 90 : 30
  }
}

resource containerAppsEnv 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: envName
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
    vnetConfiguration: {
      internal: env == 'prod'
      infrastructureSubnetId: vnetSubnetId
    }
    workloadProfiles: env == 'prod' ? [
      {
        name: 'Consumption'
        workloadProfileType: 'Consumption'
      }
      {
        name: 'gpu-profile'
        workloadProfileType: 'NC24-A100'
        minimumCount: 0
        maximumCount: 10
      }
    ] : [
      {
        name: 'Consumption'
        workloadProfileType: 'Consumption'
      }
    ]
  }
}

resource parserWorker 'Microsoft.App/containerApps@2024-03-01' = {
  name: parserWorkerName
  location: location
  tags: tags
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    environmentId: containerAppsEnv.id
    configuration: {
      ingress: {
        external: false
        targetPort: 8000
        transport: 'http'
      }
    }
    template: {
      containers: [
        {
          name: 'parser-worker'
          image: 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            {
              name: 'FEATURE_PDF_PARSER'
              value: 'false'
            }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 5
        rules: [
          {
            name: 'servicebus-scale'
            custom: {
              type: 'azure-servicebus'
              metadata: {
                queueName: 'parse-jobs'
                messageCount: '2'
              }
            }
          }
        ]
      }
    }
  }
}

resource renderWorker 'Microsoft.App/containerApps@2024-03-01' = {
  name: renderWorkerName
  location: location
  tags: tags
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    environmentId: containerAppsEnv.id
    workloadProfileName: env == 'prod' ? 'gpu-profile' : 'Consumption'
    configuration: {
      ingress: {
        external: false
        targetPort: 8000
        transport: 'http'
      }
    }
    template: {
      containers: [
        {
          name: 'render-worker'
          image: 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
          resources: {
            cpu: json(env == 'prod' ? '24' : '0.5')
            memory: env == 'prod' ? '220Gi' : '1Gi'
          }
          env: [
            {
              name: 'FEATURE_PREMIUM_RENDER'
              value: 'false'
            }
            {
              name: 'FEATURE_VIDEO'
              value: 'false'
            }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 10
        rules: [
          {
            name: 'servicebus-scale'
            custom: {
              type: 'azure-servicebus'
              metadata: {
                queueName: 'render-jobs'
                messageCount: '2'
              }
            }
          }
        ]
      }
    }
  }
}

output containerAppsEnvName string = containerAppsEnv.name
output parserWorkerFqdn string = parserWorker.properties.configuration.ingress.fqdn
output renderWorkerFqdn string = renderWorker.properties.configuration.ingress.fqdn
