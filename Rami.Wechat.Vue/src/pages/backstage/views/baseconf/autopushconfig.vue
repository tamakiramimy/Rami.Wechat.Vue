<template>
  <el-row>
    <el-row style="margin-top:10px;padding:10px;background-color:white;">
      <el-form :inline="true">
        <el-form-item label="名称">
          <el-input placeholder="名称" v-model="para.Entity.PushName"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="medium" round @click="query">查询</el-button>
          <el-button type="success" size="medium" round @click="addItem">新增</el-button>
        </el-form-item>
      </el-form>
    </el-row>

    <el-row>
      <el-table border style="width: 100%" :data="lstDatas">
        <el-table-column label="名称" prop="PushName"></el-table-column>
        <el-table-column label="类型" prop="ContentType"></el-table-column>
        <el-table-column label="推送时间" prop="PushTime"></el-table-column>
        <el-table-column label="推送人数" prop="PushCount"></el-table-column>
        <el-table-column label="状态" prop="IsDelShow"></el-table-column>
        <el-table-column label="最后更新人" prop="Updater"></el-table-column>
        <el-table-column label="最后更新时间" prop="UpdateTime"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="item" style="width:200px;">
            <el-button type="warning" size="mini" style="margin:5px;" round @click="editItem(item.row)">修改</el-button>
            <el-button type="primary" size="mini" style="margin:5px;" round @click="preview(item.row)">预览</el-button>
            <el-button :type="item.row.IsDel == 0 ? 'danger' : 'success'" size="mini" style="margin:5px;" round @click="updItem(item.row)">{{item.row.IsDel == 0 ? '禁用' : '启用'}}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-row style="margin-top:1em;text-align:center;">
        <el-pagination background layout="total,prev, pager, next,jumper" prev-text="上一页" next-text="下一页" :page-size="para.PageSize" :total="para.TotalCount" @current-change="onPageClick"></el-pagination>
      </el-row>
    </el-row>

    <el-dialog title="编辑" width="30%" :visible.sync="isShowEdit">
      <el-form ref="form" label-width="20%">
        <el-form-item label="微信昵称">
          <el-input :disabled="!entity.IsCanEdit" v-model="entity.PrevNick"></el-input>
        </el-form-item>

        <el-form-item label="OpenID">
          <el-input :disabled="!entity.IsCanEdit" v-model="entity.OpenID"></el-input>
        </el-form-item>

      </el-form>

      <el-row style="text-align:center;">
        <el-button size="small" round type="primary" :disabled="isDisSave || !entity.IsCanEdit" @click="actPrev">提交</el-button>
        <el-button size="small" round type="info" :disabled="isDisSave" @click="isShowEdit = false">取消</el-button>
      </el-row>
    </el-dialog>
  </el-row>
</template>

<script>
export default {
  data() {
    return {
      entity: {},
      lstDatas: [],
      isDisSave: false,
      isShowEdit: false,

      para: {
        PageIndex: 1,
        PageSize: 10,
        PageCount: 0,
        TotalCount: 0,
        Entity: {},
      },

      lstProvince: [],
      lstCity: [],
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
      that.$http.post("WxFunc3/GetAutoPushList", that.para).then(res => {
        if (res.IsSucc) {
          let data = res.Data;
          that.lstDatas = data.Datas;
          that.para.TotalCount = data.TotalCount;
          that.para.PageCount = data.TotalPages;
        } else {
          that.$msg.showMsg(that, res.Message);
        }
      });
    },
    // 分页
    onPageClick: function (page) {
      this.para.PageIndex = page;
      this.getDatas();
    },
    // 新增
    addItem: function () {
      this.$router.push('/baseconf/autopushedit?id=0');
    },
    // 修改
    editItem: function (item) {
      let url = `/baseconf/autopushedit?id=${item.Id}`;
      this.$router.push(url);
    },
    // 预览
    preview: function (item) {
      this.entity = Object.assign({}, item);
      this.isShowEdit = true;
    },
    // 发送预览
    actPrev: function () {
      let that = this;
      let item = Object.assign({}, that.entity);
      if ((item.OpenID == null || item.OpenID.length == 0) && (item.PrevNick == null || item.PrevNick.length == 0)) {
        that.$msg.showMsg(that, "请至少输入OpenID或者用户昵称！");
        return;
      }

      that.$http.post('WxFunc3/PrevAutoPush', item).then(res => {
        that.$msg.showMsg(that, res.Message, res.IsSucc ? 0 : 1);
        if (res.IsSucc) {
          that.getDatas();
          that.isShowEdit = false;
        }
      });
    },
    // 更新
    updItem: function (item) {
      let that = this;
      that.$msg.showComfirm('你确定要修改此自动推动配置的状态吗？', () => {
        that.$http.post('WxFunc3/UpdAutoPush', item).then(res => {
          that.$msg.showMsg(that, res.Message, res.IsSucc ? 0 : 1);
          if (res.IsSucc) {
            that.getDatas();
          }
        });
      });
    },
  },
  created() {
    this.query();
    window.vm = this;
  },
}
</script>

<style>
</style>