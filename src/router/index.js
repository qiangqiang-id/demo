import Vue from 'vue'

import VueRouter from 'vue-router';

import HelloWorld from '../components/HelloWorld.vue';

import Gif from '../components/gif.vue'


Vue.use(VueRouter)

let router = new VueRouter({
  routes: [
    {
      path: '/gif',
      name: 'gif',
      component: Gif
    },
    {
      path: '/gif1',
      name: 'gif1',
      component: () => import('../components/gif1.vue')
    },
    {
      path: '/newGif',
      name: "newGif",
      component: () => import('../components/newGif.vue')
    },
    {
      path: '/gifs',
      name: 'gifs',
      component: () => import('../components/gifs.vue')
    },
    {
      path: '/helloWorld',
      name: 'helloWorld',
      component: HelloWorld
    },
     {
      path: '/gif2',
      name: 'gif2',
      component: ()=>import('../components/gif2.vue')
    },
    {
       path: '/parsePsd',
       name: 'parsePsd',
      component:()=>import('../components/parsePsd.vue')
    }
  ]
})

export default router