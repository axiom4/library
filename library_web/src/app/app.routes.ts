import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: 'library',
    loadChildren: () =>
      import('./modules/library/library.module').then((m) => m.LibraryModule),
    canActivate: [authGuard],
    data: { role: 'view-books' },
  },
  { path: '', redirectTo: '/library', pathMatch: 'full' },
  { path: '**', redirectTo: '/library', pathMatch: 'full' },
];
