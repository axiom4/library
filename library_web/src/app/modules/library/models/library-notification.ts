export interface LibraryNotification {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number; // Duration in milliseconds
}
