import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Usuario } from './entities/usuario.entity';
import { JefeDeGrupo } from './entities/jefe-de-grupo.entity';
import { Profesor } from './entities/profesor.entity';
import { Alumno } from './entities/alumno.entity';
import { Horario } from './entities/horario.entity';
import { Asistencia } from './entities/asistencia.entity';
import { Actividad } from './entities/actividad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, JefeDeGrupo, Profesor, Alumno, Horario, Asistencia, Actividad])],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
