import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberFormat',
  standalone: true
})
export class NumberFormatPipe implements PipeTransform {
  transform(value: number | string): string {
    // Convert to number if string
    const num = typeof value === 'string' ? parseInt(value) : value;
    
    // Format with thousand separators
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  }
} 