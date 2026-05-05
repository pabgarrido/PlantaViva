param env string
param location string
param tags object

var swaName = 'swa-plantaviva-${env}'

resource swa 'Microsoft.Web/staticSites@2023-12-01' = {
  name: swaName
  location: location
  tags: tags
  sku: {
    name: env == 'prod' ? 'Standard' : 'Free'
    tier: env == 'prod' ? 'Standard' : 'Free'
  }
  properties: {
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
    buildProperties: {
      appLocation: 'apps/web'
      outputLocation: '.next'
    }
  }
}

output hostname string = swa.properties.defaultHostname
output swaId string = swa.id
