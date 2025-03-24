export class ODataBatchCall {
    id: number;
    method: string;
    url: string;
    headers?: Object;
    body?: Object;

    constructor(id: number, method: string, url: string) {
        this.id = id;
        this.method = method;
        this.url = url;
        this.headers = {"content-type": "application/json"};
    }
}
