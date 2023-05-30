
<template>
  <div id="designer-container"></div>
  <el-dialog v-model="distributeVisible" size="small" @opened="initUser()">
    <template #header>
      <h4>请选择人员</h4>
    </template>
    <el-table :data="users" :width="700">
      <el-table-column prop="userName" label="姓名" width="180" />
      <el-table-column label="状态" width="300">
        <template #default="scope"> {{ scope.row.status ? "已填报" : "未填报" }} </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button type="primary" @click="openFillPage(scope.row)"> {{ scope.row.status ? "查看" : "下发" }}</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>
<script>
import { defineComponent, reactive, ref, watch } from 'vue'
import { getPreivewConfig, loadTemplate } from "../utils/common"
import baseSetting from "../config/baseSetting"
import { useRouter } from "vue-router"
import localforage from "localforage";

import Intro from "../utils/intro"

export default defineComponent({
  setup() {
    let designer, spread
    let distributeVisible = ref(false)
    let router = useRouter()

    let config = getPreivewConfig(distributeVisible, router)

    function openFillPage(user) {
      let url = `http://${window.location.host}${window.location.pathname}#/fill?template=${router.currentRoute.value.query.template}&user=${user.userName}`
      window.open(url, "_blank")
    }

    return {
      designer,
      spread,
      config,
      router,
      distributeVisible,
      openFillPage,
    }
  },
  data() {
    return {
      users: []
    }
  },
  mounted() {
    this.initDesigner()
    this.initUser()
  },
  methods: {
    initDesigner() {
      this.designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
      this.designer.setConfig(this.config)
      this.spread = this.designer.getWorkbook();
      loadTemplate(this.spread, this.router.currentRoute.value.query.template, this.designer)
      this.router.currentRoute.value.query.template === "customDesigner" ? Intro.customDesignIntro(this.designer) : Intro.designerIntro(this.designer);
      document.querySelector('li[data-id="fill-custom"]').click()

      // 路由监听，切换文件
      watch(
        () => this.router.currentRoute.value.query.template, async (newValue) => {
          await loadTemplate(this.spread, newValue, this.designer);
          if (newValue == 'customDesigner') {
            Intro.customDesignIntro(this.designer)
          }
        }
      )
    },
    async initUser() {
      console.log("initUser")
      let fillInfo = {}
      // let router = useRouter()
      this.users = baseSetting.users.filter(v => {
        return !v.isAdmin
      })
      for (let i = 0; i < this.users.length; i++) {
        let u = this.users[i]
        let res = await localforage.getItem(this.router.currentRoute.value.query.template + "-" + u.userName)
        fillInfo[u.userName] = !!res
      }
      console.log(fillInfo)
      this.users = this.users.map(v => {
        return {
          ...v,
          status: !!fillInfo[v.userName]
        }
      })
    }
  }
}) 
</script>
<style>
#designer-container {
  height: calc(100vh - 140px);
}


.distribute-icon {
  background: url("../assets/distribute.png");
  background-size: 35px 35px;
}

.checksummary-icon {
  background: url("../assets/summary.png");
  background-size: 35px 35px;
}

.save-template-icon {
  background: url("../assets/save.png");
  background-size: 35px 35px;
}

.clear-local-icon {
  background: url("../assets/clear.png");
  background-size: 35px 35px;
}


/* dirver.js
div#driver-page-overlay{
  transition: all 0.2;
}
div#driver-highlighted-element-stage {
  transition: all 0.2;
} */
</style>