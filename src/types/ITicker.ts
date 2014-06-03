interface ITicker {
	start(): void;
	step(): void;
	stop(): void;
	isRunning(): void;
}

export = ITicker;
