import { AuthorRequest } from './../../../core/api/v1/model/authorRequest';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
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
import {
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormBuilder,
} from '@angular/forms';
import { NgIf } from '@angular/common';
import {
  Author,
  LibraryAuthorsCreateRequestParams,
  LibraryBooksCreateRequestParams,
  LibraryService,
} from '../../../core/api/v1';
import { LibraryNotificationService } from '../../services/library-notification.service';

@Component({
  selector: 'app-add-new-author',
  templateUrl: './add-new-author.component.html',
  styleUrl: './add-new-author.component.scss',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    NgIf,
  ],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },
  ],
})
export class AddNewAuthorComponent implements OnInit {
  addAuthorForm!: FormGroup;
  @Output() authorAdded: EventEmitter<Author> = new EventEmitter();
  @Output() authorCancelled: EventEmitter<void> = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    private readonly libraryService: LibraryService,
    private readonly libraryNotificationService: LibraryNotificationService
  ) {}

  ngOnInit() {
    this.addAuthorForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      citizenship: ['', Validators.required],
      date_of_birth: ['', Validators.required],
      date_of_death: [''],
    });
  }

  onSubmit() {
    if (this.addAuthorForm.valid) {
      const authorValue: Author = this.addAuthorForm.value;

      let AuthorRequest: AuthorRequest = {
        first_name: authorValue.first_name,
        last_name: authorValue.last_name,
        citizenship: authorValue.citizenship,
        date_of_birth: this.formatDate(this.addAuthorForm.value.date_of_birth),
        date_of_death: this.addAuthorForm.value.date_of_death
          ? this.formatDate(this.addAuthorForm.value.date_of_death)
          : undefined,
      };

      const params: LibraryAuthorsCreateRequestParams = {
        authorRequest: AuthorRequest,
      };

      this.libraryService.libraryAuthorsCreate(params).subscribe({
        next: (author) => {
          console.log('Author added successfully:', author);
          this.libraryNotificationService.notify({
            message: 'Author added successfully',
            type: 'success',
            duration: 3000,
          });

          this.authorAdded.emit(author);
          this.addAuthorForm.reset();
        },
        error: (error) => {
          console.error('Error adding author:', error);
          const errorMessage = error?.error || {};

          let errorMessageString = '<br><br>';

          for (const key in errorMessage) {
            errorMessageString += `<strong>${key}</strong>: ${errorMessage[key][0]}<br><br>`;
          }

          // Handle error response
          this.libraryNotificationService.notify({
            message: 'Error adding author \n' + errorMessageString,
            type: 'error',
            duration: 3000,
          });
        },
      });
    } else {
      this.addAuthorForm.markAllAsTouched();
      console.log('Form is invalid');
    }
  }

  onCancel() {
    this.authorCancelled.emit();
    this.addAuthorForm.reset();
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
