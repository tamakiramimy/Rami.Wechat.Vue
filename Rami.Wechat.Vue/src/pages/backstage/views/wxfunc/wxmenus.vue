<template>
  <el-row>
    <el-row>
      <el-button type="primary" size="medium" round @click="addLv1">一级</el-button>
      <el-button type="warning" size="medium" round @click="save">保存</el-button>
      <el-button type="danger" size="medium" round @click="syncMenus">同步公众号菜单</el-button>
    </el-row>

    <el-row>
      <el-row class="border" style="margin:5px;" :key="indLv1" v-for="(mLv1,indLv1) in lstMenu">
        <el-col :span="3">
          <span>菜单{{indLv1+1}}</span>
        </el-col>

        <el-col :span="3">
          <el-input clearable title="菜单名称" placeholder="请输入菜单名称" v-model="mLv1.Name"></el-input>
        </el-col>

        <template v-if="mLv1.SubButton == null || (mLv1.SubButton != null && mLv1.SubButton.length == 0)">
          <el-col :span="3">
            <el-select style="width:100%;" title="类别" placeholder="请选择类别" v-model="mLv1.Type">
              <el-option v-for="(item,typeInd) in lstType" :key="item.value" :value="item.value" :label="item.text"></el-option>
            </el-select>
          </el-col>

          <el-col :span="3" v-if="mLv1.Type == 'click' ">
            <el-input clearable title="事件Key" placeholder="请输入事件Key" v-model="mLv1.Key"></el-input>
          </el-col>

          <template v-if="mLv1.Type == 'miniprogram'">
            <el-col :span="3">
              <el-input clearable title="小程序AppID" placeholder="请输入小程序AppID" v-model="mLv1.Appid"></el-input>
            </el-col>

            <el-col :span="3">
              <el-input clearable title="小程序首页路径" placeholder="请输入小程序首页路径" v-model="mLv1.Pagepath"></el-input>
            </el-col>
          </template>

          <el-col :span="3" v-if="mLv1.Type == 'view' || mLv1.Type == 'miniprogram'">
            <el-input clearable title="链接地址" placeholder="请输入链接地址" v-model="mLv1.Url"></el-input>
          </el-col>
        </template>

        <el-col :span="3">
          <el-button type="primary" size="small" round @click="addLv2(mLv1)">二级</el-button>
          <el-button type="danger" size="small" round @click="delLv1(indLv1)">删除</el-button>
        </el-col>

        <el-col :span="24">
          <el-row class="border" style="margin:5px;" :key="indLv2" v-for="(mLv2,indLv2) in mLv1.SubButton">
            <el-col :span="3" :offset="1">
              <span>菜单{{indLv1+1}}-{{indLv2+1}}名称</span>
            </el-col>

            <el-col :span="3">
              <el-input clearable title="菜单名称" placeholder="请输入菜单名称" v-model="mLv2.Name"></el-input>
            </el-col>

            <el-col :span="3">
              <el-select style="width:100%;" title="类别" placeholder="请选择类别" v-model="mLv2.Type">
                <el-option v-for="(item,typeInd) in lstType" :key="item.value" :value="item.value" :label="item.text"></el-option>
              </el-select>
            </el-col>

            <el-col :span="3" v-if="mLv2.Type == 'click'">
              <el-input clearable title="事件Key" placeholder="请输入事件Key" v-model="mLv2.Key"></el-input>
            </el-col>

            <template v-if="mLv2.Type == 'miniprogram'">
              <el-col :span="3">
                <el-input clearable title="小程序AppID" placeholder="请输入小程序AppID" v-model="mLv2.Appid"></el-input>
              </el-col>

              <el-col :span="3">
                <el-input clearable title="小程序首页路径" placeholder="请输入小程序首页路径" v-model="mLv2.Pagepath"></el-input>
              </el-col>
            </template>

            <el-col :span="3" v-if="mLv2.Type == 'view' || mLv2.Type == 'miniprogram'">
              <el-input clearable title="链接地址" placeholder="请输入链接地址" v-model="mLv2.Url"></el-input>
            </el-col>

            <el-col :span="3">
              <el-button type="danger" size="small" round @click="delLv2(mLv1,indLv2)">删除</el-button>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </el-row>
  </el-row>
</template>

<script>
import { async } from 'q';
import { log } from 'util';
import { mapGetters, mapState } from 'vuex';
import enums from '../../domain/enums';
export default {
  data() {
    return {
      lstMenu: [],
      lstType: enums.EnumPubMenuTypes,
      isDisSave: false,
    };
  },
  methods: {
    // 获取菜单
    getDatas: function () {
      let that = this;
      that.$http.get('WxFunc2/GetMenus').then(res => {
        that.$msg.showMsg(that, res.Message, res.IsSucc ? 0 : 1);
        if (res.IsSucc) {
          that.lstMenu = res.Data;
        }
      }).catch(res => {
        console.log(res);
      });
    },
    // 添加一级
    addLv1: function () {
      let that = this;
      if (that.lstMenu == null) {
        that.lstMenu = [];
      }

      if (that.lstMenu.length >= 3) {
        that.$msg.showMsg(that, "一级菜单最多3个");
        return;
      }

      let lv1Temp = {};
      that.lstMenu.push(lv1Temp);
    },
    // 删除一级
    delLv1: function (ind) {
      this.lstMenu.splice(ind, 1);
    },
    // 添加二级
    addLv2: function (mLv1) {
      if (mLv1.SubButton == null) {
        mLv1.SubButton = [];
      }
      if (mLv1.SubButton.length >= 5) {
        that.$msg.showMsg(that, "二级菜单最多5个");
        return;
      }

      mLv1.Type = "";
      mLv1.Key = "";
      mLv1.Url = "";
      mLv1.MediaId = "";
      mLv1.Appid = "";
      mLv1.Pagepath = "";
      let lv2Temp = {};
      mLv1.SubButton.push(lv2Temp);
    },
    // 删除二级
    delLv2: function (mLv1, ind) {
      mLv1.SubButton.splice(ind, 1);
    },
    // 数据验证
    checkSave: function () {
      let that = this;
      for (let i = 0; i < that.lstMenu.length; i++) {
        let lv1 = that.lstMenu[i];
        if (lv1.SubButton == null || (lv1.SubButton != null && lv1.SubButton.length == 0)) {
          // 无子菜单
          if (lv1.Name == null || lv1.Name.length == 0) {
            that.$msg.showMsg(that, "请输入一级菜单" + (i + 1) + "的名称！");
            return false;
          }
          if (strlen(lv1.Name) > 8) {
            that.$msg.showMsg(that, "一级菜单" + (i + 1) + "的名称最长4个汉字8个字符！");
            return false;
          }
          if (lv1.Type == null || lv1.Type.length == 0) {
            that.$msg.showMsg(that, "请选择一级菜单" + (i + 1) + "的类别！");
            return false;
          }
          if (lv1.Type == 'click' && (lv1.Key == null || lv1.Key.length == 0)) {
            that.$msg.showMsg(that, "请输入一级菜单" + (i + 1) + "的事件！");
            return false;
          }
          if (lv1.Type == 'view' && (lv1.Url == null || lv1.Url.length == 0)) {
            that.$msg.showMsg(that, "请输入一级菜单" + (i + 1) + "的链接！");
            return false;
          }
          if (lv1.Type == 'miniprogram') {
            if (lv1.Appid == null || lv1.Appid.length == 0) {
              that.$msg.showMsg(that, "请输入一级菜单" + (i + 1) + "的小程序AppID！");
              return false;
            }
            if (lv1.Pagepath == null || lv1.Pagepath.length == 0) {
              that.$msg.showMsg(that, "请输入一级菜单" + (i + 1) + "的小程序首页路径！");
              return false;
            }
            if (lv1.Url == null || lv1.Url.length == 0) {
              that.$msg.showMsg(that, "请输入一级菜单" + (i + 1) + "的手机不支持小程序时跳转的菜单！");
              return false;
            }
          }
        } else {
          // 有子菜单
          for (let j = 0; j < lv1.SubButton.length; j++) {
            let lv2 = lv1.SubButton[j];
            if (lv2.Name == null || lv2.Name.length == 0) {
              that.$msg.showMsg(that, "请输入二级菜单" + (i + 1) + "-" + (j + 1) + "的名称！");
              return false;
            }
            if (strlen(lv2.Name) > 16) {
              that.$msg.showMsg(that, "二级菜单" + (i + 1) + "-" + (j + 1) + "的名称最长8个汉字16个字符！");
              return false;
            }
            if (lv2.Type == null || lv2.Type.length == 0) {
              that.$msg.showMsg(that, "请选择二级菜单" + (i + 1) + "-" + (j + 1) + "的类别！");
              return;
            }
            if (lv2.Type == 'click' && (lv2.Key == null || lv2.Key.length == 0)) {
              that.$msg.showMsg(that, "请输入二级菜单" + (i + 1) + "-" + (j + 1) + "的事件！");
              return false;
            }
            if (lv2.Type == 'view' && (lv2.Url == null || lv2.Url.length == 0)) {
              that.$msg.showMsg(that, "请输入二级菜单" + (i + 1) + "-" + (j + 1) + "的链接！");
              return false;
            }
            if (lv2.Type == 'miniprogram') {
              if (lv2.Appid == null || lv2.Appid.length == 0) {
                that.$msg.showMsg(that, "请输入二级菜单" + (i + 1) + "-" + (j + 1) + "的小程序AppID！");
                return false;
              }
              if (lv2.Pagepath == null || lv2.Pagepath.length == 0) {
                that.$msg.showMsg(that, "请输入二级菜单" + (i + 1) + "-" + (j + 1) + "的小程序首页路径！");
                return false;
              }
              if (lv2.Url == null || lv2.Url.length == 0) {
                that.$msg.showMsg(that, "请输入二级菜单" + (i + 1) + "-" + (j + 1) + "的手机不支持小程序时跳转的菜单！");
                return false;
              }
            }
          }
        }
      }

      return true;
    },
    // 保存
    save: function () {
      // 数据验证
      let that = this;
      if (that.checkSave()) {
        that.isDisSave = true;
        that.$http.post('WxFunc2/SaveMenus', { "lstMenu": that.lstMenu }).then(res => {
          that.isDisSave = false;
          that.$msg.showMsg(that, res.Message, res.IsSucc ? 0 : 1);
          if (res.IsSucc) {
            that.getDatas();
          }
        });
      }
    },
    // 同步公众号菜单
    syncMenus: function () {
      let that = this;
      that.$msg.showComfirm(that, '同步菜单需要较长时间，你确定要继续？', () => {
        that.$msg.showComfirm(that, '同步期间请不要进行任何操作，否则会导致同步失败！', () => {
          that.isDisSave = true;
          that.$http.post('WxFunc2/SyncMenus').then(res => {
            that.isDisSave = false;
            that.$msg.showMsg(that, res.Message, res.IsSucc ? 0 : 1);
            if (res.IsSucc) {
              that.getDatas();
            }
          });
        });
      });
    }
  },
  created() {
    this.getDatas();
    window.vm = this;
  }
}

// 计算字符长度
function strlen(str) {
  var len = 0;
  for (var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i);
    //单字节加1
    if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
      len++;
    }
    else {
      len += 2;
    }
  }
  return len;
}
</script>

<style>
.border {
  border: 1px solid #ccc;
  padding: 2px;
  margin: 2px;
}
</style>