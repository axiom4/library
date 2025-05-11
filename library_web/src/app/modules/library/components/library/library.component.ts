import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { MatDialog } from '@angular/material/dialog';
import { AddNewBookComponent } from '../add-new-book/add-new-book.component';
import { BooksListComponent } from '../books-list/books-list.component';
import { LibraryBooksListUpdateService } from '../../services/library-books-list-update.service';
import { LibraryNotificationComponent } from '../library-notification/library-notification.component';

import Keycloak from 'keycloak-js';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-library',
  imports: [
    MatButtonModule,
    MatIconModule,
    BooksListComponent,
    LibraryNotificationComponent,
    NgIf,
  ],
  templateUrl: './library.component.html',
  styleUrl: './library.component.scss',
})
export class LibraryComponent implements OnInit {
  keycloak = inject(Keycloak);
  realmRoles: string[] = [];

  constructor(
    public dialog: MatDialog,
    private readonly booksListUpdateService: LibraryBooksListUpdateService
  ) {}

  ngOnInit(): void {
    if (this.keycloak.token) {
      // Extract realm roles from the token
      this.realmRoles =
        this.keycloak.tokenParsed?.['realm_access']?.['roles'] || [];
      console.log('Realm roles:', this.realmRoles);
    }
  }

  /**
   * Opens a dialog window containing the AddNewBookComponent.
   * Configures the dialog's width.
   */
  openAddBookDialog(): void {
    const dialogRef = this.dialog.open(AddNewBookComponent, {
      width: '700px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
      if (result) {
        this.booksListUpdateService.updateBooksList();
        console.log('Dialog result:', result);
      }
    });
  }

  /**
   * Checks if the current user has the specified role.
   *
   * @param role - The name of the role to check for.
   * @returns `true` if the user has the specified role, otherwise `false`.
   */
  hasRole(role: string): boolean {
    return this.realmRoles.includes(role);
  }
}
