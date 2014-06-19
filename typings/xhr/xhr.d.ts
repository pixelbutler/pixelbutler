declare module 'xhr' {

	function xhr (options: xhr.Options, callback: (err: Error, resp: xhr.Response, body: any) => void): XMLHttpRequest;

	module xhr {
		interface Response {
			statusCode: number;
			body: any;
		}
		interface Options {
			cors?: boolean;
			sync?: boolean;
			uri?: string;
			url?: string;
			method?: string;
			timeout?: number;
			headers?: Object;
			body?: string;
			json?: Object;
		}
	}

	export = xhr;
}
