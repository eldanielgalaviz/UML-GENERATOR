import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from './email.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { create } from 'domain';

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

async register(createUserDto: any) {
  // Generar token de confirmación
  const confirmationToken = crypto.randomBytes(32).toString('hex');
  console.log('Token generado:', confirmationToken);
  const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
  console.log('Contraseña hasheada:', hashedPassword);
  console.log('Longitud del hash:', hashedPassword.length);
    // Hash de la contraseña
  
  
  // Crear usuario con token de confirmación
  const user = await this.usersService.create({
    
    ...createUserDto,
    password: createUserDto.password,
    confirmationToken,
    isEmailConfirmed: false,
  });
  console.log('Usuario creado:', { id: user.id, email: user.email });

   // Enviar email de confirmación
   console.log('Intentando enviar email de confirmación');
   await this.emailService.sendConfirmationEmail(user.email, confirmationToken);
   console.log('Email de confirmación enviado');

   return { 
    message: 'Por favor, verifica tu correo electrónico para completar el registro',
    userId: user.id 
  };
} catch (error) {
  console.error('Error en el proceso de registro:', error);
  throw error;
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

      console.log('Usuario encontrado:', user);
      if (!user) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      // Verificar si el email está confirmado
      if (!user.isEmailConfirmed) {
        throw new UnauthorizedException('Por favor verifica tu correo electrónico antes de iniciar sesión');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      
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

  return {
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