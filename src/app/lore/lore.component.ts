import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownComponent } from 'ngx-markdown';
import { chapters } from './lore.chapters';
import { HttpClient } from '@angular/common/http';
import { ChapterListComponent } from '../components/chapter-list/chapter-list.component';
import { StateService } from '../services/state.service';
import { AuthService } from '../services/auth.service';

interface Chapter {
  id: number;
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
  completedChapters = 0;
  totalChapters = chapters.length;
  loreScore = 0;

  private stateService = inject(StateService);
  private authService = inject(AuthService);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.chapters = chapters.map((chapter, index) => ({
      ...chapter,
      id: index + 1, // Assuming chapter IDs start from 1
    }));

    // Initialize chaptersWithProgress immediately with all chapters marked as not completed
    this.chaptersWithProgress = this.chapters.map((chapter) => ({
      ...chapter,
      isCompleted: false,
    }));

    this.authService.authState$.subscribe(state => {
      if (state.userId) {
        this.loadChapterProgress(state.userId);
      }
    });
  }

  private async loadChapterProgress(userId: string) {
    const progress = await this.stateService.fetchChapterProgress(userId);
    if (progress) {
      this.chaptersWithProgress = this.chapters.map((chapter) => ({
        ...chapter,
        isCompleted: progress.completedChapterIds.includes(chapter.id),
      }));
      this.completedChapters = progress.completedChapterIds.length;
      this.loreScore = Math.round(
        (this.completedChapters / this.totalChapters) * 100
      );
    }
  }

  async markChapterAsCompleted(index: number) {
    this.authService.authState$.subscribe(state => {
      if (!state.userId) {
        console.error('No user ID found');
        return;
      }

      const chapter = this.chapters[index];
      if (!chapter || chapter.isCompleted) {
        return;
      }

      const currentProgress = this.stateService.currentChapterProgress();
      const completedChapterIds = currentProgress?.completedChapterIds || [];

      if (!completedChapterIds.includes(chapter.id)) {
        this.stateService.updateChapterProgress({
          userId: state.userId!,
          completedChapterIds: [...completedChapterIds, chapter.id],
        }).then(() => this.loadChapterProgress(state.userId!));
      }
    });
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
      // Automatically mark the previous chapter as completed when moving forward
      this.markChapterAsCompleted(this.selectedChapterIndex - 1);
    }
  }

  getChapterLink(index: number): string {
    return `/chapters/${this.chapters[index].file}`;
  }
}
