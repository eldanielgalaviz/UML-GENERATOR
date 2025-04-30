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
    this.logger.debug('Recibida petición de registro:');
    this.logger.debug(createUserDto.email);
    
    // Verificación adicional de contraseñas en el controlador
    if (createUserDto.password !== createUserDto.confirmPassword) {
      this.logger.warn('Contraseñas no coinciden en la verificación del controlador');
      this.logger.debug(`Password: ${createUserDto.password}`);
      this.logger.debug(`ConfirmPassword: ${createUserDto.confirmPassword}`);
      throw new BadRequestException('Las contraseñas no coinciden');
    }
    
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
    this.logger.debug('Solicitud de recuperación de contraseña para:', body.email);
    
    try {
      const result = await this.authService.forgotPassword(body.email);
      return result;
    } catch (error) {
      this.logger.error('Error en forgot-password:', error);
      
      if (error instanceof NotFoundException) {
        // Por seguridad, no revelamos si el email existe o no
        return { message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña' };
      }
      
      throw new BadRequestException('Error en la solicitud de recuperación de contraseña');
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    try {
      this.logger.debug('Solicitando reseteo de contraseña');
      this.logger.debug('Token recibido (longitud):', body.token?.length);
      
      const result = await this.authService.resetPassword(body.token, body.newPassword);
      return result;
    } catch (error) {
      this.logger.error('Error en reset-password:', error);
      
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException('Token inválido o expirado');
      }
      
      throw new BadRequestException('Error al restablecer la contraseña');
    }
  }

  @Post('login')
  async login(@Body() loginDto: { username: string; password: string }) {
    try {
      this.logger.log(`Intento de inicio de sesión: ${loginDto.username}`);
      
      const result = await this.authService.login({
        username: loginDto.username,
        password: loginDto.password
      });
      
      this.logger.log(`¡LOGIN EXITOSO! El usuario ${loginDto.username} pudo acceder correctamente`);
      
      return result;
    } catch (error) {
      this.logger.warn(`Intento de inicio de sesión fallido para ${loginDto.username}: ${error.message}`);
      throw error;
    }
  }
  
  @Get('confirm')
  async confirmEmail(@Query('token') token: string) {
    this.logger.debug('Recibida petición de confirmación de email');
    return this.authService.confirmEmail(token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: ExpressRequest & { user?: { username: string } }) {
    const user = req.user;
    if (!user || !user.username) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    this.logger.log(`Usuario ${user.username} ha accedido a su perfil`);
    return user;
  }
}