import { of } from 'rxjs';
import { CartService } from './cart.service';

describe('CartService', () => {
  it('getSnapshot returns items from mocked API', (done) => {
    // mock ApiService with get returning observable of empty items
    const mockApi: any = { get: jest.fn().mockReturnValue(of({ items: [] })) };
    const svc = new CartService(mockApi);
    // give async load a tick
    setTimeout(() => {
      const snap = svc.getSnapshot();
      expect(Array.isArray(snap)).toBe(true);
      expect(snap.length).toBe(0);
      done();
    }, 10);
  });
});
