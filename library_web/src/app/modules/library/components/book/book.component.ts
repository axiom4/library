import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  Book,
  LibraryService,
  LibraryBooksRetrieveRequestParams,
} from '../../../core/api/v1';


@Component({
  selector: 'app-book',
  imports: [],
  templateUrl: './book.component.html',
  styleUrl: './book.component.scss',
})
export class BookComponent implements OnInit, OnDestroy {
  bookId: number | undefined;
  private routeSubscription: Subscription | undefined;
  book: Book | undefined;
  visible = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly libraryService: LibraryService
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe((params) => {
      this.bookId = params['id'];
      if (this.bookId) this.getBook(this.bookId);
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  getBook(id: number): void {
    const book_params: LibraryBooksRetrieveRequestParams = {
      id: id,
    };

    if (this.bookId) {
      this.visible = false;
      this.libraryService.libraryBooksRetrieve(book_params).subscribe({
        next: (book) => {
          this.book = book;
          console.log(this.book);
          this.visible = true;
        },
        error: (err) => {
          console.error(err);
          this.book = undefined;
          this.visible = true;
        },
      });
    }
  }
}
