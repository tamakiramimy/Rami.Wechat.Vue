<template>
  <div class="layout">
    <transition v-if="!$route.meta.NoNeedHome" name="fade" mode="out-in">
      <el-row class="container">
        <!-- 顶部Logo和登陆信息 -->
        <el-col :span="24" class="header">
          <el-col :span="12" class="sysName">
            <div @click="goIndex">{{sysName}}</div>
          </el-col>
          <el-col :span="12" class="userinfo">
            <!-- <span>
              <el-link class="ssoIcon" href="/page1.html">应用1</el-link>
              <el-link class="ssoIcon" href="/page2.html">应用2</el-link>
            </span> -->
            <el-dropdown trigger="hover">
              <span class="el-dropdown-link userinfo-inner">
                {{sysUserName}}
                <img :src="sysUserAvatar" height="128px" width="128px" />
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item divided @click.native="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </el-col>
        </el-col>
        <el-col :span="24" class="main">
          <!-- 左侧菜单栏 -->
          <aside class="asideBg" :class="collapsedClass">
            <el-scrollbar class="scrollbar-handle">
              <el-menu :default-active="$route.path" class="el-menu-vertical-demo" unique-opened :collapse="isCollapse" background-color="#2dc3e8" text-color="#fff" active-text-color="#ffd04b">
                <sidebar v-for="(menu,index) in routes" @collaFa="collapseFa" :key="index" :item="menu" />
              </el-menu>
            </el-scrollbar>
          </aside>
          <el-col :span="24" :class="isHideMenu?'content-collapsed':'content-expanded'">
            <!-- 当前页面路径 -->
            <el-col :span="24" class="header breadcrumbHeader">
              <div :class=" isHideMenu?'tools collapsed':'tools'" @click="collapse">
                <i class="fa fa-align-justify"></i>
              </div>
              <el-breadcrumb separator="/" class="breadcrumb-inner collapsedLogo">
                <el-breadcrumb-item v-for="item in $route.matched" :key="item.path">
                  <span>{{item.name}}</span>
                </el-breadcrumb-item>
              </el-breadcrumb>
            </el-col>

            <!-- 已打开页签列表 -->
            <el-col :span="24" class="content-wrapper">
              <div class="tags" v-if="showTags">
                <div id="tags-view-container" class="tags-view-container">
                  <scroll-pane ref="scrollPane" class="tags-view-wrapper">
                    <router-link v-for="(tag,index) in tagsList" ref="tag" :key="tag.path" :class="{'active': isCurTag(tag.path)}" :to="{ path: tag.path, query: tag.query, fullPath: tag.fullPath }" tag="span" @click.middle.native="closeTags(index)" class="tags-view-item">
                      {{ tag.title }}
                      <span class="el-icon-close" @click.prevent.stop="closeTags(index)" />
                    </router-link>
                  </scroll-pane>
                </div>
                <!-- 其他操作按钮 -->
                <div class="tags-close-box">
                  <el-dropdown @command="handleTags">
                    <el-button size="mini">
                      <i class="el-icon-arrow-down el-icon--right"></i>
                    </el-button>
                    <el-dropdown-menu size="small" slot="dropdown">
                      <el-dropdown-item command="other">关闭其他</el-dropdown-item>
                      <el-dropdown-item command="all">关闭所有</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </div>
              </div>
              <transition name="fade" mode="out-in">
                <div class="content-az">
                  <router-view></router-view>
                </div>
              </transition>
            </el-col>

          </el-col>
        </el-col>
      </el-row>
    </transition>
    <!-- 主界面 -->
    <transition v-else name="fade" mode="out-in">
      <div class="content-az">
        <router-view></router-view>
      </div>
    </transition>
    <!-- 隐藏菜单 -->
    <div class="v-modal" @click="collapse" v-show="isShowSideBar" tabindex="0" style="z-index: 2917;"></div>
  </div>
</template>

<script>
import Sidebar from "../components/Sidebar";
import ScrollPane from "../components/ScrollPane";
import { mapGetters, mapActions } from "vuex";
export default {
  components: {
    Sidebar,
    ScrollPane
  },
  data () {
    return {
      sysName: "公众号后台",
      sysUserName: "",
      sysUserAvatar: "",
      isShowSideBar: false,
      isHideMenu: false,
      isPC: false,
      isCollapse: false,
      collapsedClass: "menu-expanded",
      tagsList: [],
      routes: []
    };
  },
  methods: {
    // 首页
    goIndex () {
      this.$router.replace({
        path: "/"
      });
    },
    //退出登录
    logout: function () {
      let that = this;
      this.$confirm("确认退出吗?", "提示", {})
        .then(() => {
          that.$store.dispatch("jwtStore/clearLoginJwt");
          global.antRouter = [];
          this.tagsList = [];
          this.routes = [];
          that.$router.push("/login");
          window.location.reload();
        })
        .catch(() => { });
    },
    //折叠导航栏
    collapse: function () {
      this.isHideMenu = !this.isHideMenu;
      if (this.isPC) {
        if (this.isHideMenu) {
          this.collapsedClass = "menu-collapsed";
        } else {
          this.collapsedClass = "menu-expanded";
        }
      } else {
        // mobile
        if (this.isHideMenu) {
          this.isShowSideBar = true;
          this.collapsedClass = "menu-collapsed-mobile";
        } else {
          this.isShowSideBar = false;
          this.collapsedClass = "menu-expanded-mobile";
        }
        this.collapsedClass += " mobile-ex ";
      }
      this.isCollapse = !this.isCollapse;
    },
    // 菜单点击
    collapseFa: function () {
      if (!this.isPC) {
        this.collapse();
      }
    },
    // 是否当前页签
    isCurTag (path) {
      return path === this.$route.fullPath;
    },
    // 设置当前页签
    setTags (route) {
      if (!route.meta.NoTabPage) {
        const isExist = this.tagsList.some(item => {
          return item.path === route.fullPath;
        });
        if (!isExist) {
          this.tagsList.push({
            title: route.meta.title,
            path: route.fullPath
          });
        }
      }
    },
    // 关闭单个标签
    closeTags (index) {
      const delItem = this.tagsList.splice(index, 1)[0];
      const item = this.tagsList[index] ?
        this.tagsList[index] :
        this.tagsList[index - 1];
      if (item) {
        delItem.path === this.$route.fullPath && this.$router.push(item.path);
        this.$store.commit("localStore/setTags", JSON.stringify(this.tagsList));
      } else {
        this.$router.push("/");
      }
    },
    // 当关闭所有页面时隐藏
    handleTags (command) {
      command === "other" ? this.closeOther() : this.closeAll();
    },
    // 关闭其他标签
    closeOther () {
      const curItem = this.tagsList.filter(item => {
        return item.path === this.$route.fullPath;
      });
      this.tagsList = curItem;
      this.$store.commit("localStore/setTags", curItem);
    },
    // 关闭全部标签
    closeAll () {
      this.tagsList = [];
      this.$router.push("/");
      this.$store.dispatch("localStore/clearTags");
    }
  },
  computed: {
    showTags () {
      if (this.tagsList.length > 1) {
        this.$store.commit("localStore/setTags", this.tagsList);
      }
      return this.tagsList.length > 0;
    }
  },
  watch: {
    // 对router进行监听，每当访问router时，对tags的进行修改
    $route (newValue) {
      this.setTags(newValue);
      const tags = this.$refs.tag;
      this.$nextTick(() => {
        if (tags) {
          for (const tag of tags) {
            if (tag.to.path === this.$route.path) {
              this.$refs.scrollPane.moveToTarget(tag, tags);
              break;
            }
          }
        }
      });
    }
  },
  created () {
    // 第一次进入页面时，修改tag的值
    this.setTags(this.$route);
    this.isPC = window.screen.width > 680;
    if (this.isPC) {
      this.collapsedClass = "menu-expanded";
    } else {
      this.collapsedClass = "menu-expanded-mobile mobile-ex";
      this.isHideMenu = true;
      this.collapse();
    }
  },
  async mounted () {
    console.log(this.$route);
    let tags = this.$store.getters["localStore/getTags"];
    if (tags && tags.length > 0) {
      this.tagsList = tags;
    }
    //let lstRouters = this.$store.getters["localStore/getRouters"];
    let lstRouters = await this.$store.dispatch("localStore/getRouterByToken");
    if (this.routes.length <= 0 && lstRouters && lstRouters.length >= 0) {
      this.routes = lstRouters;
    }

    window.vue = this;
  },
  async updated () {
    //let user = this.$store.getters["jwtStore/getUserInfo"];
    let user = await this.$store.dispatch("jwtStore/getUserByJwt")
    if (user) {
      this.sysUserName = user.Name || "用户";
      this.sysUserAvatar = "../images/defimg.png";
    }
    let lstRouters = this.$store.getters["localStore/getRouters"];
    if (lstRouters && lstRouters.length >= 0) {
      if (this.routes.length <= 0 || JSON.stringify(this.routes) != JSON.stringify(lstRouters)) {
        this.routes = lstRouters;
      }
    }
  }
};
</script>

<style>
@import "../../../style/home.css";
@import "../../../style/layout.css";
</style>