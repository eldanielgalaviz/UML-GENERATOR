import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';
import { UsuarioModule } from '../usuario/usuario.module';
import { HorarioModule } from '../horario/horario.module';
import { AsistenciaModule } from '../asistencia/asistencia.module';
import { ActividadModule } from '../actividad/actividad.module';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), UsuarioModule, HorarioModule, AsistenciaModule, ActividadModule],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
