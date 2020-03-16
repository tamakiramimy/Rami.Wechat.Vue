<template>
  <el-row>
    <el-row style="margin-top:10px;padding:10px;background-color:white;">
      <el-form :inline="true" size="small" label-position="left">
        <el-form-item label="OA账号">
          <el-select v-model="para.Entity.UserName" clearable filterable remote reserve-keyword placeholder="OA账号" :remote-method="filterUser">
            <el-option v-for="item in lstUserTemp" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select>
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
        <el-table-column label="OA账号" prop="UserName"></el-table-column>
        <el-table-column label="中英文名" prop="Name"></el-table-column>
        <el-table-column label="角色" prop="Descriptions"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="item">
            <el-button type="warning" round size="small" @click="editItem(item.row)">修改</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-row style="margin-top:1em;text-align:center;">
        <el-pagination background layout="total,prev, pager, next,jumper" prev-text="上一页" next-text="下一页" :page-size="para.PageSize" :total="para.TotalCount" :current-page.sync="para.PageIndex" @current-change="onPageClick"></el-pagination>
      </el-row>
    </el-row>

    <el-dialog title="编辑" width="30%" :visible.sync="isShowEdit">
      <el-form ref="editForm" :model="entity" :rules="editFormRules" label-width="20%">
        <el-form-item label="OA账号" prop="UserName">
          <el-select v-model="entity.UserName" clearable filterable remote reserve-keyword placeholder="OA账号" :remote-method="filterUser" style="width:100%;">
            <el-option v-for="item in lstUserTemp" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="角色" prop="RIds">
          <el-select v-model="entity.LstRIds" clearable multiple placeholder="请选择" style="width:100%;">
            <el-option v-if="item.RoleName != 'superadmin'" v-for="item in lstRoles" :key="item.Id" :value="item.Id" :label="item.Description + '(' + item.RoleName + ')' "></el-option>
          </el-select>
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
import { async } from "q";
export default {
  data () {
    return {
      para: {
        PageIndex: 1,
        PageSize: 10,
        PageCount: 0,
        TotalCount: 0,
        Entity: {
          UserName: ""
        }
      },
      entity: {
        UserName: "",
        Name: "",
        RIds: "",
        LstRIds: []
      },
      lstDatas: [],
      lstRoles: [],
      lstUserTemp: [],
      isShowEdit: false,
      isDisSave: false,
      editFormRules: {
        UserName: [
          { required: true, message: "请输入OA账号名称", trigger: "blur" }
        ]
      }
    };
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
      this.$http.post("Permission/GetUserRoles", that.para).then(res => {
        that.$msg.showMsg(that, res.Message, res.IsSucc ? 0 : 1);
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
    // 获取角色列表
    getRoles: function () {
      let that = this;
      that.$http.post("Permission/GetRolesUse").then(res => {
        that.$msg.showMsg(that, res.Message, res.IsSucc ? 0 : 1);
        if (res.IsSucc) {
          that.lstRoles = res.Data;
        }
      }).catch(res => {
        console.log(res);
      });
    },
    // 查询用户
    filterUser: function (query) {
      let that = this;
      if (query != "") {
        that.$http.get("Permission/FilterUser", { name: query }).then(res => {
          if (res.IsSucc) {
            that.lstUserTemp = res.Data;
          } else {
            console.log(res.Message);
          }
        });
      }
    },
    // 新增
    addItem: function () {
      this.entity = {
        UserName: "",
        Name: "",
        RIds: "",
        LstRIds: []
      };

      this.isShowEdit = true;
    },
    // 编辑
    editItem: function (item) {
      this.entity = Object.assign({}, item);
      this.isShowEdit = true;
    },
    // 保存
    saveItem: function () {
      let that = this;
      let item = Object.assign({}, this.entity);
      this.$refs.editForm.validate(valid => {
        if (valid) {
          // 保存
          that.$http.post("Permission/SaveUserRole", item).then(res => {
            that.$msg.showMsg(that, res.Message, res.IsSucc ? 0 : 1);
            if (res.IsSucc) {
              that.isShowEdit = false;
              that.getDatas();
            }
          }).catch(res => {
            console.log(res);
          });
        }
      });
    }
  },
  created () {
    this.getDatas();
    this.getRoles();
    window.vm = this;
  }
};
</script>

<style>
</style>