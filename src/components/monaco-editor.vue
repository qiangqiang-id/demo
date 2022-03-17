<template>
  <div id="container" ref="container"></div>
</template>
<script>

import * as monaco from 'monaco-editor'

export default {
  data(){
    return{
      remark:null,
      string:` mounted(){
    this.remark =monaco.editor.create(this.$refs.container,{
      language: 'javaScript',
      automaticLayout: true,
      theme: 'vs',
      value:this.string
    })
  },

  methods:{

  }`
    }
  },

  mounted(){
    this.remark =monaco.editor.create(this.$refs.container,{
      language: 'javaScript',
      automaticLayout: true,
      theme: 'vs',
      value:this.string
    })
  },

  methods:{

  }

}
</script>


<style scoped>
#container {
  height: 100vh;
}

/* #container >>> .codicon-folding-expanded:before {
  content: "\eab8";
} */
::v-deep div.cldr.codicon-folding-expanded::before {
  content: "\eab8";
}
</style>