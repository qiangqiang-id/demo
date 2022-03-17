import Vue from 'vue'

import VueRouter from 'vue-router';

import HelloWorld from '../components/HelloWorld.vue';

Vue.use(VueRouter)

let router = new VueRouter({
  routes: [

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
      component: () => import('../components/gif2.vue')
    },
    {
      path: '/parsePsd',
      name: 'parsePsd',
      component: () => import('../components/parsePsd.vue')
    },
    {
      path: '/editor',
      name: 'editor',
      component: () => import('../components/monaco-editor.vue')
    },
    {
      path: '/stroke',
      name: 'stroke',
      component: () => import('../components/canvasStroke.vue')
    },
    {
      path: '/demo',
      name: 'demo',
      component: () => import('../components/demo.vue')
    },
    {
      path: '/progress',
      name: 'progress',
      component: () => import('../components/progress.vue')
    },
    {
      path: '/scroll',
      name: 'scroll',
      component: () => import('../components/scroll.vue'),
    },
    {
      path: '/editorTest',
      name: 'editorTest',
      component: () => import('../components/editor-test.vue')
    },
    {
      path: '/pixi',
      name: 'pixi',
      component: () => import('../components/pixi.vue')
    }
  ]
})

export default router