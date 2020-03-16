<template>
  <el-upload ref="upload" class="upload-demo" :file-list="filelist" :action="acton" :headers="headers" :multiple="multiple" :limit="limit" :accept="accept" :with-credentials="withcredentials" :show-file-list="showfilelist" :on-exceed="handleExceed" :on-progress="handelprogress" :on-change="handelChange" :on-success="handelSucc" :on-error="handelError" :on-remove="handleRemove">
    <template slot="trigger">
      <el-button size="small" type="primary" v-if="isShowUpBtn">点击上传</el-button>
      <slot name="trigger" v-else></slot>
    </template>
  </el-upload>
</template>

<script>
import http from '../utils/http'
export default {
  name: "CommUploader",
  props: {
    // 文件列表
    filelist: {
      type: Array,
      required: true,
    },
    // 上传地址
    acton: {
      type: String,
      required: false,
      default: `${http.root}Comm/Upload`
    },
    // 多选
    multiple: {
      type: Boolean,
      required: false,
      default: false,
    },
    // 文件数量限制
    limit: {
      type: Number,
      required: false,
      default: 1
    },
    // 可上传文件
    accept: {
      type: String,
      required: false,
      default: "*",
    },
    // header请求头，用于放jwt
    headers: {
      type: Object,
      required: false,
    },
    // 是否带cookies到后台api
    withcredentials: {
      type: Boolean,
      required: false,
      default: false
    },
    // 是否显示已上传文件
    showfilelist: {
      type: Boolean,
      required: false,
      default: true
    },
    // 是否显示上传按钮
    isShowUpBtn: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  methods: {
    // 文件超出个数限制时的钩子
    handleExceed (files, filelist) {
      this.$message.warning(`当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + filelist.length} 个文件`);
    },
    // 上传进度
    handelprogress (event, file, filelist) {
      console.log('handelprogress:', event, file, filelist);
      this.$emit('uploadProgress', event, file, filelist);
    },
    // 文件状态改变(添加文件、上传成功和上传失败时都会被调用)
    handelChange (file, filelist) {
      console.log('handelprogress:', file, filelist);
      this.$emit('uploadChange', file, filelist);
    },
    // 上传成功
    handelSucc (file, filelist) {
      console.log('handelSucc:', file, filelist);
      this.$emit("uploadSucc", file, filelist);
    },
    //上传失败
    handelError (err, file, filelist) {
      console.log('handelError:', err, file, filelist);
      this.$emit("uploadError", err, file, filelist);
    },
    // 删除文件
    handleRemove (file, filelist) {
      console.log('handleRemove:', file, filelist);
      this.$emit("uploadRemove", file, filelist);
    },
    // 获取上传的文件
    getUpFileSingle () {
      let upRes = this.filelist;
      if (upRes != null && upRes.length > 0 && upRes[0].response != null) {
        let resp = upRes[0].response;
        if (resp.IsSucc && resp.Data != null && resp.Data.length > 0) {
          return resp.Data[0];
        }
      }

      return null;
    }
  }
}
</script>

<style>
</style>