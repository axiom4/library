// src/app/modules/library/components/add-new-book/add-new-book.component.ts
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import {
  BookRequest,
  LibraryBooksCreateRequestParams,
  LibraryService,
} from '../../../core/api/v1'; // Adjust path as needed
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
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

@Component({
  selector: 'app-add-new-book',
  standalone: true, // Assuming standalone component
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
  ],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },
  ],
  templateUrl: './add-new-book.component.html',
  styleUrls: ['./add-new-book.component.scss'],
})
export class AddNewBookComponent implements OnInit {
  addBookForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddNewBookComponent>,
    private libraryService: LibraryService
  ) {}

  ngOnInit(): void {
    this.addBookForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      publication_date: ['', Validators.required],
    });
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
        author: this.addBookForm.value.author,
        publication_date: formattedDate,
      };

      const bookData: LibraryBooksCreateRequestParams = {
        bookRequest: bookRequest,
      };

      this.libraryService.libraryBooksCreate(bookData).subscribe({
        next: (response) => {
          console.log('Book added successfully', response);
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error adding book:', error);
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
}
