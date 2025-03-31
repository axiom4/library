import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LibraryComponent } from './modules/library/components/library/library.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LibraryComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
/**
 * The `AppComponent` serves as the root component of the Library application.
 * It initializes the application state and interacts with the `LibraryService`
 * to fetch and display a list of books.
 *
 * @implements {OnInit}
 */
export class AppComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
