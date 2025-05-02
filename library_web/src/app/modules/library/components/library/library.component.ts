import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { MatDialog } from '@angular/material/dialog';
import { AddNewBookComponent } from '../add-new-book/add-new-book.component';
import { BooksListComponent } from '../books-list/books-list.component';
import { LibraryBooksListUpdateService } from '../../services/library-books-list-update.service';
import { LibraryNotificationComponent } from '../library-notification/library-notification.component';
@Component({
  selector: 'app-library',
  imports: [
    MatButtonModule,
    MatIconModule,
    BooksListComponent,
    LibraryNotificationComponent,
  ],
  templateUrl: './library.component.html',
  styleUrl: './library.component.scss',
})
export class LibraryComponent implements OnInit {
  constructor(
    public dialog: MatDialog,
    private readonly booksListUpdateService: LibraryBooksListUpdateService
  ) {}

  ngOnInit(): void {}

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
}
