import { Component } from '@angular/core';
import { GitHubService } from '../../services/git-hub.service';
import { DatePipe} from '@angular/common';

@Component({
  selector: 'app-github-timeline',
  imports: [DatePipe],
  templateUrl: './github-timeline.component.html',
  styleUrl: './github-timeline.component.scss',
})
export class GithubTimelineComponent {
  commits: any[] = [];

  constructor(private gitHubService: GitHubService) {}

  ngOnInit() {
    this.gitHubService.getCommits().subscribe((data: any) => {
      this.commits = data.filter(
        (commit: any) =>
          this.isBigRelease(commit.commit.message) ||
          this.isMergePullRequest(commit.commit.message),
      );
    });
  }

  isBigRelease(message: string): boolean {
    const regex = /^\d+\.\d+/;
    return regex.test(message);
  }

  isMergePullRequest(message: string): boolean {
    const regex = /^Merge pull request #\d+/;
    return regex.test(message);
  }

  isLastCommit(commit: any): boolean {
    return this.commits.indexOf(commit) === this.commits.length - 1;
  }
}
