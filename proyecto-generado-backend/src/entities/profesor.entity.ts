import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Profesor {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.profesor)
  @JoinColumn({ name: 'userId' })
  user: User;

  // Additional fields and methods specific to Profesor can be added here
}
