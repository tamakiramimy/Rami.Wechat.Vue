<template>
  <el-row>
    <el-row>
      <el-button type="primary" size="small" round @click="save">保存</el-button>
    </el-row>

    <el-row style="border:1px solid #ccc;margin:20px 5px;padding:10px;">
      <el-form ref="form" label-width="10%">
        <el-form-item label="标题">
          <el-input v-model="news.Name"></el-input>
        </el-form-item>

        <el-form-item label="图文摘要">
          <el-input type="textarea" :rows="2" v-model="news.SecondName"></el-input>
        </el-form-item>

        <el-form-item label="图片">
          <!-- 上传组件 -->
          <CommUploader ref="upload" :filelist.sync="upObj.fileList" :headers="headers" :acton="upObj.acton" :isShowUpBtn="false" :showfilelist="false" @uploadChange="uploadChange" @uploadRemove="uploadRemove">
            <i slot="trigger" class="el-icon-upload" style="font-size:14px;color:#53a93f;" @click="uploadClear">上传</i>
          </CommUploader>

          <!-- 文件列表 -->
          <template>
            <el-row :key="fInd" v-for="(file,fInd) in upObj.fileList">
              <template v-if="file.response != null && file.response.Data != null && file.response.Data[0] != null">
                <el-col :span="24">
                  <a :href="file.response.Data[0].AbsPath" target="_blank">{{file.response.Data[0].OrgFileName}}</a>
                </el-col>
                <el-col :span="24">
                  <img v-bind:src="file.response.Data[0].AbsPath" style="max-width:100px;max-height:100px;" />
                </el-col>
              </template>
            </el-row>
          </template>
        </el-form-item>
      </el-form>

      <el-row style="margin-left:10px;">
        <h3>内容</h3>
      </el-row>
      <el-row style="margin-top:10px;padding:10px 20px;">
        <vue-ueditor-wrap ref="ueditor" v-model="content" :config="myConfig"></vue-ueditor-wrap>
      </el-row>

      <el-row>
        <h3>
          <router-link :to="'/wxfunc/newspreview?type=backnews&id='+id">
            <el-button type="primary" round size="small">预览</el-button>
          </router-link>
        </h3>
      </el-row>

    </el-row>
  </el-row>
</template>

<script>
import VueUeditorWrap from 'vue-ueditor-wrap';
import CommUploader from '../../../../components/CommUploader';
import { mapGetters, mapState } from 'vuex';
import http from '../../../../utils/http';
export default {
  components: {
    VueUeditorWrap, CommUploader
  },
  data() {
    return {
      id: '',
      news: {},
      isDisSave: false,
      upObj: {
        acton: `${http.root}Comm/Upload?upType=wxmedia`,
        fileList: [],
      },
      content: "",
      myConfig: {
        // 如果需要上传功能,找后端小伙伴要服务器接口地址
        serverUrl: `${http.root}UEditor`,
        // UE根目录
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
    ...mapGetters('jwtStore', ['getToken', 'getTokenInfo']),
    headers() {
      return { 'Authorization': `Bearer ${this.$store.getters["jwtStore/getToken"]}` };
    }
  },
  methods: {
    // 获取图文配置
    getDatas: function () {
      let that = this;
      if (that.id > 0) {
        that.$http.get('WxFunc2/GetBackNewsById', { "id": that.id }).then(res => {
          if (res.IsSucc) {
            that.news = res.Data;
            // 设置图文内容
            that.content = that.news.HtmlContent != null && that.news.HtmlContent.length > 0 ? that.news.HtmlContent : " ";
            // 设置上传的图片
            that.initUpFile(res.Data.UpFile);
          } else {
            that.$msg.showMsg(that, res.Message);
          }
        }).catch(res => {
          console.log(res);
        });
      }
    },
    // 清空上传 
    uploadClear: function () {
      this.upObj.fileList = [];
    },
    // 文件状态改变 
    uploadChange: function (file, filelist) {
      this.upObj.fileList = filelist;
    },
    // 删除文件
    uploadRemove: function (file, filelist) {
      this.upObj.fileList = filelist;
    },
    // 获取上传的文件
    getUploadFile: function () {
      return this.$refs.upload.getUpFileSingle();
    },
    // 设置上传的文件
    initUpFile: function (upFile) {
      this.upObj.fileList = [upFile];
    },
    // 保存图文消息
    save: function () {
      // 检查数据
      let that = this;
      var item = Object.assign({}, that.news);
      if (!that.$msg.checkSave(that, 0, item.Name, '请输入图文的标题！')) {
        return;
      }

      if (!that.$msg.checkSave(that, 0, item.SecondName, '请输入图文的描述！')) {
        return;
      }

      // 上传的文件
      let upFile = this.getUploadFile();
      if (upFile != null) {
        item.ImgUrlVir = upFile.VirPath;
        item.ImgUrlShow = upFile.AbsPath;
      }

      if (!that.$msg.checkSave(that, 0, item.ImgUrlVir, '请上传图文的图片！')) {
        return;
      }

      item.HtmlContent = this.content;
      if (!that.$msg.checkSave(that, 0, item.HtmlContent, '请编辑图文的内容！')) {
        return;
      }

      that.$http.post('WxFunc2/SaveBackNews', item).then(res => {
        that.$msg.showMsg(that, res.Message, res.IsSucc ? 0 : 1);
        if (res.IsSucc) {
          that.$router.push('/wxfunc/backnews');
        }
      });
    }
  },
  created() {
    this.id = this.$route.query.id;
    this.getDatas();
    window.vm = this;
  }
}
</script>

<style>
</style>