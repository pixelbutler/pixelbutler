interface ILoader {
	url: string;
	load(callback: (err: Error, value: any) => void): void;
}

export = ILoader;
