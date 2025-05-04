import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookComponent } from './components/book/book.component';
import { LibraryComponent } from './components/library/library.component';

const routes: Routes = [
  { path: '', component: LibraryComponent },
  { path: 'books/:id', component: BookComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LibraryRoutingModule {}
