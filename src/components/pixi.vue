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

      const box = document.getElementById("pixi-container");

      box.appendChild(app.view);

      // const container = new PIXI.Container();
      // console.log(app.screen.width);
      // container.x = 0;
      // container.y = 0;

      const sprite = PIXI.Sprite.from(
        "https://st0.dancf.com/gaoding-material/0/images/223463/20191107-203726-aUYH9.jpg"
      );

      // container.addChild(bgFront);

      // app.stage.addChild(container);

      // load the texture we need

      const graphics = new PIXI.Graphics();
      // graphics.beginFill(0xff3300);
      graphics.drawRect(0, 0, 200, 200);
      graphics.endFill();

      // const sprite = new PIXI.Sprite(texture);
      sprite.mask = graphics;

      app.stage.addChild(sprite);
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