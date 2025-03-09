import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
@PrimaryGeneratedColumn()
id: number;

@Column({ unique: true })
username: string;

@Column({ unique: true })
email: string;

@Column()
@Exclude()
password: string;

@Column()
nombre: string;

@Column()
apellidoPaterno: string;

@Column()
apellidoMaterno: string;

@Column({ type: 'date' })
fechaNacimiento: Date;

@CreateDateColumn()
createdAt: Date;

@UpdateDateColumn()
updatedAt: Date;

@Column({ default: false })
    isEmailConfirmed: boolean;

@Column({ type: 'varchar', nullable: true })
    confirmationToken: string | null;

@Column({ type: 'varchar', nullable: true })
    passwordResetToken: string | null;

@Column({ type: 'timestamp', nullable: true })
    passwordResetExpires: Date | null;
}