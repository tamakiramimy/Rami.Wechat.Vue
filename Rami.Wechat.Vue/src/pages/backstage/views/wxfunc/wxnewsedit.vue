<template>
  <el-row>
    <template v-if="!isShowEditor">
      <el-row class="defMargin">
        <el-button type="warning" size="small" round @click="save">保存</el-button>
        <el-button type="success" size="small" round @click="addNew">新增图文</el-button>
      </el-row>

      <el-row :key="ind" v-for="(news,ind) in list">
        <el-form ref="form" label-width="20%">
          <el-form-item :label="'标题'+ (ind + 1)">
            <el-input clearable placeholder="请输入标题" v-model="news.Title"></el-input>
          </el-form-item>

          <el-form-item :label="'图文摘要'+ (ind + 1)">
            <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4}" placeholder="请输入内容" v-model="news.Digest"></el-input>
          </el-form-item>

          <el-form-item :label="'作者'+ (ind + 1) + '(可选)'">
            <el-input clearable placeholder="请输入作者(可选)" v-model="news.Author"></el-input>
          </el-form-item>

          <el-form-item :label="'封面图片'+ (ind + 1)">
            <el-select style="width:100%;" placeholder="请选择" clearable filterable v-model="news.ThumbMediaId" @change="setImg(news)">
              <el-option v-for="item in lstImgs" :key="item.MediaId" :value="item.MediaId" :label="item.Title"></el-option>
            </el-select>

            <p style="margin:5px;" v-if="news.ThumbMediaId != null && news.ThumbMediaId.length > 0">
              <img style="max-width:150px;max-height:150px;" :src="news.ThumbUrlShow" />
            </p>
          </el-form-item>

          <el-form-item :label="'内容'+ (ind + 1)">
            <el-button type="warning" size="small" round @click="showEditor(news)">编辑</el-button>
          </el-form-item>

          <el-form-item :label="'预览'+ (ind + 1)" v-if="news.Id">
            <router-link :to="'/wxfunc/newspreview?type=wxnews&id='+news.Id">
              <el-button type="primary" size="small" round>预览</el-button>
            </router-link>
          </el-form-item>

          <el-form-item label="">
            <el-button type="danger" size="small" round @click="delNews(ind)">删除</el-button>
          </el-form-item>
        </el-form>
      </el-row>
    </template>

    <!-- 图文编辑 -->
    <el-row class="uePost" v-else>
      <el-row>
        <vue-ueditor-wrap ref="ueditor" v-model="content" :config="myConfig"></vue-ueditor-wrap>
      </el-row>

      <el-row class="defMargin">
        <el-button type="primary" size="small" round @click="saveNews">保存</el-button>
        <el-button type="info" size="small" round @click="isShowEditor = false">取消</el-button>
      </el-row>
    </el-row>
  </el-row>
</template>

<script>
import VueUeditorWrap from 'vue-ueditor-wrap'
import http from '../../../../utils/http'
export default {
  components: {
    VueUeditorWrap
  },
  data() {
    return {
      mId: "",
      list: [],
      lstImgs: [],
      content: "",
      entity: {
        Content: ""
      },

      isDisSave: false,
      isShowEditor: false,
      selImgUrl: "",
      myConfig: {
        // 如果需要上传功能,找后端小伙伴要服务器接口地址
        serverUrl: `${http.root}UEditor`,
        UEDITOR_HOME_URL: '/ueditor/',
        // 编辑器不自动被内容撑高
        autoHeightEnabled: false,
        // 工具栏是否可以浮动
        autoFloatEnabled: false,
        // 初始容器高度
        initialFrameHeight: 340,
        // 初始容器宽度
        initialFrameWidth: '100%',
        // 关闭自动保存
        enableAutoSave: true
      }
    };
  },
  computed: {
  },
  methods: {
    // 获取图文配置
    getDatas: function () {
      let that = this;
      if (that.mId != null && that.mId.length > 0) {
        that.list = new Array();
        that.$http.get('WxFunc/GetWxNewsById', { "mId": that.mId }).then(res => {
          if (res.IsSucc) {
            that.list = res.Data;
          } else {
            that.$msg.showMsg(that, res.Message);
          }
        }).catch(res => {
          console.log(res);
        });
      }
    },
    // 获取所有的图片素材
    getImgs: function () {
      let that = this;
      this.lstImgs = [];
      that.$http.get('WxFunc/GetWxImgMedias').then(res => {
        if (res.IsSucc) {
          that.lstImgs = res.Data;
        }
      }).catch(res => {
        console.log(res);
      });
    },
    // 选择图片素材
    setImg: function (news) {
      let selImg = this.lstImgs.filter(x => x.MediaId == news.ThumbMediaId);
      if (selImg != null && selImg.length > 0) {
        let temp = selImg[0];
        news.ThumbUrlShow = temp.LocalUrlShow;
      }
    },
    // 新增图文
    addNew: function () {
      let item = { Content: "" };
      if (this.list == null) {
        this.list = [];
      }

      this.list.push(item);
    },
    // 显示文本框
    showEditor: function (item) {
      // if (this.$refs.ueditor != null) {
      //   this.$refs.ueditor.editor.destroy();
      // }

      this.entity = item;
      if (this.entity.Content != null && this.entity.Content.length > 0) {
        this.content = this.entity.Content;
      }

      this.isShowEditor = true;
    },
    // 保存图文编辑内容
    saveNews: function () {
      //this.$refs.ueditor.editor.reset();
      this.entity.Content = this.content;
      this.isShowEditor = false;
    },
    // 删除图文消息
    delNews: function (ind) {
      let that = this;
      that.$msg.showComfirm(that, '你确定要删除此永久图文消息吗？', () => {
        that.list.splice(ind, 1);
      });
    },
    // 保存图文消息
    save: function () {
      let that = this;
      // 遍历检查数据
      for (let i = 0; i < that.list.length; i++) {
        let item = that.list[i];
        if (!that.$msg.checkSave(that, 0, item.Title, `请输入图文${(i + 1)}的标题！`)) {
          return;
        }

        if (!that.$msg.checkSave(that, 0, item.Digest, `请输入图文${(i + 1)}的摘要！`)) {
          return;
        }

        if (!that.$msg.checkSave(that, 0, item.ThumbMediaId, `请输入图文${(i + 1)}的图片！`)) {
          return;
        }

        if (!that.$msg.checkSave(that, 0, item.Content, `请编辑图文${(i + 1)}的内容！`)) {
          return;
        }
      }

      that.$http.post('WxFunc/SaveWxNews', { "lstNews": that.list }).then(res => {
        that.$msg.showMsg(that, res.Message, res.IsSucc ? 0 : 1);
        if (res.IsSucc) {
          this.$router.push('/wxfunc/wxnews');
        }
      });
    }
  },
  created() {
    this.mId = this.$route.query.mId;
    this.getImgs();
    this.getDatas();
    window.vm = this;
  }
}
</script>

<style>
.info {
  border-radius: 10px;
  line-height: 20px;
  padding: 10px;
  margin: 10px;
  background-color: #ffffff;
}

.defMargin {
  margin: 5px auto;
}

.uePost {
  position: absolute !important;
  width: 100%;
  top: 0px;
  left: 0px;
  height: 100%;
  background-color: whitesmoke;
  z-index: 999;
  text-align: center;
  padding-top: 20px;
}
</style>