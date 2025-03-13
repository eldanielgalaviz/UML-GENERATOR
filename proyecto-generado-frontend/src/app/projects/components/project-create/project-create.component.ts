import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-project-create',
  templateUrl: './project-create.component.html',
  styleUrls: ['./project-create.component.scss']
})
export class ProjectCreateComponent implements OnInit {

  projectForm: FormGroup;

  constructor(private fb: FormBuilder, private projectService: ProjectService, private router: Router) { 
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      client: ['']
    });
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    if (this.projectForm.valid) {
      this.projectService.createProject(this.projectForm.value).subscribe(() => {
        this.router.navigate(['/projects']);
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/projects']);
  }
}
