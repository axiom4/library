import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'library',
    loadChildren: () =>
      import('./modules/library/library.module').then((m) => m.LibraryModule),
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
