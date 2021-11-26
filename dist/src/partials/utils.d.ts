import { CarouselConfig } from '../types';
/**
 * return a debounced version of the function
 * @param fn
 * @param delay
 */
export declare function debounce(fn: (...args: any[]) => unknown, delay: number): typeof fn;
/**
 * return a throttle version of the function
 * Throttling
 *
 */
export declare function throttle(fn: (...args: any[]) => unknown, limit: number): typeof fn;
export declare function getSlides(vNode: any[] | undefined): any;
export declare function getMaxSlideIndex(config: CarouselConfig, slidesCount: number): number;
export declare function getMinSlideIndex(config: CarouselConfig): number;
export declare function getCurrentSlideIndex(config: CarouselConfig, val: number, max: number, min: number): number;
