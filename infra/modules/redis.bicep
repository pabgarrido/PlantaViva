param env string
param location string
param tags object

var cacheName = 'redis-plantaviva-${env}'

resource redisCache 'Microsoft.Cache/redis@2024-03-01' = {
  name: cacheName
  location: location
  tags: tags
  properties: {
    sku: {
      name: env == 'prod' ? 'Standard' : 'Basic'
      family: 'C'
      capacity: env == 'prod' ? 1 : 0
    }
    enableNonSslPort: false
    minimumTlsVersion: '1.2'
    redisConfiguration: {
      'maxmemory-policy': 'allkeys-lru'
    }
  }
}

output redisCacheName string = redisCache.name
output redisHostname string = redisCache.properties.hostName
