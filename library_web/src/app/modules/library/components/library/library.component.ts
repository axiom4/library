import { Component, OnInit } from '@angular/core';
import {
  Book,
  LibraryService,
  PaginatedBookList,
  LibraryBooksListRequestParams,
} from '../../../core/api/v1';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-library',
  imports: [NgFor, RouterLink, MatPaginatorModule],
  templateUrl: './library.component.html',
  styleUrl: './library.component.scss',
})
export class LibraryComponent implements OnInit {
  title = 'Library';
  books: Book[] = [];
  totalBooks = 0;
  pageSize = 5;
  pageIndex = 0;

  constructor(private readonly libraryService: LibraryService) {}

  ngOnInit(): void {
    this.getBooks();
  }

  getBooks() {
    const params: LibraryBooksListRequestParams = {
      page: this.pageIndex + 1,
      pageSize: this.pageSize,
    };

    this.libraryService.libraryBooksList(params).subscribe({
      next: (data: PaginatedBookList) => {
        this.books = data.results || [];
        this.totalBooks = data.total_records || 0;
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
