<template>
  <div id="pixi-container"></div>
</template>

<script>
import * as PIXI from "pixi.js";
export default {
  data() {
    return {};
  },

  mounted() {
    this.init();
  },

  methods: {
    init() {
      const app = new PIXI.Application({
        width: 500,
        height: 500,
        antialias: false,
        transparent: false,
        resolution: 1,
      });

      const container = document.getElementById("pixi-container");

      container.appendChild(app.view);

      console.log(app);

      // load the texture we need
      app.loader
        .add(
          "bunny",
          "https://st0.dancf.com/gaoding-material/0/images/223463/20191107-203726-aUYH9.jpg"
        )
        .load((loader, resources) => {
          console.log(loader, resources);
          // This creates a texture from a 'bunny.png' image
          const bunny = new PIXI.Sprite(resources.bunny.texture);

          // Setup the position of the bunny
          bunny.x = 0;
          bunny.y = 0;
          // bunny.scale.x = ;

          // Rotate around the center
          bunny.anchor.x = 0;
          bunny.anchor.y = 0;

          // Add the bunny to the scene we are building
          app.stage.addChild(bunny);

          // Listen for frame updates
          app.ticker.add(() => {
            // each frame pin the bunny around a bit
            // bunny.rotation += 0.01;
          });
        });
    },
  },
};
</script>


<style>
#pixi-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>