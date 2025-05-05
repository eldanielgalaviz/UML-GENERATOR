// src/conversation/entities/conversation.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  originalRequirements: string;

  @Column({ type: 'json', nullable: true })
  requirements: any;

  @Column({ type: 'json', nullable: true })
  diagrams: any;

  @Column({ type: 'json', nullable: true })
  messages: any;

  @Column({ nullable: true })
  sessionId: string;

  @ManyToOne(() => User, user => user.conversations)
  user: User;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}