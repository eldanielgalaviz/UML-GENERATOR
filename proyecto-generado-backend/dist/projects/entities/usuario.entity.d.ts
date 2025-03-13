import { JefeDeGrupo } from './jefe-de-grupo.entity';
import { Profesor } from './profesor.entity';
import { Alumno } from './alumno.entity';
export declare class Usuario {
    id: number;
    nombre: string;
    email: string;
    password: string;
    jefesDeGrupo: JefeDeGrupo[];
    profesores: Profesor[];
    alumnos: Alumno[];
}
