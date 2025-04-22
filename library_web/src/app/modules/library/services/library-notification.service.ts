import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable, OnInit } from '@angular/core';
import { LibraryNotification } from '../models/library-notification';

@Injectable({
  providedIn: 'root',
})
export class LibraryNotificationService {
  private notificationSubject = new BehaviorSubject<LibraryNotification[]>([]);
  notification_list: Observable<LibraryNotification[]> =
    this.notificationSubject.asObservable();

  constructor() {
    console.log('LibraryNotificationService initialized');
    this.notificationSubject.subscribe((notifications) => {
      notifications.forEach((notification) => {
        // Show the notification (e.g., using a toast or snackbar)
        this.showNotification(notification);
        // Automatically remove the notification after its duration
        this.removeNotification(notification);
      });
    });
  }

  /**
   * Adds a new notification to the list and emits the updated array.
   * @param notification - The notification to add.
   */
  addNotification(notification: LibraryNotification) {
    const currentNotifications = this.notificationSubject.getValue();
    this.notificationSubject.next([...currentNotifications, notification]);
  }

  /**
   * Removes a notification from the list and emits the updated array.
   * @param notification - The notification to remove.
   */
  removeNotification(notification: LibraryNotification) {
    const updatedNotifications = this.notificationSubject
      .getValue()
      .filter((n) => n !== notification);
    this.notificationSubject.next(updatedNotifications);
  }

  private showNotification(notification: LibraryNotification) {
    // Logic to display the notification (e.g., using a toast or snackbar)
    // Simulate showing the notification for its duration
    setTimeout(() => {
      console.log(
        `Notification: ${notification.type} - ${notification.message}`
      );
    }, notification.duration || 3000);
    // Clear the interval after the duration
  }
}
