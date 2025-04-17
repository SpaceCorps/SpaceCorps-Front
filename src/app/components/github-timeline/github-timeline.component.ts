import { Component, inject, OnInit, effect } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Commit } from './commit';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-github-timeline',
  imports: [DatePipe],
  templateUrl: './github-timeline.component.html',
  styleUrl: './github-timeline.component.scss',
})
export class GithubTimelineComponent implements OnInit {
  commits: Commit[] = [];

  stateService = inject(StateService);

  constructor() {
    // Set up effect to watch GitHub commits changes
    effect(() => {
      const allCommits = this.stateService.currentGithubCommits();
      if (allCommits) {
        this.commits = allCommits.filter(
          (commit: Commit) =>
            this.isBigRelease(commit.commit.message) ||
            this.isMergePullRequest(commit.commit.message)
        );
      }
    });
  }

  ngOnInit() {
    // Initial fetch of GitHub commits
    this.stateService.fetchGithubCommits();
  }

  isBigRelease(message: string): boolean {
    const regex = /^\d+\.\d+/;
    return regex.test(message);
  }

  isMergePullRequest(message: string): boolean {
    const regex = /^Merge pull request #\d+/;
    return regex.test(message);
  }

  isLastCommit(commit: Commit): boolean {
    return this.commits.indexOf(commit) === this.commits.length - 1;
  }
}
