import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { JefeDeGrupo } from './jefe-de-grupo.entity';
import { Profesor } from './profesor.entity';

@Entity()
export class Horario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  grupo: string;

  @Column()
  clase: string;

  @Column()
  horaInicio: string;  // Storing time as string for simplicity

  @Column()
  horaFin: string;    // Storing time as string for simplicity

  @ManyToOne(() => JefeDeGrupo, (jefeDeGrupo) => jefeDeGrupo.horarios)
  @JoinColumn({name: 'jefeDeGrupoId'})
  jefeDeGrupo: JefeDeGrupo;

    @ManyToOne(() => Profesor, (profesor) => profesor.horarios)
    @JoinColumn({name: 'profesorId'})
    profesor: Profesor;
}
