<template>
  <div class="hello">
    <h2>{{ value.name }}</h2>
    <h2>{{ value.age }}</h2>
  </div>
</template>


<script>
export default {
  name: 'HelloWorld',

  props: {
    msg: String,
    value:{
      type: Object,
      default:()=>({name:'zhangsan',age:10})
    }
  },

  
  methods: {
    
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
