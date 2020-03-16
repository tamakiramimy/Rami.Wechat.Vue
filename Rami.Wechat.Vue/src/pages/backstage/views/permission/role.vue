<template>
  <el-row>
    <el-row style="margin-top:10px;padding:10px;background-color:white;">
      <el-form :inline="true" size="small" label-position="left">
        <el-form-item label="ID">
          <el-input clearable placeholder="ID" v-model="para.Entity.Id"></el-input>
        </el-form-item>

        <el-form-item label="名称">
          <el-input clearable placeholder="名称" v-model="para.Entity.RoleName"></el-input>
        </el-form-item>

        <el-form-item label="描述">
          <el-input clearable placeholder="描述" v-model="para.Entity.Description"></el-input>
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
        <el-table-column label="名称" prop="RoleName"></el-table-column>
        <el-table-column label="描述" prop="Description"></el-table-column>
        <el-table-column label="排序" prop="OrdInd"></el-table-column>
        <el-table-column label="状态" prop="IsDelShow"></el-table-column>
        <el-table-column label="创建时间" prop="CreateTime"></el-table-column>
        <el-table-column label="更新时间" prop="UpdateTime"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="item">
            <el-button type="warning" round size="small" @click="editItem(item.row)">修改</el-button>
            <el-button :type="item.row.IsDel ? 'success' : 'danger'" round size="small" @click="delItem(item.row)">{{item.row.IsDel ? '启用' : '禁用'}}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-row style="margin-top:1em;text-align:center;">
        <el-pagination background layout="total,prev, pager, next,jumper" prev-text="上一页" next-text="下一页" :page-size="para.PageSize" :total="para.TotalCount" :current-page.sync="para.PageIndex" @current-change="onPageClick"></el-pagination>
      </el-row>
    </el-row>

    <el-dialog title="编辑" width="30%" :visible.sync="isShowEdit">
      <el-form ref="editForm" :model="entity" :rules="editFormRules" label-width="20%">
        <el-form-item label="名称" prop="RoleName">
          <el-input clearable placeholder="名称" v-model="entity.RoleName"></el-input>
        </el-form-item>

        <el-form-item label="描述" prop="Description">
          <el-input clearable placeholder="描述" v-model="entity.Description"></el-input>
        </el-form-item>

        <el-form-item label="排序" prop="OrdInd">
          <el-input type="number" clearable placeholder="排序" v-model.number="entity.OrdInd"></el-input>
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
          Id: "",
          RoleName: "",
          Description: ""
        }
      },
      entity: {
        Id: "",
        RoleName: "",
        Description: "",
        OrdInd: ""
      },
      lstDatas: [],
      isShowEdit: false,
      isDisSave: false,
      editFormRules: {
        RoleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" }
        ],
        Description: [
          { required: true, message: "请输入描述", trigger: "blur" }
        ],
        OrdInd: [
          { required: true, type: "number", message: "请输入排序", trigger: "blur" }
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
      this.$http.post("Permission/GetRoles", that.para).then(res => {
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
      this.entity = {
        Id: "",
        RoleName: "",
        Description: "",
        OrdInd: ""
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
          that.$http.post("Permission/SaveRole", item).then(res => {
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
    },
    // 删除
    delItem: function (item) {
      let that = this;
      that.$msg.showComfirm(that, "你确定要修改此记录的状态吗？", () => {
        that.isDisSave = true;
        that.$http.post("Permission/UpdRole", item).then(res => {
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
  created () {
    this.getDatas();
    window.vm = this;
  }
};
</script>

<style>
</style>