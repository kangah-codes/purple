export default class HTTPError extends Error {
    public statusCode: number;
    public isHTTPError: true;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'HTTPError';
        this.isHTTPError = true;
        Object.setPrototypeOf(this, HTTPError.prototype);
    }
}
