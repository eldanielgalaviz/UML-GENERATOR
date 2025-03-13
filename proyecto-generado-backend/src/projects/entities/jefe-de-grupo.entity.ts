import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Usuario } from './usuario.entity';
import { Horario } from './horario.entity';
import { Asistencia } from './asistencia.entity';
import { Actividad } from './actividad.entity';

@Entity()
export class JefeDeGrupo {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.jefesDeGrupo)
  @JoinColumn({name: 'usuarioId'})
  usuario: Usuario;

  @OneToMany(() => Horario, (horario) => horario.jefeDeGrupo)
  horarios: Horario[];

  @OneToMany(() => Asistencia, (asistencia) => asistencia.jefeDeGrupo)
  asistencias: Asistencia[];

  @OneToMany(() => Actividad, (actividad) => actividad.jefeDeGrupo)
  actividades: Actividad[];
}
