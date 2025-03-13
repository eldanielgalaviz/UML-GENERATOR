import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { JefeDeGrupo } from './jefe-de-grupo.entity';
import { Profesor } from './profesor.entity';
import { Alumno } from './alumno.entity';

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => JefeDeGrupo, (jefeDeGrupo) => jefeDeGrupo.usuario)
  jefesDeGrupo: JefeDeGrupo[];

  @OneToMany(() => Profesor, (profesor) => profesor.usuario)
  profesores: Profesor[];

  @OneToMany(() => Alumno, (alumno) => alumno.usuario)
  alumnos: Alumno[];
}
