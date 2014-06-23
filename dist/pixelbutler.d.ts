declare module 'pixelbutler' {
    export import Stage = require('__pixelbutler/core/Stage');
    export import Bitmap = require('__pixelbutler/core/Bitmap');
    export import FPS = require('__pixelbutler/core/FPS');
    export import RGBA = require('__pixelbutler/core/RGBA');
    export import HSV = require('__pixelbutler/core/HSV');
    export import PerlinNoise = require('__pixelbutler/extra/PerlinNoise');
    export import loader = require('__pixelbutler/loaders/loader');
    import _util = require('__pixelbutler/core/util');
    export import rand = _util.rand;
    import _color = require('__pixelbutler/core/color');
    export import rgb2hsv = _color.rgb2hsv;
    export import hsv2rgb = _color.hsv2rgb;
    export import ticker = require('__pixelbutler/core/ticker');
    export function rgb(r: number, g: number, b: number): RGBA;
    export function hsv(h: number, s: number, v: number): RGBA;
    export function supportsWebGL(): boolean;
}

declare module '__pixelbutler/core/Stage' {
    import IOptions = require('__pixelbutler/types/IOptions');
    import Bitmap = require('__pixelbutler/core/Bitmap');
    import IRenderer = require('__pixelbutler/types/IRenderer');
    import IAutoSize = require('__pixelbutler/types/IAutoSize');
    class Stage extends Bitmap {
        canvas: HTMLCanvasElement;
        renderer: IRenderer;
        autoSize: IAutoSize;
        constructor(opts: IOptions);
        resizeTo(width: number, height: number): void;
        render(): void;
        destruct(): void;
    }
    export = Stage;
}

declare module '__pixelbutler/core/Bitmap' {
    import INumberArray = require('__pixelbutler/types/INumberArray');
    import IShader = require('__pixelbutler/types/IShader');
    import IRGB = require('__pixelbutler/types/IRGB');
    class Bitmap {
        width: number;
        height: number;
        useAlpha: boolean;
        channels: number;
        buffer: ArrayBuffer;
        data: Uint8ClampedArray;
        constructor(width: number, height: number, useAlpha?: boolean, buffer?: ArrayBuffer);
        resizeTo(width: number, height: number): void;
        setPixel(x: number, y: number, col: IRGB): void;
        getPixel(x: number, y: number, col?: IRGB): IRGB;
        fillRect(x: number, y: number, width: number, height: number, col: IRGB): void;
        drawLineH(x: number, y: number, size: number, col: IRGB): void;
        drawLineV(x: number, y: number, size: number, col: IRGB): void;
        drawRect(x: number, y: number, width: number, height: number, col: IRGB): void;
        fillCircle(x: number, y: number, r: number, col: IRGB): void;
        drawCircle(x: number, y: number, r: number, col: IRGB): void;
        shader(f: IShader): void;
        text(x: number, y: number, txt: string, col: IRGB): void;
        blit(sprite: Bitmap, x?: number, y?: number): void;
        clear(col?: IRGB): void;
        clearAlpha(alpha?: number): void;
        static clipFromData(inputData: INumberArray, inputWidth: number, inputHeight: number, inputChannels: number, x: number, y: number, width: number, height: number, useAlpha: boolean): Bitmap;
    }
    export = Bitmap;
}

declare module '__pixelbutler/core/FPS' {
    class FPS {
        constructor(smoothFPS?: number, smoothDelta?: number);
        begin(): void;
        end(): void;
        fps : number;
        redraw : number;
    }
    export = FPS;
}

declare module '__pixelbutler/core/RGBA' {
    import IRGBA = require('__pixelbutler/types/IRGBA');
    class RGBA implements IRGBA {
        r: number;
        g: number;
        b: number;
        a: number;
        constructor(r?: number, g?: number, b?: number, a?: number);
    }
    export = RGBA;
}

declare module '__pixelbutler/core/HSV' {
    import IHSV = require('__pixelbutler/types/IHSV');
    class HSV implements IHSV {
        h: number;
        s: number;
        v: number;
        constructor(h?: number, s?: number, v?: number);
    }
    export = HSV;
}

declare module '__pixelbutler/extra/PerlinNoise' {
    class PerlinNoise {
        constructor();
        noise(x: number, y: number, z: number): number;
        fade(t: number): number;
        lerp(t: number, a: number, b: number): number;
        grad(hash: number, x: number, y: number, z: number): number;
        scale(n: number): number;
    }
    export = PerlinNoise;
}

declare module '__pixelbutler/loaders/loader' {
    export import ImageDataLoader = require('__pixelbutler/loaders/ImageDataLoader');
    export import BitmapLoader = require('__pixelbutler/loaders/BitmapLoader');
    export import TextLoader = require('__pixelbutler/loaders/TextLoader');
    export import JSONLoader = require('__pixelbutler/loaders/JSONLoader');
    export import SpriteSheetLoader = require('__pixelbutler/loaders/SpriteSheetLoader');
    export import SpriteSheetJSONLoader = require('__pixelbutler/loaders/SpriteSheetJSONLoader');
    export import MultiLoader = require('__pixelbutler/loaders/MultiLoader');
}

declare module '__pixelbutler/core/util' {
    export function rand(max: number): number;
    export function clamp(value: number, min: number, max: number): number;
}

declare module '__pixelbutler/core/color' {
    import IRGB = require('__pixelbutler/types/IRGB');
    import IRGBA = require('__pixelbutler/types/IRGBA');
    import IHSV = require('__pixelbutler/types/IHSV');
    export function useAlpha(col: IRGB): boolean;
    export function hsv2rgb(hsv: IHSV): IRGBA;
    export function rgb2hsv(rgb: IRGB): IHSV;
}

declare module '__pixelbutler/core/ticker' {
    import ITicker = require('__pixelbutler/types/ITicker');
    export interface FrameHandler {
        (frame: number, delta: number): void;
    }
    export function interval(callback: FrameHandler, fps: number): ITicker;
    export function request(callback: FrameHandler): ITicker;
}

declare module '__pixelbutler/types/IOptions' {
    interface IOptions {
        width: number;
        height: number;
        canvas: any;
        transparent?: boolean;
        renderer?: string;
        center?: boolean;
        scale?: any;
    }
    export = IOptions;
}

declare module '__pixelbutler/types/IRenderer' {
    interface IRenderer {
        resize(): void;
        update(): void;
        destruct(): void;
    }
    export = IRenderer;
}

declare module '__pixelbutler/types/IAutoSize' {
    interface IAutoSize {
        scale(mode: any): void;
        center(center?: boolean): void;
        update(): void;
        stop(): void;
    }
    export = IAutoSize;
}

declare module '__pixelbutler/types/INumberArray' {
    interface INumberArray {
        [index: number]: number;
        length: number;
    }
    export = INumberArray;
}

declare module '__pixelbutler/types/IShader' {
    import IRGBA = require('__pixelbutler/types/IRGBA');
    interface IShader {
        (x: number, y: number, col: IRGBA): IRGBA;
    }
    export = IShader;
}

declare module '__pixelbutler/types/IRGB' {
    interface IRGB {
        r: number;
        g: number;
        b: number;
    }
    export = IRGB;
}

declare module '__pixelbutler/types/IRGBA' {
    interface IRGBA {
        r: number;
        g: number;
        b: number;
        a: number;
    }
    export = IRGBA;
}

declare module '__pixelbutler/types/IHSV' {
    interface IHSV {
        h: number;
        s: number;
        v: number;
    }
    export = IHSV;
}

declare module '__pixelbutler/loaders/ImageDataLoader' {
    import ILoader = require('__pixelbutler/loaders/ILoader');
    class ImageDataLoader implements ILoader {
        url: string;
        constructor(url: string);
        load(callback: (err: Error, data: ImageData) => void): void;
    }
    export = ImageDataLoader;
}

declare module '__pixelbutler/loaders/BitmapLoader' {
    import Bitmap = require('__pixelbutler/core/Bitmap');
    import ILoader = require('__pixelbutler/loaders/ILoader');
    class BitmapLoader implements ILoader {
        url: string;
        useAlpha: boolean;
        constructor(url: string, useAlpha?: boolean);
        load(callback: (err: Error, bitmap: Bitmap) => void): void;
    }
    export = BitmapLoader;
}

declare module '__pixelbutler/loaders/TextLoader' {
    import ILoader = require('__pixelbutler/loaders/ILoader');
    class TextLoader implements ILoader {
        url: string;
        constructor(url: string);
        load(callback: (err: Error, data: string) => void): void;
    }
    export = TextLoader;
}

declare module '__pixelbutler/loaders/JSONLoader' {
    import ILoader = require('__pixelbutler/loaders/ILoader');
    class JSONLoader implements ILoader {
        url: string;
        constructor(url: string);
        load(callback: (err: Error, json: any) => void): void;
    }
    export = JSONLoader;
}

declare module '__pixelbutler/loaders/SpriteSheetLoader' {
    import SpriteSheet = require('__pixelbutler/core/SpriteSheet');
    import ILoader = require('__pixelbutler/loaders/ILoader');
    import ISpriteSheetOpts = require('__pixelbutler/types/ISpriteSheetOpts');
    class SpriteSheetLoader implements ILoader {
        url: string;
        useAlpha: boolean;
        opts: ISpriteSheetOpts;
        constructor(url: string, opts: ISpriteSheetOpts, useAlpha?: boolean);
        load(callback: (err: Error, bitmap: SpriteSheet) => void): void;
    }
    export = SpriteSheetLoader;
}

declare module '__pixelbutler/loaders/SpriteSheetJSONLoader' {
    import SpriteSheet = require('__pixelbutler/core/SpriteSheet');
    import ILoader = require('__pixelbutler/loaders/ILoader');
    import ISpriteSheetOpts = require('__pixelbutler/types/ISpriteSheetOpts');
    class SpriteSheetJSONLoader implements ILoader {
        url: string;
        useAlpha: boolean;
        opts: ISpriteSheetOpts;
        constructor(url: string, useAlpha?: boolean);
        load(callback: (err: Error, sheet: SpriteSheet) => void): void;
    }
    export = SpriteSheetJSONLoader;
}

declare module '__pixelbutler/loaders/MultiLoader' {
    import ILoader = require('__pixelbutler/loaders/ILoader');
    class MultiLoader {
        constructor(loaders?: ILoader[]);
        load(callback: (err: Error, results: any[]) => void): void;
    }
    export = MultiLoader;
}

declare module '__pixelbutler/types/ITicker' {
    interface ITicker {
        start(): void;
        step(): void;
        stop(): void;
        isRunning(): void;
    }
    export = ITicker;
}

declare module '__pixelbutler/loaders/ILoader' {
    interface ILoader {
        url: string;
        load(callback: (err: Error, value: any) => void): void;
    }
    export = ILoader;
}

declare module '__pixelbutler/core/SpriteSheet' {
    import Bitmap = require('__pixelbutler/core/Bitmap');
    class SpriteSheet {
        constructor(width: number, height: number);
        getSprite(x: number, y: number): Bitmap;
        getSpriteAt(index: number): Bitmap;
        addSprite(bitmap: Bitmap): void;
    }
    export = SpriteSheet;
}

declare module '__pixelbutler/types/ISpriteSheetOpts' {
    interface ISpriteSheetOpts {
        image?: string;
        sizeX: number;
        sizeY: number;
        spritesX: number;
        spritesY: number;
        outerMargin?: number;
        innerMargin?: number;
    }
    export = ISpriteSheetOpts;
}

