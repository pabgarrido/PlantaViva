param env string
param location string
param tags object
param adminPasswordSecretUri string

var serverName = 'sql-plantaviva-${env}'
var dbName = 'plantaviva-${env}'

resource sqlServer 'Microsoft.Sql/servers@2023-08-01-preview' = {
  name: serverName
  location: location
  tags: tags
  properties: {
    administratorLogin: 'pvadmin'
    administratorLoginPassword: adminPasswordSecretUri // Will be set via Key Vault ref
    minimalTlsVersion: '1.2'
    publicNetworkAccess: env == 'prod' ? 'Disabled' : 'Enabled'
  }
  identity: {
    type: 'SystemAssigned'
  }
}

resource sqlDb 'Microsoft.Sql/servers/databases@2023-08-01-preview' = {
  parent: sqlServer
  name: dbName
  location: location
  tags: tags
  sku: {
    name: env == 'prod' ? 'GP_Gen5_2' : 'Basic'
    tier: env == 'prod' ? 'GeneralPurpose' : 'Basic'
    capacity: env == 'prod' ? 2 : 5
  }
  properties: {
    collation: 'SQL_Latin1_General_CP1_CI_AS'
    zoneRedundant: false
  }
}

// Allow Azure services for dev only
resource firewallAllowAzure 'Microsoft.Sql/servers/firewallRules@2023-08-01-preview' = if (env == 'dev') {
  parent: sqlServer
  name: 'AllowAllAzureIPs'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

output sqlServerFqdn string = sqlServer.properties.fullyQualifiedDomainName
output sqlDatabaseName string = sqlDb.name
