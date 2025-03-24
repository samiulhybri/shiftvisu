import { ComponentRef } from "@angular/core";

export abstract class Window {
    formData!: any;
    public cmpRef!: ComponentRef<any>;

    public cancelHandler(): void {
        this.formData = undefined
        if (this.cmpRef.instance.onCancel) this.cmpRef.instance.onCancel();
    }

    abstract onAdd(event: PointerEvent): any
}
