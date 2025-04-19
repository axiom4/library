# A Full Test Application Using Django and Angular (Part 13) - Forms Security

Now we will insert a form that will allow us to create new books and add them to our library collection.

First, let's reorganize our code. We consider moving the common structure, like a `<div class="library">`, to the main `app.component.html`. This ensures consistent layout across different views managed by the router.

After, inside this main layout in `app.component.html`, let's insert a new Angular Material `mat-button`. This button will trigger the opening of a dialog (popup) for adding a new book.

```html
<!-- src/app/app.component.html -->
<h1>{{ title }}</h1>

<div class="library">
  <app-library></app-library>
  <hr />
  <div class="library-footer">
    <a mat-raised-button color="primary" (click)="openAddBookDialog()"> <mat-icon>add</mat-icon> Add New Book </a>
  </div>
  <router-outlet></router-outlet>
</div>
```

Now, update `style.scss` adding:

```scss
.library-footer {
  margin: 20px 0 0 0;
  width: 100%;
  text-align: right;
}
```

Next, we need to add the corresponding method in our `app.component.ts` to handle the button's click event. This method will typically use Angular Material's `MatDialog` service to open the dialog component (which we will create later).

```typescript
// src/app/app.component.ts

import { Component, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { LibraryComponent } from "./modules/library/components/library/library.component";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
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
  title = "Library";

  constructor() {}

  ngOnInit(): void {}

  openAddBookDialog() {
    // Logic to open the dialog for adding a new book
  }
}
```

Finally, we update `library` component.

```html
<h2>Books</h2>

<mat-form-field class="search-form-field">
  <mat-label>Search</mat-label>
  <input matInput type="text" placeholder="Search for books" [(ngModel)]="searchText" (ngModelChange)="onSearchInputChange($event)" />
  @if (searchText) {
  <button matSuffix mat-icon-button aria-label="Clear" (click)="clearFilter()">
    <mat-icon>close</mat-icon>
  </button>
  }
</mat-form-field>

<table *ngIf="books" mat-table [dataSource]="books" class="library-table" matSort matSortActive="ordering" matSortDirection="desc" (matSortChange)="handleSortEvent($event)">
  <!-- Title Column -->
  <ng-container matColumnDef="title">
    <th mat-header-cell *matHeaderCellDef mat-sort-header>Title</th>
    <td mat-cell *matCellDef="let row">{{ row.title }}</td>
  </ng-container>

  <!-- State Column -->
  <ng-container matColumnDef="author_name">
    <th mat-header-cell *matHeaderCellDef mat-sort-header>Author</th>
    <td mat-cell *matCellDef="let row">{{ row.author_name }}</td>
  </ng-container>

  <!-- Created Column -->
  <ng-container matColumnDef="publication_date">
    <th mat-header-cell *matHeaderCellDef mat-sort-header>Published</th>
    <td mat-cell *matCellDef="let row">{{ row.publication_date | date }}</td>
  </ng-container>

  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
  <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
</table>
<mat-paginator
  #paginator
  [pageSize]="pageSize"
  [pageSizeOptions]="pageSizeOptions"
  [length]="totalBooks"
  [pageIndex]="pageIndex"
  (page)="handlePageEvent($event)"
  aria-label="Select page"
>
</mat-paginator>
```

and remove `title = 'Library';` property from our `library.component.ts`.
