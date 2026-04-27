import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { ProductFormDialogComponent } from './components/product-form-dialog/product-form-dialog.component';
import { ProductsListComponent } from './pages/products-list/products-list.component';
import { ProductsRoutingModule } from './products-routing.module';

@NgModule({
  declarations: [ProductsListComponent, ProductFormDialogComponent],
  imports: [SharedModule, ProductsRoutingModule]
})
export class ProductsModule {}
