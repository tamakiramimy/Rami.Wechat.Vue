<template>
  <el-row>
    <el-row style="margin-top:10px;padding:10px;background-color:white;">
      <el-form :inline="true" size="small" label-position="left">
        <el-form-item label="ID">
          <el-input clearable placeholder="ID" v-model="para.Entity.Id"></el-input>
        </el-form-item>

        <el-form-item label="父ID">
          <el-input clearable placeholder="父ID" v-model="para.Entity.PId"></el-input>
        </el-form-item>

        <el-form-item label="名称">
          <el-input clearable placeholder="名称" v-model="para.Entity.MenuName"></el-input>
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
        <el-table-column label="父Id" prop="PId"></el-table-column>
        <el-table-column label="名称" prop="MenuName"></el-table-column>
        <el-table-column label="路由" prop="Router"></el-table-column>
        <el-table-column label="全路径" prop="FullPath"></el-table-column>
        <el-table-column label="图标样式" prop="IconClass"></el-table-column>
        <el-table-column label="是否需要授权" prop="NeedAuthShow"></el-table-column>
        <el-table-column label="是否隐藏" prop="IsHideShow"></el-table-column>
        <el-table-column label="排序" prop="OrdInd"></el-table-column>
        <el-table-column label="树代码" prop="TreeCode"></el-table-column>
        <el-table-column label="状态" prop="IsDelShow"></el-table-column>
        <el-table-column label="创建时间" prop="CreateTime"></el-table-column>
        <el-table-column label="更新时间" prop="UpdateTime"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="item">
            <el-button type="warning" round size="small" @click="editItem(item.row)">修改</el-button>
            <el-button :type="item.row.IsDel ? 'success' : 'danger'" round size="small" @click="delItem(item.row)">{{ item.row.IsDel ? '启用' : '禁用' }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-row style="margin-top:1em;text-align:center;">
        <el-pagination background layout="total,prev, pager, next,jumper" prev-text="上一页" next-text="下一页" :page-size="para.PageSize" :total="para.TotalCount" :current-page.sync="para.PageIndex" @current-change="onPageClick"></el-pagination>
      </el-row>
    </el-row>

    <el-dialog title="编辑" width="30%" :visible.sync="isShowEdit">
      <el-form ref="editForm" :model="entity" :rules="editFormRules" label-width="20%">
        <el-form-item label="名称" prop="MenuName">
          <el-input clearable placeholder="名称" v-model="entity.MenuName"></el-input>
        </el-form-item>

        <el-form-item label="路由" prop="Router">
          <el-input clearable placeholder="路由" v-model="entity.Router"></el-input>
        </el-form-item>

        <el-form-item label="父菜单">
          <el-cascader placeholder="请选择，支持搜索功能" style="width: 100%" :options="lstPermissonTree" v-model="entity.PIdArr" :key="entity.Id" :props="{ checkStrictly: true, expandTrigger: 'hover' }" filterable clearable></el-cascader>
        </el-form-item>

        <el-form-item label="图标样式" prop="IconClass">
          <el-input clearable placeholder="图标样式" v-model="entity.IconClass"></el-input>
        </el-form-item>

        <el-form-item label="是否需要授权" prop="NeedAuth">
          <el-radio-group v-model="entity.NeedAuth">
            <el-radio :label="1">需要</el-radio>
            <el-radio :label="0">不需要</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="是否隐藏" prop="IsHide">
          <el-radio-group v-model="entity.IsHide">
            <el-radio :label="0">否</el-radio>
            <el-radio :label="1">是</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="排序" prop="OrdInd">
          <el-input type="number" clearable placeholder="排序" v-model.number="entity.OrdInd"></el-input>
        </el-form-item>

        <el-form-item label="树代码" prop="TreeCode">
          <el-input clearable placeholder="树代码" v-model="entity.TreeCode"></el-input>
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
import { async } from 'q';
import { log } from 'util';
export default {
  data () {
    return {
      para: {
        PageIndex: 1,
        PageSize: 10,
        PageCount: 0,
        TotalCount: 0,
        Entity: {
          Id: '',
          PId: '',
          MenuName: ''
        }
      },
      entity: {
        Id: '',
        PId: '',
        MenuName: '',
        Router: '',
        OrdInd: '',
        TreeCode: '',
        IconClass: '',
        NeedAuth: '',
        PIdArr: []
      },
      lstDatas: [],
      lstPermissonTree: [],
      isShowEdit: false,
      isDisSave: false,
      editFormRules: {
        MenuName: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
        Router: [{ required: true, message: '请输入路由地址', trigger: 'blur' }],
        OrdInd: [
          {
            required: true,
            type: 'number',
            message: '请输入排序',
            trigger: 'blur'
          }
        ],
        TreeCode: [{ required: true, message: '请输入树编码', trigger: 'blur' }]
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
      this.$http.post('Permission/GetMenus', that.para).then(res => {
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
    // 菜单树
    getPermissionTree: async function () {
      let that = this;
      this.lstPermissonTree = [];
      this.$http.get('Permission/GetPermissionTree').then(res => {
        that.lstPermissonTree.push(res.Data);
      }).catch(res => {
        console.log(res);
      });
    },
    // 新增
    addItem: function () {
      this.entity = {
        Id: '',
        PId: '',
        MenuName: '',
        Router: '',
        OrdInd: '',
        TreeCode: '',
        IconClass: '',
        NeedAuth: 1,
        PIdArr: [0]
      };

      this.isShowEdit = true;
    },
    // 编辑
    editItem: function (item) {
      if (item.PIdArr == null || item.PIdArr.length == 0) {
        item.PIdArr = [];
      }

      this.entity = Object.assign({}, item);
      this.isShowEdit = true;
    },
    // 保存
    saveItem: function () {
      let that = this;
      let item = Object.assign({}, this.entity);
      this.$refs.editForm.validate(valid => {
        if (valid) {
          item.PId = item.PIdArr.pop();
          if (!that.$msg.checkSave(that, 0, item.PId, '请选择父节点！')) {
            return;
          }

          if (item.Id) {
            if (item.Id == item.PId) {
              that.$msg.showMsg(that, '父节点不能选择自己！');
              return;
            }
          }

          // 保存
          that.$http.post('Permission/SaveMenu', item).then(res => {
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
      that.$msg.showComfirm(that, '你确定要修改此记录的状态吗？', () => {
        that.isDisSave = true;
        that.$http.post('Permission/UpdMenu', item).then(res => {
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
    this.getPermissionTree();
    window.vm = this;
  }
};
</script>

<style></style>
