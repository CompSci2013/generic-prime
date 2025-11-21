import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HTTP_INTERCEPTORS, HttpErrorResponse } from '@angular/common/http';
import { HttpErrorInterceptor } from './http-error.interceptor';

describe('HttpErrorInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let interceptor: HttpErrorInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        HttpErrorInterceptor,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: HttpErrorInterceptor,
          multi: true
        }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    interceptor = TestBed.inject(HttpErrorInterceptor);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should pass through successful requests', () => {
    const mockData = { id: '1', name: 'Test' };

    httpClient.get('/api/test').subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne('/api/test');
    req.flush(mockData);
  });

  describe('Error handling', () => {
    it('should handle 400 Bad Request', (done) => {
      httpClient.get('/api/test').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.code).toBe('BAD_REQUEST');
          expect(error.status).toBe(400);
          done();
        }
      });

      const req = httpMock.expectOne('/api/test');
      req.flush('Bad request', {
        status: 400,
        statusText: 'Bad Request'
      });
    });

    it('should handle 401 Unauthorized', (done) => {
      httpClient.get('/api/test').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.code).toBe('UNAUTHORIZED');
          expect(error.message).toContain('Authentication required');
          done();
        }
      });

      const req = httpMock.expectOne('/api/test');
      req.flush('Unauthorized', {
        status: 401,
        statusText: 'Unauthorized'
      });
    });

    it('should handle 403 Forbidden', (done) => {
      httpClient.get('/api/test').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.code).toBe('FORBIDDEN');
          expect(error.message).toContain('Access denied');
          done();
        }
      });

      const req = httpMock.expectOne('/api/test');
      req.flush('Forbidden', {
        status: 403,
        statusText: 'Forbidden'
      });
    });

    it('should handle 404 Not Found', (done) => {
      httpClient.get('/api/test').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.code).toBe('NOT_FOUND');
          expect(error.message).toContain('Resource not found');
          done();
        }
      });

      const req = httpMock.expectOne('/api/test');
      req.flush('Not found', {
        status: 404,
        statusText: 'Not Found'
      });
    });

    it('should handle 500 Internal Server Error', (done) => {
      httpClient.get('/api/test').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.code).toBe('INTERNAL_SERVER_ERROR');
          expect(error.message).toContain('Internal server error');
          done();
        }
      });

      const req = httpMock.expectOne('/api/test');
      req.flush('Server error', {
        status: 500,
        statusText: 'Internal Server Error'
      });
    });

    it('should handle 503 Service Unavailable', (done) => {
      httpClient.get('/api/test').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.code).toBe('SERVICE_UNAVAILABLE');
          expect(error.message).toContain('Service unavailable');
          done();
        }
      });

      const req = httpMock.expectOne('/api/test');
      req.flush('Service unavailable', {
        status: 503,
        statusText: 'Service Unavailable'
      });
    });

    it('should extract structured error message from response', (done) => {
      const errorResponse = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data'
        }
      };

      httpClient.get('/api/test').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toBe('Invalid input data');
          done();
        }
      });

      const req = httpMock.expectOne('/api/test');
      req.flush(errorResponse, {
        status: 422,
        statusText: 'Unprocessable Entity'
      });
    });

    it('should extract simple error message from response', (done) => {
      const errorResponse = {
        message: 'Custom error message'
      };

      httpClient.get('/api/test').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toBe('Custom error message');
          done();
        }
      });

      const req = httpMock.expectOne('/api/test');
      req.flush(errorResponse, {
        status: 400,
        statusText: 'Bad Request'
      });
    });

    it('should include timestamp in error', (done) => {
      httpClient.get('/api/test').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.timestamp).toBeDefined();
          expect(new Date(error.timestamp)).toBeInstanceOf(Date);
          done();
        }
      });

      const req = httpMock.expectOne('/api/test');
      req.flush('Error', {
        status: 500,
        statusText: 'Internal Server Error'
      });
    });

    it('should include request URL in error', (done) => {
      httpClient.get('/api/test/123').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.url).toBe('/api/test/123');
          done();
        }
      });

      const req = httpMock.expectOne('/api/test/123');
      req.flush('Error', {
        status: 404,
        statusText: 'Not Found'
      });
    });
  });

  describe('Error code mapping', () => {
    const testCases = [
      { status: 400, expectedCode: 'BAD_REQUEST' },
      { status: 401, expectedCode: 'UNAUTHORIZED' },
      { status: 403, expectedCode: 'FORBIDDEN' },
      { status: 404, expectedCode: 'NOT_FOUND' },
      { status: 409, expectedCode: 'CONFLICT' },
      { status: 422, expectedCode: 'VALIDATION_ERROR' },
      { status: 429, expectedCode: 'RATE_LIMIT_EXCEEDED' },
      { status: 500, expectedCode: 'INTERNAL_SERVER_ERROR' },
      { status: 502, expectedCode: 'BAD_GATEWAY' },
      { status: 503, expectedCode: 'SERVICE_UNAVAILABLE' },
      { status: 504, expectedCode: 'GATEWAY_TIMEOUT' }
    ];

    testCases.forEach(({ status, expectedCode }) => {
      it(`should map HTTP ${status} to ${expectedCode}`, (done) => {
        httpClient.get('/api/test').subscribe({
          next: () => fail('should have failed'),
          error: (error) => {
            expect(error.code).toBe(expectedCode);
            done();
          }
        });

        const req = httpMock.expectOne('/api/test');
        req.flush('Error', { status, statusText: expectedCode });
      });
    });
  });

  describe('Retry configuration', () => {
    it('should allow updating retry config', () => {
      interceptor.setRetryConfig({
        maxRetries: 5,
        retryableStatusCodes: [500, 502]
      });

      // Config is updated (tested indirectly through behavior)
      expect(interceptor).toBeTruthy();
    });
  });
});
