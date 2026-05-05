import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SalesOverviewComponent } from './pages/sales-overview/sales-overview.component';
import { UsersListComponent } from './pages/users-list/users-list.component';

const routes: Routes = [
  {
    path: '',
    component: UsersListComponent
  },
  {
    path: 'sales',
    component: SalesOverviewComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule {}
