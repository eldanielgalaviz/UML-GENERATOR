// src/auth/dto/login.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
    @IsNotEmpty({ message: 'El usuario es requerido' })
    @IsString({ message: 'El usuario debe ser una cadena de texto' })
    usuario: string;

    @IsNotEmpty({ message: 'La contraseña es requerida' })
    @IsString({ message: 'La contraseña debe ser una cadena de texto' })
    password: string;
}