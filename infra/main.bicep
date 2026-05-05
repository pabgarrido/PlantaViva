targetScope = 'subscription'

@description('Environment name (dev or prod)')
@allowed(['dev', 'prod'])
param env string = 'dev'

@description('Azure region')
param location string = 'westeurope'

@description('Project name tag')
param projectTag string = 'plantaviva'

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
    adminPasswordSecretUri: keyvault.outputs.kvUri
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
  }
}

output resourceGroupName string = rg.name
output keyVaultUri string = keyvault.outputs.kvUri
