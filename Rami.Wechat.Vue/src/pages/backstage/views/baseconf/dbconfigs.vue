<template>
  <el-row>
    <el-row style="margin-top:10px;padding:10px;background-color:white;">
      <el-form :inline="true">
        <el-form-item label="配置名称">
          <el-input clearable placeholder="配置名称" v-model="para.Entity.ConfigRemark"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="small" round @click="query">查询</el-button>
        </el-form-item>
      </el-form>
    </el-row>

    <el-row>
      <el-table border style="width: 100%" :data="list">
        <el-table-column label="配置名" prop="ConfigRemark"></el-table-column>
        <el-table-column label="关键字" prop="ConfigName"></el-table-column>
        <el-table-column label="提示信息">
          <template slot-scope="item" style="width:200px;">
            <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4}" :disabled="true" placeholder="请输入提示信息" v-model="item.row.ConfigTag"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="内容">
          <template slot-scope="item" style="width:200px;">
            <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4}" :disabled="true" placeholder="请输入内容" v-model="item.row.ConfigValue"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="item" style="width:200px;">
            <el-button type="warning" size="mini" style="margin:5px;" round @click="editItem(item.row)">修改</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-row style="margin-top:1em;text-align:center;">
        <el-pagination background layout="total,prev, pager, next,jumper" prev-text="上一页" next-text="下一页" :page-size="para.PageSize" :total="para.TotalCount" @current-change="onPageClick"></el-pagination>
      </el-row>
    </el-row>

    <el-dialog title="编辑" width="30%" :visible.sync="isShowEdit">
      <el-form ref="form" label-width="20%">
        <el-form-item label="配置名称">
          <el-input placeholder="配置名称" :disabled="true" v-model="entity.ConfigRemark"></el-input>
        </el-form-item>

        <el-form-item label="关键字">
          <el-input placeholder="关键字" :disabled="true" v-model="entity.ConfigName"></el-input>
        </el-form-item>

        <el-form-item label="提示">
          <el-input placeholder="提示" :disabled="true" v-model="entity.ConfigTag"></el-input>
        </el-form-item>

        <el-form-item label="内容">
          <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4}" placeholder="内容" v-model="entity.ConfigValue"></el-input>
        </el-form-item>
      </el-form>

      <el-row style="text-align:center;">
        <el-button size="small" round type="primary" :disabled="isDisSave" @click="saveItem">保存</el-button>
        <el-button size="small" round type="info" :disabled="isDisSave" @click="isShowEdit = false">取消</el-button>
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

      list: [],
      entity: {},
      isDisSave: false,
      isShowEdit: false,
    };
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
      this.list = new Array();
      this.isDisSave = true;
      this.$http.post("BaseConf/GetDbConfigs", that.para).then(res => {
        that.isDisSave = false;
        if (res.IsSucc) {
          let data = res.Data;
          that.list = data.Datas;
          that.para.TotalCount = data.TotalCount;
          that.para.PageCount = data.TotalPages;
        } else {
          that.$msg.showMsg(that, res.Message);
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
    // 修改
    editItem: function (item) {
      this.entity = Object.assign({}, item);
      this.isShowEdit = true;
    },
    // 保存
    saveItem: function () {
      let that = this;
      let item = Object.assign({}, this.entity);
      if (!that.$msg.checkSave(that, 0, item.ConfigValue, '请输入配置内容！')) {
        return;
      }

      that.$http.post("BaseConf/SaveDbConfig", item).then(res => {
        that.$msg.showMsg(that, res.Message, res.IsSucc ? 0 : 1);
        if (res.IsSucc) {
          that.query();
          that.isShowEdit = false;
        }
      }).catch(res => {
        console.log(res);
      });
    }
  },
  created() {
    this.query();
    window.vm = this;
  }
}
</script>

<style>
</style>