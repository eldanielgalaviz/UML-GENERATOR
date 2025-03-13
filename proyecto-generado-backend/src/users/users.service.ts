import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../entities/user.entity';
import { JefeDeGrupo } from './entities/jefe-de-grupo.entity';
import { Profesor } from '../entities/profesor.entity';
import { Alumno } from './entities/alumno.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(JefeDeGrupo) private jefeDeGrupoRepository: Repository<JefeDeGrupo>,
    @InjectRepository(Profesor) private profesorRepository: Repository<Profesor>,
    @InjectRepository(Alumno) private alumnoRepository: Repository<Alumno>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    this.userRepository.merge(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

// src/users/users.service.ts (solo las funciones con errores)

async createJefeDeGrupo(createUserDto: CreateUserDto): Promise<JefeDeGrupo> {
  // Primero crear un usuario
  const user = await this.create(createUserDto);
  
  // Luego crear el jefe de grupo asociado
  const jefeDeGrupo = this.jefeDeGrupoRepository.create({
    user: user
  });
  
  return this.jefeDeGrupoRepository.save(jefeDeGrupo);
}

async createProfesor(createUserDto: CreateUserDto): Promise<Profesor> {
  // Primero crear un usuario
  const user = await this.create(createUserDto);
  
  // Luego crear el profesor asociado
  const profesor = this.profesorRepository.create({
    user: user
  });
  
  return this.profesorRepository.save(profesor);
}

async createAlumno(createUserDto: CreateUserDto): Promise<Alumno> {
  // Primero crear un usuario
  const user = await this.create(createUserDto);
  
  // Luego crear el alumno asociado
  const alumno = this.alumnoRepository.create({
    user: user
  });
  
  return this.alumnoRepository.save(alumno);
}
}
