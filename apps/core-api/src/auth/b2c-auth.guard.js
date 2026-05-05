"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.B2CAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt = __importStar(require("jsonwebtoken"));
const jwksRsa = __importStar(require("jwks-rsa"));
let B2CAuthGuard = class B2CAuthGuard {
    jwksClient;
    constructor() {
        const tenant = process.env['AZURE_B2C_TENANT'] ?? '';
        const policy = process.env['AZURE_B2C_POLICY'] ?? 'B2C_1_signup_signin';
        this.jwksClient = jwksRsa({
            jwksUri: `https://${tenant}.b2clogin.com/${tenant}.onmicrosoft.com/${policy}/discovery/v2.0/keys`,
            cache: true,
            cacheMaxAge: 600000,
        });
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('Missing or invalid Authorization header');
        }
        const token = authHeader.slice(7);
        try {
            const decoded = jwt.decode(token, { complete: true });
            if (!decoded || typeof decoded === 'string') {
                throw new common_1.UnauthorizedException('Invalid token');
            }
            const key = await this.jwksClient.getSigningKey(decoded.header.kid);
            const signingKey = key.getPublicKey();
            const audience = process.env['AZURE_B2C_CLIENT_ID'] ?? '';
            const tenant = process.env['AZURE_B2C_TENANT'] ?? '';
            const policy = process.env['AZURE_B2C_POLICY'] ?? 'B2C_1_signup_signin';
            const issuer = `https://${tenant}.b2clogin.com/${tenant}.onmicrosoft.com/${policy}/v2.0/`;
            const payload = jwt.verify(token, signingKey, {
                algorithms: ['RS256'],
                audience,
                issuer,
            });
            request.user = payload;
            return true;
        }
        catch (err) {
            throw new common_1.UnauthorizedException('Token validation failed');
        }
    }
};
exports.B2CAuthGuard = B2CAuthGuard;
exports.B2CAuthGuard = B2CAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], B2CAuthGuard);
//# sourceMappingURL=b2c-auth.guard.js.map