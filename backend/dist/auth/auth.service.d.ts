import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from './email.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private emailService;
    constructor(usersService: UsersService, jwtService: JwtService, emailService: EmailService);
    validateToken(token: string): Promise<any>;
    register(createUserDto: any): Promise<{
        message: string;
        userId: number;
    }>;
    catch(error: unknown): void;
    confirmEmail(token: string): Promise<{
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    validateUser(username: string, password: string): Promise<any>;
    login(loginDto: {
        username: string;
        password: string;
    }): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            username: any;
            nombre: any;
        };
    }>;
}
