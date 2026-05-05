param location string
param tags object
param subnetId string
param sqlServerId string
param cosmosAccountId string
param storageAccountId string
param kvId string

// Private DNS zones
var dnsZones = {
  sql: 'privatelink${environment().suffixes.sqlServerHostname}'
  cosmos: 'privatelink.documents.azure.com'
  blob: 'privatelink.blob.${environment().suffixes.storage}'
  kv: 'privatelink.vaultcore.azure.net'
}

resource sqlDnsZone 'Microsoft.Network/privateDnsZones@2024-06-01' = {
  name: dnsZones.sql
  location: 'global'
  tags: tags
}

resource cosmosDnsZone 'Microsoft.Network/privateDnsZones@2024-06-01' = {
  name: dnsZones.cosmos
  location: 'global'
  tags: tags
}

resource blobDnsZone 'Microsoft.Network/privateDnsZones@2024-06-01' = {
  name: dnsZones.blob
  location: 'global'
  tags: tags
}

resource kvDnsZone 'Microsoft.Network/privateDnsZones@2024-06-01' = {
  name: dnsZones.kv
  location: 'global'
  tags: tags
}

// Private endpoints
resource sqlPe 'Microsoft.Network/privateEndpoints@2024-01-01' = {
  name: 'pe-sql-plantaviva'
  location: location
  tags: tags
  properties: {
    subnet: {
      id: subnetId
    }
    privateLinkServiceConnections: [
      {
        name: 'sql'
        properties: {
          privateLinkServiceId: sqlServerId
          groupIds: ['sqlServer']
        }
      }
    ]
  }
}

resource cosmosPe 'Microsoft.Network/privateEndpoints@2024-01-01' = {
  name: 'pe-cosmos-plantaviva'
  location: location
  tags: tags
  properties: {
    subnet: {
      id: subnetId
    }
    privateLinkServiceConnections: [
      {
        name: 'cosmos'
        properties: {
          privateLinkServiceId: cosmosAccountId
          groupIds: ['Sql']
        }
      }
    ]
  }
}

resource storagePe 'Microsoft.Network/privateEndpoints@2024-01-01' = {
  name: 'pe-storage-plantaviva'
  location: location
  tags: tags
  properties: {
    subnet: {
      id: subnetId
    }
    privateLinkServiceConnections: [
      {
        name: 'blob'
        properties: {
          privateLinkServiceId: storageAccountId
          groupIds: ['blob']
        }
      }
    ]
  }
}

resource kvPe 'Microsoft.Network/privateEndpoints@2024-01-01' = {
  name: 'pe-kv-plantaviva'
  location: location
  tags: tags
  properties: {
    subnet: {
      id: subnetId
    }
    privateLinkServiceConnections: [
      {
        name: 'kv'
        properties: {
          privateLinkServiceId: kvId
          groupIds: ['vault']
        }
      }
    ]
  }
}

// DNS zone groups for auto-registration
resource sqlDnsGroup 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2024-01-01' = {
  parent: sqlPe
  name: 'default'
  properties: {
    privateDnsZoneConfigs: [
      {
        name: 'sql'
        properties: {
          privateDnsZoneId: sqlDnsZone.id
        }
      }
    ]
  }
}

resource cosmosDnsGroup 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2024-01-01' = {
  parent: cosmosPe
  name: 'default'
  properties: {
    privateDnsZoneConfigs: [
      {
        name: 'cosmos'
        properties: {
          privateDnsZoneId: cosmosDnsZone.id
        }
      }
    ]
  }
}

resource storageDnsGroup 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2024-01-01' = {
  parent: storagePe
  name: 'default'
  properties: {
    privateDnsZoneConfigs: [
      {
        name: 'blob'
        properties: {
          privateDnsZoneId: blobDnsZone.id
        }
      }
    ]
  }
}

resource kvDnsGroup 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2024-01-01' = {
  parent: kvPe
  name: 'default'
  properties: {
    privateDnsZoneConfigs: [
      {
        name: 'kv'
        properties: {
          privateDnsZoneId: kvDnsZone.id
        }
      }
    ]
  }
}
