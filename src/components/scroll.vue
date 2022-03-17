<template>
  <div class="container">
    <div
      v-for="(item, index) in list"
      :key="index"
      :id="item.id"
      @mousedown="handleMousedown($event, item.id)"
    >
      <img draggable="false" :src="item.src" alt="" />
    </div>
  </div>
</template>

<script>
import scroll1 from "../assets/scroll1.jpg";
import scroll2 from "../assets/scroll2.jpg";

export default {
  data() {
    return {
      list: [
        { src: scroll1, id: 1 },
        { src: scroll2, id: 2 },
        { src: scroll1, id: 3 },
        { src: scroll2, id: 4 },
      ],
      activeIndex: 1,
    };
  },

  methods: {
    handleMousedown(e, id) {
      console.log(id);
      const startY = e.pageY;
      let endY;
      function handleMouseup(e) {
        endY = e.pageY;

        const diff = startY - endY;
        if (diff > 50) {
          document.getElementById(Number(id) + 1).scrollIntoView(true);
        }

        if (diff < -50) {
          document.getElementById(Number(id) - 1).scrollIntoView(true);
        }

        document.removeEventListener("mouseup", handleMouseup);
      }
      document.addEventListener("mouseup", handleMouseup);
    },
  },
};
</script>


<style scoped>
.container {
  overflow: hidden;
  height: 100vh;
  scroll-behavior: smooth;
}
</style>