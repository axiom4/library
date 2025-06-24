import { Component, OnDestroy, OnInit } from '@angular/core';
import { LibraryNotificationService } from '../../services/library-notification.service';
import { LibraryNotification } from '../../models/library-notification';
import { Subject, takeUntil } from 'rxjs';
import { NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-library-notification',
  imports: [
    NgClass,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatProgressBarModule
],
  templateUrl: './library-notification.component.html',
  styleUrl: './library-notification.component.scss',
})
/**
 * `LibraryNotificationComponent` is responsible for displaying and managing library notifications.
 * It subscribes to the `LibraryNotificationService` to receive notifications and displays them to the user.
 * The component automatically removes notifications after a specified duration.
 * It also provides a method to manually close notifications.
 *
 * Implements `OnInit` and `OnDestroy` lifecycle hooks for initialization and cleanup.
 */
export class LibraryNotificationComponent implements OnInit, OnDestroy {
  /**
   * The `notification` property holds the current notification object.
   * It is initialized to null, indicating that there is no notification by default.
   *
   * @type {LibraryNotification | undefined}
   */
  notification: LibraryNotification | undefined;
  private destroyStream$ = new Subject<void>();

  constructor(
    private readonly libraryNotificationService: LibraryNotificationService
  ) {}
  /**
   * The `ngOnInit` lifecycle hook is called after the component has been initialized.
   * It is used to perform any necessary initialization tasks, such as subscribing
   * to services or fetching data.
   *
   * @returns {void}
   */
  ngOnInit(): void {
    console.log('LibraryNotificationComponent initialized');
    this.events();
  }

  /**
   * @description This method subscribes to the notification stream from the library notification service.
   * When notifications are received, it updates the component's notification property and sets a timeout to remove the notification after its specified duration.
   * If there are no notifications, it clears the component's notification property.
   * The subscription is automatically unsubscribed when the component is destroyed.
   * @async
   * @returns {Promise<void>}
   */
  async events() {
    this.libraryNotificationService.notification_list
      .pipe(takeUntil(this.destroyStream$))
      .subscribe(async (notifications) => {
        if (notifications.length > 0) {
          const notification =
            this.libraryNotificationService.getNotification();
          this.notification = notification;
          if (this.notification) {
            await new Promise((resolve) =>
              setTimeout(() => {
                this.libraryNotificationService.removeNotification(
                  notification
                );
                resolve(undefined);
              }, notification.duration)
            );
          }
        } else {
          this.notification = undefined;
        }
      });
  }

  /**
   * Closes the current notification by removing it from the library notification service.
   * This function checks if a notification exists and then calls the service to remove it.
   */
  closeNotification() {
    if (this.notification) {
      this.libraryNotificationService.removeNotification(this.notification);
    }
  }

  /**
   * Lifecycle hook that is called when the component is destroyed.
   * It completes the `destroyStream$` Subject, signaling all subscribers to unsubscribe.
   */
  ngOnDestroy() {
    this.destroyStream$.complete();
  }
}
