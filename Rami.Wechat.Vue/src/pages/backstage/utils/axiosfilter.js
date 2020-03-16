
import router from "../router";
import store from "../store";
import Vue from 'vue';
import httpHelper from '../../../utils/http'

// 跳转登录
function toLogin() {
    store.dispatch('jwtToken/clearLoginJwt');
    router.replace({
        path: "/login",
        query: {
            redirect: router.currentRoute.fullPath
        }
    });

    window.location.reload();
};

// 全局请求拦截器
httpHelper.http.interceptors.request.use(
    config => {
        let token = store.getters["jwtStore/getToken"];
        let tokenInfo = store.getters["jwtStore/getTokenInfo"];

        // 判断是否存在token，并且没有超时，则每个http header都加上token
        if (token && token.length >= 128 && tokenInfo && tokenInfo.ExpireTimeStamp) {
            let curTime = new Date();
            let expiretime = new Date(tokenInfo.ExpireTimeStamp);
            if (curTime < expiretime) {
                config.headers.Authorization = "Bearer " + token;
            }
        }

        store.dispatch('jwtStore/setRefreshTime');
        return config;
    },
    err => {
        return Promise.reject(err);
    }
);

// 全局响应拦截器
httpHelper.http.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        // 超时重新发起请求
        var originalRequest = error.config;
        if (error.code == 'ECONNABORTED' && error.message.indexOf('timeout') != -1 && !originalRequest._retry) {
            Vue.prototype.$message({
                message: '请求超时！',
                type: 'error'
            });

            originalRequest._retry = true
            return null;
        }

        if (error.response) {
            if (error.response.status == 401) {
                let token = store.getters['jwtStore/getToken'];
                let tokenInfo = store.getters["jwtStore/getTokenInfo"];
                if (token && tokenInfo && tokenInfo.RefreshTime) {
                    let curTime = new Date();
                    let refreshtime = new Date(tokenInfo.RefreshTime);
                    if (curTime <= refreshtime) {
                        return apiAxios('GET', 'Login/GetJwtByRefresh', {
                            token: token
                        }).then(res => {
                            if (res.IsSucc) {
                                Vue.prototype.$message({
                                    message: '刷新token成功',
                                    type: 'success'
                                });

                                // 保存token 信息
                                let data = res.Data;
                                store.dispatch('jwtStore/loginJwt', data);

                                // 用刷新后token 重新请求
                                error.config.__isRetryRequest = true;
                                error.config.headers.Authorization = 'Bearer ' + data.Token;
                                return http(error.config)
                            } else {
                                toLogin();
                            }
                        }).catch(res => {
                            console.log(`刷新Token失败！错误:${JSON.stringify(res)}`);
                            toLogin();
                        });
                    }
                }

                // 返回 401，并且不知用户操作活跃期内 清除token信息并跳转到登录页面
                toLogin();
            }

            // 403 无权限
            if (error.response.status == 403) {
                Vue.prototype.$message({
                    message: '失败！该操作无权限',
                    type: 'error'
                });

                return null;
            }
        }

        return error; // 返回接口返回的错误信息
    }
);
