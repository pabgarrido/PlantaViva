param env string
param location string
param tags object
param appInsightsInstrumentationKey string

var apimName = 'apim-plantaviva-${env}'

resource apim 'Microsoft.ApiManagement/service@2023-09-01-preview' = {
  name: apimName
  location: location
  tags: tags
  sku: {
    name: env == 'prod' ? 'StandardV2' : 'Developer'
    capacity: 1
  }
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    publisherEmail: 'admin@plantaviva.pt'
    publisherName: 'PlantaViva'
  }
}

resource apimLogger 'Microsoft.ApiManagement/service/loggers@2023-09-01-preview' = {
  parent: apim
  name: 'appinsights'
  properties: {
    loggerType: 'applicationInsights'
    credentials: {
      instrumentationKey: appInsightsInstrumentationKey
    }
  }
}

output gatewayUrl string = apim.properties.gatewayUrl
output gatewayHostname string = replace(replace(apim.properties.gatewayUrl, 'https://', ''), '/', '')
output apimPrincipalId string = apim.identity.principalId
