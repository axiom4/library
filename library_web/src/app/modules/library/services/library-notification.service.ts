import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { LibraryNotification } from '../models/library-notification';

@Injectable({
  providedIn: 'root',
})
/**
 * Service for managing and emitting library notifications.
 *
 * This service uses a BehaviorSubject to hold and update a list of LibraryNotification objects.
 * It provides methods to add, retrieve, and remove notifications, and exposes an observable
 * stream of notifications for components to subscribe to.
 */
export class LibraryNotificationService {
  private notification$: BehaviorSubject<LibraryNotification[]> =
    new BehaviorSubject<LibraryNotification[]>([]);

  notification: Observable<LibraryNotification[]> =
    this.notification$.asObservable();

  constructor() {}

  /**
   * Adds a new notification to the list and emits the updated array.
   * @param notification - The notification to add.
   */
  notify(notification: LibraryNotification) {
    // console.log('Notification:', notification);
    this.notification$.next([...this.notification$.value, notification]);
  }

  /**
   * Retrieves the first notification from the notification stream.
   * @returns {LibraryNotification} The first notification in the stream.
   */
  getNotification(): LibraryNotification {
    return this.notification$.value[0];
  }

  /**
   * Removes a notification from the list and emits the updated array.
   * @param notification - The notification to remove.
   */
  removeNotification(notification: LibraryNotification) {
    const notifications = this.notification$.value.filter(
      (n) => n !== notification
    );
    this.notification$.next(notifications);
  }
}
