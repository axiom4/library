import { TestBed } from '@angular/core/testing';

import { LibraryBooksListUpdateService } from './library-books-list-update.service';

describe('LibraryBooksListUpdateService', () => {
  let service: LibraryBooksListUpdateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LibraryBooksListUpdateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
