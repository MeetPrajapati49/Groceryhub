import { of, BehaviorSubject } from 'rxjs';
import { CartService } from './cart.service';

describe('CartService', () => {
  let service: CartService;
  let mockApi: any;
  let mockAuth: any;
  let mockRouter: any;

  beforeEach(() => {
    localStorage.clear();
    mockApi = {
      get: jest.fn().mockReturnValue(of({ items: [] })),
      post: jest.fn().mockReturnValue(of({})),
      put: jest.fn().mockReturnValue(of({})),
      delete: jest.fn().mockReturnValue(of({}))
    };
    mockAuth = {
      user: null,
      user$: new BehaviorSubject(null).asObservable()
    };
    mockRouter = {
      navigate: jest.fn()
    };
    service = new CartService(mockApi, mockAuth, mockRouter);
  });

  it('getSnapshot returns empty items when user not logged in', () => {
    const snap = service.getSnapshot();
    expect(Array.isArray(snap)).toBe(true);
    expect(snap.length).toBe(0);
  });

  it('getSnapshot returns items from mocked API when user is logged in', (done) => {
    const mockItems = [{ product: { _id: 'p1' }, quantity: 2 }];
    mockApi.get.mockReturnValue(of({ items: mockItems }));
    mockAuth.user = { id: '1', name: 'Test' };

    service = new CartService(mockApi, mockAuth, mockRouter);

    setTimeout(() => {
      const snap = service.getSnapshot();
      expect(snap).toEqual(mockItems);
      done();
    }, 10);
  });

  it('add returns error when user not authenticated', (done) => {
    const product = { _id: 'p1', name: 'Apple' };
    service.add(product).subscribe({
      error: (err) => {
        expect(err.error).toBe('AUTH_REQUIRED');
        done();
      }
    });
  });
});
