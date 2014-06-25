interface Uint8ClampedArray extends ArrayBufferView {
	BYTES_PER_ELEMENT: number;
	length: number;
	[index: number]: number;
	get(index: number): number;
	set(index: number, value: number): void;
	set(array: Uint8ClampedArray, offset?: number): void;
	set(array: number[], offset?: number): void;
	subarray(begin: number, end?: number): Uint8ClampedArray;
}

declare var Uint8ClampedArray: {
	prototype: Uint8ClampedArray;
	new (length: number): Uint8ClampedArray;
	new (array: Uint8ClampedArray): Uint8ClampedArray;
	new (array: number[]): Uint8ClampedArray;
	new (buffer: ArrayBuffer, byteOffset?: number, length?: number): Uint8ClampedArray;
	BYTES_PER_ELEMENT: number;
}

interface Window {
	WebGLRenderingContext: boolean;
	Uint8ClampedArray: typeof Uint8ClampedArray;
	Uint8Array: typeof Uint8Array;
	ArrayBuffer: typeof ArrayBuffer;
	atob(str: string): string;
	btoa(str: string): string;
}

declare function escape(str: string): string;
declare function unescape(str: string): string;
