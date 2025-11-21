import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { UrlStateService } from './url-state.service';

describe('UrlStateService', () => {
  let service: UrlStateService;
  let router: jasmine.SpyObj<Router>;
  let route: any;
  let queryParamsSubject: BehaviorSubject<any>;

  beforeEach(() => {
    queryParamsSubject = new BehaviorSubject({});

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    routerSpy.navigate.and.returnValue(Promise.resolve(true));

    const routeMock = {
      snapshot: {
        queryParams: {}
      },
      queryParams: queryParamsSubject.asObservable()
    };

    TestBed.configureTestingModule({
      providers: [
        UrlStateService,
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: routeMock }
      ]
    });

    service = TestBed.inject(UrlStateService);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    route = TestBed.inject(ActivatedRoute);
  });

  describe('Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize from route snapshot', () => {
      route.snapshot.queryParams = { page: '1', search: 'test' };
      const newService = new UrlStateService(router, route);

      const params = newService.getParams();
      expect(params).toEqual({ page: '1', search: 'test' });
    });
  });

  describe('getParams()', () => {
    it('should return current parameters', () => {
      queryParamsSubject.next({ page: 1, search: 'test' });

      const params = service.getParams();
      expect(params).toEqual({ page: 1, search: 'test' });
    });

    it('should return typed parameters', () => {
      interface TestParams {
        page: number;
        search: string;
      }

      queryParamsSubject.next({ page: 1, search: 'test' });

      const params = service.getParams<TestParams>();
      expect(params.page).toBe(1);
      expect(params.search).toBe('test');
    });

    it('should return empty object when no params', () => {
      const params = service.getParams();
      expect(params).toEqual({});
    });
  });

  describe('setParams()', () => {
    it('should update URL with new parameters', fakeAsync(() => {
      service.setParams({ page: 2, search: 'test' });
      tick();

      expect(router.navigate).toHaveBeenCalledWith(
        [],
        jasmine.objectContaining({
          queryParams: { page: 2, search: 'test' },
          replaceUrl: false
        })
      );
    }));

    it('should merge with existing parameters', fakeAsync(() => {
      queryParamsSubject.next({ existing: 'value' });
      tick();

      service.setParams({ page: 2 });
      tick();

      expect(router.navigate).toHaveBeenCalledWith(
        [],
        jasmine.objectContaining({
          queryParams: { existing: 'value', page: 2 }
        })
      );
    }));

    it('should remove parameters when set to null', fakeAsync(() => {
      queryParamsSubject.next({ page: 1, search: 'test' });
      tick();

      service.setParams({ search: null });
      tick();

      expect(router.navigate).toHaveBeenCalledWith(
        [],
        jasmine.objectContaining({
          queryParams: { page: 1 }
        })
      );
    }));

    it('should remove parameters when set to undefined', fakeAsync(() => {
      queryParamsSubject.next({ page: 1, search: 'test' });
      tick();

      service.setParams({ search: undefined });
      tick();

      expect(router.navigate).toHaveBeenCalledWith(
        [],
        jasmine.objectContaining({
          queryParams: { page: 1 }
        })
      );
    }));

    it('should use replaceUrl when specified', fakeAsync(() => {
      service.setParams({ page: 2 }, true);
      tick();

      expect(router.navigate).toHaveBeenCalledWith(
        [],
        jasmine.objectContaining({
          replaceUrl: true
        })
      );
    }));

    it('should return navigation result', fakeAsync(() => {
      let result: boolean | undefined;
      service.setParams({ page: 2 }).then(r => result = r);
      tick();

      expect(result).toBe(true);
    }));
  });

  describe('watchParams()', () => {
    it('should emit current parameters', (done) => {
      queryParamsSubject.next({ page: 1, search: 'test' });

      service.watchParams().subscribe(params => {
        expect(params).toEqual({ page: 1, search: 'test' });
        done();
      });
    });

    it('should emit on parameter changes', (done) => {
      const emittedValues: any[] = [];

      service.watchParams().subscribe(params => {
        emittedValues.push(params);

        if (emittedValues.length === 2) {
          expect(emittedValues[0]).toEqual({});
          expect(emittedValues[1]).toEqual({ page: 2 });
          done();
        }
      });

      setTimeout(() => queryParamsSubject.next({ page: 2 }), 10);
    });

    it('should not emit duplicate values', (done) => {
      const emittedValues: any[] = [];

      service.watchParams().subscribe(params => {
        emittedValues.push(params);
      });

      setTimeout(() => queryParamsSubject.next({ page: 1 }), 10);
      setTimeout(() => queryParamsSubject.next({ page: 1 }), 20);
      setTimeout(() => {
        expect(emittedValues.length).toBe(2); // Initial + one change
        done();
      }, 50);
    });

    it('should support typed parameters', (done) => {
      interface TestParams {
        page: number;
        search: string;
      }

      queryParamsSubject.next({ page: 1, search: 'test' });

      service.watchParams<TestParams>().subscribe(params => {
        expect(params.page).toBe(1);
        expect(params.search).toBe('test');
        done();
      });
    });
  });

  describe('clearParams()', () => {
    it('should clear all parameters', fakeAsync(() => {
      queryParamsSubject.next({ page: 1, search: 'test' });
      tick();

      service.clearParams();
      tick();

      expect(router.navigate).toHaveBeenCalledWith(
        [],
        jasmine.objectContaining({
          queryParams: {}
        })
      );
    }));

    it('should use replaceUrl when specified', fakeAsync(() => {
      service.clearParams(true);
      tick();

      expect(router.navigate).toHaveBeenCalledWith(
        [],
        jasmine.objectContaining({
          replaceUrl: true
        })
      );
    }));
  });

  describe('getParam()', () => {
    it('should return specific parameter value', () => {
      queryParamsSubject.next({ page: 1, search: 'test' });

      expect(service.getParam('page')).toBe(1);
      expect(service.getParam('search')).toBe('test');
    });

    it('should return null for non-existent parameter', () => {
      queryParamsSubject.next({ page: 1 });

      expect(service.getParam('search')).toBeNull();
    });
  });

  describe('setParam()', () => {
    it('should set a specific parameter', fakeAsync(() => {
      service.setParam('page', 2);
      tick();

      expect(router.navigate).toHaveBeenCalledWith(
        [],
        jasmine.objectContaining({
          queryParams: { page: 2 }
        })
      );
    }));

    it('should merge with existing parameters', fakeAsync(() => {
      queryParamsSubject.next({ search: 'test' });
      tick();

      service.setParam('page', 2);
      tick();

      expect(router.navigate).toHaveBeenCalledWith(
        [],
        jasmine.objectContaining({
          queryParams: { search: 'test', page: 2 }
        })
      );
    }));
  });

  describe('hasParam()', () => {
    it('should return true if parameter exists', () => {
      queryParamsSubject.next({ page: 1, search: 'test' });

      expect(service.hasParam('page')).toBe(true);
      expect(service.hasParam('search')).toBe(true);
    });

    it('should return false if parameter does not exist', () => {
      queryParamsSubject.next({ page: 1 });

      expect(service.hasParam('search')).toBe(false);
    });
  });

  describe('watchParam()', () => {
    it('should watch specific parameter', (done) => {
      queryParamsSubject.next({ page: 1 });

      service.watchParam('page').subscribe(value => {
        expect(value).toBe(1);
        done();
      });
    });

    it('should emit null for non-existent parameter', (done) => {
      queryParamsSubject.next({});

      service.watchParam('page').subscribe(value => {
        expect(value).toBeNull();
        done();
      });
    });

    it('should emit on parameter changes', (done) => {
      const emittedValues: any[] = [];

      service.watchParam('page').subscribe(value => {
        emittedValues.push(value);

        if (emittedValues.length === 2) {
          expect(emittedValues[0]).toBeNull();
          expect(emittedValues[1]).toBe(2);
          done();
        }
      });

      setTimeout(() => queryParamsSubject.next({ page: 2 }), 10);
    });
  });

  describe('serializeParams()', () => {
    it('should serialize params to query string', () => {
      const params = { page: 1, search: 'test', active: true };
      const queryString = service.serializeParams(params);

      expect(queryString).toContain('page=1');
      expect(queryString).toContain('search=test');
      expect(queryString).toContain('active=true');
    });

    it('should handle array parameters', () => {
      const params = { ids: ['1', '2', '3'] };
      const queryString = service.serializeParams(params);

      expect(queryString).toBe('ids=1%2C2%2C3');
    });

    it('should skip null and undefined values', () => {
      const params = { page: 1, search: null, filter: undefined };
      const queryString = service.serializeParams(params);

      expect(queryString).toBe('page=1');
    });

    it('should return empty string for empty params', () => {
      const queryString = service.serializeParams({});
      expect(queryString).toBe('');
    });
  });

  describe('deserializeParams()', () => {
    it('should deserialize query string to params', () => {
      const queryString = 'page=1&search=test';
      const params = service.deserializeParams(queryString);

      expect(params).toEqual({ page: 1, search: 'test' });
    });

    it('should handle leading question mark', () => {
      const queryString = '?page=1&search=test';
      const params = service.deserializeParams(queryString);

      expect(params).toEqual({ page: 1, search: 'test' });
    });

    it('should parse numbers', () => {
      const queryString = 'page=1&size=20';
      const params = service.deserializeParams(queryString);

      expect(params['page']).toBe(1);
      expect(params['size']).toBe(20);
    });

    it('should parse booleans', () => {
      const queryString = 'active=true&archived=false';
      const params = service.deserializeParams(queryString);

      expect(params['active']).toBe(true);
      expect(params['archived']).toBe(false);
    });

    it('should parse comma-separated arrays', () => {
      const queryString = 'ids=1,2,3';
      const params = service.deserializeParams(queryString);

      expect(params['ids']).toEqual(['1', '2', '3']);
    });

    it('should keep strings as strings', () => {
      const queryString = 'search=test&name=John%20Doe';
      const params = service.deserializeParams(queryString);

      expect(params['search']).toBe('test');
      expect(params['name']).toBe('John Doe');
    });

    it('should return empty object for empty string', () => {
      const params = service.deserializeParams('');
      expect(params).toEqual({});
    });
  });
});
