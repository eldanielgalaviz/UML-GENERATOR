import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    create(createTaskDto: CreateTaskDto): Promise<import("./task.entity").Task>;
    findAll(): Promise<import("./task.entity").Task[]>;
    findOne(id: string): Promise<import("./task.entity").Task>;
    update(id: string, updateTaskDto: UpdateTaskDto): Promise<import("./task.entity").Task>;
    remove(id: string): Promise<void>;
}
