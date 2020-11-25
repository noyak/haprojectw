<template>
  <div>
        <div class="title-out">
      <div class="title-in" >消息列表</div>
   
    </div>
    <el-tabs style="padding-left:20px;padding-right:20px">
      <el-tab-pane label="待办未读" name="first">
        <el-table :data="todoList" stripe style="width: 100%" @row-click="toDetail">
          <el-table-column prop="createDate" label="日期" ></el-table-column>
          <el-table-column prop="messageContent" @ label="消息" ></el-table-column>
        </el-table>
          <div style="margin-top: 20px">
                <el-button @click="loadData('todoList','2',todoPageNo+1,'0')">加载更多</el-button>
            </div>
      </el-tab-pane>
      <el-tab-pane label="待办已读" name="second">
        <el-table :data="todoListAl" stripe style="width: 100%"  @row-click="toDetail">
          <el-table-column prop="createDate" label="日期" ></el-table-column>
          <el-table-column prop="messageContent" label="消息" ></el-table-column>
        </el-table>
             <div style="margin-top: 20px">
                <el-button @click="loadData('todoListAl','2',todoAlPageNo+1,'1')">加载更多</el-button>
            </div>
      </el-tab-pane>
      <el-tab-pane label="通知未读" name="third">
        <el-table :data="noteList" stripe style="width: 100%"  @row-click="toDetail">
          <el-table-column prop="createDate" label="日期" ></el-table-column>
          <el-table-column prop="messageContent" label="消息" ></el-table-column>
        </el-table>
            <div style="margin-top: 20px">
                <el-button @click="loadData('noteList','4',notePageNo+1,'0')">加载更多</el-button>
            </div>
      </el-tab-pane>
      <el-tab-pane label="通知已读" name="fourth">
        <el-table :data="noteListAl" stripe style="width: 100%"  @row-click="toDetail">
          <el-table-column prop="createDate" label="日期" ></el-table-column>
          <el-table-column prop="messageContent" label="消息"></el-table-column>
        </el-table>
         <div style="margin-top: 20px">
                <el-button @click="loadData('noteList','4',noteAlPageNo+1,'1')">加载更多</el-button>
            </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import util from "../../utils/util";
export default {
  name: "ApproveDetail",
  data() {
    return {
      userId: util.getUrlKey("userId"), //"1001A91000000005GOIA",
      todoList: [],
      todoListAl: [],
      noteList: [],
      noteListAl: [],
      todoPageNo:1,
      todoAlPageNo:1,
      notePageNo:1,
      noteAlPageNo:1,
    };
  },
  created: function() {
    this.loadData("todoList", "2", "1", "1", "");
    this.loadData("todoListAl", "2", "1", "0", "");
    this.loadData("noteList", "4", "1", "1", "");
    this.loadData("noteListAl", "4", "1", "0", "");
  },
  methods: {
    loadData: function(target, messageType, pageNo, isNew, like) {
      let that = this;
      that
        .post("/app/message/getMsgList", {
          userId: that.userId,
          messageType: messageType,
          pageNo: pageNo,
          pageSize: 10,
          isNew: isNew,
          like: like
        })
        .then(data => {
            
          let obj = data.res.responcontext;
          if (obj) {
        
            that[target].push.apply( that[target],JSON.parse(obj).data);
          } else {
            this.$notify.error({
              title: "错误",
              message: "该单据暂不支持查看"
            });
          }
        });
    },
    toDetail:function(row){

       this.$router.push({ path: '/ApproveDetail', query: { userId: util.getUrlKey("userId"), msgId: row.originId } })
            
    }
  }
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
</style>
