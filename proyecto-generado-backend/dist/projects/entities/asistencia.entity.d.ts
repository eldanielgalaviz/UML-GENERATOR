import { JefeDeGrupo } from './jefe-de-grupo.entity';
import { Profesor } from './profesor.entity';
export declare class Asistencia {
    id: number;
    fecha: Date;
    presente: boolean;
    jefeDeGrupo: JefeDeGrupo;
    profesor: Profesor;
}
