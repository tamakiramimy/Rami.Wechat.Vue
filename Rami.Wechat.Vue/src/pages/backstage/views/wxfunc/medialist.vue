<template>
  <el-row>
    <el-row style="margin-top:10px;padding:10px;background-color:white;">
      <el-form :inline="true">
        <el-form-item label="素材名称">
          <el-input clearable placeholder="素材名称" v-model="para.Entity.Title"></el-input>
        </el-form-item>
        <el-form-item label="素材类别">
          <el-select style="width:100%;" placeholder="请选择" clearable filterable v-model="para.Entity.Type">
            <el-option v-for="item in lstType" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" round @click="query">查询</el-button>
          <el-button type="success" size="small" round @click="addItem">新建</el-button>
          <el-button type="warning" size="small" round @click="isShowSync = true">同步素材</el-button>
        </el-form-item>
      </el-form>
    </el-row>
    <el-row>
      <el-table border style="width: 100%" :data="lstDatas">
        <el-table-column label="类型" prop="TypeShow"></el-table-column>
        <el-table-column label="名称" prop="Title"></el-table-column>
        <el-table-column label="描述" prop="Introduction"></el-table-column>
        <el-table-column label="媒体ID" prop="MediaId"></el-table-column>
        <el-table-column label="微信路径">
          <template slot-scope="item" style="width:200px;">
            <span class="nowrapSpan" style="width:50px;overflow:hidden;" v-bind:title="item.row.WxUrl">{{ item.row.WxUrl }}</span>
          </template>
        </el-table-column>
        <el-table-column label="预览">
          <template slot-scope="item" style="width:200px;">
            <a target="_blank" :href="item.row.LocalUrlShow">
              <el-button type="primary" size="small" round>预览</el-button>
            </a>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="item" style="width:200px;">
            <el-button type="warning" size="mini" style="margin:5px;" round @click="editItem(item.row)"> 编辑</el-button>
            <el-button type="danger" size="mini" style="margin:5px;" round @click="delItem(item.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-row style="margin-top:1em;text-align:center;">
        <el-pagination background layout="total,prev, pager, next,jumper" prev-text="上一页" next-text="下一页" :page-size="para.PageSize" :total="para.TotalCount" @current-change="onPageClick">
        </el-pagination>
      </el-row>
    </el-row>

    <el-dialog title="编辑" width="30%" :visible.sync="isShowEdit">
      <template v-if="actType == 'add'">
        <el-form ref="form" label-width="20%">
          <el-form-item label="类型">
            <el-select style="width:100%;" placeholder="请选择" clearable filterable v-model="entity.Type">
              <el-option v-for="item in lstType" :key="item.value" :value="item.value" :label="item.label"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="描述" v-show="entity.Type == '@PubMediaType.video.ToString()'">
            <el-input placeholder="描述" v-model="entity.Introduction"></el-input>
          </el-form-item>
          <el-form-item label="上传" v-show="entity.Type != null">
            <!-- 上传组件 -->
            <CommUploader ref="upload" :filelist.sync="upObj.fileList" :headers="headers" :acton="upObj.acton" :isShowUpBtn="false" :showfilelist="false" @uploadChange="uploadChange" @uploadRemove="uploadRemove">
              <i slot="trigger" class="fa fa-cloud-upload" style="font-size:14px;color:#53a93f;" @click="uploadClear">点此上传</i>
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
        <el-row style="text-align:center;">
          <el-button size="small" round type="primary" :disabled="isDisSave" v-show="entity.Type != null" @click="saveItem">保存</el-button>
          <el-button size="small" round type="info" :disabled="isDisSave" @click="isShowEdit = false">取消</el-button>
        </el-row>
      </template>

      <template v-if="actType == 'edit'">
        <el-form ref="form" label-width="20%">
          <el-form-item label="名称">
            <el-input placeholder="请输入素材名称" v-model="entity.Title"></el-input>
          </el-form-item>
        </el-form>
        <el-row style="text-align:center;">
          <el-button size="small" round type="primary" :disabled="isDisSave" @click="updItem">保存</el-button>
          <el-button size="small" round type="info" :disabled="isDisSave" @click="isShowEdit = false">取消</el-button>
        </el-row>
      </template>
    </el-dialog>

    <el-dialog title="同步" width="30%" :visible.sync="isShowSync">
      <el-form ref="form" label-width="20%">
        <el-form-item label="类型">
          <el-select style="width:100%;" placeholder="请选择" clearable filterable v-model="mediaType">
            <el-option v-for="item in lstSyncTypes" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="同步数量">
          <el-select style="width:100%;" placeholder="请选择" clearable filterable v-model="syncCount">
            <el-option v-for="item in [20, 40, 60, 80, 100, 200, 300, 400, 500]" :key="item" :value="item" :label="item"></el-option>
            <el-option key="99999" value="99999" label="全部"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <el-row style="text-align:center;">
        <p style="text-align:center;margin:5px;">
          <span style="color:red;">注意：缩略图和图片是同一个接口，请选择图片</span>
        </p>

        <el-button size="small" round type="primary" v-show="mediaType != null && mediaType.length > 0" :disabled="isDisSave" @click="syncMedia">同步</el-button>
        <el-button size="small" round type="info" :disabled="isDisSave" @click="isShowSync = false">取消</el-button>
      </el-row>
    </el-dialog>
  </el-row>
</template>

<script>
import { async } from 'q';
import { log } from 'util';
import enums from '../../domain/enums';
import CommUploader from '../../../../components/CommUploader';
import { mapGetters, mapState } from 'vuex';
import http from '../../../../utils/http'
export default {
  components: {
    CommUploader: CommUploader
  },
  data () {
    return {
      para: {
        PageIndex: 1,
        PageSize: 10,
        PageCount: 0,
        TotalCount: 0,
        Entity: {}
      },
      lstDatas: [],
      entity: {},
      lstType: enums.EnumPubMediaType,
      lstSyncTypes: enums.EnumPubSyncTypes,
      mediaType: '',
      syncCount: '',
      actType: '',
      isDisSave: false,
      isShowEdit: false,
      isShowSync: false,
      upObj: {
        acton: `${http.root}Comm/Upload?upType=wxmedia`,
        fileList: [],
      }
    };
  },
  computed: {
    ...mapGetters('jwtStore', ['getToken', 'getTokenInfo']),
    headers () {
      return { 'Authorization': `Bearer ${this.$store.getters["jwtStore/getToken"]}` };
    }
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
      this.$http.post('WxFunc/GetMediaList', that.para).then(res => {
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
    // 新增
    addItem: function () {
      this.entity = {};
      this.actType = 'add';
      this.isShowEdit = true;

      // 清空上传
      this.uploadClear();
    },
    // 编辑
    editItem: function (item) {
      this.entity = Object.assign({}, item);
      this.actType = 'edit';
      this.isShowEdit = true;
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
    // 保存
    saveItem: function () {
      let that = this;
      let item = Object.assign({}, this.entity);

      // 上传的文件
      let upRes = that.upObj.fileList;
      if (upRes != null && upRes.length > 0 && upRes[0].response != null) {
        let resp = upRes[0].response;
        if (resp.IsSucc && resp.Data != null && resp.Data.length > 0) {
          let upFile = resp.Data[0];
          item.LocalUrl = upFile.VirPath;
          item.LocalUrlShow = upFile.AbsPath;
          item.Title = upFile.OrgFileName;
        }
      }

      if (!that.$msg.checkSave(that, 0, item.LocalUrl, '请先上传文件！')) {
        return;
      }

      // 保存
      that.isDisSave = true;
      that.$http.post('WxFunc/SaveMedia', item).then(res => {
        that.isDisSave = false;
        that.$msg.showMsg(that, res.Message, res.IsSucc ? 0 : 1);
        if (res.IsSucc) {
          that.query();
          that.isShowEdit = false;
        }
      }).catch(res => {
        console.log(res);
      });
    },
    // 更新素材名称
    updItem: function () {
      let that = this;
      let item = Object.assign({}, this.entity);
      if (that.$msg.checkSave(that, 0, item.Title, '请输入素材名称！')) {
        return;
      }
      that.isDisSave = true;
      that.$http.post('WxFunc/UpdMediaName', item).then(res => {
        that.isDisSave = false;
        that.$msg.showMsg(res.Message, res.IsSucc ? 0 : 1);
        if (res.IsSucc) {
          that.query();
          that.isShowEdit = false;
        }
      }).catch(res => {
        console.log(res);
      });
    },
    // 删除
    delItem: function (item) {
      let that = this;
      that.$msg.showComfirm(that, '你确定要删除此永久素材吗？', () => {
        that.isDisSave = true;
        that.$http.post('WxFunc/DelMedia', item).then(res => {
          that.isDisSave = false;
          that.$msg.showMsg(that, res.Message, res.IsSucc ? 0 : 1);
          if (res.IsSucc) {
            that.query();
          }
        }).catch(res => {
          console.log(res);
        });
      });
    },
    // 同步微信公众号永久素材
    syncMedia: function () {
      let that = this;
      if (!that.$msg.checkSave(that, 0, that.mediaType, '请先选择要同步媒体类型！')) {
        return;
      }
      if (!that.$msg.checkSave(that, 0, that.syncCount, '请先选择要同步的数量！')) {
        return;
      }
      that.$msg.showComfirm(that, '同步永久素材需要较长时间，你确定要继续？', () => {
        that.$msg.showComfirm(that, '同步期间请不要进行任何操作，否则会导致同步失败！', () => {
          that.isDisSave = true;
          that.$http.post('WxFunc/SyncMediaList', { type: vm.mediaType, count: vm.syncCount }).then(res => {
            that.isDisSave = false;
            that.$msg.showMsg(that, res.Message, res.IsSucc ? 0 : 1);
            if (res.IsSucc) {
              that.query();
              that.isShowSync = false;
            }
          });
        });
      });
    }
  },
  created () {
    this.query();
    window.vm = this;
  }
};
</script>

<style></style>
