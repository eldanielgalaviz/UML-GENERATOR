import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Post('/jefe-de-grupo')
  createJefeDeGrupo(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createJefeDeGrupo(createUserDto);
  }

  @Post('/profesor')
  createProfesor(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createProfesor(createUserDto);
  }

  @Post('/alumno')
  createAlumno(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createAlumno(createUserDto);
  }
}
