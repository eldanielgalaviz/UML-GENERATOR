import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('usuarios')
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.projectsService.createUsuario(createUsuarioDto);
  }

  @Get('usuarios')
  findAll() {
    return this.projectsService.findAllUsuarios();
  }

  @Get('usuarios/:id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findUsuarioById(+id);
  }

  @Patch('usuarios/:id')
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.projectsService.updateUsuario(+id, updateUsuarioDto);
  }

  @Delete('usuarios/:id')
  remove(@Param('id') id: string) {
    return this.projectsService.removeUsuario(+id);
  }

  @Post('horarios')
  createHorario(@Body() createHorarioDto: any) { // Replace any with DTO
      return this.projectsService.createHorario(createHorarioDto);
  }

  @Get('horarios')
  findAllHorarios() {
      return this.projectsService.findAllHorarios();
  }

  @Get('horarios/:id')
  findHorario(@Param('id') id: string) {
      return this.projectsService.findHorarioById(+id);
  }
  
  // Add endpoints for other entities (JefeDeGrupo, Profesor, Alumno, Asistencia, Actividad)
}
