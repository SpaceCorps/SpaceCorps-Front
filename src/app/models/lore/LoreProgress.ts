export interface ChapterProgress {
  chapterId: number;
  isCompleted: boolean;
  readCount: number;
}

export interface UserLoreProgress {
  userId: string;
  totalChapters: number;
  completedChapters: number;
  loreScore: number;
  chapterProgress: ChapterProgress[];
}

export interface Chapter {
  id: number;
  title: string;
  file: string;
  isCompleted?: boolean;
} 