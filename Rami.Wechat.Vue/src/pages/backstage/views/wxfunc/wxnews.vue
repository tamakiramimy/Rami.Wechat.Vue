<template>
  <el-row>
    <el-row>
      <el-form :inline="true">
        <el-form-item label="首图文标题">
          <el-input clearable placeholder="首图文标题" v-model="para.Entity.FirstNewsTitle"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" class="defMargin" size="small" round @click="query">查询</el-button>
          <el-button type="success" class="defMargin" size="small" round @click="addItem">新建</el-button>
          <el-button type="danger" class="defMargin" size="small" round @click="isShowEdit = true">同步永久图文</el-button>
        </el-form-item>
      </el-form>
    </el-row>

    <el-row>
      <el-table border style="width: 100%" :data="list">
        <el-table-column label="媒体ID" prop="MediaId"></el-table-column>
        <el-table-column label="首图文标题" prop="FirstNewsTitle"></el-table-column>
        <el-table-column label="是否多图文" prop="IsMultipleShow"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="item" style="width:200px;">
            <el-button type="warning" size="mini" round @click="editItem(item.row)">查看</el-button>
            <el-button type="danger" size="mini" style="margin:5px;" round @click="delItem(item.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-row style="margin-top:1em;text-align:center;">
        <el-pagination background layout="total,prev, pager, next,jumper" prev-text="上一页" next-text="下一页" :page-size="para.PageSize" :total="para.TotalCount" @current-change="onPageClick"></el-pagination>
      </el-row>
    </el-row>

    <el-dialog title="同步" width="30%" :visible.sync="isShowEdit">
      <el-form ref="form" label-width="20%">
        <el-form-item label="类型">
          <span>公众号永久图文</span>
        </el-form-item>

        <el-form-item label="同步数量">
          <el-select style="width:100%;" placeholder="请选择" clearable filterable v-model="syncCount">
            <el-option v-for="item in [20,40,60,80,100,200,300,400,500]" :key="item" :value="item" :label="item"></el-option>
            <el-option key="99999" value="99999" label="全部"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <el-row style="text-align:center;">
        <el-button size="small" round type="primary" :disabled="isDisSave" @click="syncMedia">同步</el-button>
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
      syncCount: "",
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
      that.$http.post("WxFunc/GetNewsList", that.para).then(res => {
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
    // 新增
    addItem: function () {
      this.$router.push('/wxfunc/wxnewsedit?mId=');
    },
    // 编辑
    editItem: function (item) {
      this.$router.push(`/wxfunc/wxnewsedit?mId=${item.MediaId}`);
    },
    // 删除图文消息
    delItem: function (item) {
      let that = this;
      that.$msg.showComfirm(that, '你确定要删除此永久图文消息吗？', () => {
        that.isDisSave = true;
        that.$http.post('WxFunc/DelWxNews', item).then(res => {
          that.isDisSave = false;
          that.$msg.showMsg(that, res.Message, res.IsSucc ? 0 : 1);
          if (res.IsSucc) {
            that.query();
          }
        });
      });
    },
    // 同步微信公众号永久素材
    syncMedia: function () {
      let that = this;
      if (!that.$msg.checkSave(that, 1, that.syncCount, '请先选择要同步的数量！')) {
        return;
      }

      that.$msg.showComfirm(that, '同步永久素材需要较长时间，你确定要继续？', () => {
        that.$msg.showComfirm(that, '同步期间请不要进行任何操作，否则会导致同步失败！', () => {
          that.isDisSave = true;
          that.$http.post('WxFunc/SyncNewsList', { "count": that.syncCount }).then(res => {
            that.isDisSave = false;
            that.$msg.showMsg(that, res.Message, res.IsSucc ? 0 : 1);
            if (res.IsSucc) {
              that.query();
              that.isShowEdit = false;
            }
          });
        });
      });
    },
  },
  created() {
    this.query();
    window.vm = this;
  }
}
</script>

<style>
.defMargin {
  margin: 5px;
}
</style>