import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { UsersListComponent } from './pages/users-list/users-list.component';
import { UsersRoutingModule } from './users-routing.module';
import { UserFormDialogComponent } from './components/user-form-dialog/user-form-dialog.component';
import { SalesOverviewComponent } from './pages/sales-overview/sales-overview.component';

@NgModule({
  declarations: [UsersListComponent, UserFormDialogComponent, SalesOverviewComponent],
  imports: [SharedModule, UsersRoutingModule]
})
export class UsersModule {}
