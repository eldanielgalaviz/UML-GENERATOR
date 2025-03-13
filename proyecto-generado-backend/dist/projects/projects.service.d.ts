import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import { Horario } from './entities/horario.entity';
export declare class ProjectsService {
    private usuarioRepository;
    private horarioRepository;
    constructor(usuarioRepository: Repository<Usuario>, horarioRepository: Repository<Horario>);
    createUsuario(createUsuarioDto: CreateUsuarioDto): Promise<Usuario>;
    findAllUsuarios(): Promise<Usuario[]>;
    findUsuarioById(id: number): Promise<Usuario>;
    updateUsuario(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario>;
    removeUsuario(id: number): Promise<void>;
    createHorario(createHorarioDto: any): Promise<Horario>;
    findAllHorarios(): Promise<Horario[]>;
    findHorarioById(id: number): Promise<Horario>;
}
