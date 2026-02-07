import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../services/toast.service';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="toast-container">
      <div *ngFor="let toast of toasts" 
           class="toast" 
           [class.success]="toast.type === 'success'"
           [class.error]="toast.type === 'error'"
           [class.info]="toast.type === 'info'"
           [class.warning]="toast.type === 'warning'"
           (click)="dismiss(toast.id)">
        <span class="icon">{{ getIcon(toast.type) }}</span>
        <span class="message">{{ toast.message }}</span>
        <button class="close" (click)="dismiss(toast.id); $event.stopPropagation()">×</button>
      </div>
    </div>
  `,
    styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      border-radius: 12px;
      background: #1a1a2e;
      color: white;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease-out;
      cursor: pointer;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .toast.success {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-color: rgba(16, 185, 129, 0.3);
    }
    .toast.error {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      border-color: rgba(239, 68, 68, 0.3);
    }
    .toast.info {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      border-color: rgba(59, 130, 246, 0.3);
    }
    .toast.warning {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      border-color: rgba(245, 158, 11, 0.3);
    }
    .icon {
      font-size: 20px;
    }
    .message {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
    }
    .close {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      padding: 2px 8px;
      border-radius: 6px;
      transition: background 0.2s;
    }
    .close:hover {
      background: rgba(255, 255, 255, 0.3);
    }
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class ToastComponent {
    toasts: Toast[] = [];

    constructor(private toastService: ToastService) {
        this.toastService.toasts.subscribe(toasts => this.toasts = toasts);
    }

    getIcon(type: string): string {
        switch (type) {
            case 'success': return '✓';
            case 'error': return '✗';
            case 'warning': return '⚠';
            case 'info': return 'ℹ';
            default: return '';
        }
    }

    dismiss(id: number) {
        this.toastService.dismiss(id);
    }
}
