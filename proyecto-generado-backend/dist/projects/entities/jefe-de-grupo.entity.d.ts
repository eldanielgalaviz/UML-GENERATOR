import { Usuario } from './usuario.entity';
import { Horario } from './horario.entity';
import { Asistencia } from './asistencia.entity';
import { Actividad } from './actividad.entity';
export declare class JefeDeGrupo {
    id: number;
    usuario: Usuario;
    horarios: Horario[];
    asistencias: Asistencia[];
    actividades: Actividad[];
}
