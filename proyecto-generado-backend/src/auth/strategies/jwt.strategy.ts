import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'default_secret_key',
    });
    
    // Verificar que la clave está disponible
    console.log('JWT Secret configurado:', !!configService.get('JWT_SECRET'));
  }

  async validate(payload: JwtPayload) {
    try {
      const { id } = payload;
      const user = await this.authService.validateUser(id);
      return user;
    } catch (error) {
      throw new UnauthorizedException('Token no válido o expirado');
    }
  }
}