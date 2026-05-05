param env string
param location string
param tags object

var accountName = 'cosmos-plantaviva-${env}'

resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2024-05-15' = {
  name: accountName
  location: location
  tags: tags
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    capabilities: env == 'dev' ? [{ name: 'EnableServerless' }] : []
    publicNetworkAccess: env == 'prod' ? 'Disabled' : 'Enabled'
    enableAutomaticFailover: false
    disableKeyBasedMetadataWriteAccess: true
  }
}

resource cosmosDb 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2024-05-15' = {
  parent: cosmosAccount
  name: 'plantaviva'
  properties: {
    resource: {
      id: 'plantaviva'
    }
    options: env == 'prod' ? {
      autoscaleSettings: {
        maxThroughput: 4000
      }
    } : {}
  }
}

// Collections
resource scenesContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-05-15' = {
  parent: cosmosDb
  name: 'scenes'
  properties: {
    resource: {
      id: 'scenes'
      partitionKey: {
        paths: ['/projectId']
        kind: 'Hash'
      }
    }
  }
}

resource commentsContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-05-15' = {
  parent: cosmosDb
  name: 'comments'
  properties: {
    resource: {
      id: 'comments'
      partitionKey: {
        paths: ['/projectId']
        kind: 'Hash'
      }
    }
  }
}

resource sharesContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-05-15' = {
  parent: cosmosDb
  name: 'shares'
  properties: {
    resource: {
      id: 'shares'
      partitionKey: {
        paths: ['/projectId']
        kind: 'Hash'
      }
    }
  }
}

output cosmosAccountName string = cosmosAccount.name
output cosmosEndpoint string = cosmosAccount.properties.documentEndpoint
