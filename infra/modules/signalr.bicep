param env string
param location string
param tags object

var signalrName = 'signalr-plantaviva-${env}'

resource signalr 'Microsoft.SignalRService/signalR@2024-03-01' = {
  name: signalrName
  location: location
  tags: tags
  sku: {
    name: env == 'prod' ? 'Standard_S1' : 'Free_F1'
    capacity: env == 'prod' ? 1 : 1
  }
  properties: {
    features: [
      {
        flag: 'ServiceMode'
        value: 'Default'
      }
    ]
    cors: {
      allowedOrigins: env == 'prod' ? ['https://app.plantaviva.pt'] : ['*']
    }
    publicNetworkAccess: env == 'prod' ? 'Disabled' : 'Enabled'
  }
}

output signalrName string = signalr.name
output signalrHostname string = signalr.properties.hostName
