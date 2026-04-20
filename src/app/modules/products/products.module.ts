import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { ProductsListComponent } from './pages/products-list/products-list.component';
import { ProductsRoutingModule } from './products-routing.module';

@NgModule({
  declarations: [ProductsListComponent],
  imports: [SharedModule, ProductsRoutingModule]
})
export class ProductsModule {}
