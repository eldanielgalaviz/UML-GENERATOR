import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskService } from '../task.service';
import { Task } from '../task.model';

@Component({
  selector: 'app-task-edit',
  templateUrl: './task-edit.component.html',
  styleUrls: ['./task-edit.component.scss']
})
export class TaskEditComponent implements OnInit {

  taskId: number | null = null;
  taskForm: FormGroup;

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private taskService: TaskService, private router: Router) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.taskId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadTask();
  }

  loadTask(): void {
    if (this.taskId) {
      this.taskService.getTask(this.taskId).subscribe(task => {
        this.taskForm.patchValue(task);
      });
    }
  }

  onSubmit(): void {
    if (this.taskForm.valid && this.taskId) {
      this.taskService.updateTask(this.taskId, this.taskForm.value).subscribe(() => {
        this.router.navigate(['/tasks']);
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/tasks']);
  }

}
