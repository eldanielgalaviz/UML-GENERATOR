import { IsEmail, IsOptional, IsString, MinLength, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    @MinLength(3)
    username?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    nombre?: string;

    @IsOptional()
    @IsString()
    apellidoPaterno?: string;

    @IsOptional()
    @IsString()
    apellidoMaterno?: string;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    fechaNacimiento?: Date;
}