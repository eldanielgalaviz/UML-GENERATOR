import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from './email.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}    

  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  async register(createUserDto: CreateUserDto) {
    try {
      // Debug para verificar qué datos estamos recibiendo
      console.log('Datos recibidos para registro:', JSON.stringify(createUserDto, null, 2));
      
      // Verificar explícitamente si las contraseñas coinciden
      if (createUserDto.password !== createUserDto.confirmPassword) {
        console.log('Password:', createUserDto.password);
        console.log('Confirm Password:', createUserDto.confirmPassword);
        throw new BadRequestException('Las contraseñas no coinciden');
      }
      
      // Generar token de confirmación
      const confirmationToken = crypto.randomBytes(32).toString('hex');
      console.log('Token generado:', confirmationToken);
      
      // Crear usuario (el servicio de usuarios se encargará de hashear la contraseña)
      const user = await this.usersService.create({
        ...createUserDto,
        confirmationToken,
        // Para pruebas locales, marcamos como confirmado
        isEmailConfirmed: true,
      });
      
      console.log('Usuario creado:', { id: user.id, email: user.email });

      // Enviar email de confirmación
      console.log('Intentando enviar email de confirmación');
      try {
        await this.emailService.sendConfirmationEmail(user.email, confirmationToken);
        console.log('Email de confirmación enviado');
      } catch (emailError) {
        console.error('Error al enviar email, pero el usuario fue creado:', emailError);
        // No lanzamos el error para permitir el registro aunque el email falle
      }

      return { 
        message: 'Usuario registrado correctamente. Ya puedes iniciar sesión.',
        userId: user.id 
      };
    } catch (error) {
      console.error('Error en el proceso de registro:', error);
      throw error;
    }
  }

  async confirmEmail(token: string) {
    try {
      const user = await this.usersService.findByConfirmationToken(token);
      
      if (!user) {
        throw new UnauthorizedException('Token de verificación inválido');
      }

      await this.usersService.update(user.id, {
        isEmailConfirmed: true,
        confirmationToken: null,
      });

      return { message: 'Email verificado correctamente' };
    } catch (error) {
      console.error('Error en confirmación de email:', error);
      throw error;
    }
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return { message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetExpires = new Date();
    passwordResetExpires.setHours(passwordResetExpires.getHours() + 1);

    await this.usersService.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires,
    });

    await this.emailService.sendPasswordResetEmail(email, resetToken);

    return { message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByResetToken(token);
    
    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    // Hash nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar usuario
    await this.usersService.update(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null
    });

    return { message: 'Contraseña actualizada correctamente' };
  }

  async validateUser(username: string, password: string): Promise<any> {
    try {
      console.log('Intentando validar usuario:', username);
      const user = await this.usersService.findByUsername(username);

      console.log('Usuario encontrado:', user ? user.id : 'no encontrado');
      
      if (!user) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      // COMENTADO PARA PRUEBAS LOCALES
      // Verificar si el email está confirmado
      // if (!user.isEmailConfirmed) {
      //   throw new UnauthorizedException('Por favor verifica tu correo electrónico antes de iniciar sesión');
      // }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('¿Contraseña válida?', isPasswordValid);
      
      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      console.error('Error en validación:', error);
      throw error;
    }
  }

  async login(loginDto: { username: string; password: string }) {
    console.log('Datos de login recibidos:', loginDto);
    const user = await this.validateUser(loginDto.username, loginDto.password);

    const payload = {
      email: user.email,
      sub: user.id,
      username: user.username,
      nombre: user.nombre
    };

    // Registrar acceso exitoso
    console.log(`¡Acceso exitoso! El usuario ${user.username} (${user.email}) ha iniciado sesión correctamente`);

    return {
      message: `¡Bienvenido ${user.nombre || user.username}! Has iniciado sesión correctamente`,
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        nombre: user.nombre
      }
    };
  }
}