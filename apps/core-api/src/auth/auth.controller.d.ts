import { AuthUser } from './current-user.decorator';
export declare class AuthController {
    getMe(user: AuthUser): {
        sub: string;
        email: string | undefined;
        name: string | undefined;
    };
}
//# sourceMappingURL=auth.controller.d.ts.map