import Vue from 'vue'
import App from './App.vue'
import VueLocalStorage from 'vue-ls';

const storageOptions = {
  namespace: 'vjs__'
};

Vue.use(VueLocalStorage, storageOptions);

/* event bus to handle child / parent relationships */
const bus = new Vue();

Object.defineProperty(Vue.prototype,'$bus', { get() { return this.$root.bus } });

new Vue({
  el: '#app',
  render: h => h(App),
  data: {
  	bus
  }
})
