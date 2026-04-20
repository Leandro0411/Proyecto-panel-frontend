import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { MaterialModule } from './material/material.module';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';

@NgModule({
  declarations: [MainLayoutComponent, ConfirmDialogComponent],
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MaterialModule],
  exports: [CommonModule, RouterModule, ReactiveFormsModule, MaterialModule, MainLayoutComponent]
})
export class SharedModule {}
