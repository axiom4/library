import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LibraryBooksListUpdateService {
  private booksListUpdate: Subject<void> = new Subject<void>();
  booksListUpdate$ = this.booksListUpdate.asObservable();

  constructor() {}

  updateBooksList() {
    this.booksListUpdate.next();
  }
}
