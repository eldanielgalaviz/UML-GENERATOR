import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<import("../entities/user.entity").User>;
    findAll(): Promise<import("../entities/user.entity").User[]>;
    findOne(id: string): Promise<import("../entities/user.entity").User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<import("../entities/user.entity").User>;
    remove(id: string): Promise<void>;
    createJefeDeGrupo(createUserDto: CreateUserDto): Promise<import("./entities/jefe-de-grupo.entity").JefeDeGrupo>;
    createProfesor(createUserDto: CreateUserDto): Promise<import("../entities/profesor.entity").Profesor>;
    createAlumno(createUserDto: CreateUserDto): Promise<import("./entities/alumno.entity").Alumno>;
}
