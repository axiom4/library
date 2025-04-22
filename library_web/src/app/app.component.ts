import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LibraryComponent } from './modules/library/components/library/library.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LibraryNotificationService } from './modules/library/services/library-notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet, LibraryComponent, MatButtonModule, MatIconModule],
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
    this.libraryNotificationService.addNotification({
      message: 'Welcome to the Library!',
      type: 'info',
      duration: 3000,
    });
    this.libraryNotificationService.addNotification({
      message: 'New book added to the library!',
      type: 'success',
      duration: 5000,
    });
    this.libraryNotificationService.addNotification({
      message: 'Error loading book data.',
      type: 'error',
      duration: 4000,
    });
  }
}
