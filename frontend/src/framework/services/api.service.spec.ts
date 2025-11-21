import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.interface';

interface TestData {
  id: string;
  name: string;
}

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('get()', () => {
    it('should execute GET request and return paginated response', () => {
      const mockResponse: ApiResponse<TestData> = {
        results: [
          { id: '1', name: 'Item 1' },
          { id: '2', name: 'Item 2' }
        ],
        total: 100,
        page: 1,
        size: 20,
        totalPages: 5
      };

      service.get<TestData>('/api/items').subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.results.length).toBe(2);
        expect(response.total).toBe(100);
      });

      const req = httpMock.expectOne('/api/items');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should serialize query parameters', () => {
      const mockResponse: ApiResponse<TestData> = {
        results: [],
        total: 0,
        page: 1,
        size: 20,
        totalPages: 0
      };

      service.get<TestData>('/api/items', {
        params: {
          page: 1,
          size: 20,
          search: 'test',
          active: true
        }
      }).subscribe();

      const req = httpMock.expectOne(
        r => r.url === '/api/items' && r.params.has('page')
      );

      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('size')).toBe('20');
      expect(req.request.params.get('search')).toBe('test');
      expect(req.request.params.get('active')).toBe('true');

      req.flush(mockResponse);
    });

    it('should handle array parameters as comma-separated', () => {
      const mockResponse: ApiResponse<TestData> = {
        results: [],
        total: 0,
        page: 1,
        size: 20,
        totalPages: 0
      };

      service.get<TestData>('/api/items', {
        params: {
          ids: ['1', '2', '3']
        }
      }).subscribe();

      const req = httpMock.expectOne(
        r => r.url === '/api/items' && r.params.has('ids')
      );

      expect(req.request.params.get('ids')).toBe('1,2,3');

      req.flush(mockResponse);
    });

    it('should skip null and undefined parameters', () => {
      const mockResponse: ApiResponse<TestData> = {
        results: [],
        total: 0,
        page: 1,
        size: 20,
        totalPages: 0
      };

      service.get<TestData>('/api/items', {
        params: {
          page: 1,
          search: null,
          filter: undefined,
          size: 20
        }
      }).subscribe();

      const req = httpMock.expectOne('/api/items?page=1&size=20');

      expect(req.request.params.has('search')).toBe(false);
      expect(req.request.params.has('filter')).toBe(false);

      req.flush(mockResponse);
    });

    it('should handle HTTP errors', () => {
      service.get<TestData>('/api/items').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          expect(error.message).toContain('500');
        }
      });

      const req = httpMock.expectOne('/api/items');
      req.flush('Server error', {
        status: 500,
        statusText: 'Internal Server Error'
      });
    });
  });

  describe('post()', () => {
    it('should execute POST request with body', () => {
      const requestBody = { name: 'New Item' };
      const mockResponse: TestData = { id: '1', name: 'New Item' };

      service.post<TestData>('/api/items', requestBody).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/api/items');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(requestBody);
      req.flush(mockResponse);
    });

    it('should include query parameters with POST', () => {
      const requestBody = { name: 'New Item' };
      const mockResponse: TestData = { id: '1', name: 'New Item' };

      service.post<TestData>('/api/items', requestBody, {
        params: { validate: true }
      }).subscribe();

      const req = httpMock.expectOne(
        r => r.url === '/api/items' && r.params.has('validate')
      );

      expect(req.request.params.get('validate')).toBe('true');

      req.flush(mockResponse);
    });
  });

  describe('put()', () => {
    it('should execute PUT request with body', () => {
      const requestBody = { id: '1', name: 'Updated Item' };
      const mockResponse: TestData = { id: '1', name: 'Updated Item' };

      service.put<TestData>('/api/items/1', requestBody).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/api/items/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(requestBody);
      req.flush(mockResponse);
    });
  });

  describe('patch()', () => {
    it('should execute PATCH request with body', () => {
      const requestBody = { name: 'Patched Item' };
      const mockResponse: TestData = { id: '1', name: 'Patched Item' };

      service.patch<TestData>('/api/items/1', requestBody).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/api/items/1');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(requestBody);
      req.flush(mockResponse);
    });
  });

  describe('delete()', () => {
    it('should execute DELETE request', () => {
      const mockResponse: TestData = { id: '1', name: 'Deleted Item' };

      service.delete<TestData>('/api/items/1').subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/api/items/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });

    it('should include query parameters with DELETE', () => {
      const mockResponse: TestData = { id: '1', name: 'Deleted Item' };

      service.delete<TestData>('/api/items/1', {
        params: { force: true }
      }).subscribe();

      const req = httpMock.expectOne(
        r => r.url === '/api/items/1' && r.params.has('force')
      );

      expect(req.request.params.get('force')).toBe('true');

      req.flush(mockResponse);
    });
  });

  describe('getStandard()', () => {
    it('should unwrap success response', () => {
      const mockData: TestData = { id: '1', name: 'Item 1' };
      const mockResponse = {
        success: true,
        data: mockData
      };

      service.getStandard<TestData>('/api/item/1').subscribe(response => {
        expect(response).toEqual(mockData);
      });

      const req = httpMock.expectOne('/api/item/1');
      req.flush(mockResponse);
    });

    it('should handle error response', () => {
      const mockResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Item not found'
        }
      };

      service.getStandard<TestData>('/api/item/999').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toBe('Item not found');
        }
      });

      const req = httpMock.expectOne('/api/item/999');
      req.flush(mockResponse);
    });
  });

  describe('Custom headers', () => {
    it('should include custom headers in request', () => {
      const mockResponse: ApiResponse<TestData> = {
        results: [],
        total: 0,
        page: 1,
        size: 20,
        totalPages: 0
      };

      service.get<TestData>('/api/items', {
        headers: {
          'X-Custom-Header': 'test-value',
          'Authorization': 'Bearer token123'
        }
      }).subscribe();

      const req = httpMock.expectOne('/api/items');

      expect(req.request.headers.get('X-Custom-Header')).toBe('test-value');
      expect(req.request.headers.get('Authorization')).toBe('Bearer token123');

      req.flush(mockResponse);
    });
  });
});
