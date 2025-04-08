export default class HTTPError extends Error {
    public statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'HTTPError';
        Object.setPrototypeOf(this, HTTPError.prototype);
    }
}
