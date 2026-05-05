import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class B2CAuthGuard implements CanActivate {
    private jwksClient;
    constructor();
    canActivate(context: ExecutionContext): Promise<boolean>;
}
//# sourceMappingURL=b2c-auth.guard.d.ts.map