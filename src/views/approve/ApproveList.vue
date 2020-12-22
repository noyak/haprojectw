<template>
  <div>
    <div class="title-out">
      <div class="title-in">消息列表</div>
    </div>
    <el-form :inline="true"  class="demo-form-inline" >
      <el-form-item label="搜索:">
        <el-input v-model="searchWord" @change="onSubmit" placeholder="请输入消息标题"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">查询</el-button>
      </el-form-item>
    </el-form>
    <el-tabs
      style="padding-left: 20px; padding-right: 20px"
      v-model="activeName"
      @tab-click="handleClick"
    >
      <el-tab-pane label="待办未读" name="first">
        <el-table
          :data="todoList"
          stripe
          style="width: 100%"
          @row-click="toDetail"
        >
           <el-table-column
          type="index"
          width="50">
        </el-table-column>
          <el-table-column
            prop="createDate"
            width="300"
            label="日期"
          ></el-table-column>
          <el-table-column
            prop="messageContent"
            @
            label="消息"
          ></el-table-column>
        </el-table>
        <div style="margin-top: 20px">
          <el-button @click="loadMoreData('todoList', '2', '1')"
            >加载更多</el-button
          >
        </div>
      </el-tab-pane>
      <el-tab-pane label="待办已读" name="second">
        <el-table
          :data="todoListAl"
          stripe
          style="width: 100%"
          @row-click="toDetail"
        >
             <el-table-column
          type="index"
          width="50">
        </el-table-column>
          <el-table-column
            prop="createDate"
            width="300"
            label="日期"
          ></el-table-column>
          <el-table-column prop="messageContent" label="消息"></el-table-column>
        </el-table>
        <div style="margin-top: 20px">
          <el-button @click="loadMoreData('todoListAl', '2', '0')"
            >加载更多</el-button
          >
        </div>
      </el-tab-pane>
      <el-tab-pane label="通知未读" name="third">
        <el-table
          :data="noteList"
          stripe
          style="width: 100%"
          @row-click="toDetail"
        >
             <el-table-column
          type="index"
          width="50">
        </el-table-column>
          <el-table-column
            prop="createDate"
            width="300"
            label="日期"
          ></el-table-column>
          <el-table-column prop="messageContent" label="消息"></el-table-column>
        </el-table>
        <div style="margin-top: 20px">
          <el-button @click="loadMoreData('noteList', '4', '1')"
            >加载更多</el-button
          >
        </div>
      </el-tab-pane>
      <el-tab-pane label="通知已读" name="fourth">
        <el-table
          :data="noteListAl"
          stripe
          style="width: 100%"
          @row-click="toDetail"
        >
             <el-table-column
          type="index"
          width="50">
        </el-table-column>
          <el-table-column
            prop="createDate"
            width="300"
            label="日期"
          ></el-table-column>
          <el-table-column prop="messageContent" label="消息"></el-table-column>
        </el-table>
        <div style="margin-top: 20px">
          <el-button @click="loadMoreData('noteListAl', '4', '0')"
            >加载更多</el-button
          >
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import util from "../../utils/util";
export default {
  name: "ApproveList",
  data() {
    return {
      userId: util.getUrlKey("userId"), //"1001A91000000005GOIA",
      activeName: "first",
      todoList: [],
      todoListAl: [],
      noteList: [],
      noteListAl: [],
      todoPageNo: 1,
      todoAlPageNo: 1,
      notePageNo: 1,
      noteAlPageNo: 1,
      searchWord:'',
      pageNo:1
    };
  },
  created: function () {
    this.loadData("todoList", "2", "1", "1", this.searchWord);
    // this.loadData("todoListAl", "2", "1", "0",  this.searchWord);
    // this.loadData("noteList", "4", "1", "1",  this.searchWord);
    // this.loadData("noteListAl", "4", "1", "0",  this.searchWord);
  },
  methods: {
    loadData: function (target, messageType, isNew) {
      let that = this;
      that
        .post("/app/message/getMsgList", {
          userId: that.userId,
          messageType: messageType,
          pageNo: this.pageNo,
          pageSize: 10,
          isNew: isNew,
          like: this.searchWord,
        })
        .then((data) => {
          let obj = data.res.responcontext;
          if (obj) {
            let list = JSON.parse(obj).data;
            if(list.length == 0){
                 that.$notify.info({
              title: "提示",
              message: "没有更多数据了",
            });
            }else{
             that[target].push.apply(that[target], JSON.parse(obj).data);
            that.$forceUpdate();
            }
        
          } else {
            that.$notify.error({
              title: "错误",
              message: "该单据暂不支持查看",
            });
          }
        });
    },
    loadMoreData:function(target, messageType, isNew){
      this.pageNo = this.pageNo+1;
      this.loadData(target, messageType, isNew);
    },
    handleClick:function(){
      this.searchWord = '';
      this.pageNo = 0;
      this.onSubmit();
    },
    loadDataSearch:function(target, messageType, pageNo, isNew){
        let that = this;
      that
        .post("/app/message/getMsgList", {
          userId: that.userId,
          messageType: messageType,
          pageNo: pageNo,
          pageSize: 10,
          isNew: isNew,
          like: this.searchWord,
        })
        .then((data) => {
          let obj = data.res.responcontext;
          if (obj) {
            that[target] = JSON.parse(obj).data;
          } else {
            that.$notify.error({
              title: "错误",
              message: "该单据暂不支持查看",
            });
          }
        });
    },
    onSubmit:function(){
      this.pageNo = 1
      switch (this.activeName) {
        case 'first':
          this.loadDataSearch("todoList", "2", "1", "1", this.searchWord);
          break;
        case 'second':
          this.loadDataSearch("todoListAl", "2", "1", "0",  this.searchWord);
          break;
        case 'third':
         this.loadDataSearch("noteList", "4", "1", "1", this.searchWord);
          break;
        case 'fourth':
          this.loadDataSearch("noteListAl", "4", "1", "0",  this.searchWord);
          break;
      }
      console.log(this.activeName)
    },
    toDetail: function (row) {
      this.$router.push({
        path: "/ApproveDetail",
        query: {
          userId: util.getUrlKey("userId"),
          msgId: row.originId,
          status: row.isRead,
        },
      });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style >
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
.demo-form-inline{
  text-align: left;
      margin-left: 50px;
}
</style>
