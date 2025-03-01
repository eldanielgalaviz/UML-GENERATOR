import { Controller, Get, Patch, Request, UseGuards, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard.auth';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('profile')
  async updateProfile(
    @Request() req: any,
    @Body() updateProfileDto: UpdateProfileDto
  ) {
    return this.usersService.updateProfile(req.user.userId, updateProfileDto);
  }

  @Get('profile')
  async getProfile(@Request() req: any) {
    console.log('User from request:', req.user);
    return this.usersService.findOne(req.user.userId);
  }
}