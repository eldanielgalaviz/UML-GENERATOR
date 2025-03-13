import { JefeDeGrupo } from './jefe-de-grupo.entity';
import { Profesor } from './profesor.entity';
import { Alumno } from './alumno.entity';
export declare class User {
    id: number;
    nombre: string;
    email: string;
    password: string;
    jefeDeGrupo: JefeDeGrupo[];
    profesor: Profesor[];
    alumno: Alumno[];
}
