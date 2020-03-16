<template>
  <el-row>
    <el-row style="margin-top:10px;padding:10px;background-color:white;">
      <el-form :inline="true">
        <el-form-item label="图文名称">
          <el-input placeholder="图文名称" v-model="para.Entity.Name"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="small" round @click="query">查询</el-button>
          <el-button type="success" size="small" round @click="addItem">新增</el-button>
        </el-form-item>
      </el-form>
    </el-row>

    <el-row>
      <el-table border style="width: 100%" :data="list">
        <el-table-column label="名称" prop="Name"></el-table-column>
        <el-table-column label="摘要" prop="SecondName"></el-table-column>
        <el-table-column label="图片">
          <template slot-scope="item">
            <a target="_blank" :href="item.row.ImgUrlShow">
              <img style="max-width:100px;max-height:100px;" :src="item.row.ImgUrlShow" />
            </a>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="IsDelShow"></el-table-column>
        <el-table-column label="最后更新人" prop="Updater"></el-table-column>
        <el-table-column label="最后更新时间" prop="UpdateTime"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="item">
            <el-button type="warning" size="mini" round @click="editItem(item.row)">修改</el-button>
            <a class="btn btn-success" target="_blank" v-show="item.ArticleUrlShow != null && item.ArticleUrlShow.length > 0" v-bind:href="item.ArticleUrlShow">预览</a>
            <el-button :type="item.row.IsDel == 0 ? 'danger' : 'success'" size="mini" round @click="updItem(item.row)">{{item.row.IsDel == 0 ? '禁用' : '启用'}}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-row style="margin-top:1em;text-align:center;">
        <el-pagination background layout="total,prev, pager, next,jumper" prev-text="上一页" next-text="下一页" :page-size="para.PageSize" :total="para.TotalCount" @current-change="onPageClick"></el-pagination>
      </el-row>
    </el-row>

  </el-row>
</template>

<script>
export default {
  data () {
    return {
      list: [],
      entity: {},

      para: {
        PageIndex: 1,
        PageSize: 10,
        PageCount: 0,
        TotalCount: 0,
        Entity: {}
      },
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
      that.$http.post("WxFunc2/GetBackNews", that.para).then(res => {
        if (res.IsSucc) {
          that.list = res.Data.Datas;
          that.para.TotalCount = res.Data.TotalCount;
          that.para.PageCount = res.Data.TotalPages;
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
      this.$router.push('/wxfunc/backnewsedit');
    },
    // 修改
    editItem: function (item) {
      this.$router.push(`/wxfunc/backnewsedit?id=${item.Id}`);
    },
    // 预览
    preview: function (item) {
      // todo:修改成弹出窗
      let url = item.ArticleUrlShow;
      window.open(url, "_blank");
    },
    // 更新状态
    updItem: function (item) {
      let that = this;
      that.$msg.showComfirm(that, '你确定要切换此图文的状态码？', () => {
        that.$http.post('WxFunc2/UpdBackNews', { "Id": item.Id }).then(res => {
          that.$msg.showMsg(that, res.Message, res.IsSucc ? 0 : 1);
          if (res.IsSucc) {
            that.getDatas();
          }
        }).catch(res => {
          console.log(res);
        });
      });
    },
  },
  created () {
    this.getDatas();
    window.vm = this;
  }
}
</script>

<style>
</style>