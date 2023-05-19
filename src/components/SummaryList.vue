<template>
  <el-row class="operate-buttons" align="middle">
    <el-col :span="6" :offset="18">
      <el-button type="success" class="save-button" @click="callPreview">返回模板预览</el-button>
    </el-col>
  </el-row>
  <gc-spread-sheets @workbookInitialized="initWorkbook"></gc-spread-sheets>
</template>
 
<script>
import { reactive, toRefs, defineComponent } from 'vue'
import { useRouter } from 'vue-router'
 import * as GC from "@grapecity/spread-sheets";
 import "@grapecity/spread-excelio"
 import "@grapecity/spread-sheets-resources-zh"
 import '@grapecity/spread-sheets/styles/gc.spread.sheets.excel2013white.css';
 import {GcSpreadSheets} from "@grapecity/spread-sheets-vue"
import { executeSummary } from "../utils/common"

export default defineComponent({
  components:{
     GcSpreadSheets
   },
  setup() {
    let router = useRouter()
    let spread = null
    //  返回模板预览
    const callPreview = () => {
      router.push({
        path: "/preview",
        query: {
          template: router.currentRoute.value.query.template
        }
      })
    }
    const host = ref(null)
    return {
      host,
      router,
      spread,
      callPreview
    }
  },
  methods: {
    initWorkbook(spread) {
      this.spread = spread
      this.host = this.spread.getHost()
      this.host.style.height = "calc(100vh - 190px)"
      this.$nextTick(()=>{
        this.spread.refresh()
      })
      executeSummary(this.spread, this.router)
      // 路由监听，切换文件
      watch(
        () => this.router.currentRoute.value.query.template, (newValue) => {
          if (newValue == 'customDesigner') {
            this.spread.clearSheets()
            this.spread.addSheet(0, new GC.Spread.Sheets.Worksheet("自定义设计"))
          } else {
            executeSummary(this.spread, this.router)
          }
        }
      )
    }
  }
})
</script>
 
<style>
.operate-buttons {
  border-bottom: 1px solid #ddd;
  height: 40px;
}
</style>