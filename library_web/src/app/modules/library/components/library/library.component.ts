import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BooksListComponent } from '../books-list/books-list.component';

@Component({
  selector: 'app-library',
  imports: [BooksListComponent, MatButtonModule, MatIconModule],
  templateUrl: './library.component.html',
  styleUrl: './library.component.scss',
})
export class LibraryComponent implements OnInit {
  ngOnInit(): void {}

  openAddBookDialog() {
    // Logic to open the dialog for adding a new book
  }
}
