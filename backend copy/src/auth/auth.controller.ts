import { Controller, Post, Body, UseGuards, Get, Request, UnauthorizedException, NotFoundException, BadRequestException, Query, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './guards/jwt-guard.auth';
import { Request as ExpressRequest } from 'express';

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

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    console.log('Solicitud de recuperación de contraseña para:', body.email);
    
    try {
      const result = await this.authService.forgotPassword(body.email);
      return result;
    } catch (error) {
      console.error('Error completo en forgot-password:', error);
      
      if (error instanceof NotFoundException) {
        // Si el usuario no existe
        return { message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña' };
      }
      
      throw new BadRequestException('Error en la solicitud de recuperación de contraseña');
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    try {
      console.log('Solicitando reseteo de contraseña');
      console.log('Token recibido:', body.token);
      
      const result = await this.authService.resetPassword(body.token, body.newPassword);
      return result;
    } catch (error) {
      console.error('Error en reset-password:', error);
      
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException('Token inválido o expirado');
      }
      
      throw new BadRequestException('Error al restablecer la contraseña');
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
  getProfile(@Request() req: ExpressRequest) {
    return req.user;
  }
}