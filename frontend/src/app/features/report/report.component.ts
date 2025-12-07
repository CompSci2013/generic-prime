import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Report Component
 *
 * Displays Playwright test report in an iframe with cache busting
 *
 * The iframe loads the report with a timestamp query parameter that forces
 * the browser to fetch fresh content instead of showing cached results.
 *
 * To view the live report after running tests:
 * 1. Run: npm run test:e2e (in the e2e container)
 * 2. Navigate to: http://localhost:4205/report
 * 3. The report will automatically load the latest test results
 */
@Component({
  selector: 'app-report',
  template: `
    <div class="report-container">
      <iframe
        [src]="reportUrl"
        class="report-iframe"
        title="Playwright Test Report">
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
      background: #f5f5f5;
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

  constructor(private sanitizer: DomSanitizer) {
    // Initialize with cache-busting timestamp
    this.reportUrl = this.getReportUrl();
  }

  ngOnInit() {
    console.log('Playwright test report page loaded with live updates.');
  }

  /**
   * Generate report URL with cache-busting query parameter
   * The timestamp forces the browser to always fetch fresh content
   */
  private getReportUrl(): SafeResourceUrl {
    const timestamp = Date.now();
    const url = `/report/index.html?t=${timestamp}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
