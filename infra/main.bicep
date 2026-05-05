targetScope = 'subscription'

@description('Environment name (dev or prod)')
@allowed(['dev', 'prod'])
param env string = 'dev'

@description('Azure region')
param location string = 'westeurope'

@description('Project name tag')
param projectTag string = 'plantaviva'

@description('SQL admin password — will be stored in Key Vault')
@secure()
param sqlAdminPassword string

// Resource group
resource rg 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: 'rg-plantaviva-${env}'
  location: location
  tags: {
    project: projectTag
    env: env
    owner: 'paulo'
  }
}

module vnet 'modules/vnet.bicep' = {
  name: 'vnet'
  scope: rg
  params: {
    env: env
    location: location
  }
}

module keyvault 'modules/keyvault.bicep' = {
  name: 'keyvault'
  scope: rg
  params: {
    env: env
    location: location
    tags: rg.tags
  }
}

module storage 'modules/storage.bicep' = {
  name: 'storage'
  scope: rg
  params: {
    env: env
    location: location
    tags: rg.tags
  }
}

module sql 'modules/sql.bicep' = {
  name: 'sql'
  scope: rg
  params: {
    env: env
    location: location
    tags: rg.tags
    kvName: keyvault.outputs.kvName
    adminPassword: sqlAdminPassword
  }
}

module cosmos 'modules/cosmos.bicep' = {
  name: 'cosmos'
  scope: rg
  params: {
    env: env
    location: location
    tags: rg.tags
  }
}

module servicebus 'modules/servicebus.bicep' = {
  name: 'servicebus'
  scope: rg
  params: {
    env: env
    location: location
    tags: rg.tags
  }
}

module redis 'modules/redis.bicep' = {
  name: 'redis'
  scope: rg
  params: {
    env: env
    location: location
    tags: rg.tags
  }
}

module signalr 'modules/signalr.bicep' = {
  name: 'signalr'
  scope: rg
  params: {
    env: env
    location: location
    tags: rg.tags
  }
}

module appservice 'modules/appservice.bicep' = {
  name: 'appservice'
  scope: rg
  params: {
    env: env
    location: location
    tags: rg.tags
    appInsightsConnectionString: appinsights.outputs.connectionString
    vnetSubnetId: vnet.outputs.appServiceSubnetId
  }
}

module containerapps 'modules/containerapps.bicep' = {
  name: 'containerapps'
  scope: rg
  params: {
    env: env
    location: location
    tags: rg.tags
    vnetSubnetId: vnet.outputs.containerAppsSubnetId
    logAnalyticsWorkspaceId: appinsights.outputs.logAnalyticsWorkspaceId
  }
}

module appinsights 'modules/appinsights.bicep' = {
  name: 'appinsights'
  scope: rg
  params: {
    env: env
    location: location
    tags: rg.tags
  }
}

module swa 'modules/staticwebapp.bicep' = {
  name: 'swa'
  scope: rg
  params: {
    env: env
    location: location
    tags: rg.tags
  }
}

module apim 'modules/apim.bicep' = {
  name: 'apim'
  scope: rg
  params: {
    env: env
    location: location
    tags: rg.tags
    appInsightsInstrumentationKey: appinsights.outputs.instrumentationKey
  }
}

module frontdoor 'modules/frontdoor.bicep' = {
  name: 'frontdoor'
  scope: rg
  params: {
    env: env
    tags: rg.tags
    apimHostname: apim.outputs.gatewayHostname
    swaHostname: swa.outputs.hostname
  }
}

module privateendpoints 'modules/privateendpoints.bicep' = if (env == 'prod') {
  name: 'privateendpoints'
  scope: rg
  params: {
    location: location
    tags: rg.tags
    subnetId: vnet.outputs.privateEndpointsSubnetId
    sqlServerId: sql.outputs.sqlServerId
    cosmosAccountId: cosmos.outputs.cosmosAccountId
    storageAccountId: storage.outputs.storageAccountId
    kvId: keyvault.outputs.kvId
  }
}

output resourceGroupName string = rg.name
output keyVaultUri string = keyvault.outputs.kvUri
output appInsightsConnectionString string = appinsights.outputs.connectionString
output swaHostname string = swa.outputs.hostname
output apimGatewayUrl string = apim.outputs.gatewayUrl
output frontDoorEndpoint string = frontdoor.outputs.endpoint
