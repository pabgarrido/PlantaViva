import appInsights from 'applicationinsights';

const connectionString = process.env['APPLICATIONINSIGHTS_CONNECTION_STRING'];

if (connectionString) {
  appInsights
    .setup(connectionString)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true)
    .start();
  console.log('[delivery-api] Application Insights initialized');
}

export default appInsights;
