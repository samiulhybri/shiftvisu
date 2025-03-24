import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import ValueState from '@ui5/webcomponents-base/dist/types/ValueState';
import Toast from "@ui5/webcomponents/dist/Toast";

@Injectable({
    providedIn: 'root',
})
export class ToastService {
    private renderer: Renderer2;
    private toastQueue: Array<{ message: string, type: string, placement: string, target?: HTMLElement }> = [];
    private isShowingToast = false;
    private setTimeOut = 3000;

    constructor(rendererFactory: RendererFactory2) {
        this.renderer = rendererFactory.createRenderer(null, null);
    }

    showToast(message: string, type: string, placement: string = 'BottomCenter', target?: HTMLElement) {
        this.toastQueue.push({ message, type, placement, target });
        this.displayNextToast();
    }

    private displayNextToast() {
        if (this.isShowingToast || this.toastQueue.length === 0) return;

        this.isShowingToast = true;
        const { message, type, placement, target } = this.toastQueue.shift()!;
        this.showSingleToast(message, type, placement, target);
    }

    private showSingleToast(message: string, type: string, placement: string, target?: HTMLElement) {
        const toast = this.createToastElement(message, type, placement);
        const appendTarget = target || document.body;

        this.renderer.appendChild(appendTarget, toast);
        (toast as Toast).open = true;

        // Auto-remove the toast after it’s displayed
        setTimeout(() => {
            this.renderer.removeChild(appendTarget, toast);
            this.isShowingToast = false;
            this.displayNextToast();
        }, this.setTimeOut);
    }

    public createToastElement(message: string, type: string, placement: string = 'BottomCenter'): HTMLElement {
        const toast = this.renderer.createElement('ui5-toast');
        this.renderer.setAttribute(toast, 'id', 'messageToaster');
        this.renderer.setAttribute(toast, 'placement', placement);
        this.renderer.setAttribute(toast, 'value-state', this.getValueState(type));
        this.renderer.setStyle(toast, 'z-index', '10000');
        this.renderer.setStyle(toast, 'display', 'block');
        toast.textContent = message; 
        toast.className = this.setToasterType(type);
        return toast;
    }

    private getValueState(type: string): ValueState {
        switch (type) {
            case 'success':
                return ValueState.Positive;
            case 'information':
                return ValueState.Information;
            case 'warning':
                return ValueState.Critical;
            case 'error':
                return ValueState.Negative;
            default:
                return ValueState.None;
        }
    }
    
    public setToasterType(type: string) {
        return '';
        switch (type) {
            case 'success':
                return '';
            case 'information':
                return 'information-toaster';
            case 'warning':
                return 'warning-toaster';
            case 'error':
                return 'error-toaster';
            default:
                return '';
        }
    }
}
