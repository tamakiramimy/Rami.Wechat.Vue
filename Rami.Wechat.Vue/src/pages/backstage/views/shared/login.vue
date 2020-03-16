<template>
  <div class="fullWidth" style="margin-top:100px;">
    <div class="loginRect">
      <p class="txtCenter">
        <span style="font-size:20px;color:#303133;">系统登陆</span>
      </p>
      <p class="txtCenter">
        <span style="font-size:14px;color:#CCCCCC;">{{ title }}</span>
      </p>

      <div style="width:80%;margin:auto;" v-if="isOidcAuth">
        <el-row>
          <el-button type="primary" icon="el-icon-upload" @click="oidcLogin">Oidc登陆</el-button>
        </el-row>
      </div>

      <div style="width:80%;margin:auto;" v-else>
        <el-form ref="loginForm" :model="user" :rules="rules" status-icon label-width="50px">
          <el-form-item label="账号" prop="name">
            <el-input clearable v-model="user.name"></el-input>
          </el-form-item>

          <el-form-item label="密码" prop="pass">
            <el-input clearable v-model="user.pass" type="password"></el-input>
          </el-form-item>

          <el-row>
            <el-button type="primary" icon="el-icon-upload" @click="login">登录</el-button>
          </el-row>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import router from '../../router';
import { resetRouter, filterAsyncRouter } from '../../router/index';
export default {
  data() {
    return {
      title: '公众号后台',
      isOidcAuth: false,
      user: {
        name: '',
        pass: ''
      },
      rules: {
        name: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
        pass: [{ required: true, message: '密码不能为空', trigger: 'blur' }]
      }
    };
  },
  methods: {
    // 登陆
    login: async function () {
      let that = this;
      return that.$http.get('Login/GetJwtByLogin', { userName: that.user.name, userPwd: that.user.pass }).then(async res => {
        if (res.IsSucc) {
          let data = res.Data;

          // 保存token和超时信息
          that.$store.dispatch('jwtStore/loginJwt', data);

          // 根据用户名获取用户信息
          await that.$store.dispatch('jwtStore/getUserByJwt');

          // 根据用户名获取菜单列表
          await that.$store.dispatch('localStore/getRouterByToken');

          //过滤路由
          let getRouter = that.$store.getters['localStore/getRouters'];
          console.log(getRouter);
          if (getRouter) {
            getRouter = filterAsyncRouter(getRouter);
            //动态添加路由
            router.$addRoutes(getRouter);
          }

          // 跳转界面
          let redirect = that.$route.query.redirect;
          if (redirect != null && redirect.length > 0) {
            that.$router.replace(redirect);
          } else {
            that.$router.replace('/');
          }
        } else {
          that.$msg.showMsg(that, res.Message);
        }
      });
    },
    // oidc 登陆
    oidcLogin: function () {
      that.$route.replace('/');
    }
  },
  computed: {},
  // 界面加载完
  mounted() {
    // 清空旧Token
    this.$store.dispatch('jwtStore/clearLoginJwt');
  }
};
</script>

<style>
body {
  padding: 0px;
  margin: 0px;
  min-height: 100%;
  background-color: #eeeeee;
}

.fullWidth {
  width: 100%;
}

.txtCenter {
  text-align: center;
}

.loginRect {
  width: 300px;
  height: 400px;
  background-color: white;
  margin: auto;
  padding: 10px;
  border-radius: 10px;
}

.defMargin {
  margin: 10px 0px;
}
</style>
