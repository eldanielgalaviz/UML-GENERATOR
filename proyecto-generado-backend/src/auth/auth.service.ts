import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Usuario } from '../usuario/entities/usuario.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<Usuario> {
    const { password, ...userData } = registerDto;

    const usuario = this.usuarioRepository.create({
      ...userData,
      password: bcrypt.hashSync(password, 10),
    });

    return this.usuarioRepository.save(usuario);
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const usuario = await this.usuarioRepository.findOne({
      where: { email },
      select: ['email', 'password', 'id', 'nombre']
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (!bcrypt.compareSync(password, usuario.password)) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const payload = { id: usuario.id, email: usuario.email, nombre: usuario.nombre };
    const token = this.jwtService.sign(payload);

    return {
      token: token,
      user: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
      }
    };
  }

  async validateUser(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOneBy({ id });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    delete usuario.password;
    return usuario;
  }
}
