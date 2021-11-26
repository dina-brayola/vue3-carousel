<template>
  <Carousel :items-to-show="2" :wrap-around="true" direction="vertical">
    <Slide v-for="slide in 10" :key="slide">
      <div class="carousel__item">{{ slide }}</div>
    </Slide>

    <template #addons>
      <Navigation />
    </template>
  </Carousel>
</template>

<script>
import { defineComponent } from 'vue';
import { Carousel, Navigation, Slide } from '../../dist/carousel.es';

import '../../dist/carousel.css';

export default defineComponent({
  name: 'Vertical',
  components: {
    Carousel,
    Slide,
    Navigation,
  },
});
</script>

<style>
  .carousel--vertical {
    height: 500px;
  }

  .carousel--vertical .carousel__item {
    height: 230px;
    width: 200px;
  }
</style>
