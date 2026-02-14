// Mock @angular/common/http for Jest
export class HttpClient {
    get() { return null; }
    post() { return null; }
    put() { return null; }
    delete() { return null; }
}
export class HttpParams {
    set(key: string, value: string) { return this; }
}
