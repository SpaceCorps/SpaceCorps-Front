import * as THREE from 'three';

export class UpdateManager {
  private lastUpdateTime: number = 0;
  private lastSignalRUpdateTime: number = 0;
  private updateInterval: number = 0;
  private readonly SMOOTHING_WINDOW = 5; // Number of updates to average for smoothing
  private updateIntervals: number[] = [];
  private isFirstUpdate: boolean = true;

  constructor() {
    this.lastUpdateTime = performance.now();
    this.lastSignalRUpdateTime = this.lastUpdateTime;
  }

  public onSignalRUpdate(): void {
    const currentTime = performance.now();
    if (!this.isFirstUpdate) {
      const interval = currentTime - this.lastSignalRUpdateTime;
      this.updateIntervals.push(interval);
      
      // Keep only the last N intervals for smoothing
      if (this.updateIntervals.length > this.SMOOTHING_WINDOW) {
        this.updateIntervals.shift();
      }
      
      // Calculate average update interval
      this.updateInterval = this.updateIntervals.reduce((a, b) => a + b, 0) / this.updateIntervals.length;
    } else {
      this.isFirstUpdate = false;
    }
    this.lastSignalRUpdateTime = currentTime;
  }

  public getInterpolationFactor(): number {
    const currentTime = performance.now();
    const timeSinceLastUpdate = currentTime - this.lastUpdateTime;
    
    // If we don't have enough data yet, use a default factor
    if (this.updateInterval === 0) {
      return 0.1; // Default interpolation factor
    }
    
    // Calculate how far we are between updates
    const progress = timeSinceLastUpdate / this.updateInterval;
    
    // Clamp the progress between 0 and 1
    return Math.min(Math.max(progress, 0), 1);
  }

  public update(): void {
    this.lastUpdateTime = performance.now();
  }

  public getUpdateInterval(): number {
    return this.updateInterval;
  }
} 