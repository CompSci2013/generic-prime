import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

/**
 * Report Component
 *
 * Loads and displays the live Playwright test report from playwright-report/index.html
 * The report updates automatically after each test run - no rebuild needed
 */
@Component({
  selector: 'app-report',
  template: `
    <div class="report-container">
      <iframe
        [src]="reportUrl"
        frameborder="0"
        class="report-iframe">
      </iframe>
    </div>
  `,
  styles: [`
    .report-container {
      display: flex;
      width: 100%;
      height: 100vh;
      margin: 0;
      padding: 0;
    }

    .report-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  `]
})
export class ReportComponent implements OnInit {
  reportUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer, private http: HttpClient) {
    // Default URL - will be updated in ngOnInit
    this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl('/playwright-report/index.html');
  }

  ngOnInit() {
    // Try to load the live report from the dev server
    // The dev server serves playwright-report/ as static content
    // This allows the report to update automatically after each test run
    this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl('/playwright-report/index.html');

    // Verify the report exists by checking if index.html is accessible
    this.http.head('/playwright-report/index.html', { observe: 'response' }).subscribe({
      next: () => {
        console.log('Live Playwright report loaded successfully');
      },
      error: (error) => {
        console.warn('Live report not found. Run tests to generate: npm run test:e2e', error);
      }
    });
  }
}
