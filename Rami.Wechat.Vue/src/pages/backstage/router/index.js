import Vue from 'vue';
import Router from 'vue-router';
import NoPage from '../views/shared/404';
import Forbidden from '../views/shared/403';
import Thanks from '../views/shared/thanks';
import Login from '../views/shared/login';
import adminLayout from '../components/AdminLayout';
import defLayout from '../components/DefLayout';
const _import = require('../router/_import_' + process.env.NODE_ENV); //获取组件的方法

Vue.use(Router);

// 默认菜单
const createRouter = () =>
  new Router({
    //mode: 'history',
    mode: 'hash',
    base: process.env.BASE_URL,
    routes: [
      {
        path: '/',
        component: adminLayout,
        name: '母版页',
        iconCls: 'fa-address-card',
        meta: {
          title: '母版页',
          NoTabPage: true,
          requireAuth: true // 添加该字段，表示进入这个路由是需要登录的
        },
        hidden: true
      },
      {
        path: '/404',
        component: NoPage,
        name: 'NoPage',
        meta: {
          title: 'NoPage',
          requireAuth: false,
          NoTabPage: true,
          NoNeedHome: true
        },
        hidden: true
      },
      {
        path: '/403',
        component: Forbidden,
        name: 'Forbidden',
        meta: {
          title: 'Forbidden',
          requireAuth: false,
          NoTabPage: true,
          NoNeedHome: true
        },
        hidden: true
      },
      {
        path: '/thanks',
        component: Thanks,
        name: 'Thanks',
        meta: {
          title: 'Thanks',
          requireAuth: false
        },
        hidden: true
      },
      {
        path: '/login',
        component: Login,
        name: 'login',
        iconCls: 'fa-address-card',
        meta: {
          title: '登录',
          NoTabPage: true,
          NoNeedHome: true
        },
        hidden: true
      },
      {
        path: '*',
        hidden: true,
        redirect: {
          path: '/404'
        }
      }
    ]
  });

// 路由
const router = createRouter();

// 过滤菜单
export function filterAsyncRouter(asyncRouterMap) {
  //注意这里的 asyncRouterMap 是一个数组
  const accessedRouters = asyncRouterMap.filter(route => {
    if (route.path) {
      if (route.path === '/' || route.path === '-') {
        //Layout组件特殊处理
        route.component = defLayout;
      } else {
        try {
          route.component = _import(route.path.replace('/:id', ''));
        } catch (e) {
          try {
            route.component = () => import('../views' + route.path.replace('/:id', '') + '.vue');
          } catch (error) {
            console.info('%c 当前路由 ' + route.path.replace('/:id', '') + '.vue 不存在，因此如法导入组件，请检查接口数据和组件是否匹配，并重新登录，清空缓存!', 'color:red');
          }
        }
      }
    }

    if (route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children);
    }

    return true;
  });

  return accessedRouters;
}

// 重新生成路由
export function resetRouter() {
  const newRouter = createRouter();
  router.matcher = newRouter.matcher; // the relevant part
}

// 动态添加路由
router.$addRoutes = params => {
  // var f = item => {
  //   if (item['children']) {
  //     item['children'] = item['children'].filter(f);
  //     return true;
  //   } else {
  //     return true;
  //   }
  // }

  // var params = params.filter(f);

  // 模板页Layout特殊处理
  let layout = router.options.routes.filter(item => {
    return item.path == '/' && item.name == '母版页';
  })[0];

  layout.children = params;
  router.addRoutes([layout]);
};

export default router;
