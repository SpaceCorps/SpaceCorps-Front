import { Component, OnInit } from '@angular/core';
import { MarkdownComponent } from 'ngx-markdown';
import { chapters } from './lore.chapters';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lore',
  templateUrl: './lore.component.html',
  styleUrls: ['./lore.component.scss'],
  imports: [FormsModule, MarkdownComponent],
})
export class LoreComponent implements OnInit {
  selectedChapterIndex = 0;
  chapters: { title: string; file: string }[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.chapters = chapters;
  }

  selectChapter(index: number): void {
    this.selectedChapterIndex = index;
  }

  navigateToPrevious(): void {
    if (this.selectedChapterIndex > 0) {
      this.selectedChapterIndex--;
    }
  }

  navigateToNext(): void {
    if (this.selectedChapterIndex < this.chapters.length - 1) {
      this.selectedChapterIndex++;
    }
  }

  getChapterLink(arg0: number): string {
    return `/chapters/${this.chapters[arg0].file}`;
  }
}
