param env string
param location string
param tags object

// Key Vault name must be globally unique, 3-24 chars
var kvName = 'kv-pv-${env}-${uniqueString(resourceGroup().id)}'

resource kv 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: kvName
  location: location
  tags: tags
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
    enablePurgeProtection: true
    publicNetworkAccess: env == 'prod' ? 'Disabled' : 'Enabled'
    networkAcls: env == 'prod' ? {
      defaultAction: 'Deny'
      bypass: 'AzureServices'
    } : null
  }
}

output kvName string = kv.name
output kvUri string = kv.properties.vaultUri
output kvId string = kv.id
