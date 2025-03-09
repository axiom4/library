import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Book, LibraryService } from './modules/core/api/v1';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgFor, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'Library';
  books: Book[] = [];

  constructor(private readonly libraryService: LibraryService) {}

  ngOnInit(): void {
    this.libraryService.listBooks().subscribe({
      next: (books) => {
        this.books = books;
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
