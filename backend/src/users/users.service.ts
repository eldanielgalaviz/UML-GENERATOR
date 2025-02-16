import { Injectable, ConflictException, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { PasswordValidator } from '../auth/password.validator';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Validar email y username por separado para dar mensajes más específicos
      const existingEmail = await this.usersRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (existingEmail) {
        throw new ConflictException('El email ya está registrado');
      }

      const existingUsername = await this.usersRepository.findOne({
        where: { username: createUserDto.username },
      });

      if (existingUsername) {
        throw new ConflictException('El nombre de usuario ya está en uso');
      }

      if (createUserDto.password !== createUserDto.confirmPassword) {
        console.log('Password:', createUserDto.password);
        console.log('Confirm Password:', createUserDto.confirmPassword);
        throw new BadRequestException('Las contraseñas no coinciden');
      }

      // Validar requisitos de contraseña
      PasswordValidator.validate(createUserDto.password);

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

  
        // Eliminar confirmPassword antes de crear el usuario
        const { confirmPassword, ...userData } = createUserDto;
        
        const user = this.usersRepository.create({
          ...userData,
          password: hashedPassword,
          isEmailConfirmed: false,
        });

      return await this.usersRepository.save(user);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear el usuario');
    }
  }

  async findOne(id: number): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({ 
        where: { id },
        select: ['id', 'email', 'username', 'nombre', 'isEmailConfirmed'] // No devolver datos sensibles
      });
      
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
      
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al buscar el usuario');
    }
  }

  async findByUsername(username: string): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({ where: { username }, select: ['id', 'email', 'username', 'password', 'nombre', 'isEmailConfirmed'] });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al buscar el usuario');
    }
  }

  async findByEmail(email: string): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({ where: { email } });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al buscar el usuario');
    }
  }

  async findByConfirmationToken(token: string): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({ 
        where: { confirmationToken: token } 
      });
      
      if (!user) {
        throw new NotFoundException('Token de confirmación inválido');
      }
      
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al verificar el token');
    }
  }

  async findByResetToken(token: string): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({ 
        where: { 
          passwordResetToken: token,
          passwordResetExpires: MoreThan(new Date()) // Verifica que el token no haya expirado
        } 
      });
      
      if (!user) {
        throw new NotFoundException('Token de recuperación inválido o expirado');
      }
      
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al verificar el token');
    }
  }

  async update(id: number, updateData: Partial<User>): Promise<void> {
    try {
      const result = await this.usersRepository.update(id, updateData);
      
      if (result.affected === 0) {
        throw new NotFoundException('Usuario no encontrado');
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar el usuario');
    }
  }
}