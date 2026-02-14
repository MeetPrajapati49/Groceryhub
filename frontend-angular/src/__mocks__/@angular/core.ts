// Mock @angular/core for Jest
export function Injectable(opts?: any): ClassDecorator {
    return function (target: any) { return target; };
}
export function Component(opts?: any): ClassDecorator {
    return function (target: any) { return target; };
}
export function NgModule(opts?: any): ClassDecorator {
    return function (target: any) { return target; };
}
export function Inject(token?: any): ParameterDecorator {
    return function (target: any, key: any, index: any) { };
}
export class InjectionToken<T> {
    constructor(public desc: string) { }
}
export class EventEmitter<T> {
    emit(value?: T) { }
    subscribe(fn: any) { return { unsubscribe: () => { } }; }
}
