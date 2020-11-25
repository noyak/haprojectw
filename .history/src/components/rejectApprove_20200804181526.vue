<template>
  <el-form ref="form" label-width="80px">
    <!-- 驳回节点 -->
    <el-form-item style="text-align:left" v-for="(item,index) in list" :key="index">
      <el-radio-group v-model="checkId">
        <el-radio :label="item.id">{{item.name}}</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="驳回意见">
      <el-input type="textarea" v-model="note"></el-input>
    </el-form-item>
    <!-- 底部 -->
    <div style="text-align:right;margin-top:5px">
      <el-button class="dl-button" @click="cancle">取消</el-button>
      <el-button class="dl-button" type="primary" @click="submit">确定</el-button>
    </div>
  </el-form>
</template>

<script>
export default {
  props: {
    msgId: String,
    userId: String
  },
  data: function() {
    return {
      list: [],
      checkId: "",
      note: ""
    };
  },
  created: function() {
    this.loadData();
  },
  methods: {
    cancle: function() {
      this.$emit("close");
    },
    submit() {
      if(!this.checkId){
             this.$notify({
          title: '警告',
          message: '请选择驳回的节点',
          type: 'warning'
        });
        return
      }
      let reject = {
        checked: this.checkId,
        note: this.note
      };
        this.$emit("submitForm",reject);
    },
    loadData() {
      let that = this;
      that
        .post("/app/approvedRest/getRejectNodeList", {
          userId: that.userId,
          msgid: that.msgId
        })
        .then(data => {
          if (data.res.result == "success") {
            if (data.responcontext) {
              that.list = JSON.parse(data.responcontext) ;
            } else {
              that.list = [];
            }
          }else{
            this.$notify.error({
              title: "错误",
              message: data.res.resultmsg
            });
          }
        });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
