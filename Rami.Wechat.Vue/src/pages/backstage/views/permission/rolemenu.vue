<template>
  <el-row>
    <el-row>
      <!--角色列表-->
      <el-col :span="8" class="toolbar roles">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>权限</span>
            <el-button type="primary" size="small" round @click="getRoles()" style="float: right;">刷新</el-button>
          </div>
          <div v-for="role in lstRoles" :key="role.Id" @click="getRoleMenus(role.Id)" :class="role.Id == selRole ? 'active':''" class="text item role-item">{{role.Description + '(' + role.RoleName + ')' }}</div>
        </el-card>
      </el-col>

      <!-- 菜单权限列表 -->
      <el-col :span="16" class="toolbar perms">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>菜单</span>
            <el-button type="primary" size="small" round :disabled="isDisSave" @click="saveItem()" style="float: right;">保存</el-button>
          </div>
          <div class="block">
            <el-tree :data="lstMenus" show-checkbox node-key="value" ref="tree" default-expand-all :expand-on-click-node="true" :check-strictly="true">
              <span class="custom-tree-node" slot-scope="{ node }">
                <span>{{ node.label }}</span>
              </span>
            </el-tree>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </el-row>
</template>

<script>
import { async } from "q";
export default {
  data () {
    return {
      selRole: "",
      lstRoles: [],
      lstMenus: [],
      lstRoleMenus: [],
      isDisSave: false
    };
  },
  methods: {
    // 角色列表
    getRoles: function () {
      let that = this;
      this.$http.post("Permission/GetRolesUse").then(res => {
        that.lstRoles = res.Data;
      }).catch(res => {
        console.log(res);
      });
    },
    // 菜单树
    getMenus: function () {
      let that = this;
      this.$http.get("Permission/GetPermissionTree").then(res => {
        that.lstMenus = res.Data.children;
      }).catch(res => {
        console.log(res);
      });
    },
    // 根据角色 查询 菜单权限列表
    getRoleMenus: function (rId) {
      let that = this;
      this.selRole = rId;
      this.$http.post("Permission/GetMenusByRole", { rId: rId }).then(res => {
        that.lstRoleMenus = res.Data;
        that.$refs.tree.setCheckedKeys(that.lstRoleMenus);
      }).catch(res => {
        console.log(res);
      });
    },
    // 保存
    saveItem: function () {
      let that = this;
      let lstMIds = this.$refs.tree.getCheckedKeys();
      let postData = { rId: this.selRole, lstMIds: lstMIds };

      // 判断是否有选择角色
      if (!that.$msg.checkSave(that, 0, that.selRole, "请先选择角色！")) {
        return;
      }

      that.isDisSave = true;
      // 保存
      that.$http.post("Permission/SaveRoleMenus", postData).then(res => {
        that.isDisSave = false;
        that.$msg.showMsg(that, res.Message, res.IsSucc ? 0 : 1);
        if (res.IsSucc) {
          that.isShowEdit = false;
          that.getRoleMenus(that.selRole);
        }
      }).catch(res => {
        that.isDisSave = false;
        console.log(res);
      });
    }
  },
  created () {
    this.getRoles();
    this.getMenus();
    window.vm = this;
  }
};
</script>

<style>
.role-item {
  cursor: pointer;
  padding: 10px;
}

.role-item.active {
  background: #ebf5ff;
}

.role-item:hover {
  background: #ebf5ff;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

.text {
  font-size: 14px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both;
}

.box-card {
  width: 90%;
}

.el-checkbox + .el-checkbox {
  margin-left: 5px !important;
}

.el-checkbox {
  margin-right: 5px !important;
}
</style>