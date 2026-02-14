import { of } from 'rxjs';
import { ProductService } from './product.service';

describe('ProductService', () => {
    let service: ProductService;
    let mockApi: any;

    beforeEach(() => {
        mockApi = {
            get: jest.fn().mockReturnValue(of([])),
            post: jest.fn().mockReturnValue(of({})),
            put: jest.fn().mockReturnValue(of({})),
            delete: jest.fn().mockReturnValue(of({}))
        };
        service = new ProductService(mockApi);
    });

    it('list() should call API with /products path', () => {
        service.list();
        expect(mockApi.get).toHaveBeenCalledWith('/products', undefined);
    });

    it('list() should pass query params to API', () => {
        const params = { page: 1, limit: 10 };
        service.list(params);
        expect(mockApi.get).toHaveBeenCalledWith('/products', params);
    });

    it('list() should sanitize search parameter', () => {
        const params = { search: 'apples<script>' };
        service.list(params);
        expect(params.search).toBe('applesscript');
        expect(mockApi.get).toHaveBeenCalledWith('/products', params);
    });

    it('get() should call API with correct product path', () => {
        service.get('abc123');
        expect(mockApi.get).toHaveBeenCalledWith('/products/abc123');
    });

    it('create() should POST product data', () => {
        const product = { name: 'Apple', price: 50 };
        service.create(product);
        expect(mockApi.post).toHaveBeenCalledWith('/products', product);
    });

    it('update() should PUT product data with ID', () => {
        const product = { name: 'Apple', price: 60 };
        service.update('abc123', product);
        expect(mockApi.put).toHaveBeenCalledWith('/products/abc123', product);
    });

    it('delete() should call API with correct product path', () => {
        service.delete('abc123');
        expect(mockApi.delete).toHaveBeenCalledWith('/products/abc123');
    });
});
