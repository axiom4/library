import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { MatDialog } from '@angular/material/dialog';
import { AddNewBookComponent } from '../add-new-book/add-new-book.component';
import { BooksListComponent } from '../books-list/books-list.component';
@Component({
  selector: 'app-library',
  imports: [MatButtonModule, MatIconModule, BooksListComponent],
  templateUrl: './library.component.html',
  styleUrl: './library.component.scss',
})
export class LibraryComponent implements OnInit {
  constructor(public dialog: MatDialog) {}

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
        console.log('Dialog result:', result);
      }
    });
  }
}
