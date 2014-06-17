interface IAutoSize {
	scale(mode: any): void;
	center(center?: boolean): void;
	update(): void;
	stop(): void;
}

export = IAutoSize;
