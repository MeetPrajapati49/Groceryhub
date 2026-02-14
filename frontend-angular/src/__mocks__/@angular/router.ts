// Mock @angular/router for Jest
export class Router {
    navigate(commands: any[], extras?: any) { return Promise.resolve(true); }
    navigateByUrl(url: string) { return Promise.resolve(true); }
}
export class ActivatedRoute {
    snapshot = { params: {}, queryParams: {} };
}
export const RouterModule = { forRoot: () => ({}), forChild: () => ({}) };
