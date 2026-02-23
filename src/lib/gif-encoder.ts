import GIF from 'gif.js';

export interface GifOptions {
    delay?: number; // Default frame delay in ms (e.g. 500)
    quality?: number; // 1-30, lower is better but slower
    width: number;
    height: number;
    lastFrameDelay?: number; // Delay for the last frame (e.g. 3000ms)
}

/**
 * Creates and configures a gif.js encoder instance.
 * Note: requires /gif.worker.js to be available in public directory.
 */
export function createGifEncoder(options: GifOptions): GIF {
    return new GIF({
        workers: 2,
        quality: options.quality || 10,
        width: options.width,
        height: options.height,
        workerScript: '/gif.worker.js',
        background: '#ffffff',
        transparent: null
    });
}
