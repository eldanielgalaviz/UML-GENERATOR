import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { JefeDeGrupo } from './jefe-de-grupo.entity';

@Entity()
export class Actividad {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  descripcion: string;

  @Column()
  fecha: Date;

  @ManyToOne(() => JefeDeGrupo, (jefeDeGrupo) => jefeDeGrupo.actividades)
  @JoinColumn({name: 'jefeDeGrupoId'})
  jefeDeGrupo: JefeDeGrupo;
}
