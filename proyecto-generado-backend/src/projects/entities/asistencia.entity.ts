import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { JefeDeGrupo } from './jefe-de-grupo.entity';
import { Profesor } from './profesor.entity';

@Entity()
export class Asistencia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fecha: Date;

  @Column()
  presente: boolean;

  @ManyToOne(() => JefeDeGrupo, (jefeDeGrupo) => jefeDeGrupo.asistencias)
  @JoinColumn({name: 'jefeDeGrupoId'})
  jefeDeGrupo: JefeDeGrupo;

  @ManyToOne(() => Profesor, (profesor) => profesor.asistencias)
  @JoinColumn({name: 'profesorId'})
  profesor: Profesor;
}
