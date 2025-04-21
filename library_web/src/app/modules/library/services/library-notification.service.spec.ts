import { TestBed } from '@angular/core/testing';

import { LibraryNotificationService } from './library-notification.service';

describe('LibraryNotificationService', () => {
  let service: LibraryNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LibraryNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
