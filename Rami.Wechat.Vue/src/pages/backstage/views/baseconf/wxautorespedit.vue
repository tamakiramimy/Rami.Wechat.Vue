<template>
  <el-row>
    <el-form ref="form" label-width="15%">
      <el-form-item label="名称">
        <el-input placeholder="名称" v-model="entity.AutoName"></el-input>
      </el-form-item>

      <el-form-item label="关键字（用、隔开）">
        <el-input placeholder="关键字（用、隔开）" v-model="entity.KeyWords"></el-input>
      </el-form-item>

      <el-form-item label="消息类型">
        <el-select placeholder="请选择" clearable v-model="entity.ContentType" style="width:100%;">
          <el-option v-for="item in lstApType" :key="item.value" :value="item.value" :label="item.text"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="文本内容" v-show="entity.ContentType=='Text'">
        <el-input type="textarea" :rows="3" placeholder="用户名可用{nickname}代替" v-model="entity.TextContent"></el-input>
      </el-form-item>

      <el-form :inline="true" v-show="entity.ContentType=='Image'">
        <a target="_blank" @click="goLink('medialist')" style="width:20%;margin-left:6%;font-size:14px;">
          <i class="fa fa-edit">管理永久素材</i>
        </a>
        <el-form-item label="图片" style="width:80%;">
          <el-select style="width:100%;" placeholder="请选择" clearable filterable remote :remote-method="getSelImageInfo" v-model="entity.MediaId">
            <el-option v-for="item in lstImage" :key="item.id" :value="item.id" :label="item.text"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <el-form :inline="true" v-show="entity.ContentType=='Video'">
        <a target="_blank" @click="goLink('medialist')" style="width:20%;margin-left:1%;font-size:14px;">
          <i class="fa fa-edit">管理永久素材</i>
        </a>
        <el-form-item label="缩略图(64k以内)" style="width:80%;">
          <el-select style="width:100%;" placeholder="请选择" clearable filterable remote :remote-method="getSelImageInfo" v-model="entity.VideoThumbMediaId">
            <el-option v-for="item in lstImage" :key="item.id" :value="item.id" :label="item.text"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <el-form :inline="true" v-show="entity.ContentType=='Video'">
        <a target="_blank" @click="goLink('medialist')" style="width:20%;margin-left:6%;font-size:14px;">
          <i class="fa fa-edit">管理永久素材</i>
        </a>
        <el-form-item label="视频" style="width:80%;">
          <el-select style="width:100%;" placeholder="请选择" clearable filterable remote :remote-method="getSelVideoInfo" v-model="entity.MediaId">
            <el-option v-for="item in lstVideo" :key="item.id" :value="item.id" :label="item.text"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <el-form :inline="true" v-show="entity.ContentType=='Voice'">
        <a target="_blank" @click="goLink('medialist')" style="width:20%;margin-left:6%;font-size:14px;">
          <i class="fa fa-edit">管理永久素材</i>
        </a>
        <el-form-item label="录音" style="width:80%;">
          <el-select style="width:100%;" placeholder="请选择" clearable filterable remote :remote-method="getSelVoiceInfo" v-model="entity.MediaId">
            <el-option v-for="item in lstVoice" :key="item.id" :value="item.id" :label="item.text"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <el-form :inline="true" v-show="entity.ContentType=='News'">
        <a target="_blank" @click="goLink('medialist')" style="width:20%;margin-left:3%;font-size:14px;">
          <i class="fa fa-edit">管理永久素材</i>
        </a>
        <el-form-item label="公众号图文" style="width:80%;">
          <el-select style="width:100%;" placeholder="请选择" clearable filterable remote :remote-method="getSelNewsInfo" v-model="entity.MediaId">
            <el-option v-for="item in lstNews" :key="item.id" :value="item.id" :label="item.text"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <el-form-item label="消息类型" v-show="entity.ContentType=='BackNews'">
        <el-row>
          <el-radio-group v-model="entity.SendType">
            <el-radio :label="0">随机推送其一</el-radio>
            <el-radio :label="1">多图文推送</el-radio>
          </el-radio-group>
        </el-row>
      </el-form-item>

      <el-form :inline="true" style="width:100%;" v-show="entity.ContentType=='BackNews'">
        <a target="_blank" @click="goLink('backnews')" style="width:20%;margin-left:4%;font-size:14px;">
          <i class="fa fa-edit">管理后台图文</i>
        </a>
        <el-form-item label="后台图文" style="width:80%;">
          <el-select style="width:100%;" placeholder="请选择" clearable filterable multiple remote :remote-method="getSelBackNewsInfo" v-model="entity.LstSelArtIds">
            <el-option v-for="item in lstBackNew" :key="item.Id" :value="item.Id" :label="item.Name"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <el-row v-show="entity.ContentType=='RedBag'">
        <el-form-item label="红包金额(单位:分)">
          <el-input type="text" placeholder="红包金额(单位:分)" v-model="entity.RedAmount"></el-input>
        </el-form-item>
        <el-form-item label="红包数量">
          <el-input type="text" placeholder="红包数量" v-model="entity.RedCount"></el-input>
        </el-form-item>
        <el-form-item label="红包祝福语">
          <el-input type="text" placeholder="红包祝福语" v-model="entity.RedWish"></el-input>
        </el-form-item>
        <el-form-item label="活动名称">
          <el-input type="text" placeholder="活动名称" v-model="entity.RedAct"></el-input>
        </el-form-item>
        <el-form-item label="红包备注">
          <el-input type="text" placeholder="红包备注" v-model="entity.RedRemark"></el-input>
        </el-form-item>
      </el-row>

      <el-row>
        <el-col :offset="8" :col="12">
          <el-button size="small" round type="primary" :disabled="isDisSave" @click="actSave">保存</el-button>
        </el-col>
      </el-row>
    </el-form>
  </el-row>
</template>

<script>
import enums from '../../domain/enums';
export default {
  data() {
    return {
      id: '',
      entity: {},
      isDisSave: false,

      lstApType: enums.EnumApMsgType,
      lstImage: [],
      lstVideo: [],
      lstVoice: [],
      lstNews: [],
      lstBackNew: [],
    }
  },
  computed: {
  },
  methods: {
    // 跳转
    goLink: function (type) {
      if (type == 'medialist') {
        this.$router.push('/wxfunc/medialist');
      } else if (type == 'backnews') {
        this.$router.push('/wxfunc/backnews');
      }
    },
    // 图片素材
    getSelImageInfo: function (query) {
      let that = this;
      that.lstImage = [];
      that.$http.get("WxFunc3/GetWxMediaByType", { type: 'image', name: query }).then(res => {
        that.lstImage = res;
      });
    },
    // 视频素材
    getSelVideoInfo: function (query) {
      let that = this;
      that.lstVideo = [];
      that.$http.get("WxFunc3/GetWxMediaByType", { type: 'video', name: query }).then(res => {
        that.lstVideo = res;
      });
    },
    // 音频素材
    getSelVoiceInfo: function (query) {
      let that = this;
      that.lstVoice = [];
      that.$http.get("WxFunc3/GetWxMediaByType", { type: 'voice', name: query }).then(res => {
        that.lstVoice = res;
      });
    },
    // 图文素材
    getSelNewsInfo: function (query) {
      let that = this;
      that.lstNews = [];
      that.$http.get("WxFunc3/GetWxNewsByType", { name: query }).then(res => {
        that.lstNews = res;
      });
    },
    // 后台图文
    getSelBackNewsInfo: function (query) {
      let that = this;
      that.lstNews = [];
      that.$http.get("WxFunc3/GetWxBackNews", { name: query }).then(res => {
        that.lstBackNew = res;
      });
    },
    // 保存
    actSave: function () {
      let that = this;
      let item = Object.assign({}, that.entity);
      if (!that.$msg.checkSave(that, 0, item.AutoName, '请输入名称！')) {
        return;
      }

      if (!that.$msg.checkSave(that, 0, item.KeyWords, '请输入关键字！')) {
        return;
      }

      if (!that.$msg.checkSave(that, 0, item.ContentType, '请选择消息类型！')) {
        return;
      }

      if (item.ContentType == 'Text') {
        // 文本
        if (!that.$msg.checkSave(that, 0, item.TextContent, '请输入文本消息内容！')) {
          return;
        }
      } else if (item.ContentType == 'Image') {
        // 图片
        if (!that.$msg.checkSave(that, 0, item.MediaId, '请选择公众号图片！')) {
          return;
        }
      } else if (item.ContentType == 'Voice') {
        // 录音
        if (!that.$msg.checkSave(that, 0, item.MediaId, '请选择公众号录音！')) {
          return;
        }
      } else if (item.ContentType == 'Video') {
        // 视频
        if (!that.$msg.checkSave(that, 0, item.VideoThumbMediaId, '请选择视频的缩略图！')) {
          return;
        }

        if (!that.$msg.checkSave(that, 0, item.MediaId, '请选择公众号视频！')) {
          return;
        }
      } else if (item.ContentType == 'News') {
        // 公众号图文
        if (!that.$msg.checkSave(that, 0, item.MediaId, '请选择公众号图文！')) {
          return;
        }
      } else if (item.ContentType == 'BackNews') {
        // 后台图文
        if (!that.$msg.checkSave(that, 0, item.LstSelArtIds, '请选择至少一篇后台图文！')) {
          return;
        }
      } else if (item.ContentType == 'RedBag') {
        // 红包
        if (!that.$msg.checkSave(that, 1, item.RedAmount, '请输入红包金额！')) {
          return;
        }

        if (!that.$msg.checkSave(that, 1, item.RedCount, '请输入红包数量！')) {
          return;
        }

        if (!that.$msg.checkSave(that, 0, item.RedWish, '请输入红包祝福语！')) {
          return;
        }

        if (!that.$msg.checkSave(that, 0, item.RedAct, '请输入红包活动名称！')) {
          return;
        }

        if (!that.$msg.checkSave(that, 0, item.RedRemark, '请输入红包备注！')) {
          return;
        }
      }

      that.$http.post('WxFunc3/SaveAutoKeyword', item).then(res => {
        if (res.IsSucc) {
          that.$router.push('/baseconf/wxautorespconf');
        } else {
          that.$msg.showMsg(that, res.Message);
        }
      });
    },
    // 根据Id初始化信息
    initSelOpts: function () {
      let that = this;
      that.$http.get('WxFunc3/GetAutoKeyDetById', { id: that.id }).then(res => {
        if (res.IsSucc) {
          let data = res.Data;
          that.entity = data.auto;
          // that.lstApType.Image.value 过于复杂
          if (that.entity.ContentType == 'Image') {
            that.lstImage = data.lstOpts1;
          } else if (that.entity.ContentType == 'Voice') {
            that.lstVoice = data.lstOpts1;
          } else if (that.entity.ContentType == 'Video') {
            that.lstImage = data.lstOpts1;
            that.lstVideo = data.lstOpts2;
          } else if (that.entity.ContentType == 'News') {
            that.lstNews = data.lstOpts1;
          } else if (that.entity.ContentType == 'BackNews') {
            that.lstBackNew = data.lstOpts1;
          }
        }
      });
    },
  },
  created() {
    this.id = this.$route.query.id;
    if (this.id > 0) {
      this.initSelOpts();
    }

    window.vm = this;
  },
}
</script>

<style>
</style>