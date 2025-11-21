import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { ResourceManagementService } from './resource-management.service';
import { UrlStateService } from './url-state.service';
import {
  ResourceManagementConfig,
  IFilterUrlMapper,
  IApiAdapter,
  ICacheKeyBuilder,
  ApiAdapterResponse
} from '../models/resource-management.interface';
import { Params } from '@angular/router';

interface TestFilters {
  search: string;
  page: number;
  size: number;
}

interface TestData {
  id: string;
  name: string;
}

interface TestStatistics {
  total: number;
  average: number;
}

describe('ResourceManagementService', () => {
  let service: ResourceManagementService<TestFilters, TestData, TestStatistics>;
  let urlState: jasmine.SpyObj<UrlStateService>;
  let filterMapper: jasmine.SpyObj<IFilterUrlMapper<TestFilters>>;
  let apiAdapter: jasmine.SpyObj<IApiAdapter<TestFilters, TestData, TestStatistics>>;
  let cacheKeyBuilder: jasmine.SpyObj<ICacheKeyBuilder<TestFilters>>;
  let config: ResourceManagementConfig<TestFilters, TestData, TestStatistics>;
  let urlParamsSubject: BehaviorSubject<Params>;

  const defaultFilters: TestFilters = {
    search: '',
    page: 1,
    size: 20
  };

  const mockApiResponse: ApiAdapterResponse<TestData, TestStatistics> = {
    results: [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' }
    ],
    total: 100,
    statistics: {
      total: 100,
      average: 50
    }
  };

  beforeEach(() => {
    urlParamsSubject = new BehaviorSubject<Params>({});

    const urlStateSpy = jasmine.createSpyObj('UrlStateService', [
      'getParams',
      'setParams',
      'watchParams'
    ]);
    urlStateSpy.getParams.and.returnValue({});
    urlStateSpy.setParams.and.returnValue(Promise.resolve(true));
    urlStateSpy.watchParams.and.returnValue(urlParamsSubject.asObservable());

    const filterMapperSpy = jasmine.createSpyObj('IFilterUrlMapper', [
      'toUrlParams',
      'fromUrlParams'
    ]);
    filterMapperSpy.fromUrlParams.and.returnValue(defaultFilters);
    filterMapperSpy.toUrlParams.and.returnValue({});

    const apiAdapterSpy = jasmine.createSpyObj('IApiAdapter', ['fetchData']);
    apiAdapterSpy.fetchData.and.returnValue(of(mockApiResponse));

    const cacheKeyBuilderSpy = jasmine.createSpyObj('ICacheKeyBuilder', [
      'buildKey'
    ]);
    cacheKeyBuilderSpy.buildKey.and.returnValue('cache-key');

    config = {
      filterMapper: filterMapperSpy,
      apiAdapter: apiAdapterSpy,
      cacheKeyBuilder: cacheKeyBuilderSpy,
      defaultFilters,
      autoFetch: true
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: UrlStateService, useValue: urlStateSpy }
      ]
    });

    urlState = TestBed.inject(UrlStateService) as jasmine.SpyObj<UrlStateService>;
    filterMapper = filterMapperSpy;
    apiAdapter = apiAdapterSpy;
    cacheKeyBuilder = cacheKeyBuilderSpy;

    service = new ResourceManagementService(urlState, config);
  });

  afterEach(() => {
    service.ngOnDestroy();
  });

  describe('Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize from URL params', () => {
      expect(urlState.getParams).toHaveBeenCalled();
      expect(filterMapper.fromUrlParams).toHaveBeenCalled();
    });

    it('should fetch data on initialization if autoFetch is true', () => {
      expect(apiAdapter.fetchData).toHaveBeenCalledWith(defaultFilters);
    });

    it('should not fetch data on initialization if autoFetch is false', () => {
      apiAdapter.fetchData.calls.reset();

      const noFetchConfig = { ...config, autoFetch: false };
      const noFetchService = new ResourceManagementService(urlState, noFetchConfig);

      expect(apiAdapter.fetchData).not.toHaveBeenCalled();

      noFetchService.ngOnDestroy();
    });
  });

  describe('State Observables', () => {
    it('should emit initial state', (done) => {
      service.state$.subscribe(state => {
        expect(state).toBeDefined();
        expect(state.filters).toEqual(defaultFilters);
        done();
      });
    });

    it('should emit filters', (done) => {
      service.filters$.subscribe(filters => {
        expect(filters).toEqual(defaultFilters);
        done();
      });
    });

    it('should emit results after data fetch', (done) => {
      service.results$.subscribe(results => {
        if (results.length > 0) {
          expect(results).toEqual(mockApiResponse.results);
          done();
        }
      });
    });

    it('should emit totalResults', (done) => {
      service.totalResults$.subscribe(total => {
        if (total > 0) {
          expect(total).toBe(100);
          done();
        }
      });
    });

    it('should emit loading state', (done) => {
      service.loading$.subscribe(loading => {
        expect(typeof loading).toBe('boolean');
        done();
      });
    });

    it('should emit statistics', (done) => {
      service.statistics$.subscribe(stats => {
        if (stats) {
          expect(stats.total).toBe(100);
          expect(stats.average).toBe(50);
          done();
        }
      });
    });
  });

  describe('updateFilters()', () => {
    it('should update filters and trigger URL update', fakeAsync(() => {
      const newFilters = { search: 'test' };
      const expectedFilters = { ...defaultFilters, search: 'test' };

      filterMapper.toUrlParams.and.returnValue({ search: 'test' });

      service.updateFilters(newFilters);
      tick();

      expect(filterMapper.toUrlParams).toHaveBeenCalledWith(expectedFilters);
      expect(urlState.setParams).toHaveBeenCalledWith({ search: 'test' });
    }));

    it('should merge partial filters with existing filters', fakeAsync(() => {
      const mergedFilters = { ...defaultFilters, search: 'test' };
      filterMapper.fromUrlParams.and.returnValue(mergedFilters);

      service.updateFilters({ search: 'test' });
      tick();

      // Trigger URL change to update state
      urlParamsSubject.next({ search: 'test' });
      tick();

      const currentFilters = service.getCurrentFilters();
      expect(currentFilters.search).toBe('test');
      expect(currentFilters.page).toBe(defaultFilters.page);
      expect(currentFilters.size).toBe(defaultFilters.size);
    }));
  });

  describe('clearFilters()', () => {
    it('should reset to default filters', fakeAsync(() => {
      filterMapper.toUrlParams.and.returnValue({});

      service.clearFilters();
      tick();

      expect(filterMapper.toUrlParams).toHaveBeenCalledWith(defaultFilters);
      expect(urlState.setParams).toHaveBeenCalledWith({}, true);
    }));
  });

  describe('refresh()', () => {
    it('should re-fetch data with current filters', () => {
      apiAdapter.fetchData.calls.reset();

      service.refresh();

      expect(apiAdapter.fetchData).toHaveBeenCalledWith(service.getCurrentFilters());
    });
  });

  describe('getCurrentState()', () => {
    it('should return current state snapshot', () => {
      const state = service.getCurrentState();

      expect(state).toBeDefined();
      expect(state.filters).toEqual(defaultFilters);
      expect(state.results).toBeDefined();
      expect(state.loading).toBeDefined();
    });
  });

  describe('getCurrentFilters()', () => {
    it('should return current filters snapshot', () => {
      const filters = service.getCurrentFilters();

      expect(filters).toEqual(defaultFilters);
    });
  });

  describe('URL Change Watching', () => {
    it('should update filters when URL changes', fakeAsync(() => {
      const newFilters: TestFilters = { search: 'new', page: 2, size: 50 };
      filterMapper.fromUrlParams.and.returnValue(newFilters);

      urlParamsSubject.next({ search: 'new', page: '2', size: '50' });
      tick();

      expect(filterMapper.fromUrlParams).toHaveBeenCalledWith({
        search: 'new',
        page: '2',
        size: '50'
      });

      const currentFilters = service.getCurrentFilters();
      expect(currentFilters).toEqual(newFilters);
    }));

    it('should fetch data when URL changes', fakeAsync(() => {
      apiAdapter.fetchData.calls.reset();

      const newFilters: TestFilters = { search: 'test', page: 1, size: 20 };
      filterMapper.fromUrlParams.and.returnValue(newFilters);

      urlParamsSubject.next({ search: 'test' });
      tick();

      expect(apiAdapter.fetchData).toHaveBeenCalledWith(newFilters);
    }));
  });

  describe('Data Fetching', () => {
    it('should set loading to true before fetching', fakeAsync(() => {
      let sawLoadingTrue = false;

      service.loading$.subscribe(loading => {
        if (loading) {
          sawLoadingTrue = true;
        }
      });

      service.refresh();
      tick();

      expect(sawLoadingTrue).toBe(true);
    }));

    it('should set loading to false after successful fetch', (done) => {
      service.loading$.subscribe(loading => {
        if (!loading && service.getCurrentState().results.length > 0) {
          expect(loading).toBe(false);
          done();
        }
      });
    });

    it('should handle fetch errors', fakeAsync(() => {
      apiAdapter.fetchData.and.returnValue(
        throwError(() => new Error('API Error'))
      );

      service.refresh();
      tick();

      const state = service.getCurrentState();
      expect(state.error).toBeTruthy();
      expect(state.error?.message).toBe('API Error');
      expect(state.loading).toBe(false);
      expect(state.results).toEqual([]);
    }));

    it('should set error to null on successful fetch', fakeAsync(() => {
      // First cause an error
      apiAdapter.fetchData.and.returnValue(
        throwError(() => new Error('API Error'))
      );
      service.refresh();
      tick();

      expect(service.getCurrentState().error).toBeTruthy();

      // Then succeed
      apiAdapter.fetchData.and.returnValue(of(mockApiResponse));
      service.refresh();
      tick();

      expect(service.getCurrentState().error).toBeNull();
    }));
  });

  describe('ngOnDestroy()', () => {
    it('should complete subscriptions', () => {
      const destroySpy = spyOn(service['destroy$'], 'next');
      const completeSpy = spyOn(service['destroy$'], 'complete');

      service.ngOnDestroy();

      expect(destroySpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });
});
