import { Component, OnInit } from '@angular/core';
import {
  Book,
  LibraryService,
  PaginatedBookList,
  LibraryBooksListRequestParams,
} from '../../../core/api/v1';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { Sort, MatSortModule, SortDirection } from '@angular/material/sort';

@Component({
  selector: 'app-library',
  imports: [NgIf, MatPaginatorModule, MatTableModule, MatSortModule, DatePipe],
  templateUrl: './library.component.html',
  styleUrl: './library.component.scss',
})
export class LibraryComponent implements OnInit {
  title = 'Library';
  books: Book[] = [];
  totalBooks = 0;
  pageSize = 5;
  pageIndex = 0;
  pageEvent: PageEvent | undefined;
  pageSizeOptions = [5, 10, 25];
  ordering = 'title';
  displayedColumns: string[] = [
    'id',
    'title',
    'author_name',
    'publication_date',
  ];

  constructor(private readonly libraryService: LibraryService) {}

  ngOnInit(): void {
    this.getBooks();
  }

  handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;

    this.getBooks();
  }

  handleSortEvent(e: Sort) {
    const sortDirection: SortDirection = e.direction;
    let sortActive = e.active;

    if (sortActive === 'publication_date') {
      sortActive = 'publication_date';
    } else if (sortActive === 'author_name') {
      sortActive = 'author';
    } else if (sortActive === 'title') {
      sortActive = 'title';
    } else {
      sortActive = 'id';
    }

    console.log('sortActive', sortActive);
    console.log('sortDirection', sortDirection);

    if (sortDirection === 'asc') {
      this.ordering = `-${sortActive}`;
    } else {
      this.ordering = `${sortActive}`;
    }

    this.pageIndex = 0;

    this.getBooks();
  }

  getBooks() {
    const params: LibraryBooksListRequestParams = {
      page: this.pageIndex + 1,
      pageSize: this.pageSize,
      ordering: this.ordering,
    };

    this.libraryService.libraryBooksList(params).subscribe({
      next: (data: PaginatedBookList) => {
        console.log(data);
        this.books = data.results || [];
        this.totalBooks = data.total_records || 0;
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
