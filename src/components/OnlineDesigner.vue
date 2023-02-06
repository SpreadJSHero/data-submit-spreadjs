<template>
  <gc-spread-sheets-designer id="designer-container"/>
</template>
<script>
import { defineComponent } from 'vue'
import * as GC from "@grapecity/spread-sheets";
import "@grapecity/spread-sheets-tablesheet";
import "@grapecity/spread-excelio"
import "@grapecity/spread-sheets-charts"
import "@grapecity/spread-sheets-print"
import "@grapecity/spread-sheets-resources-zh"
import "@grapecity/spread-sheets-pdf"
import "@grapecity/spread-sheets-barcode"
import "@grapecity/spread-sheets-languagepackages"
import "@grapecity/spread-sheets-shapes"
import "@grapecity/spread-sheets-pivot-addon"
import "@grapecity/spread-sheets-designer-resources-cn"
import "@grapecity/spread-sheets-designer"
import "@grapecity/spread-sheets-designer/styles/gc.spread.sheets.designer.min.css";
import '@grapecity/spread-sheets/styles/gc.spread.sheets.excel2013white.css';
import Designer from "@grapecity/spread-sheets-designer-vue"

export default defineComponent({
  components:{
    'gc-spread-sheets-designer': Designer,
  }

}) 
</script>
<style>
  #designer-container{
    height: 90vh;
  }
</style>