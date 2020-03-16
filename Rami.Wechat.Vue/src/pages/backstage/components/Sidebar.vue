<template>
  <div>
    <!-- 有子节点的菜单 -->
    <template v-if="item.children">
      <template v-if="!item.IsHide">
        <!-- 非根目录菜单 -->
        <el-submenu v-if="!(item.path != '' && item.path != ' ' && item.path != '-')" :index="item.id+'index'" :key="item.path">
          <template slot="title">
            <i v-if="item.children && item.children.length > 0 && item.iconCls" class="fa" :class="item.iconCls"></i>
            <span class="title-name" slot="title">{{item.name}}</span>
          </template>
          <template v-for="child in item.children" v-if="!child.IsHide">
            <!-- 这里实现自己递归嵌套 -->
            <sidebar v-if="child.children && child.children.length > 0" :item="child" :index="child.id" :key="child.path" />
            <!-- 子菜单 -->
            <el-menu-item v-else :key="child.path" :index="child.path" @click="cop(child)">
              <i class="fa" :class="child.iconCls"></i>
              <template slot="title">
                <a :href="child.path" target="_blank" v-if="child.IsUrl">
                  <span class="title-name">{{child.name}}</span>
                </a>
                <span class="title-name" v-else>{{child.name}}</span>
              </template>
            </el-menu-item>
          </template>
        </el-submenu>
        <!-- 根目录菜单 -->
        <template v-else>
          <el-menu-item :index="item.path" :key="item.path+'d'">
            <i class="fa" :class="item.iconCls"></i>
            <template slot="title">
              <span class="title-name" slot="title">{{item.name}}</span>
            </template>
          </el-menu-item>
        </template>
      </template>
    </template>
    <!-- 没有子节点的菜单 -->
    <template v-else>
      <template v-if="!item.IsHide">
        <el-menu-item :index="item.path" :key="item.path+'d'" @click="cop(item)">
          <i class="fa" :class="item.iconCls"></i>
          <template slot="title">
            <a :href="item.Router" target="_blank" v-if="item.IsUrl">
              <span class="title-name">{{item.path}}</span>
            </a>
            <span class="title-name" v-else>{{item.name}}</span>
          </template>
        </el-menu-item>
      </template>
    </template>
  </div>
</template>

<script>
export default {
  name: "Sidebar",
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  methods: {
    cop: function (menu) {
      // 子组件中触发父组件方法collaFa
      this.$emit("collaFa");
      // 触发路由跳转
      if (!menu.IsUrl) {
        this.$router.push(menu.path);
      }
    }
  }
};
</script>

<style>
a {
  text-decoration: none;
  color: whitesmoke;
}
</style>
