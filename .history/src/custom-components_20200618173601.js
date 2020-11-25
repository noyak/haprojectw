import selectPeople from  "./components/selectPeople.vue"
import rejectApprove from  "./components/rejectApprove.vue"
export default (Vue)=>{
    Vue.component("select-people", selectPeople)
    Vue.component("reject-approve", rejectApprove)
  }