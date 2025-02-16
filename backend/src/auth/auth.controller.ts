import { Controller, Post, Body, UseGuards, Get, Request, UnauthorizedException, Query, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './guards/jwt-guard.auth';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    this.logger.debug('Recibida petición de registro:', createUserDto.email);
    try {
      const result = await this.authService.register(createUserDto);
      this.logger.debug('Registro exitoso');
      return result;
    } catch (error) {
      this.logger.error('Error en registro:', error);
      throw error;
    }
  }

  @Post('login')
  async login(@Body() loginDto: { username: string; password: string }) {
    
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return this.authService.login({
      username: loginDto.username,
      password: loginDto.password
    });
  }
  
  @Get('confirm')
  async confirmEmail(@Query('token') token: string) {
    this.logger.debug('Recibida petición de confirmación de email');
    return this.authService.confirmEmail(token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}