"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const terminus_1 = require("@nestjs/terminus");
const health_controller_1 = require("./health.controller");
describe('HealthController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            imports: [terminus_1.TerminusModule],
            controllers: [health_controller_1.HealthController],
        }).compile();
        controller = module.get(health_controller_1.HealthController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
    it('should return health check result', async () => {
        const result = await controller.check();
        expect(result).toHaveProperty('status');
    });
});
//# sourceMappingURL=health.controller.spec.js.map