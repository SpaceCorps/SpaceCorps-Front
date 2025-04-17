import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Chapter {
  title: string;
  file: string;
  isCompleted?: boolean;
}

@Component({
  selector: 'app-chapter-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chapter-list.component.html',
  styleUrl: './chapter-list.component.scss',
})
export class ChapterListComponent {
  @Input() chapters: Chapter[] = [];
  @Input() selectedIndex = 0;
  @Output() chapterSelected = new EventEmitter<number>();

  selectChapter(index: number) {
    this.chapterSelected.emit(index);
  }
}
