interface IRenderer {
	resize(render?: boolean): void;
	update(): void;
	close(): void;
}

export = IRenderer;
