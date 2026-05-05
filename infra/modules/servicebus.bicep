param env string
param location string
param tags object

var nsName = 'sb-plantaviva-${env}'

resource sbNamespace 'Microsoft.ServiceBus/namespaces@2023-01-01-preview' = {
  name: nsName
  location: location
  tags: tags
  sku: {
    name: env == 'prod' ? 'Standard' : 'Basic'
    tier: env == 'prod' ? 'Standard' : 'Basic'
  }
  properties: {}
}

// Topics (Standard tier only)
resource parseJobsTopic 'Microsoft.ServiceBus/namespaces/topics@2023-01-01-preview' = if (env == 'prod') {
  parent: sbNamespace
  name: 'parse-jobs'
  properties: {
    defaultMessageTimeToLive: 'PT1H'
    maxSizeInMegabytes: 1024
    requiresDuplicateDetection: true
  }
}

resource renderJobsTopic 'Microsoft.ServiceBus/namespaces/topics@2023-01-01-preview' = if (env == 'prod') {
  parent: sbNamespace
  name: 'render-jobs'
  properties: {
    defaultMessageTimeToLive: 'PT2H'
    maxSizeInMegabytes: 1024
    requiresDuplicateDetection: true
  }
}

resource videoJobsTopic 'Microsoft.ServiceBus/namespaces/topics@2023-01-01-preview' = if (env == 'prod') {
  parent: sbNamespace
  name: 'video-jobs'
  properties: {
    defaultMessageTimeToLive: 'PT4H'
    maxSizeInMegabytes: 1024
    requiresDuplicateDetection: true
  }
}

// Queues for dev (Basic tier doesn't support topics)
resource parseJobsQueue 'Microsoft.ServiceBus/namespaces/queues@2023-01-01-preview' = if (env == 'dev') {
  parent: sbNamespace
  name: 'parse-jobs'
  properties: {
    defaultMessageTimeToLive: 'PT1H'
    deadLetteringOnMessageExpiration: true
    maxDeliveryCount: 2
  }
}

resource renderJobsQueue 'Microsoft.ServiceBus/namespaces/queues@2023-01-01-preview' = if (env == 'dev') {
  parent: sbNamespace
  name: 'render-jobs'
  properties: {
    defaultMessageTimeToLive: 'PT2H'
    deadLetteringOnMessageExpiration: true
    maxDeliveryCount: 2
  }
}

resource videoJobsQueue 'Microsoft.ServiceBus/namespaces/queues@2023-01-01-preview' = if (env == 'dev') {
  parent: sbNamespace
  name: 'video-jobs'
  properties: {
    defaultMessageTimeToLive: 'PT4H'
    deadLetteringOnMessageExpiration: true
    maxDeliveryCount: 2
  }
}

output serviceBusNamespaceName string = sbNamespace.name
output serviceBusEndpoint string = sbNamespace.properties.serviceBusEndpoint
