<template>
  <div>
    <el-button @click="parsePsd">解析psd</el-button>

    <input type="file" @change="handleChange" />
  </div>
</template>

<script>
export default {
  methods: {
    async parsePsd() {
      // const worker = new Worker('./worker.js');
      // worker.postMessage({result: 13123})
      const response = await fetch("odyssey-demo.psd");
      const blob = await response.blob();
      const file = new File([blob], "odyssey-demo.psd");
      console.log("file", file);

      const worker = new Worker("worker.js");
      worker.postMessage({ file });
    },

    handleChange(e) {
      const file = e.target.files[0];
      const fileReader = new FileReader();
      const worker = new Worker("work.js");
      fileReader.readAsArrayBuffer(file);
      fileReader.onload = (e) => {
        const { result } = e.target;
        worker.postMessage({ result });
      };
    },
  },
};
</script>