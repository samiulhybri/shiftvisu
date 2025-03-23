export class ComboFilter {
    data: any;
    src_data: any;

    constructor(data: any) {
        this.data = data;
        this.src_data = data;
    }

    handleLocalDataFilter(value: String, type: String) {
        type ObjectKey = keyof typeof this.data;
        const field = type as ObjectKey;
        this.data = this.src_data?.filter(
            (s: any) =>
                s[field].toLowerCase().indexOf(value.toLowerCase()) !== -1
        );
        return this.data;
    }
}
