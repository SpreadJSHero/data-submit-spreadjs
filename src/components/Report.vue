<template>
  <div id="designer-container"></div>
</template>
 
<script>
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { getSummaryData, getReportConfig, loadReport } from "../utils/common"

export default defineComponent({
  setup() {
    let router = useRouter()
    let spread = null
    let designer

    const host = ref(null)
    return {
      host,
      router,
      spread,
      designer
    }
  },
  mounted() {
    this.initWorkbook()
  },
  methods: {
    async initWorkbook() {
      let config = getReportConfig(this.designer, this.router)
      this.designer = new GC.Spread.Sheets.Designer.Designer("designer-container", config)
      this.$nextTick(()=>{
        this.designer.refresh()
      })
      await loadReport(this.designer, this.router.currentRoute.value.query.template);

      this.spread = this.designer.getWorkbook();
      let data = await getSummaryData(this.router.currentRoute.value.query.template)

      if(data && data.length){
        let dataManager = this.spread.dataManager();
        var myTable = dataManager.addTable("汇总数据", {
          data: data
        })
      }

    const reportSheet = this.spread.addSheetTab(0, 'Report1', GC.Spread.Sheets.SheetType.reportSheet);
    reportSheet.renderMode('Design');
    this.spread.setActiveSheetTab('Report1')
    this.designer.refresh();
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