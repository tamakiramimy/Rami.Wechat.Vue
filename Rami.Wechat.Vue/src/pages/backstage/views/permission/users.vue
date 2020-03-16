<template>
  <el-row>
    <el-row style="margin-top:10px;padding:10px;background-color:white;">
      <el-form :inline="true" size="small" label-position="left">
        <el-form-item label="登录账号">
          <el-input clearable placeholder="登录账号" v-model="para.Entity.UserName"></el-input>
        </el-form-item>

        <el-form-item label="显示名称">
          <el-input clearable placeholder="显示名称" v-model="para.Entity.Name"></el-input>
        </el-form-item>

        <el-row>
          <el-form-item>
            <el-button type="primary" size="small" round @click="query">搜索</el-button>
            <el-button type="success" size="small" round @click="addItem">新增</el-button>
          </el-form-item>
        </el-row>
      </el-form>
    </el-row>

    <el-row>
      <el-table border size="small" style="width: 100%" :data="lstDatas">
        <el-table-column label="Id" prop="Id"></el-table-column>
        <el-table-column label="登录账号" prop="UserName"></el-table-column>
        <el-table-column label="显示名称" prop="Name"></el-table-column>
        <el-table-column label="手机" prop="Phone"></el-table-column>
        <el-table-column label="邮箱" prop="Email"></el-table-column>
        <el-table-column label="状态" prop="IsDelShow"></el-table-column>
        <el-table-column label="创建时间" prop="CreateTime"></el-table-column>
        <el-table-column label="更新时间" prop="UpdateTime"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="item">
            <el-button type="warning" round size="small" @click="editItem(item.row)">编辑</el-button>
            <el-button type="warning" round size="small" @click="editPwd(item.row)">修改密码</el-button>
            <el-button :type="item.row.IsDel ? 'success' : 'danger'" round size="small" @click="delItem(item.row)">{{item.row.IsDel ? '启用' : '禁用'}}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-row style="margin-top:1em;text-align:center;">
        <el-pagination background layout="total,prev, pager, next,jumper" prev-text="上一页" next-text="下一页" :page-size="para.PageSize" :total="para.TotalCount" :current-page.sync="para.PageIndex" @current-change="onPageClick"></el-pagination>
      </el-row>
    </el-row>

    <el-dialog title="编辑" width="30%" :visible.sync="isShowEdit">
      <el-form ref="editForm" :model="entity" label-width="20%">
        <el-form-item label="登录账号" prop="UserName" v-if="optType == 1">
          <el-input clearable placeholder="登录账号" v-model="entity.UserName"></el-input>
        </el-form-item>

        <el-form-item label="登录密码" prop="UserPwd" v-if="optType == 1 || optType == 3">
          <el-input clearable placeholder="登录密码" type="password" v-model="entity.UserPwd"></el-input>
        </el-form-item>

        <el-form-item label="显示名称" prop="Name" v-if="optType != 3">
          <el-input clearable placeholder="显示名称" v-model="entity.Name"></el-input>
        </el-form-item>

        <el-form-item label="手机" prop="Phone" v-if="optType != 3">
          <el-input clearable placeholder="手机" v-model="entity.Phone"></el-input>
        </el-form-item>

        <el-form-item label="邮箱" prop="Email" v-if="optType != 3">
          <el-input clearable placeholder="邮箱" v-model="entity.Email"></el-input>
        </el-form-item>
      </el-form>

      <el-row style="text-align:center;">
        <el-button size="small" round type="primary" :disabled="isDisSave" @click="saveItem">确认</el-button>
        <el-button size="small" round type="info" @click="isShowEdit = false">取消</el-button>
      </el-row>
    </el-dialog>
  </el-row>
</template>

<script>
export default {
  data() {
    return {
      para: {
        PageIndex: 1,
        PageSize: 10,
        PageCount: 0,
        TotalCount: 0,
        Entity: {},
      },
      entity: {},
      lstDatas: [],
      isShowEdit: false,
      isDisSave: false,
      optType: "",// 1：新增；2：编辑 3:修改密码
    }
  },
  computed: {
  },
  methods: {
    // 查询
    query: function () {
      this.onPageClick(1);
    },
    // 数据加载
    getDatas: function () {
      let that = this;
      this.lstDatas = [];
      this.$http.post("Permission/GetUsers", that.para).then(res => {
        if (res.IsSucc) {
          let data = res.Data;
          that.lstDatas = data.Datas;
          that.para.TotalCount = data.TotalCount;
          that.para.PageCount = data.TotalPages;
        }
      }).catch(res => {
        console.log(res);
      });
    },
    // 分页
    onPageClick: function (page) {
      this.para.PageIndex = page;
      this.getDatas();
    },
    // 新增
    addItem: function () {
      this.entity = {};
      this.isShowEdit = true;
      this.optType = 1;
    },
    // 编辑
    editItem: function (item) {
      this.entity = Object.assign({}, item);
      this.isShowEdit = true;
      this.optType = 2;
    },
    // 修改密码
    editPwd: function (item) {
      this.entity = Object.assign({}, item);
      this.isShowEdit = true;
      this.optType = 3;
    },
    // 保存
    saveItem: function () {
      let that = this;
      let item = Object.assign({}, this.entity);
      if (this.optType == 3) {
        // 修改密码
        if (that.$msg.showMsg(that, 0, item.UserPwd, "请输入登录密码！")) {
          return;
        }
      } else {
        // 新增和修改
        if (that.$msg.showMsg(that, 0, item.UserName, "请输入登录账号")) {
          return;
        }

        if (that.$msg.showMsg(that, 0, item.UserPwd, "请输入登录密码")) {
          return;
        }

        if (that.$msg.showMsg(that, 0, item.Name, "请输入显示名称")) {
          return;
        }
      }

      // 判断是保存还是修改密码
      let optUrl = this.optType != 3 ? "Permission/SaveUser" : "Permission/UpdUserPwd";
      that.$http.post(optUrl, item).then(res => {
        that.$msg.showMsg(that, res.Message, res.IsSucc ? 0 : 1);
        if (res.IsSucc) {
          that.isShowEdit = false;
          that.getDatas();
        }
      }).catch(res => {
        console.log(res);
      });
    },
    // 删除
    delItem: function (item) {
      let that = this;
      that.$msg.showComfirm(that, "你确定要修改此记录的状态吗？", () => {
        that.isDisSave = true;
        that.$http.post("Permission/UpdUser", item).then(res => {
          that.$msg.showMsg(that, res.Message, res.IsSucc ? 0 : 1);
          if (res.IsSucc) {
            that.getDatas();
          }
        }).catch(res => {
          console.log(res);
        });
      });
    }
  },
  created() {
    this.getDatas();
    window.vm = this;
  }
}
</script>

<style>
</style>