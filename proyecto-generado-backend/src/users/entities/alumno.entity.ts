import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Alumno {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.alumno)
  @JoinColumn({ name: 'userId' })
  user: User;

  // Additional fields and methods specific to Alumno can be added here
}
