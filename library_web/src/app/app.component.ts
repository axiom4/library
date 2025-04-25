import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LibraryComponent } from './modules/library/components/library/library.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LibraryNotificationService } from './modules/library/services/library-notification.service';
import { LibraryNotificationComponent } from './modules/library/components/library-notification/library-notification.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [
    RouterOutlet,
    LibraryComponent,
    MatButtonModule,
    MatIconModule,
    LibraryNotificationComponent,
  ],
})
/**
 * The `AppComponent` serves as the root component of the Library application.
 * It initializes the application state and interacts with the `LibraryService`
 * to fetch and display a list of books.
 *
 * @implements {OnInit}
 */
export class AppComponent implements OnInit {
  title = 'Library';
  constructor(private libraryNotificationService: LibraryNotificationService) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.libraryNotificationService.notify({
        message: 'Welcome to the Library!',
        type: 'info',
        duration: 3000,
      });
      this.libraryNotificationService.notify({
        message: 'New book added to the library!',
        type: 'success',
        duration: 5000,
      });
      this.libraryNotificationService.notify({
        message: 'Error loading book data.',
        type: 'error',
        duration: 4000,
      });
      this.libraryNotificationService.notify({
        message: 'This is a warning notification.',
        type: 'warning',
        duration: 6000,
      });
    }, 2000); // Simulate a delay before adding notifications
  }
}
