// src/app/modules/library/components/add-new-book/add-new-book.component.ts
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import {
  Author,
  BookRequest,
  LibraryAuthorsListRequestParams,
  LibraryBooksCreateRequestParams,
  LibraryService,
} from '../../../core/api/v1'; // Adjust path as needed
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_NATIVE_DATE_FORMATS,
  MatNativeDateModule,
  NativeDateAdapter,
} from '@angular/material/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import { map, Observable, startWith, switchMap } from 'rxjs';
import { LibraryNotificationService } from '../../services/library-notification.service';
import { AddNewAuthorComponent } from '../add-new-author/add-new-author.component';

import { OAuthService } from 'angular-oauth2-oidc';

@Component({
  selector: 'app-add-new-book',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatAutocompleteModule,
    AddNewAuthorComponent
],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },
  ],
  templateUrl: './add-new-book.component.html',
  styleUrls: ['./add-new-book.component.scss'],
})
/**
 * Component for adding a new book to the library.
 *
 * This component provides a form for entering book details, including title, author, and publication date.
 * It features an autocomplete input for selecting authors, which fetches matching authors from the backend as the user types.
 * Upon form submission, the component validates the input, formats the data as required by the API, and sends a request to create the new book.
 * The dialog is closed upon successful creation or cancellation.
 *
 * @remarks
 * - Uses Angular Reactive Forms for form handling and validation.
 * - Integrates with the `LibraryService` to fetch authors and create books.
 * - Utilizes Angular Material Dialog for modal functionality.
 * - Implements an autocomplete feature for author selection.
 *
 * @see LibraryService
 */
export class AddNewBookComponent implements OnInit {
  addBookForm!: FormGroup;
  filteredOptions: Observable<Author[]> | undefined;
  newAuthor = false;
  authorControl = new FormControl('', Validators.required);
  oauthService = inject(OAuthService);
  realmRoles: string[] = [];

  /**
   * Initializes a new instance of the AddNewBookComponent.
   *
   * @param fb - The FormBuilder service used to create and manage reactive forms.
   * @param dialogRef - Reference to the dialog opened for adding a new book.
   * @param libraryService - Service for interacting with the library's data and operations.
   */
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddNewBookComponent>,
    private libraryService: LibraryService,
    private libraryNotificationService: LibraryNotificationService
  ) {}

  /**
   * Initializes the add book form and sets up the filtered options for the author autocomplete.
   *
   * - Creates a reactive form group with controls for title, author, and publication date.
   * - Sets up an observable (`filteredOptions`) that listens to changes in the author input,
   *   and filters the available author options accordingly.
   * - Uses `startWith` to initialize the filter and `switchMap` to handle asynchronous filtering logic.
   */
  ngOnInit(): void {
    this.addBookForm = this.fb.group({
      title: ['', Validators.required],
      author: this.authorControl,
      publication_date: ['', Validators.required],
    });

    this.filteredOptions = this.authorControl.valueChanges.pipe(
      startWith(''),
      switchMap((value) => {
        if (typeof value === 'string') {
          return this._filter(value);
        }
        return [[]];
      })
    );

    if (this.oauthService.hasValidAccessToken()) {
      // Extract realm roles from the token
      const accessToken = this.oauthService.getAccessToken();
      const claims = this.getJwtClaims(accessToken);
      this.realmRoles = claims?.['realm_access']?.['roles'] || [];
      console.log('Realm roles:', this.realmRoles);
    }
  }

  private getJwtClaims(token: string): any {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  /**
   * Formats an Author object into a display string.
   *
   * @param author - The Author object to format.
   * @returns The author's full name as a string, or an empty string if the author or first name is not provided.
   */
  displayFn(author: Author): string {
    return author ? author.first_name + ' ' + author.last_name : '';
  }

  /**
   * Filters authors based on the provided name by querying the library service.
   *
   * @param name - The search string used to filter authors.
   * @returns An Observable emitting an array of Author objects matching the search criteria.
   */
  private _filter(name: string): Observable<Author[]> {
    const params: LibraryAuthorsListRequestParams = {
      search: name,
      pageSize: 3,
    };

    return this.libraryService
      .libraryAuthorsList(params)
      .pipe(
        map((data) => (data && Array.isArray(data.results) ? data.results : []))
      );
  }

  /**
   * Handles the form submission. If the form is valid, it formats the data,
   * calls the library service to create the book, and closes the dialog on success.
   */
  onSubmit(): void {
    console.log('Form submitted:', this.addBookForm.value);

    if (this.addBookForm.valid) {
      // Ensure date is formatted correctly if needed by the API (e.g., YYYY-MM-DD)
      const formattedDate = this.formatDate(
        this.addBookForm.value.publication_date
      );

      const bookRequest: BookRequest = {
        title: this.addBookForm.value.title,
        author: this.addBookForm.value.author
          ? this.addBookForm.value.author.id
          : null,
        publication_date: formattedDate,
      };

      const bookData: LibraryBooksCreateRequestParams = {
        bookRequest: bookRequest,
      };

      this.libraryService.libraryBooksCreate(bookData).subscribe({
        next: (response) => {
          console.log('Book added successfully', response);
          this.libraryNotificationService.notify({
            message: 'Book added successfully',
            type: 'success',
            duration: 3000,
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          const errorMessage = error?.error || {};

          let errorMessageString = '<br><br>';

          for (const key in errorMessage) {
            errorMessageString += `<strong>${key}</strong>: ${errorMessage[key]}<br><br>`;
          }

          // Handle error response
          this.libraryNotificationService.notify({
            message: 'Error adding book \n' + errorMessageString,
            type: 'error',
            duration: 3000,
          });
        },
      });
    } else {
      this.addBookForm.markAllAsTouched();
    }
  }

  /**
   * Closes the dialog without submitting the form.
   */
  onCancel(): void {
    this.dialogRef.close(); // Close dialog without passing any data
  }

  /**
   * Helper function to format a Date object into 'YYYY-MM-DD' string format.
   * @param date - The date to format.
   * @returns The formatted date string.
   */
  private formatDate(date: Date): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  toggleNewAuthor(): void {
    // Logic to add a new author
    // This could involve opening another dialog or navigating to an author creation page
    console.log('Add new author clicked');
    this.newAuthor = !this.newAuthor; // Toggle the new author form visibility

    if (this.newAuthor) {
      this.authorControl.setValue(''); // Clear the author control value
      this.authorControl.disable(); // Enable the author control when adding a new author
    } else {
      this.authorControl.enable(); // Disable the author control when adding a new author
    }
  }

  onAuthorCancelled() {
    this.newAuthor = false; // Reset the new author form visibility
    this.authorControl.enable(); // Re-enable the author control
  }

  onAuthorAdded(author: Author) {
    console.log('Author added:', author);
    this.newAuthor = false; // Reset the new author form visibility
    this.addBookForm.controls['author'].setValue(author);

    this.authorControl.enable(); // Re-enable the author control
  }

  hasRole(role: string): boolean {
    return this.realmRoles.includes(role);
  }
}
