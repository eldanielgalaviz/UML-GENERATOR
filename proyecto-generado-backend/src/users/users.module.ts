import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../entities/user.entity';
import { JefeDeGrupo } from './entities/jefe-de-grupo.entity';
import { Profesor } from '../entities/profesor.entity';
import { Alumno } from './entities/alumno.entity';
import { Horario } from '../horario/entities/horario.entity';
import { Asistencia } from '../asistencia/entities/asistencia.entity';
import { Actividad } from '../actividad/entities/actividad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, JefeDeGrupo, Profesor, Alumno, Horario, Asistencia, Actividad])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
