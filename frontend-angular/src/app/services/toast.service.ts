import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    private toasts$ = new BehaviorSubject<Toast[]>([]);
    private idCounter = 0;

    get toasts() {
        return this.toasts$.asObservable();
    }

    show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 3000) {
        const id = ++this.idCounter;
        const toast: Toast = { id, message, type, duration };
        this.toasts$.next([...this.toasts$.value, toast]);

        if (duration > 0) {
            setTimeout(() => this.dismiss(id), duration);
        }
        return id;
    }

    success(message: string, duration = 3000) {
        return this.show(message, 'success', duration);
    }

    error(message: string, duration = 4000) {
        return this.show(message, 'error', duration);
    }

    info(message: string, duration = 3000) {
        return this.show(message, 'info', duration);
    }

    warning(message: string, duration = 3500) {
        return this.show(message, 'warning', duration);
    }

    dismiss(id: number) {
        this.toasts$.next(this.toasts$.value.filter(t => t.id !== id));
    }

    clear() {
        this.toasts$.next([]);
    }
}
