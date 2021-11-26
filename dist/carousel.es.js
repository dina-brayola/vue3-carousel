/**
 * Vue 3 Carousel 0.1.30
 * (c) 2021
 * @license MIT
 */
import { defineComponent, ref, reactive, watch, provide, onMounted, computed, watchEffect, h, inject } from 'vue';

const defaultConfigs = {
    itemsToShow: 1,
    itemsToScroll: 1,
    direction: 'horizontal',
    modelValue: 0,
    transition: 300,
    autoplay: 0,
    snapAlign: 'center',
    wrapAround: false,
    pauseAutoplayOnHover: false,
    mouseDrag: true,
    touchDrag: true,
    breakpoints: undefined,
};

function counterFactory() {
    return new Proxy({ value: 0, read: 0 }, {
        get(obj, prop) {
            if (!(prop in obj))
                return 0;
            if (prop === 'read') {
                return obj[prop];
            }
            return obj[prop]++;
        },
        set(obj, prop, value) {
            obj[prop] = Math.max(value, 0);
            return true;
        },
    });
}

/**
 * return a debounced version of the function
 * @param fn
 * @param delay
 */
function debounce(fn, delay) {
    let timerId;
    return function (...args) {
        if (timerId) {
            clearTimeout(timerId);
        }
        timerId = setTimeout(() => {
            fn(...args);
            timerId = null;
        }, delay);
    };
}
/**
 * return a throttle version of the function
 * Throttling
 *
 */
function throttle(fn, limit) {
    let inThrottle;
    return function (...args) {
        const self = this;
        if (!inThrottle) {
            fn.apply(self, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}
function getSlides(vNode) {
    var _a, _b, _c;
    // Return empty array if there's any node
    if (!vNode)
        return [];
    // Check if the Slides components are added directly without v-for (#72)
    if (((_b = (_a = vNode[0]) === null || _a === void 0 ? void 0 : _a.type) === null || _b === void 0 ? void 0 : _b.name) === 'CarouselSlide')
        return vNode;
    return ((_c = vNode[0]) === null || _c === void 0 ? void 0 : _c.children) || [];
}
function getMaxSlideIndex(config, slidesCount) {
    if (config.wrapAround) {
        return slidesCount - 1;
    }
    switch (config.snapAlign) {
        case 'start':
            return slidesCount - config.itemsToShow;
        case 'end':
            return slidesCount - 1;
        case 'center':
        case 'center-odd':
            return slidesCount - Math.ceil(config.itemsToShow / 2);
        case 'center-even':
            return slidesCount - Math.ceil(config.itemsToShow / 2);
        default:
            return 0;
    }
}
function getMinSlideIndex(config) {
    if (config.wrapAround) {
        return 0;
    }
    switch (config.snapAlign) {
        case 'start':
            return 0;
        case 'end':
            return config.itemsToShow - 1;
        case 'center':
        case 'center-odd':
            return Math.floor((config.itemsToShow - 1) / 2);
        case 'center-even':
            return Math.floor((config.itemsToShow - 2) / 2);
        default:
            return 0;
    }
}
function getCurrentSlideIndex(config, val, max, min) {
    if (config.wrapAround) {
        return val;
    }
    return Math.min(Math.max(val, min), max);
}

var Carousel = defineComponent({
    name: 'Carousel',
    props: {
        direction: {
            default: defaultConfigs.direction,
            type: String,
            validator(value) {
                // The value must match one of these strings
                return ['vertical', 'horizontal'].includes(value);
            },
        },
        // count of items to showed per view
        itemsToShow: {
            default: defaultConfigs.itemsToShow,
            type: Number,
        },
        // count of items to be scrolled
        itemsToScroll: {
            default: defaultConfigs.itemsToScroll,
            type: Number,
        },
        // control infinite scrolling mode
        wrapAround: {
            default: defaultConfigs.wrapAround,
            type: Boolean,
        },
        // control snap position alignment
        snapAlign: {
            default: defaultConfigs.snapAlign,
            validator(value) {
                // The value must match one of these strings
                return ['start', 'end', 'center', 'center-even', 'center-odd'].includes(value);
            },
        },
        // sliding transition time in ms
        transition: {
            default: defaultConfigs.transition,
            type: Number,
        },
        // an object to store breakpoints
        breakpoints: {
            default: defaultConfigs.breakpoints,
            type: Object,
        },
        // time to auto advance slides in ms
        autoplay: {
            default: defaultConfigs.autoplay,
            type: Number,
        },
        // pause autoplay when mouse hover over the carousel
        pauseAutoplayOnHover: {
            default: defaultConfigs.pauseAutoplayOnHover,
            type: Boolean,
        },
        // slide number number of initial slide
        modelValue: {
            default: undefined,
            type: Number,
        },
        // toggle mouse dragging.
        mouseDrag: {
            default: defaultConfigs.mouseDrag,
            type: Boolean,
        },
        // toggle mouse dragging.
        touchDrag: {
            default: defaultConfigs.touchDrag,
            type: Boolean,
        },
        // an object to pass all settings
        settings: {
            default() {
                return {};
            },
            type: Object,
        },
    },
    setup(props, { slots, emit }) {
        var _a;
        const root = ref(null);
        const slides = ref([]);
        const slidesBuffer = ref([]);
        const slideWidth = ref(0);
        const slideHeight = ref(0);
        const slidesCount = ref(1);
        const slidesCounter = counterFactory();
        let breakpoints = ref({});
        // generate carousel configs
        let defaultConfig = Object.assign({}, defaultConfigs);
        // current config
        const config = reactive(Object.assign({}, defaultConfigs));
        // Update the carousel on props change
        watch(props, () => {
            initDefaultConfigs();
            updateBreakpointsConfigs();
            updateSlidesData();
            updateSlideSize();
        });
        // slides
        const currentSlideIndex = ref((_a = config.modelValue) !== null && _a !== void 0 ? _a : 0);
        const prevSlideIndex = ref(0);
        const middleSlideIndex = ref(0);
        const maxSlideIndex = ref(0);
        const minSlideIndex = ref(0);
        provide('config', config);
        provide('slidesBuffer', slidesBuffer);
        provide('slidesCount', slidesCount);
        provide('currentSlide', currentSlideIndex);
        provide('maxSlide', maxSlideIndex);
        provide('minSlide', minSlideIndex);
        provide('slidesCounter', slidesCounter);
        /**
         * Configs
         */
        function initDefaultConfigs() {
            // generate carousel configs
            const mergedConfigs = Object.assign(Object.assign({}, props), props.settings);
            // Set breakpoints
            breakpoints = ref(Object.assign({}, mergedConfigs.breakpoints));
            // remove extra values
            defaultConfig = Object.assign(Object.assign({}, mergedConfigs), { settings: undefined, breakpoints: undefined });
        }
        function updateBreakpointsConfigs() {
            const breakpointsArray = Object.keys(breakpoints.value)
                .map((key) => Number(key))
                .sort((a, b) => +b - +a);
            let newConfig = Object.assign({}, defaultConfig);
            breakpointsArray.some((breakpoint) => {
                const isMatched = window.matchMedia(`(min-width: ${breakpoint}px)`).matches;
                if (isMatched) {
                    newConfig = Object.assign(Object.assign({}, newConfig), breakpoints.value[breakpoint]);
                    return true;
                }
                return false;
            });
            let key;
            for (key in newConfig) {
                // @ts-ignore
                config[key] = newConfig[key];
            }
        }
        const handleWindowResize = debounce(() => {
            if (breakpoints.value) {
                updateBreakpointsConfigs();
                updateSlidesData();
            }
            updateSlideSize();
        }, 16);
        /**
         * Setup functions
         */
        function updateSlideSize() {
            if (!root.value)
                return;
            const rect = root.value.getBoundingClientRect();
            if (config.direction === 'vertical') {
                slideHeight.value = rect.height / config.itemsToShow;
                return;
            }
            slideWidth.value = rect.width / config.itemsToShow;
        }
        function updateSlidesData() {
            slidesCount.value = slides.value.length;
            if (slidesCount.value <= 0)
                return;
            middleSlideIndex.value = Math.ceil((slidesCount.value - 1) / 2);
            maxSlideIndex.value = getMaxSlideIndex(config, slidesCount.value);
            minSlideIndex.value = getMinSlideIndex(config);
            currentSlideIndex.value = getCurrentSlideIndex(config, currentSlideIndex.value, maxSlideIndex.value, minSlideIndex.value);
        }
        function updateSlidesBuffer() {
            const slidesArray = [...Array(slidesCount.value).keys()];
            const shouldShiftSlides = config.wrapAround && config.itemsToShow + 1 <= slidesCount.value;
            if (shouldShiftSlides) {
                const buffer = Math.round((slidesCount.value - config.itemsToShow) / 2);
                let shifts = buffer - currentSlideIndex.value;
                if (config.snapAlign === 'end') {
                    shifts += Math.floor(config.itemsToShow - 1);
                }
                else if (config.snapAlign === 'center' || config.snapAlign === 'center-odd') {
                    shifts++;
                }
                // Check shifting directions
                if (shifts < 0) {
                    for (let i = shifts; i < 0; i++) {
                        slidesArray.push(Number(slidesArray.shift()));
                    }
                }
                else {
                    for (let i = 0; i < shifts; i++) {
                        slidesArray.unshift(Number(slidesArray.pop()));
                    }
                }
            }
            slidesBuffer.value = slidesArray;
        }
        onMounted(() => {
            if (breakpoints.value) {
                updateBreakpointsConfigs();
                updateSlidesData();
            }
            updateSlideSize();
            if (config.autoplay && config.autoplay > 0) {
                initializeAutoplay();
            }
            window.addEventListener('resize', handleWindowResize, { passive: true });
        });
        /**
         * Carousel Event listeners
         */
        let isTouch = false;
        const startPosition = { x: 0, y: 0 };
        const endPosition = { x: 0, y: 0 };
        const dragged = reactive({ x: 0, y: 0 });
        const isDragging = ref(false);
        const isHover = ref(false);
        const handleMouseEnter = () => {
            isHover.value = true;
        };
        const handleMouseLeave = () => {
            isHover.value = false;
        };
        const handleDrag = throttle((event) => {
            if (!isTouch)
                event.preventDefault();
            endPosition.x = isTouch ? event.touches[0].clientX : event.clientX;
            endPosition.y = isTouch ? event.touches[0].clientY : event.clientY;
            const deltaX = endPosition.x - startPosition.x;
            const deltaY = endPosition.y - startPosition.y;
            dragged.y = deltaY;
            dragged.x = deltaX;
        }, 16);
        function handleDragStart(event) {
            if (!isTouch)
                event.preventDefault();
            isTouch = event.type === 'touchstart';
            if ((!isTouch && event.button !== 0) || isSliding.value) {
                return;
            }
            isDragging.value = true;
            startPosition.x = isTouch ? event.touches[0].clientX : event.clientX;
            startPosition.y = isTouch ? event.touches[0].clientY : event.clientY;
            document.addEventListener(isTouch ? 'touchmove' : 'mousemove', handleDrag);
            document.addEventListener(isTouch ? 'touchend' : 'mouseup', handleDragEnd);
        }
        function handleDragEnd() {
            isDragging.value = false;
            let tolerance = Math.sign(dragged.x) * 0.4;
            let draggedSlides = Math.round(dragged.x / slideWidth.value + tolerance);
            if (config.direction === 'vertical') {
                tolerance = Math.sign(dragged.y) * 0.4;
                draggedSlides = Math.round(dragged.y / slideHeight.value + tolerance);
            }
            let newSlide = getCurrentSlideIndex(config, currentSlideIndex.value - draggedSlides, maxSlideIndex.value, minSlideIndex.value);
            slideTo(newSlide);
            dragged.x = 0;
            dragged.y = 0;
            document.removeEventListener(isTouch ? 'touchmove' : 'mousemove', handleDrag);
            document.removeEventListener(isTouch ? 'touchend' : 'mouseup', handleDragEnd);
        }
        /**
         * Autoplay
         */
        function initializeAutoplay() {
            setInterval(() => {
                if (config.pauseAutoplayOnHover && isHover.value) {
                    return;
                }
                next();
            }, config.autoplay);
        }
        /**
         * Navigation function
         */
        const isSliding = ref(false);
        function slideTo(slideIndex, mute = false) {
            if (currentSlideIndex.value === slideIndex || isSliding.value) {
                return;
            }
            // Wrap slide index
            const lastSlideIndex = slidesCount.value - 1;
            if (slideIndex > lastSlideIndex) {
                return slideTo(slideIndex - slidesCount.value);
            }
            if (slideIndex < 0) {
                return slideTo(slideIndex + slidesCount.value);
            }
            isSliding.value = true;
            prevSlideIndex.value = currentSlideIndex.value;
            currentSlideIndex.value = slideIndex;
            if (!mute) {
                emit('update:modelValue', currentSlideIndex.value);
            }
            setTimeout(() => {
                if (config.wrapAround)
                    updateSlidesBuffer();
                isSliding.value = false;
            }, config.transition);
        }
        function next() {
            let nextSlide = currentSlideIndex.value + config.itemsToScroll;
            if (!config.wrapAround) {
                nextSlide = Math.min(nextSlide, maxSlideIndex.value);
            }
            slideTo(nextSlide);
        }
        function prev() {
            let prevSlide = currentSlideIndex.value - config.itemsToScroll;
            if (!config.wrapAround) {
                prevSlide = Math.max(prevSlide, minSlideIndex.value);
            }
            slideTo(prevSlide);
        }
        const nav = { slideTo, next, prev };
        provide('nav', nav);
        /**
         * Track style
         */
        const slidesToScroll = computed(() => {
            let output = slidesBuffer.value.indexOf(currentSlideIndex.value);
            if (config.snapAlign === 'center' || config.snapAlign === 'center-odd') {
                output -= (config.itemsToShow - 1) / 2;
            }
            else if (config.snapAlign === 'center-even') {
                output -= (config.itemsToShow - 2) / 2;
            }
            else if (config.snapAlign === 'end') {
                output -= config.itemsToShow - 1;
            }
            if (!config.wrapAround) {
                const max = slidesCount.value - config.itemsToShow;
                const min = 0;
                output = Math.max(Math.min(output, max), min);
            }
            return output;
        });
        provide('slidesToScroll', slidesToScroll);
        const trackStyleHorizontal = computed(() => {
            const xScroll = dragged.x - slidesToScroll.value * slideWidth.value;
            return {
                transform: `translateX(${xScroll}px)`,
                transition: `${isSliding.value ? config.transition : 0}ms`,
            };
        });
        const trackStyleVertical = computed(() => {
            const yScroll = dragged.y - slidesToScroll.value * slideHeight.value;
            return {
                transform: `translateY(${yScroll}px)`,
                transition: `${isSliding.value ? config.transition : 0}ms`,
            };
        });
        const slotsProps = reactive({
            slideWidth,
            slideHeight,
            slidesCount,
            currentSlide: currentSlideIndex,
        });
        const slotSlides = slots.default || slots.slides;
        const slotAddons = slots.addons;
        watchEffect(() => {
            // Handel when slides added/removed
            const needToUpdate = slidesCount.value !== slides.value.length;
            const currentSlideUpdated = props.modelValue !== undefined && currentSlideIndex.value !== props.modelValue;
            if (currentSlideUpdated) {
                slideTo(Number(props.modelValue), true);
            }
            if (needToUpdate) {
                updateSlidesData();
                updateSlidesBuffer();
            }
            if (slidesCounter.read) {
                slidesCounter.value = slides.value.length - 1;
            }
        });
        initDefaultConfigs();
        updateBreakpointsConfigs();
        updateSlidesBuffer();
        return () => {
            const slidesElements = getSlides(slotSlides === null || slotSlides === void 0 ? void 0 : slotSlides(slotsProps));
            const addonsElements = (slotAddons === null || slotAddons === void 0 ? void 0 : slotAddons(slotsProps)) || [];
            slides.value = slidesElements;
            // Bind slide order
            slidesElements.forEach((el, index) => (el.props.index = index));
            const trackEl = h('ol', {
                class: 'carousel__track',
                style: config.direction === 'vertical' ? trackStyleVertical.value : trackStyleHorizontal.value,
                onMousedown: config.mouseDrag ? handleDragStart : null,
                onTouchstart: config.touchDrag ? handleDragStart : null,
            }, slidesElements);
            const viewPortEl = h('div', { class: 'carousel__viewport' }, trackEl);
            return h('section', {
                ref: root,
                class: `carousel carousel--${config.direction}`,
                'aria-label': 'Gallery',
                onMouseenter: handleMouseEnter,
                onMouseleave: handleMouseLeave,
            }, [viewPortEl, addonsElements]);
        };
    },
});

const icons = {
    arrowUp: 'M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z',
    arrowDown: 'M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z',
    arrowRight: 'M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z',
    arrowLeft: 'M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z',
};

const Icon = (props) => {
    const iconName = props.name;
    if (!iconName || typeof iconName !== 'string') {
        return;
    }
    const path = icons[iconName];
    const pathEl = h('path', { d: path });
    props.title || iconName;
    const titleEl = h('title', null, iconName);
    return h('svg', {
        class: 'carousel__icon',
        viewBox: '0 0 24 24',
        role: 'img',
    }, [titleEl, pathEl]);
};
Icon.props = { name: String, title: String };

const Navigation = (props, { slots, attrs }) => {
    const { next: slotNext, prev: slotPrev } = slots;
    const nav = inject('nav', {});
    const prevButton = h('button', {
        type: 'button',
        class: ['carousel__prev', attrs === null || attrs === void 0 ? void 0 : attrs.class],
        'aria-label': `Navigate to previous slide`,
        onClick: nav.prev,
    }, (slotPrev === null || slotPrev === void 0 ? void 0 : slotPrev()) || h(Icon, { name: 'arrowLeft' }));
    const nextButton = h('button', {
        type: 'button',
        class: ['carousel__next', attrs === null || attrs === void 0 ? void 0 : attrs.class],
        'aria-label': `Navigate to next slide`,
        onClick: nav.next,
    }, (slotNext === null || slotNext === void 0 ? void 0 : slotNext()) || h(Icon, { name: 'arrowRight' }));
    return [prevButton, nextButton];
};

var Slide = defineComponent({
    name: 'CarouselSlide',
    props: {
        index: {
            type: Number,
            default: 1,
        },
    },
    setup(props, { slots }) {
        const config = inject('config', reactive(Object.assign({}, defaultConfigs)));
        const slidesBuffer = inject('slidesBuffer', ref([]));
        const slidesCounter = inject('slidesCounter');
        const currentSlide = inject('currentSlide', ref(0));
        const slidesToScroll = inject('slidesToScroll', ref(0));
        const slideOrder = slidesCounter.value;
        const wrapOrder = ref(slideOrder);
        if (config.wrapAround) {
            updateOrder();
            watchEffect(updateOrder);
        }
        function updateOrder() {
            wrapOrder.value = slidesBuffer.value.indexOf(slideOrder);
        }
        const slideStyle = computed(() => {
            const items = config.itemsToShow;
            const size = `${(1 / items) * 100}%`;
            const styles = {
                height: '',
                width: '',
                order: wrapOrder.value.toString(),
            };
            if (config.direction === 'vertical') {
                styles.height = size;
            }
            else {
                styles.width = size;
            }
            return styles;
        });
        const isActive = () => props.index === currentSlide.value;
        const isVisible = () => {
            const min = Math.ceil(slidesToScroll.value);
            const max = Math.floor(slidesToScroll.value + config.itemsToShow);
            const current = slidesBuffer.value.slice(min, max);
            return current.includes(props.index);
        };
        const isPrev = () => props.index === slidesBuffer.value[Math.ceil(slidesToScroll.value) - 1];
        const isNext = () => props.index ===
            slidesBuffer.value[Math.floor(slidesToScroll.value + config.itemsToShow)];
        return () => {
            var _a;
            return h('li', {
                style: slideStyle.value,
                class: {
                    carousel__slide: true,
                    'carousel__slide--active': isActive(),
                    'carousel__slide--visible': isVisible(),
                    'carousel__slide--prev': isPrev(),
                    'carousel__slide--next': isNext(),
                },
            }, (_a = slots.default) === null || _a === void 0 ? void 0 : _a.call(slots));
        };
    },
});

const Pagination = () => {
    const maxSlide = inject('maxSlide', ref(1));
    const minSlide = inject('minSlide', ref(1));
    const currentSlide = inject('currentSlide', ref(1));
    const nav = inject('nav', {});
    function handleButtonClick(slideNumber) {
        nav.slideTo(slideNumber);
    }
    const isActive = (slide) => {
        const val = currentSlide.value;
        return (val === slide ||
            (val > maxSlide.value && slide >= maxSlide.value) ||
            (val < minSlide.value && slide <= minSlide.value));
    };
    const children = [];
    for (let slide = minSlide.value; slide < maxSlide.value + 1; slide++) {
        const button = h('button', {
            type: 'button',
            class: {
                'carousel__pagination-button': true,
                'carousel__pagination-button--active': isActive(slide),
            },
            'aria-label': `Navigate to slide ${slide + 1}`,
            onClick: () => handleButtonClick(slide),
        });
        const item = h('li', { class: 'carousel__pagination-item', key: slide }, button);
        children.push(item);
    }
    return h('ol', { class: 'carousel__pagination' }, children);
};

export { Carousel, Icon, Navigation, Pagination, Slide };
