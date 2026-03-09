import * as http from 'http';
export interface HttpResponse {
    statusCode: number;
    headers: http.IncomingHttpHeaders;
    body: any;
}
export interface RequestOptions {
    hostname: string;
    port: number;
    path: string;
    method: string;
    headers: Record<string, string | number>;
}
export declare function httpRequest(options: RequestOptions, body?: string): Promise<HttpResponse>;
export declare function buildOptions(url: string, method: string, headers?: Record<string, string | number>, body?: string): RequestOptions;
//# sourceMappingURL=http.d.ts.map