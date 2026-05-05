"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const applicationinsights_1 = __importDefault(require("applicationinsights"));
const connectionString = process.env['APPLICATIONINSIGHTS_CONNECTION_STRING'];
if (connectionString) {
    applicationinsights_1.default
        .setup(connectionString)
        .setAutoDependencyCorrelation(true)
        .setAutoCollectRequests(true)
        .setAutoCollectPerformance(true)
        .setAutoCollectExceptions(true)
        .setAutoCollectDependencies(true)
        .setAutoCollectConsole(true)
        .start();
    console.log('[core-api] Application Insights initialized');
}
exports.default = applicationinsights_1.default;
//# sourceMappingURL=telemetry.js.map