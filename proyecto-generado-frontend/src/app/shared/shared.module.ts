import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CustomErrorComponent } from './components/custom-error/custom-error.component';


@NgModule({
  declarations: [
    CustomErrorComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule
  ],
  exports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    CustomErrorComponent
  ]
})
export class SharedModule { }
