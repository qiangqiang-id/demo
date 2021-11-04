<template>
  <div id="app">
    <router-view></router-view>
    <div>
      <button @click="jumpHelloWorld">go helloWorld</button>
    </div>
    <div>
      <button @click="jumpGif">go gif</button>
    </div>
    <div>
      <button @click="jumpNewGif">go newGif</button>
    </div>
  </div>
</template>

<script >

export default {
  name: 'App',
  components: {
    // HelloWorld
  },
  data(){
    return {
      message:'Welcome to Your Vue.js App',
      text:'你好，我是大傻',
      obj: {
        name:"大傻",
        age: 12
      }
    }
  },

  methods: {

    jumpHelloWorld(){
        this.$router.push({path:'/helloWorld'})
    },

    jumpGif(){
       this.$router.push({path:'/gif'})
    },

    jumpNewGif(){
       this.$router.push({path:'/newGif'})
    }
  
  }
}
</script>