import { Breakpoints } from '@/types';
declare const _default: import("vue").DefineComponent<{
    direction: {
        default: "vertical" | "horizontal";
        type: StringConstructor;
        validator(value: string): boolean;
    };
    itemsToShow: {
        default: number;
        type: NumberConstructor;
    };
    itemsToScroll: {
        default: number;
        type: NumberConstructor;
    };
    wrapAround: {
        default: boolean | undefined;
        type: BooleanConstructor;
    };
    snapAlign: {
        default: "start" | "end" | "center" | "center-even" | "center-odd";
        validator(value: string): boolean;
    };
    transition: {
        default: number | undefined;
        type: NumberConstructor;
    };
    breakpoints: {
        default: Breakpoints | undefined;
        type: ObjectConstructor;
    };
    autoplay: {
        default: number | undefined;
        type: NumberConstructor;
    };
    pauseAutoplayOnHover: {
        default: boolean | undefined;
        type: BooleanConstructor;
    };
    modelValue: {
        default: undefined;
        type: NumberConstructor;
    };
    mouseDrag: {
        default: boolean | undefined;
        type: BooleanConstructor;
    };
    touchDrag: {
        default: boolean | undefined;
        type: BooleanConstructor;
    };
    settings: {
        default(): {};
        type: ObjectConstructor;
    };
}, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, import("vue").EmitsOptions, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    direction?: unknown;
    itemsToShow?: unknown;
    itemsToScroll?: unknown;
    wrapAround?: unknown;
    snapAlign?: unknown;
    transition?: unknown;
    breakpoints?: unknown;
    autoplay?: unknown;
    pauseAutoplayOnHover?: unknown;
    modelValue?: unknown;
    mouseDrag?: unknown;
    touchDrag?: unknown;
    settings?: unknown;
} & {
    itemsToShow: number;
    itemsToScroll: number;
    direction: string;
    transition: number;
    autoplay: number;
    snapAlign: "start" | "end" | "center" | "center-even" | "center-odd";
    wrapAround: boolean;
    pauseAutoplayOnHover: boolean;
    mouseDrag: boolean;
    touchDrag: boolean;
    breakpoints: Record<string, any>;
    settings: Record<string, any>;
} & {
    modelValue?: number | undefined;
}> & ({} | {}), {
    itemsToShow: number;
    itemsToScroll: number;
    direction: string;
    modelValue: number;
    transition: number;
    autoplay: number;
    snapAlign: "start" | "end" | "center" | "center-even" | "center-odd";
    wrapAround: boolean;
    pauseAutoplayOnHover: boolean;
    mouseDrag: boolean;
    touchDrag: boolean;
    breakpoints: Record<string, any>;
    settings: Record<string, any>;
}>;
export default _default;
