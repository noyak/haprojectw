<template>
  <div>
    <!-- 头部 -->
    <div>
      <el-input class="el-input-div" placeholder="请输入人员名称搜索" v-model="peopleName" clearable></el-input>
      <el-button class="dl-button" type="primary" @click="search">搜索</el-button>
    </div>
    <!-- 面包屑 -->
    <div class="breadcrumb-out">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item v-for="(address,index) in addressArr" :key="index">
          <a @click="openBack(address,index)">{{address.name}}</a>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <!-- 列表 -->
    <el-table
      :data="list"
      class="el-table-dl"
      @row-click="openNext"
      style="width: 100%;height: 320px; overflow-y: scroll;"
      v-show="type == 'org'"
    >
      <el-table-column type="index" width="50"></el-table-column>
      <el-table-column prop="name" label="组织部门"></el-table-column>
      <el-table-column prop="psncountwithsub" label="人数" width="100"></el-table-column>
      <el-table-column fixed="right" width="50">
        <template>
          <i class="el-icon-arrow-right"></i>
        </template>
      </el-table-column>
    </el-table>
    <el-table
      ref="multipleTable"
      :data="list"
      tooltip-effect="dark"
      style="width: 100%;height: 320px; overflow-y: scroll;"
      @select="handleSelectionChange"
      v-show="type != 'org' && multi"
    >
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="name" label="姓名"></el-table-column>
    </el-table>
    <el-table
      :data="list"
      class="el-table-dl"
      highlight-current-row
      @row-click="handleSelectionChange"
      style="width: 100%;height: 320px; overflow-y: scroll;"
      v-show="type != 'org' && !multi"
    >
      <el-table-column type="index" width="50"></el-table-column>
      <el-table-column prop="name" label="姓名"></el-table-column>
      <el-table-column prop="code" label="工号"></el-table-column>
    </el-table>
    <!-- 底部 -->
    <div style="text-align:left">
      <div v-for="(select,index) in selectArr" :key="index" style=" display:inline-block;">
        <el-button type="primary" class="dl-select" plain>{{select.name}}</el-button>
      </div>
      <div style="text-align:right;margin-top:5px">
        <el-button class="dl-button" @click="cancle">取消</el-button>
        <el-button class="dl-button" type="primary" @click="submit()">确定</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "selectPeople",
  props: {
    multi: Boolean,
    msgId: String,
    userId: String
  },
  data: function() {
    return {
      showHeader: false,
      type: "org",
      peopleName: "",
      selectArr: [],
      addressArr: [
        {
          name: "首页",
          pk: "0"
        }
      ],
      list: []
    };
  },
  created: function() {
    this.loadOrg();
  },

  methods: {
    submit:function(){
      if(this.selectArr.length == 0){
        this.$notify({
          title: '警告',
          message: '请选择操作对象',
          type: 'warning'
        });
        return;
      }
      console.log(JSON.stringify(this.selectArr));
      this.$emit("submitForm",this.selectArr);
    },
    cancle:function(){
        this.$emit("close");
    },
    search: function() {
     let that = this;
      that
        .post("/app/approvedRest/getPsnList", {
           userId: that.userId,
        condition: that.peopleName
        })
        .then(data => {
        // console.warn("##人员数据####");
        // console.log(JSON.stringify(data));
        if (data.responcontext) {
          that.type = 'people';
          that.list = JSON.parse(data.responcontext);
                setTimeout(() => {
                 that.alreadyCheck();
            }, 500);
        }
      });
    },
    openBack: function(item, index) {
      this.type = "org";
      this.addressArr = this.addressArr.splice(0, index + 1);
      if (item.pk == "0") {
        this.loadOrg();
      } else {
        this.loadDept(item.innercode, item.type);
      }
    },
    setAddressArr: function(item) {
      this.addressArr.push({
        innercode: item.innercode,
        name: item.name,
        type: item.type
      });
    },
    loadOrg: function() {
      let that = this;
      that
        .post("/app/approvedRest/getOrgList", {
          userId: this.userId,
          withPsnCount: "Y"
        })
        .then(data => {
          if (data.result == "success") {
            that.list = JSON.parse(data.responcontext);
          }
        });
    },
    loadDept: function(innercode, type) {
      let that = this;
      that
        .post("/app/approvedRest/getOrgDeptList", {
          userId: this.userId,
          type: type,
          pk: innercode,
          level: "1",
          withPsnCount: "Y"
        })
        .then(data => {
          if (data.result == "success") {
            if (data.responcontext) {
              that.list = JSON.parse(data.responcontext);
            }
          }
        });
    },
    handleSelectionChange: function(item, row) {
      let selectArr = this.selectArr;
      if(this.multi){//多选
        
            let filterArr = selectArr.filter(function(select) {
              return select.pk_psndoc == row.pk_psndoc;
            });
            if (filterArr.length > 0) {
              this.selectArr = selectArr.filter(function(sele) {
                return sele.pk_psndoc != row.pk_psndoc;
              });
            } else {
              this.selectArr.push(row);
            }
      }else{
              selectArr = [];
              selectArr.push(item);
              this.selectArr = selectArr;
      }
    
    },
    loadPeople: function(item) {
      let that = this;
      that
        .post("/app/approvedRest/getPsnList", {
          userId: that.userId,
          pk: item.pk,
          level: "0",
          type: "DEPT",
          condition: ""
        })
        .then(data => {
          if (data.responcontext) {
            that.type = "people";

            that.list = JSON.parse(data.responcontext);
            setTimeout(() => {
                 that.alreadyCheck();
            }, 500);
         
          }
        });
    },
    alreadyCheck: function() {
      let  list = this.list;
      for (let index = 0; index < list.length; index++) {
        const element = list[index];
        let alreadyArr = this.selectArr.filter(function(select){
          return element.cuserid == select.cuserid;
        });
        if(alreadyArr.length>0){
          this.$refs.multipleTable.toggleRowSelection(list[index],true);
        }
      }
      return list;
    },
    openNext: function(item) {
     
      if (item.psncountwithsub == item.psncount && item.type != "ORG") {
        //判断是否下一级是人
        this.loadPeople(item);
      } else {
        this.loadDept(item.pk, item.type);
      }
      this.setAddressArr(item);
    },


  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style >
.breadcrumb-out {
  margin-top: 10px;
  margin-bottom: 10px;
}
.el-dialog__body {
  height: 64%;
}
.el-table-dl {
  width: 100%;
  height: 370px;
  overflow-y: scroll;
}
.el-input-div {
  width: 70%;
}
.dl-button {
  margin-left: 50px;
}
.dl-button-out {
  position: fixed;
  bottom: 0px;
  line-height: 65px;
  width: 99%;
  height: 65px;
  background-color: #fff;
}
.dl-select {
  margin-right: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>
