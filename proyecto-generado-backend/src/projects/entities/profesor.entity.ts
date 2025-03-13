import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Usuario } from './usuario.entity';
import { Asistencia } from './asistencia.entity';
import { Horario } from './horario.entity';

@Entity()
export class Profesor {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.profesores)
  @JoinColumn({name: 'usuarioId'})
  usuario: Usuario;

  @OneToMany(() => Asistencia, (asistencia) => asistencia.profesor)
  asistencias: Asistencia[];

  @OneToMany(() => Horario, (horario) => horario.profesor)
  horarios: Horario[];
}
