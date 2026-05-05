param env string
param location string
param tags object

var planName = 'asp-plantaviva-${env}'
var coreApiName = 'app-pv-core-api-${env}'
var deliveryApiName = 'app-pv-delivery-api-${env}'

resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: planName
  location: location
  tags: tags
  sku: {
    name: env == 'prod' ? 'P1v3' : 'B1'
    tier: env == 'prod' ? 'PremiumV3' : 'Basic'
  }
  properties: {
    reserved: true // Linux
  }
  kind: 'linux'
}

resource coreApi 'Microsoft.Web/sites@2023-12-01' = {
  name: coreApiName
  location: location
  tags: tags
  kind: 'app,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      alwaysOn: env == 'prod'
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      appSettings: [
        {
          name: 'NODE_ENV'
          value: env == 'prod' ? 'production' : 'development'
        }
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1'
        }
        {
          name: 'FEATURE_PDF_PARSER'
          value: 'false'
        }
        {
          name: 'FEATURE_VIDEO'
          value: 'false'
        }
        {
          name: 'FEATURE_PREMIUM_RENDER'
          value: 'false'
        }
      ]
    }
  }
}

resource deliveryApi 'Microsoft.Web/sites@2023-12-01' = {
  name: deliveryApiName
  location: location
  tags: tags
  kind: 'app,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      alwaysOn: env == 'prod'
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      appSettings: [
        {
          name: 'NODE_ENV'
          value: env == 'prod' ? 'production' : 'development'
        }
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1'
        }
        {
          name: 'FEATURE_PDF_PARSER'
          value: 'false'
        }
        {
          name: 'FEATURE_VIDEO'
          value: 'false'
        }
        {
          name: 'FEATURE_PREMIUM_RENDER'
          value: 'false'
        }
      ]
    }
  }
}

output appServicePlanId string = appServicePlan.id
output coreApiHostname string = coreApi.properties.defaultHostName
output deliveryApiHostname string = deliveryApi.properties.defaultHostName
output coreApiPrincipalId string = coreApi.identity.principalId
output deliveryApiPrincipalId string = deliveryApi.identity.principalId
