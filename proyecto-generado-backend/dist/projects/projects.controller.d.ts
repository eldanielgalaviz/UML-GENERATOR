import { ProjectsService } from './projects.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(createUsuarioDto: CreateUsuarioDto): Promise<import("./entities/usuario.entity").Usuario>;
    findAll(): Promise<import("./entities/usuario.entity").Usuario[]>;
    findOne(id: string): Promise<import("./entities/usuario.entity").Usuario>;
    update(id: string, updateUsuarioDto: UpdateUsuarioDto): Promise<import("./entities/usuario.entity").Usuario>;
    remove(id: string): Promise<void>;
    createHorario(createHorarioDto: any): Promise<import("./entities/horario.entity").Horario>;
    findAllHorarios(): Promise<import("./entities/horario.entity").Horario[]>;
    findHorario(id: string): Promise<import("./entities/horario.entity").Horario>;
}
