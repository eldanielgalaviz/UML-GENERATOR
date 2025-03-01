import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    updateProfile(req: any, updateProfileDto: UpdateProfileDto): Promise<import("./entities/user.entity").User>;
    getProfile(req: any): Promise<import("./entities/user.entity").User>;
}
