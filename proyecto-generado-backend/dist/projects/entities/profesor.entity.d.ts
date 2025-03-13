import { Usuario } from './usuario.entity';
import { Asistencia } from './asistencia.entity';
import { Horario } from './horario.entity';
export declare class Profesor {
    id: number;
    usuario: Usuario;
    asistencias: Asistencia[];
    horarios: Horario[];
}
