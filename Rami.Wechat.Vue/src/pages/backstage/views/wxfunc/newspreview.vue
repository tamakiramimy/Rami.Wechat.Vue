<template>
  <el-row>
    <div v-html="html">
    </div>
  </el-row>
</template>

<script>
export default {
  data() {
    return {
      html: "",
      id: "",
      type: "",
    }
  },
  computed: {
  },
  methods: {
    // 查询Html内容
    getHtmlCont: function () {
      let that = this;
      that.$http.get('/WxFunc3/GetNewsHtml', { id: that.id, type: that.type }).then(res => {
        that.$msg.showMsg(that, res.Message, res.IsSucc ? 0 : 1);
        if (res.IsSucc) {
          that.html = res.Data;
        }
      })
    }
  },
  created() {
    let query = this.$route.query;
    this.id = query.id;
    this.type = query.type;
    this.getHtmlCont();

    window.vm = this;
  },
}
</script>

<style>
</style>