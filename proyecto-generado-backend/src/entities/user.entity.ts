import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { JefeDeGrupo } from './jefe-de-grupo.entity';
import { Profesor } from './profesor.entity';
import { Alumno } from './alumno.entity';

@Entity()
export class User {
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

  @OneToMany(() => JefeDeGrupo, (jefeDeGrupo) => jefeDeGrupo.user)
  jefeDeGrupo: JefeDeGrupo[];

  @OneToMany(() => Profesor, (profesor) => profesor.user)
  profesor: Profesor[];

  @OneToMany(() => Alumno, (alumno) => alumno.user)
  alumno: Alumno[];
}
