import storeHelper from '../../../utils/storeHelper'
import http from '../../../utils/http'

const TokenKey = "Token";
const UserNameKey = "UserName";
const UserInfoKey = "UserInfo";
const TokenInfoKey = "TokenInfo";

export default {
    namespaced: true,
    state: {
        token: "",
        userName: "",
        userInfo: "",
        tokenInfo: {
            ExpiresIn: "",
            ExpireTimeStamp: "",
            RefreshTime: "",
        },
    },
    getters: {
        getToken(state) {
            let temp = state.token;
            if (temp == null || temp.length == 0) {
                temp = storeHelper.getLocal(TokenKey);
            }

            return temp;
        },
        getUserName(state) {
            let temp = state.userName;
            if (temp == null || temp.length == 0) {
                temp = storeHelper.getLocal(UserNameKey);
            }

            return temp;
        },
        getUserInfo(state) {
            let temp = state.userInfo;
            if (temp == null || temp.UserName == null || temp.UserName.length == 0) {
                let jsonStr = storeHelper.getLocal(UserInfoKey);
                if (jsonStr) {
                    temp = JSON.parse(jsonStr);
                }
            }

            return temp;
        },
        getTokenInfo(state) {
            let temp = state.tokenInfo;
            if (temp == null || temp.ExpiresIn == null || temp.ExpiresIn != "" || temp.ExpireTimeStamp == null || temp.ExpireTimeStamp == "") {
                let jsonStr = storeHelper.getLocal(TokenInfoKey);
                if (jsonStr) {
                    temp = JSON.parse(jsonStr);
                }
            }

            return temp;
        }
    },
    mutations: {
        setToken(state, data) {
            state.token = data;
            storeHelper.setLocal(TokenKey, data);
        },
        setUserName(state, data) {
            state.userName = data;
            storeHelper.setLocal(UserNameKey, data);
        },
        setUserInfo(state, data) {
            state.userInfo = data;
            storeHelper.setLocal(UserInfoKey, JSON.stringify(data));
        },
        setTokenInfo(state, data) {
            if (data && data.ExpireTimeStamp) {
                // 计算超时时间
                if (!data.RefreshTime) {
                    let expiredate = new Date(data.ExpireTimeStamp);
                    data.RefreshTime = expiredate;
                }
            }

            // console.log(new Date(data.ExpireTimeStamp));
            // console.log(new Date(data.RefreshTime));
            state.tokenInfo = data;
            storeHelper.setLocal(TokenInfoKey, JSON.stringify(data));
        }
    },
    actions: {
        clearToken(context) {
            context.commit('setToken', '');
        },
        clearTokenExpire(context) {
            context.commit('setTokenExpire', '');
        },
        clearUserName(context) {
            context.commit('setUserName', '');
        },
        clearLoginJwt(context) {
            context.commit('setToken', '');
            context.commit('setUserName', '');
            context.commit('setUserInfo', '');
            context.commit('setTokenInfo', '');
            context.dispatch('localStore/clearTags', {}, { root: true });
            context.dispatch('localStore/clearRouters', {}, { root: true });
        },
        loginJwt(context, data) {
            context.commit('setToken', data.Token);
            context.commit('setUserName', data.UserName);
            context.commit('setTokenInfo', { ExpiresIn: data.ExpiresIn, ExpireTimeStamp: data.ExpireTimeStamp });
        },
        async getUserByJwt(context) {
            // 从store获取用户信息
            let userInfo = context.getters.getUserInfo;
            if (userInfo != null && userInfo.UserName != null) {
                return userInfo;
            }

            // 根据token后台获取用户信息
            let token = context.getters.getToken;
            if (token != null && token.length >= 120) {
                let apiRes = await http.get('Login/GetUserByJwt', { token: token });
                if (apiRes.IsSucc) {
                    context.commit('setUserInfo', apiRes.Data);
                }

                return apiRes.Data;
            }

            return null;
        },
        setRefreshTime(context) {
            let tokenInfo = context.getters.getTokenInfo;
            if (tokenInfo != null && tokenInfo.RefreshTime != null && tokenInfo.RefreshTime) {
                // 当前时间
                let nowtime = new Date();
                // 最后刷新时间
                let lastRefreshTime = new Date(-1);
                if (tokenInfo.RefreshTime) {
                    lastRefreshTime = new Date(tokenInfo.RefreshTime);
                }

                // token过期时间
                let expiretime = new Date(tokenInfo.ExpireTimeStamp);
                let refreshCount = 1; //滑动系数
                if (lastRefreshTime >= nowtime) {
                    lastRefreshTime = nowtime > expiretime ? nowtime : expiretime;
                    lastRefreshTime.setMinutes(lastRefreshTime.getMinutes() + refreshCount);
                    tokenInfo.RefreshTime = lastRefreshTime;
                } else {
                    tokenInfo.RefreshTime = new Date(-1);
                }

                context.commit('setTokenInfo', tokenInfo);
            }
        }
    }
}