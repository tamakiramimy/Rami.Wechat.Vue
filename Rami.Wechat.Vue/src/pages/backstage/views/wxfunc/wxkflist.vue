<template>
  <el-row>
    <el-row style="margin-top:10px;padding:10px;background-color:white;">
      <el-form :inline="true">
        <el-form-item label="客服账号">
          <el-input clearable placeholder="客服账号" v-model="para.Entity.KfAccount"></el-input>
        </el-form-item>

        <el-form-item label="客服昵称">
          <el-input clearable placeholder="客服昵称" v-model="para.Entity.KfNick"></el-input>
        </el-form-item>

        <el-form-item label="微信账号">
          <el-input clearable placeholder="微信账号" v-model="para.Entity.KfWx"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="medium" round @click="query">查询</el-button>
          <el-button type="success" size="medium" round @click="addItem">新建</el-button>
          <el-button type="warning" size="medium" round @click="syncKf">同步永久客服</el-button>
        </el-form-item>
      </el-form>
    </el-row>

    <el-row>
      <el-table border style="width: 100%" :data="list">
        <el-table-column label="客服账号" prop="KfAccount"></el-table-column>
        <el-table-column label="客服昵称" prop="KfNick"></el-table-column>
        <el-table-column label="客服ID" prop="KfId"></el-table-column>
        <el-table-column label="客服头像">
          <template slot-scope="item" style="width:200px;">
            <a target="_blank" :href="item.row.KfHeadUpShow">
              <img class="image" style="max-height:100px;max-width:100px;" :src="item.row.KfHeadUpShow" />
            </a>
          </template>
        </el-table-column>
        <el-table-column label="微信账号" prop="KfWx"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="item" style="width:200px;">
            <el-button type="warning" size="mini" style="margin:5px;" round @click="actItem(item.row,'edit')">修改昵称</el-button>
            <el-button type="warning" size="mini" style="margin:5px;" round @click="actItem(item.row,'setimg')">修改头像</el-button>
            <el-button type="success" size="mini" style="margin:5px;" round @click="actItem(item.row,'invite')">发送绑定微信邀请</el-button>
            <el-button type="danger" size="mini" style="margin:5px;" round @click="delItem(item.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-row style="margin-top:1em;text-align:center;">
        <el-pagination background layout="total,prev, pager, next,jumper" prev-text="上一页" next-text="下一页" :page-size="para.PageSize" :total="para.TotalCount" @current-change="onPageClick"></el-pagination>
      </el-row>
    </el-row>

    <el-dialog title="编辑" width="30%" :visible.sync="isShowEdit">
      <el-form ref="form" label-width="20%">
        <el-form-item label="客服账号">
          <el-input placeholder="客服账号" :disabled="actType != 'add'" v-model="entity.KfAccount"></el-input>
        </el-form-item>

        <el-form-item label="客服昵称" v-show="actType == 'add' || actType == 'edit'">
          <el-input placeholder="客服昵称" v-model="entity.KfNick"></el-input>
        </el-form-item>

        <el-form-item label="上传头像" v-show="actType == 'setimg'">
          <!-- 上传组件 -->
          <CommUploader ref="upload" :filelist.sync="upObj.fileList" :headers="headers" :acton="upObj.acton" :isShowUpBtn="false" :showfilelist="false" @uploadChange="uploadChange" @uploadRemove="uploadRemove">
            <i slot="trigger" class="fa fa-cloud-upload" style="color:green;" @click="uploadClear">点此上传</i>
          </CommUploader>

          <!-- 文件列表 -->
          <template>
            <el-row :key="fInd" v-for="(file,fInd) in upObj.fileList">
              <template v-if="file.response != null && file.response.Data != null && file.response.Data[0] != null">
                <el-col :span="24">
                  <a :href="file.response.Data[0].AbsPath" target="_blank">{{file.response.Data[0].OrgFileName}}</a>
                </el-col>
                <el-col :span="24">
                  <img v-bind:src="file.response.Data[0].AbsPath" class="image" style="border:1px solid #ccc;padding:2px;max-height:150px;max-width:150px;" />
                </el-col>
              </template>
            </el-row>
          </template>
        </el-form-item>

        <el-form-item label="客服微信账号" v-show="actType == 'invite'">
          <el-input placeholder="客服微信账号" v-model="entity.InviteWx"></el-input>
        </el-form-item>
      </el-form>

      <el-row style="text-align:center;">
        <el-button size="small" round type="primary" :disabled="isDisSave" @click="actSave">保存</el-button>
        <el-button size="small" round type="info" :disabled="isDisSave" @click="isShowEdit = false">取消</el-button>
      </el-row>
    </el-dialog>
  </el-row>
</template>

<script>
import CommUploader from '../../../../components/CommUploader';
import http from '../../../../utils/http';
import { mapGetters, mapState } from 'vuex';
export default {
  components: {
    CommUploader
  },
  data() {
    return {
      para: {
        PageIndex: 1,
        PageSize: 10,
        PageCount: 0,
        TotalCount: 0,
        Entity: {},
      },
      upObj: {
        acton: `${http.root}Comm/Upload?upType=wxmedia`,
        fileList: [],
      },

      list: [],
      entity: {},
      actType: "",
      isDisSave: false,
      isShowEdit: false,
    };
  },
  computed: {
    ...mapGetters('jwtStore', ['getToken', 'getTokenInfo']),
    headers() {
      return { 'Authorization': `Bearer ${this.$store.getters["jwtStore/getToken"]}` };
    }
  },
  methods: {
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
    // 查询
    query: function () {
      this.onPageClick(1);
    },
    // 数据加载
    getDatas: function () {
      let that = this;
      that.list = [];
      that.isDisSave = true;
      that.$http.post("WxFunc2/GetWxKfList", that.para).then(res => {
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
    // 添加客服
    addItem: function () {
      this.entity = {};
      this.actType = 'add';
      this.isShowEdit = true;
    },
    // 操作弹窗
    actItem: function (item, actType) {
      this.entity = item;
      this.actType = actType;
      this.isShowEdit = true;
    },
    // 保存相关操作
    actSave: function () {
      let that = this;
      let item = that.entity;
      let url = "";
      if (that.actType == 'add' || that.actType == 'edit') {
        if (!that.$msg.checkSave(that, 0, item.KfAccount, '请输入客服账号！')) {
          return;
        }

        if (!that.$msg.checkSave(that, 0, item.KfNick, '请输入客服昵称！')) {
          return;
        }

        url = 'WxFunc2/SaveWxKf';
      } else if (that.actType == 'setimg') {
        // 上传的文件
        let upFile = this.getUploadFile();
        if (upFile != null) {
          item.KfHeadUpVir = upFile.VirPath;
          item.KfHeadUpShow = upFile.AbsPath;
        }

        if (!that.$msg.checkSave(that, 0, item.KfHeadUpVir, '请上传客服头像！')) {
          return;
        }

        url = 'WxFunc2/UpdWxKfImg';
      } else if (that.actType == 'invite') {
        if (!that.$msg.checkSave(that, 0, item.InviteWx, '请输入要邀请的微信客服对应的微信账号！')) {
          return;
        }

        url = 'WxFunc2/InviteWxKf';
      }

      // 提交操作
      that.isDisSave = true;
      that.$http.post(url, item).then(res => {
        that.$msg.showMsg(that, res.Message, res.IsSucc ? 0 : 1);
        that.isDisSave = false;
        if (res.IsSucc) {
          that.query();
          that.isShowEdit = false;
        }
      }).catch(res => {
        console.log(res);
      });
    },
    // 删除客服
    delItem: function (item) {
      let that = this;
      that.$msg.showComfirm(that, '你确定要删除此客服吗？', val => {
        that.$http.post('WxFunc2/DelWxKfImg', item).then(res => {
          that.$msg.showMsg(that, res.Message, res.IsSucc ? 0 : 1);
          if (res.IsSucc) {
            that.query();
          }
        }).catch(res => {
          console.log(res);
        });
      });
    },
    // 同步客服列表
    syncKf: function () {
      let that = this;
      that.$msg.showComfirm(that, '同步客服需要较长时间，你确定要继续？', () => {
        that.$msg.showComfirm(that, '同步期间请不要进行任何操作，否则会导致同步失败！', () => {
          that.$http.post('WxFunc2/SyncWxKf', {}).then(res => {
            that.$msg.showMsg(that, res.Message, res.IsSucc ? 0 : 1);
            if (res.IsSucc) {
              that.query();
            }
          }).catch(res => {
            console.log(res);
          });
        });
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