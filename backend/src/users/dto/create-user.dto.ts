import { IsEmail, IsNotEmpty, MinLength, IsDate, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
@IsString()
@IsNotEmpty()
@MinLength(3)
username: string;

@IsEmail()
email: string;

@IsString()
@MinLength(6)
password: string;

@IsString()
@IsNotEmpty()
nombre: string;

@IsString()
@IsNotEmpty()
apellidoPaterno: string;

@IsString()
@IsNotEmpty()
apellidoMaternoW: string;

@IsDate()
@Type(() => Date)
fechaNacimiento: Date;
}