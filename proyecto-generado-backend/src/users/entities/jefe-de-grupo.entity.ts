import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class JefeDeGrupo {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.jefeDeGrupo)
  @JoinColumn({ name: 'userId' })
  user: User;

  // Additional fields and methods specific to JefeDeGrupo can be added here
}
