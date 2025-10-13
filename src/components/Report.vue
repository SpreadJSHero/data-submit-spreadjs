<template>
  <div id="designer-container"></div>
</template>
 
<script>
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { getSummaryData } from "../utils/common"

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
      this.designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
      this.$nextTick(()=>{
        this.designer.refresh()
      })
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