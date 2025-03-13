import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import { Horario } from './entities/horario.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Usuario) private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Horario) private horarioRepository: Repository<Horario>,
  ) {}

  async createUsuario(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const usuario = this.usuarioRepository.create(createUsuarioDto);
    return this.usuarioRepository.save(usuario);
  }

  async findAllUsuarios(): Promise<Usuario[]> {
    return this.usuarioRepository.find();
  }

  async findUsuarioById(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOneBy({ id });
    if (!usuario) {
      throw new NotFoundException(`Usuario with ID "${id}" not found`);
    }
    return usuario;
  }

  async updateUsuario(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.findUsuarioById(id);
    Object.assign(usuario, updateUsuarioDto);
    return this.usuarioRepository.save(usuario);
  }

  async removeUsuario(id: number): Promise<void> {
    const usuario = await this.findUsuarioById(id);
    await this.usuarioRepository.remove(usuario);
  }

// Dentro de src/projects/projects.service.ts

async createHorario(createHorarioDto: any): Promise<Horario> {
  const horario = this.horarioRepository.create(createHorarioDto);
  return await this.horarioRepository.save(horario as any); // Usar tipo any para superar el error temporalmente
}

  async findAllHorarios(): Promise<Horario[]> {
      return this.horarioRepository.find();
  }

  async findHorarioById(id: number): Promise<Horario> {
      const horario = await this.horarioRepository.findOneBy({ id });
      if (!horario) {
          throw new NotFoundException(`Horario with ID "${id}" not found`);
      }
      return horario;
  }

  // Implement methods for JefeDeGrupo, Profesor, Alumno, Asistencia, Actividad
}
