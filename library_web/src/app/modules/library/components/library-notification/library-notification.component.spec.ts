import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryNotificationComponent } from './library-notification.component';

describe('LibraryNotificationComponent', () => {
  let component: LibraryNotificationComponent;
  let fixture: ComponentFixture<LibraryNotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibraryNotificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LibraryNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
