<template>
  <div>
    <!-- 标题 -->
    <div class="title-out">
      <div class="title-in" v-if="baseInfo.billId">{{baseInfo.billtypename}}</div>
      <div class="title-other">
        <el-button @click="drawer = true" class="el-button-padding0" style="height: 35px; font-size: 14px;width: 100px;">审批历史</el-button>
        <el-button
        class="el-button-padding0"
          @click="drawerAttach = true"
          style="height: 35px; font-size: 14px;width: 60px;"
        >附件</el-button>
      </div>
    </div>
    <!-- 基本信息 -->
    <el-form :inline="true" :disabled="true" class="demo-form-inline form-dl">
      <el-form-item :label="item.name" v-for="(item,index) in header.cols" v-bind:key="index">
        <el-input v-model="item.value"></el-input>
      </el-form-item>
    </el-form>
    <!-- 表体 -->
    <div style="padding-left:20px;padding-right:20px">
      <el-tabs class="tabs-dl" type="card">
        <el-tab-pane :label="body.tabname" v-for="(body,bindex) in bodyArray" :key="bindex">
          <el-table :data="body.data" stripe style="width: 100%" class="table-dl">
            <el-table-column
              :prop="bitem.code"
              :label="bitem.name"
              width="180"
              v-for="(bitem,bodyIndex) in body.cols"
              :key="bodyIndex"
            ></el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
    <!-- 表尾 -->
    <div style="padding-top:10px;padding-left:20px;padding-right:20px">
      <el-collapse v-for="(end,e) in endArray" :key="e">
        <el-collapse-item :title="end.tabname">
          <el-form :inline="true" :disabled="true" class="demo-form-inline form-dl">
            <el-form-item :label="e.name" v-for="(e,eindex) in end.cols" v-bind:key="eindex">
              <el-input v-model="e.value"></el-input>
            </el-form-item>
          </el-form>
        </el-collapse-item>
      </el-collapse>
    </div>
    <div style="height:6rem"></div>
    <!-- 按钮 -->
    <div class="dl-button-out">
      <div>
        <el-button
          class="dl-button dl-button-1"
          type="primary"
          @click="openMessage('agree','同意')"
          v-if="status == '0'"
          round
        >同意</el-button>
        <el-button
          class="dl-button dl-button-1"
          type="primary"
          @click="openMessage('disagree','不同意')"
          v-if="status == '0'"
          round
        >不同意</el-button>
        <el-button
          class="dl-button dl-button-1"
          type="primary"
          @click="cancleApprove()"
          v-if="status == '1'"
          round
        >取消审批</el-button>
        <el-dropdown class="dl-button" placement="top-end" @command="doTask" v-if="status == '0'">
          <el-button round>
            更多菜单
            <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              style="width:80px;text-align:center"
              v-for="(task,index) in taskInfo"
              :key="index"
              :command="task"
            >{{task}}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <!-- 抽屉页面 -->
    <el-drawer title="审批历史" :visible.sync="drawer" :with-header="false" :direction="direction">
      <h3>审批历史</h3>
      <el-timeline :reverse="reverse">
        <el-timeline-item
          :timestamp="history.dealdate"
          placement="top"
          v-for="(history,index) in approveHistory"
          :key="index"
        >
          <el-card class="text-left">
            <h4>{{history.checkname}}({{history.checkgroupname}})</h4>
            <p>审批意见：{{history.approveresult}}</p>
            <p>批语:{{history.checknote}}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-drawer>

    <el-drawer
      title="附件"
      :visible.sync="drawerAttach"
      :direction="directionAttach"
      :with-header="false"
      class="attach-drawer"
    >
      <h3 class="text-center">附件</h3>
      <div class="attach" v-for="(file,index) in files" :key="index">
        <el-link @click="openAttach(file)">
          <i class="el-icon-document" style="margin-right:5px"></i>
          {{file.name}}
        </el-link>
      </div>
    </el-drawer>
    <!-- 弹窗 -->
    <el-dialog
      title="请选择加签对象"
      :visible.sync="dialogVisibleAdd"
      class="dialog-dl"
      width="60%"
      height="120%"
      top="10vh"
    >
      <select-people
        :multi="true"
        :msgId="msgid"
        :userId="userId"
        @close="closeDialog"
        @submitForm="addSubmit"
      ></select-people>
    </el-dialog>
    <el-dialog
      title="请选择改派对象"
      :visible.sync="dialogVisibleAssigned"
      class="dialog-dl"
      width="60%"
      height="120%"
      top="10vh"
    >
      <select-people
        :multi="false"
        :msgId="msgid"
        :userId="userId"
        @close="closeDialog"
        @submitForm="assignedSubmit"
      ></select-people>
    </el-dialog>
    <el-dialog
      title="请选择驳回节点"
      :visible.sync="dialogVisibleReject"
      class="dialog-dl"
      width="60%"
      height="120%"
      top="10vh"
    >
      <reject-approve
        :msgId="msgid"
        :userId="userId"
        @close="closeDialog"
        @submitForm="rejectSubmit"
      ></reject-approve>
    </el-dialog>
  </div>
</template>

<script>
import util from "../../utils/util";
export default {
  name: "ApproveDetail",
  data() {
    return {
      msgid: util.getUrlKey("msgId"), //"1001A91000000005GOIA",
      userId: "", //"1001A91000000000DUKP",
      activeName: "1",
      drawer: false,
      reverse: true,
      direction: "rtl",
      rejectNode: "",
      drawerAttach: false,
      directionAttach: "btt",
      dialogVisibleAdd: false, //加签
      dialogVisibleAssigned: false, //指派
      dialogVisibleReject: false, //驳回
      header: {},
      baseInfo: {},
      approveHistory: [],
      files: [],
      bodyArray: [],
      endArray: [],
      rejectNodes: [],
      rejectNote: "",
      status: "",
      taskInfo: [] //可操作按钮
    };
  },
  created: function() {
    this.msgid = util.getUrlKey("msgId");
    this.userId = util.getUrlKey("userId");
    this.status = util.getUrlKey("status");
    this.getData();
    this.getApproveDo();
  },
  methods: {
    openAttach: function(file) {
      let that = this;
      that
        .get("/app/oa/getAttachToken", {
          userCode: that.msgid
        })
        .then(data => {
          let result = data.res.responcontext;
          const url = that.pdfurl + file.pk + "/" + JSON.parse(result).data;
          console.log(url);

          var tempwindow = window.open("_blank"); // 先打开页面
          tempwindow.location = url; // 后更改页面地址
        });
    },
    getData: function() {
      let that = this;
      that
        .post("/app/approved/msgDetail", {
          msgid: that.msgid
        })
        .then(data => {
          if (data.res.responcontext) {
            that.loadData(data.res.responcontext);
          } else {
            this.$notify.error({
              title: "错误",
              message: "该单据暂不支持查看"
            });
          }
        });
    },
    doTask: function(task) {
      switch (task) {
        case "驳回":
          this.dialogVisibleReject = true;

          break;
        case "加签":
          this.dialogVisibleAdd = true;
          break;
        case "改派":
          this.dialogVisibleAssigned = true;
          break;
      }
    },
    cancleApprove: function() {
      let that = this;
      that
        .post("/app/approvedRest/undoApprove", {
          userId: that.userId,
          msgid: that.msgid
        })
        .then(data => {
          if (data.result == "success") {
            console.log(JSON.stringify(data.responcontext));
            this.$notify({
              title: "成功",
              message: "取消审批成功",
              type: "success"
            });
          } else {
            this.$notify.error({
              title: "错误",
              message: data.resultmsg
            });
          }
        });
    },
    openMessage(type, text) {
      let that = this;
      this.$prompt("请输入审批意见", text, {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(({ value }) => {
          if (type == "agree") {
            that.agree(value);
          } else {
            that.disagree(value);
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "取消输入"
          });
        });
    },
    closeDialog: function() {
      this.dialogVisibleAdd = false;
      this.dialogVisibleAssigned = false;
      this.dialogVisibleReject = false;
    },
    disagree: function(note) {
      let that = this;
      that
        .post("/app/approvedRest/disagree", {
          userId: that.userId,
          note: note,
          msgid: that.msgid
        })
        .then(data => {
          if (data.result == "success") {
            console.log(JSON.stringify(data.responcontext));
            this.$notify({
              title: "成功",
              message: "操作成功",
              type: "success"
            });
          } else {
            this.$notify.error({
              title: "错误",
              message: data.resultmsg
            });
          }
        });
    },
    agree: function(note) {
      let that = this;
      that
        .post("/app/approvedRest/agree", {
          userId: that.userId,
          note: note,
          msgid: that.msgid
        })
        .then(data => {
          if (data.result == "success") {
            console.log(JSON.stringify(data.responcontext));
            this.$notify({
              title: "成功",
              message: "操作成功",
              type: "success"
            });
          } else {
            this.$notify.error({
              title: "错误",
              message: data.resultmsg
            });
          }
        });
    },
    addSubmit: function(array) {
      let that = this;
      that
        .post("/app/approvedRest/getRejectNodeList", {
          userId: that.userId,
          msgid: that.msgid,
          cuserids: array.join(",")
        })
        .then(data => {
          if (data.result == "success") {
            that.dialogVisibleAdd = false;
            this.$notify({
              title: "成功",
              message: "加签成功",
              type: "success"
            });
          } else {
            this.$notify.error({
              title: "错误",
              message: data.resultmsg
            });
          }
        });
    },
    rejectSubmit: function(rejectObj) {
      let that = this;
      that
        .post("/app/approvedRest/reject", {
          userId: that.userId,
          msgid: that.msgid,
          note: rejectObj.note,
          rejectNode: rejectObj.checked
        })
        .then(data => {
          if (data.result == "success") {
            that.dialogVisibleReject = false;
            this.$notify({
              title: "成功",
              message: "驳回成功",
              type: "success"
            });
          } else {
            this.$notify.error({
              title: "错误",
              message: data.resultmsg
            });
          }
        });
    },
    assignedSubmit: function(selectArr) {
      const cuserid = selectArr[0].cuserid;
      let that = this;
      that
        .post("/app/approvedRest/reassign", {
          userId: that.userId,
          msgid: that.msgid,
          targetUserId: cuserid
        })
        .then(data => {
          if (data.result == "success") {
            that.dialogVisibleAssigned = false;
            this.$notify({
              title: "成功",
              message: "改派成功",
              type: "success"
            });
          } else {
            this.$notify.error({
              title: "错误",
              message: data.resultmsg
            });
          }
        });
    },
    rejectCheck: function() {
      let that = this,
        rejectNode = that.rejectNode;
      let rejectNote = that.rejectNote;
      if (!rejectNode) {
        this.$notify({
          title: "警告",
          message: "请选择驳回节点",
          type: "warning"
        });
        return;
      }
      that
        .post("/app/approvedRest/reject", {
          userId: that.userId,
          msgid: that.msgid,
          rejectNode: rejectNode,
          note: rejectNote
        })
        .then(data => {
          if (data.result == "success") {
            console.log(JSON.stringify(data.responcontext));
            this.$notify({
              title: "成功",
              message: "操作成功",
              type: "success"
            });
          } else {
            this.$notify.error({
              title: "错误",
              message: data.resultmsg
            });
          }
        });
    },
    getApproveDo: function() {
      let that = this;
      that
        .post("/app/approvedRest/getTaskInfo", {
          userCode: "100041",
          msgid: that.msgid
        })
        .then(data => {
          if (data.result == "success") {
            let reponse = JSON.parse(data.responcontext);
            for (const key in reponse) {
              const element = reponse[key];
              switch (key) {
                case "CanReject":
                  if (element) {
                    that.taskInfo.push("驳回");
                  }
                  break;
                case "Assigned":
                  if (element) {
                    that.taskInfo.push("指派");
                  }
                  break;
                case "CanAddApprover":
                  if (element) {
                    that.taskInfo.push("加签");
                  }
                  break;
                case "CanTransfer":
                  if (element) {
                    that.taskInfo.push("改派");
                  }
                  break;
              }
            }
          } else {
            this.$notify({
              title: "警告",
              message: data.resultmsg,
              type: "warning"
            });
          }
        });
    },
    loadData: function(data) {
      let that = this;
      const tabs = data.tabs;
      const billInfo = data.billInfo;
      this.baseInfo = data.baseInfo;
      this.files = data.files;
      this.approveHistory = data.approveHistory;
      for (let index = 0; index < tabs.length; index++) {
        const element = tabs[index];
        that.dealData(element, billInfo);
        const code = element["tabcode"][0];
        switch (code) {
          case "0": //表头
            that.header = element;
            break;
          case "1": //表体
            element["data"] = billInfo[element["tabcode"]];
            that.bodyArray.push(element);
            break;
          case "2": //表尾
            that.endArray.push(element);
            break;
        }
      }
    },
    dealData: function(element, billInfo) {
      const tabcode = element["tabcode"];
      const data = billInfo[tabcode];
      const cols = element["cols"];
      if (data) {
        for (let index = 0; index < cols.length; index++) {
          const item = cols[index];
          const code = item["code"];
          item["value"] = data[code];
        }
        return element;
      } else {
        alert("数据异常!");
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style >
.body {
  margin: 0;
}
.form-dl {
  text-align: left;
}

.el-table th {
  background: #f5f7fa;
}
.el-form-item__label {
  width: 150px;
}
.title-out {
  background-color: #3f8edd;
  height: 70px;
  line-height: 70px;
  margin-bottom: 30px;
}
.title-in {
  display: inline-block;
  font-size: 18px;
  color: #fff;
}
.title-other {
  float: right;
  margin-right: 65px;
  margin-top: 22px;
}
.attach {
  display: inline-block;
  margin-right: 60px;
  margin-bottom: 10px;
}
.text-left {
  text-align: left;
}
.text-center {
  text-align: center;
}
.el-drawer {
  overflow: scroll;
}
.btt .el-drawer__body {
  text-align: left;
  padding-left: 25px;
}
.el-dropdown {
  vertical-align: top;
}
.dl-button {
  width: 110px;
  margin-right: 15px;
 
}
.dl-button-1{
 background-color: #3f8edd !important;
}
.dl-button-out {
  position: fixed;
  bottom: 0px;
  line-height: 65px;
  width: 99%;
  height: 65px;
  background-color: #fff;
  padding-top: 10px;
  z-index: 999;
}
.el-dialog {
  height: auto;
}
.el-input.is-disabled .el-input__inner {
  background-color: #fff;
  color: #000000;
}
.el-input.is-disabled .el-input__inner {
  cursor: default;
}
.el-table th > .cell {
  line-height: 45px;
}
.el-button-padding0 {
  /* padding-left: 10px;
  padding-right: 10px; */
  padding-right: 0;
  padding-left: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.el-tabs__item.is-active {
  background-color: #3f8edd;
  color: #ffffff;
}
.el-button--primary{
  background-color: #3f8edd;
}
.text-left .el-card__body{
padding:4px;
padding-left:10px;
}
</style>
