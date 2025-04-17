import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownComponent } from 'ngx-markdown';
import { chapters } from './lore.chapters';
import { HttpClient } from '@angular/common/http';
import { ChapterListComponent } from '../components/chapter-list/chapter-list.component';

interface Chapter {
  title: string;
  file: string;
  isCompleted?: boolean;
}

@Component({
  selector: 'app-lore',
  standalone: true,
  imports: [CommonModule, MarkdownComponent, ChapterListComponent],
  templateUrl: './lore.component.html',
  styleUrls: ['./lore.component.scss'],
})
export class LoreComponent implements OnInit {
  selectedChapterIndex = 0;
  chapters: Chapter[] = [];
  chaptersWithProgress: Chapter[] = [];
  completedChapters = 4; // This would normally be loaded from a service
  totalChapters = 60;
  loreScore = 56;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.chapters = chapters;
    this.chaptersWithProgress = this.chapters.map((chapter, index) => ({
      ...chapter,
      isCompleted: index < this.completedChapters,
    }));
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

  getChapterLink(index: number): string {
    return `/chapters/${this.chapters[index].file}`;
  }
}
