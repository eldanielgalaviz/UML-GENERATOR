import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { Request as ExpressRequest } from 'express';
export declare class AuthController {
    private authService;
    private usersService;
    private readonly logger;
    constructor(authService: AuthService, usersService: UsersService);
    register(createUserDto: CreateUserDto): Promise<any>;
    forgotPassword(body: {
        email: string;
    }): Promise<any>;
    resetPassword(body: {
        token: string;
        newPassword: string;
    }): Promise<any>;
    login(loginDto: {
        username: string;
        password: string;
    }): Promise<any>;
    confirmEmail(token: string): Promise<any>;
    getProfile(req: ExpressRequest): Express.User | undefined;
}
