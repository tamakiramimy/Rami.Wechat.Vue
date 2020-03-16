import Vue from 'vue'
import Vuex from 'vuex'
import jwtStore from './jwtStore'
import localStore from './localStore'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {},
  getters: {},
  mutations: {},
  actions: {},
  modules: {
    jwtStore: jwtStore,
    localStore: localStore
  }
})