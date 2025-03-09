import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-book',
  imports: [],
  templateUrl: './book.component.html',
  styleUrl: './book.component.scss',
})
export class BookComponent implements OnInit {
  bookId: number | undefined;

  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    this.bookId = this.route.snapshot.params['id'];
  }
}
