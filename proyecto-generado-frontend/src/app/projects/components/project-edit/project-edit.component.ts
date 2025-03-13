import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-project-edit',
  templateUrl: './project-edit.component.html',
  styleUrls: ['./project-edit.component.scss']
})
export class ProjectEditComponent implements OnInit {

  projectId: string | null = null;
  projectForm: FormGroup;
  project: Project | undefined;

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private projectService: ProjectService, private router: Router) {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      client: ['']
    });
  }

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id');
    if (this.projectId) {
      this.loadProject(this.projectId);
    }
  }

  loadProject(id: string): void {
    this.projectService.getProject(id).subscribe(project => {
      this.project = project;
      this.projectForm.patchValue(project);
    });
  }

  onSubmit(): void {
    if (this.projectForm.valid && this.projectId && this.project) {
      const updatedProject = { ...this.project, ...this.projectForm.value };
      this.projectService.updateProject(this.projectId, updatedProject).subscribe(() => {
        this.router.navigate(['/projects']);
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/projects']);
  }
}
