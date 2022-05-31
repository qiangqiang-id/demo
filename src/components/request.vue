<template>
  <div class="box" @click.self="handlerClick">
    <div>
      <el-button @click="handleGetRequest">GET</el-button>
      <el-button @click="handlePostRequest" @mousedown.stop>POST</el-button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      url: "https://mtv-api.test.bhbapp.cn/passports/wxpub/qrcode",
    };
  },

  methods: {
    handleGetRequest() {
      fetch(`${this.url}?name=zhangsan`);
    },

    handlePostRequest() {
      // const data = {
      //   username: "xiaoqiang",
      //   password: "123123",
      // };
      fetch(this.url, {
        method: "post",
        // body: JSON.stringify(data),
      });
    },

    handlerClick() {
      console.log("cahufa");
    },
  },
};
</script>


<style scoped>
.box {
  padding: 10px;
}
</style>