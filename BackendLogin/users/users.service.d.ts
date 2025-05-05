import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    create(createUserDto: CreateUserDto): Promise<User>;
    findOne(id: number): Promise<User>;
    findByUsername(username: string): Promise<User>;
    findByEmail(email: string): Promise<User>;
    findByConfirmationToken(token: string): Promise<User>;
    findByResetToken(token: string): Promise<User>;
    update(id: number, updateData: Partial<User>): Promise<void>;
    updateProfile(userId: number, updateProfileDto: UpdateProfileDto): Promise<User>;
}
