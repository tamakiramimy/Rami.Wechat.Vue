import router from '../router';
import store from '../store';
import { resetRouter, filterAsyncRouter } from '../router/index';

var storeTemp = store;
//用来获取后台拿到的路由
var lstRouters;
//不加这个判断，路由会陷入死循环
if (!lstRouters) {
    let temp = storeTemp.getters['localStore/getRouters'];
    if (!temp) {
        //本地没有，则从数据库获取
        storeTemp.dispatch('localStore/getRouterByToken').then(res => {
            if (res != null && res.length >= 120) {
                console.log('%c 从后台api获取到路由列表', "color:green");
                lstRouters = storeTemp.getters['localStore/getRouters'];
            }
        });
    } else {
        //从localStorage拿到了路由
        console.info('%c 从缓存中获取到路由列表！', "color:green")
        lstRouters = temp;
        //过滤路由
        lstRouters = filterAsyncRouter(lstRouters);
        //动态添加路由
        router.$addRoutes(lstRouters);
    }
}

/**
 * 路由权限检查
 */
router.beforeEach(async(to, from, next) => {
    {
        // 更新token刷新时间
        storeTemp.dispatch('jwtStore/setRefreshTime');
        // 判断该路由是否需要登录权限
        if (to.meta.requireAuth) {
            var token = storeTemp.getters['jwtStore/getToken'];
            if (token && typeof(token) != "undefined") {
                next();
            } else {
                // 清空登录信息
                storeTemp.dispatch('jwtStore/clearLoginJwt');

                // 将跳转的路由path作为参数，登录成功后跳转到该路由
                next({
                    path: "/login",
                    query: {
                        redirect: to.fullPath
                    }
                });

                window.location.reload()
            }
        } else {
            next();
        }
    }

    {
        //动态添加路由    
        var temp = storeTemp.getters['localStore/getRouters'];
        //不加这个判断，路由会陷入死循环
        if (!lstRouters) {
            if (!temp) {
                //本地没有，则从数据库获取
                await storeTemp.dispatch('localStore/getRouterByToken');
                console.log('%c 从后台api获取到路由列表', "color:green");
                lstRouters = storeTemp.getters['localStore/getRouters'];
                if (lstRouters != null && lstRouters.length > 0) {
                    //执行路由跳转方法
                    routerGo(to, next);
                }
            } else {
                console.info('%c 从缓存中获取到路由列表！', "color:green")
                lstRouters = temp;
                routerGo(to, next)
            }
        } else {
            if (to.name && to.name != 'login') {
                lstRouters = temp;
            }

            next();
        }
    }
});

/**
 * 路由跳转
 * @param {*} to 
 * @param {*} next 
 */
function routerGo(to, next) {
    //过滤路由
    lstRouters = filterAsyncRouter(lstRouters)
    resetRouter();

    //动态添加路由
    router.$addRoutes(lstRouters)

    next({
        ...to,
        replace: true
    })
}

var buttonList = [];
export const getButtonList = (routePath, routers) => {
    routers.forEach(element => {
        if (routePath && element.path) {
            let path = routePath.toLowerCase();
            if (element.path && element.path.toLowerCase() === path) {
                buttonList = element.children;
                return;
            } else if (element.children) {
                getButtonList(path, element.children);
            }
        }
    });

    return buttonList;
};