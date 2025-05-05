import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { Request as ExpressRequest } from 'express';
export declare class AuthController {
    private authService;
    private usersService;
    private readonly logger;
    constructor(authService: AuthService, usersService: UsersService);
    register(createUserDto: CreateUserDto): Promise<{
        message: string;
        userId: number;
    }>;
    forgotPassword(body: {
        email: string;
    }): Promise<{
        message: string;
    }>;
    resetPassword(body: {
        token: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
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
    confirmEmail(token: string): Promise<{
        message: string;
    }>;
    getProfile(req: ExpressRequest): Express.User | undefined;
}
