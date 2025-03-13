import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../entities/user.entity';
import { JefeDeGrupo } from './entities/jefe-de-grupo.entity';
import { Profesor } from '../entities/profesor.entity';
import { Alumno } from './entities/alumno.entity';
export declare class UsersService {
    private userRepository;
    private jefeDeGrupoRepository;
    private profesorRepository;
    private alumnoRepository;
    constructor(userRepository: Repository<User>, jefeDeGrupoRepository: Repository<JefeDeGrupo>, profesorRepository: Repository<Profesor>, alumnoRepository: Repository<Alumno>);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: number): Promise<User>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<User>;
    remove(id: number): Promise<void>;
    createJefeDeGrupo(createUserDto: CreateUserDto): Promise<JefeDeGrupo>;
    createProfesor(createUserDto: CreateUserDto): Promise<Profesor>;
    createAlumno(createUserDto: CreateUserDto): Promise<Alumno>;
}
