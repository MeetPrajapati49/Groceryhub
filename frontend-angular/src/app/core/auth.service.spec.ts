import { of, throwError } from 'rxjs';
import { AuthService } from './auth.service';

describe('AuthService', () => {
    let service: AuthService;
    let mockApi: any;

    beforeEach(() => {
        // Clear localStorage
        localStorage.clear();
        mockApi = {
            get: jest.fn().mockReturnValue(of(null)),
            post: jest.fn()
        };
        service = new AuthService(mockApi);
    });

    it('should have null user initially when no token', () => {
        expect(service.user).toBeNull();
    });

    it('login should store token and emit user', (done) => {
        const mockResponse = {
            user: { id: '1', name: 'Test', email: 'test@test.com' },
            token: 'jwt-token-123'
        };
        mockApi.post.mockReturnValue(of(mockResponse));

        service.login('test@test.com', 'password123').subscribe({
            next: (res) => {
                expect(res.token).toBe('jwt-token-123');
                expect(service.user).toEqual(mockResponse.user);
                expect(localStorage.getItem('auth_token')).toBe('jwt-token-123');
                expect(mockApi.post).toHaveBeenCalledWith('/auth/login', {
                    email: 'test@test.com',
                    password: 'password123'
                });
                done();
            }
        });
    });

    it('register should store token and emit user', (done) => {
        const mockResponse = {
            user: { id: '2', name: 'New User', email: 'new@test.com' },
            token: 'jwt-token-456'
        };
        mockApi.post.mockReturnValue(of(mockResponse));

        service.register('New User', 'new@test.com', 'password123').subscribe({
            next: (res) => {
                expect(res.token).toBe('jwt-token-456');
                expect(service.user).toEqual(mockResponse.user);
                expect(localStorage.getItem('auth_token')).toBe('jwt-token-456');
                done();
            }
        });
    });

    it('logout should clear token and emit null', (done) => {
        localStorage.setItem('auth_token', 'existing-token');
        mockApi.post.mockReturnValue(of({}));

        service.logout().subscribe({
            next: () => {
                expect(service.user).toBeNull();
                expect(localStorage.getItem('auth_token')).toBeNull();
                done();
            }
        });
    });

    it('loadMe with no token should set user to null', () => {
        localStorage.removeItem('auth_token');
        service.loadMe();
        expect(service.user).toBeNull();
    });

    it('loadMe with token should call /auth/me', () => {
        localStorage.setItem('auth_token', 'some-token');
        const mockUser = { id: '1', name: 'Test', email: 'test@test.com' };
        mockApi.get.mockReturnValue(of(mockUser));

        service.loadMe();

        expect(mockApi.get).toHaveBeenCalledWith('/auth/me');
    });

    it('loadMe should clear token on API error', (done) => {
        localStorage.setItem('auth_token', 'expired-token');
        mockApi.get.mockReturnValue(throwError(() => new Error('Unauthorized')));

        service.loadMe();

        setTimeout(() => {
            expect(service.user).toBeNull();
            expect(localStorage.getItem('auth_token')).toBeNull();
            done();
        }, 10);
    });
});
