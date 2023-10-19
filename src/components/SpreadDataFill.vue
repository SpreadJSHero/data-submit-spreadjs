<template>
  <el-row class="h-40" align="middle" justify="end">
    <el-popover placement="bottom" :width="200" hide-after="50" trigger="hover">
      <template #reference>
        <el-button type="success" class="save-button" style="margin-right: 16px">在移动端填报</el-button>
      </template>
      <div class="mb-2 flex items-center text-sm">
        <div class="flex-center">请扫码查看</div>
        <canvas id="qrcode"></canvas>
        <div class="flex-center">
          <span>或：</span>
          <a target="_blank" :href="mobileHref">直接打开页面</a>
        </div>
      </div>
    </el-popover>
    <el-col :span="2">
      <div class="flex-right" style="margin-right: 50px">
        <el-button type="success" class="save-button" @click="handleSubmitData">保存</el-button>
      </div>
    </el-col>
  </el-row>
  <el-divider />
  <common-dialog :title="title" :detail="detail" :hasShow='hasShow' :showCancel="false" :confirmEvent="closeDialog"></common-dialog>
  <div id="sheet-container"></div>
</template>

<script>
import { reactive, toRefs, ref, unref, defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { loadTemplate, initialTemplateData, setVersion } from "../utils/common"
import { saveRecord } from "../utils/dbManager"
import { ElMessage } from 'element-plus';
import commonDialog from "./commonDialog.vue"
import { SUCCESS } from "../config/constantValue"
import QRCode from "qrcode"

export default defineComponent({
  components: {
    commonDialog
  },

  setup() {
    let spread = null
    let router = useRouter()
    const reactiveData = reactive({
      title: "保存成功",
      detail: "请切换至管理员界面查看填报进度",
      hasShow: false
    })
    // 路由监听，切换文件
    watch(
      () => router.currentRoute.value.query.template, (newValue) => {
        if (newValue == 'customDesigner') {
          spread.clearSheets()
          spread.addSheet(0, new GC.Spread.Sheets.Worksheet("自定义设计"))
        } else {
          loadTemplate(spread, newValue).then(initialTemplateData())
        }
      }
    )

    /**关闭当前页*/
    const closeWindow = () => { window.close() }

    /**关闭提示框 */
    const closeDialog = () => { reactiveData.hasShow = false }

    const isPhone = () => {
      let userAgent = navigator.userAgent
      return /mobile/i.test(userAgent)
    }

    const host = ref(null)
    return {
      router,
      spread,
      closeWindow,
      closeDialog,
      isPhone,
      host,
      ...toRefs(reactiveData)
    }
  },
  mounted() {
    setVersion()
    this.initQrCode()
    this.initWorkbook()
  },
  data() {
    return {
      inputMoveUp: true,
      preventRangeSelect: true,
      preventSelectLockedCell: true,
      scrollByPixel: true,
      mobileHref: ""
    }
  },
  methods: {
    initQrCode() {
      let qrCanvas = document.getElementById("qrcode")
      let query = this.router.currentRoute.value.query
      let queryStr = ""
      Object.keys(query).forEach(key => {
        queryStr += key + "=" + query[key] + "&"
      })
      this.mobileHref = window.location.href.split("#")[0] + "#/mobileFill?" + queryStr
      QRCode.toCanvas(qrCanvas, this.mobileHref)
    },
    async initWorkbook() {
      this.spread = new GC.Spread.Sheets.Workbook("sheet-container")
      this.host = this.spread.getHost()
      this.host.style.height = "calc(100vh - 200px)"
      let templateName = this.router.currentRoute.value.query.template
      await loadTemplate(this.spread, templateName)
      initialTemplateData(this.spread, this.router)
    },
    /**保存填报数据 */
    async handleSubmitData() {
      let { template, user } = this.router.currentRoute.value.query
      if (!template || !user) {
        ElMessage({ message: '模板或用户名称不存在', type: 'error' })
      } else {
        let result = await saveRecord(template, user, this.spread.getActiveSheet().getDataSource().getSource())
        if (result == SUCCESS) {
          this.hasShow = true
        } else {
          ElMessage({ message: '保存失败', type: 'error' })
        }
      }
    }
  }
})
</script>

<style>
.operate-buttons {
  height: 40px;
}

.el-switch {
  margin-top: 0;
}

.save-button {
  background-color: #f28e41;
  border-color: #ffb852;
  padding: 10px 18px;
  font-size: 14px;
}

.save-button:hover {
  background-color: #ffb852;
  border-color: #ffb852
}

.el-main::-webkit-scrollbar {
  display: none;
}

.el-divider--horizontal {
  margin: 0;
}

.switch-label {
  width: 140px;
  display: inline-block;
}

.flex-right {
  display: flex;
  justify-content: flex-end;
}

.flex-center {
  display: flex;
  justify-content: center;
}

.h-40 {
  height: 40px;
}
</style>