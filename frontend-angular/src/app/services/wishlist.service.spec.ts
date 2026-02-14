import { of, BehaviorSubject } from 'rxjs';
import { WishlistService } from './wishlist.service';

describe('WishlistService', () => {
    let service: WishlistService;
    let mockApi: any;
    let mockAuth: any;
    let userSubject: BehaviorSubject<any>;

    beforeEach(() => {
        mockApi = {
            get: jest.fn().mockReturnValue(of({ products: [] })),
            post: jest.fn().mockReturnValue(of({})),
            delete: jest.fn().mockReturnValue(of({}))
        };
        userSubject = new BehaviorSubject<any>(null);
        mockAuth = {
            user$: userSubject.asObservable()
        };
        service = new WishlistService(mockApi, mockAuth);
    });

    it('should have empty wishlist initially (no user)', () => {
        expect(service.getSnapshot()).toEqual([]);
    });

    it('should load wishlist when user logs in', (done) => {
        const mockProducts = [
            { _id: 'p1', name: 'Apple' },
            { _id: 'p2', name: 'Banana' }
        ];
        mockApi.get.mockReturnValue(of({ products: mockProducts }));

        userSubject.next({ id: '1', name: 'Test' });

        setTimeout(() => {
            expect(mockApi.get).toHaveBeenCalledWith('/wishlist');
            expect(service.getSnapshot()).toEqual(mockProducts);
            done();
        }, 10);
    });

    it('should clear wishlist when user logs out', (done) => {
        // First log in
        mockApi.get.mockReturnValue(of({ products: [{ _id: 'p1', name: 'Apple' }] }));
        userSubject.next({ id: '1', name: 'Test' });

        setTimeout(() => {
            // Then log out
            userSubject.next(null);
            setTimeout(() => {
                expect(service.getSnapshot()).toEqual([]);
                done();
            }, 10);
        }, 10);
    });

    it('add() should optimistically add product and call API', () => {
        const product = { _id: 'p1', name: 'Apple' };
        service.add(product);

        expect(service.getSnapshot()).toContainEqual(product);
        expect(mockApi.post).toHaveBeenCalledWith('/wishlist/add', { productId: 'p1' });
    });

    it('add() should not duplicate existing product', () => {
        const product = { _id: 'p1', name: 'Apple' };
        service.add(product);
        service.add(product);

        expect(service.getSnapshot().filter(i => i._id === 'p1').length).toBe(1);
    });

    it('remove() should optimistically remove product and call API', () => {
        const product = { _id: 'p1', name: 'Apple' };
        service.add(product);
        expect(service.getSnapshot().length).toBe(1);

        service.remove('p1');
        expect(service.getSnapshot().length).toBe(0);
        expect(mockApi.delete).toHaveBeenCalledWith('/wishlist/p1');
    });
});
