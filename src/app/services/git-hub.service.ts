import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Commit } from '../components/github-timeline/dtos';

@Injectable({
  providedIn: 'root',
})
export class GitHubService {
  private apiUrl =
    'https://api.github.com/repos/rorychatt/SpaceCorps-Front/commits?per_page=1000';

  constructor(private http: HttpClient) {}

  getCommits() {
    return this.http.get<Commit[]>(this.apiUrl);
  }
}
