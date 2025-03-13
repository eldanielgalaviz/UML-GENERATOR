import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne, JoinTable } from 'typeorm';
import { Usuario } from './usuario.entity';
import { Horario } from './horario.entity';

@Entity()
export class Alumno {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.alumnos)
  @JoinColumn({name: 'usuarioId'})
  usuario: Usuario;

  @OneToOne(() => Horario)
  @JoinTable()
  horario: Horario;
}
