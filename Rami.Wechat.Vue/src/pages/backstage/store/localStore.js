import storeHelper from '../../../utils/storeHelper'
import http from '../../../utils/http'

const TagsKey = "Tags";
const RouterKey = "Routers";
var httpTemp = http;
export default {
    namespaced: true,
    state: {
        lstTags: [],
        lstRouter: null,
    },
    getters: {
        /**
         * 设置Tags
         * @param {*} state 
         */
        getTags(state) {
            let temp = state.lstTags;
            if (temp == null || temp.length == 0) {
                let jsonStr = storeHelper.getSession(TagsKey);
                //let jsonStr = storeHelper.getLocal(TagsKey);
                if (jsonStr) {
                    temp = JSON.parse(jsonStr);
                }
            }

            return temp;
        },
        /**
         * 获取路由信息
         * @param {*} state 
         */
        getRouters(state) {
            let temp = state.lstRouter;
            if (temp == null || temp.length == 0) {
                let jsonStr = storeHelper.getSession(RouterKey);
                //let jsonStr = storeHelper.getLocal(RouterKey);
                if (jsonStr) {
                    temp = JSON.parse(jsonStr);
                }
            }

            return temp;
        }
    },
    mutations: {
        /**
         * 设置Tags
         * @param {*} state 
         * @param {*} data 
         */
        setTags(state, data) {
            state.lstTags = data;
            storeHelper.setSession(TagsKey, JSON.stringify(data));
            //storeHelper.setLocal(TagsKey, JSON.stringify(data));
        },
        /**
         * 设置路由
         * @param {*} state 
         * @param {*} data 
         */
        setRouters(state, data) {
            state.lstRouter = data;
            storeHelper.setSession(RouterKey, JSON.stringify(data));
            //storeHelper.setLocal(RouterKey, JSON.stringify(data));
        }
    },
    actions: {
        /**
         * 清空Tags
         * @param {*} context 
         */
        clearTags(context) {
            context.commit('setTags', '');
        },
        /**
         * 清空 路由
         * @param {*} context 
         */
        clearRouters(context) {
            context.commit('setRouters', '')
        },
        /**
         * 根据token获取用户路由列表
         * @param {*} context 
         */
        async getRouterByToken(context) {
            // 从store获取路由
            let temp = context.getters.getRouters;
            if (temp != null && temp.length > 0) {
                return temp;
            }

            // 根据token获取路由
            let token = context.rootGetters["jwtStore/getToken"];
            console.log(`getRouterByToken:token:${token}`);
            if (token != null && token.length > 120) {
                console.log(`getRouterByToken:httpTemp:${httpTemp}`);
                var apiRes = await httpTemp.get('Permission/GetMenusByUser', {
                    token: token
                });

                console.log(`getRouterByToken:apiRes:${apiRes}`);
                if (apiRes && apiRes.IsSucc && apiRes.Data && apiRes.Data.children) {
                    context.commit('setRouters', apiRes.Data.children);
                    return apiRes.Data.children;
                }
            }

            return null;
        }
    },
}