// src/horarios/entities/horario.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Horario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  grupo: string;

  @Column()
  clase: string;

  @Column()
  horaInicio: string;

  @Column()
  horaFin: string;
}