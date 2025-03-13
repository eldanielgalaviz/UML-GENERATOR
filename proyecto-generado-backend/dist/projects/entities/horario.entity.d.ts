import { JefeDeGrupo } from './jefe-de-grupo.entity';
import { Profesor } from './profesor.entity';
export declare class Horario {
    id: number;
    grupo: string;
    clase: string;
    horaInicio: string;
    horaFin: string;
    jefeDeGrupo: JefeDeGrupo;
    profesor: Profesor;
}
