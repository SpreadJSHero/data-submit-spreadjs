<template>
    <el-row class="h-40" align="middle" justify="space-between">
        <el-popover ref="popoverRef" placement="bottom" :width="300" hide-after="50" trigger="click">
            <template #reference>
                <el-button type="success" class="save-button" style="margin-right: 16px">点击配置移动端适配项</el-button>
            </template>
            <div class="mb-2 flex items-center text-sm">
                <div>
                    <span class="switch-label">输入时页面上移</span>
                    <el-switch @change="inputMoveUpChange" v-model="inputMoveUp" inline-prompt active-text="是" inactive-text="否" />
                </div>
                <div>
                    <span class="switch-label">禁用区域选择</span>
                    <el-switch @change="preventRangeSelectChange" v-model="preventRangeSelect" inline-prompt active-text="是" inactive-text="否" />
                </div>
                <div>
                    <span class="switch-label">禁止选择保护单元格</span>
                    <el-switch @change="preventSelectLockedCellChange" v-model="preventSelectLockedCell" inline-prompt active-text="是" inactive-text="否" />
                </div>
                <div>
                    <span class="switch-label">开启像素滚动</span>
                    <el-switch @change="scrollByPixelChange" v-model="scrollByPixel" inline-prompt active-text="是" inactive-text="否" />
                </div>
                <div>
                    <span class="switch-label">移动端滚动条</span>
                    <el-switch @change="scrollBarMobileStatusChange" v-model="scrollBarMobileStatus" inline-prompt active-text="是" inactive-text="否" />
                </div>
            </div>
        </el-popover>
        <el-col :span="2">
            <div class="flex-right">
                <el-button type="success" class="save-button" @click="handleSubmitData">保存</el-button>
            </div>
        </el-col>
    </el-row>
    <el-divider />
    <common-dialog :title="title" :detail="detail" :hasShow='hasShow' :confirmEvent="closeWindow" :cancelEvent="closeDialog"></common-dialog>
    <div id="sheet-container"></div>
</template>
  
<script>
import { ref, defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { loadTemplate, initialTemplateData } from "../utils/common"
import { saveRecord } from "../utils/dbManager"
import { ElMessage } from 'element-plus';
import commonDialog from "../components/commonDialog.vue"
import { SUCCESS } from "../config/constantValue"

export default defineComponent({
    components: {
        commonDialog
    },

    setup() {
        let spread = null
        let router = useRouter()
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


        const host = ref(null)
        return {
            router,
            spread,
            closeWindow,
            host
        }
    },
    mounted() {
        this.initWorkbook()
    },
    data() {
        return {
            inputMoveUp: true,
            preventRangeSelect: true,
            preventSelectLockedCell: true,
            scrollByPixel: true,
            scrollBarMobileStatus: true
        }
    },
    methods: {
        async initWorkbook() {
            this.spread = new GC.Spread.Sheets.Workbook("sheet-container")
            this.host = this.spread.getHost()
            this.host.style.height = "calc(100vh - 40px)"
            let templateName = this.router.currentRoute.value.query.template
            await loadTemplate(this.spread, templateName)
            initialTemplateData(this.spread, this.router)
            this.handleMobileFill()
        },
        handleMobileFill() {
            this.addPopoverEvent()
            this.inputMoveUpChange(true)
            this.preventRangeSelectChange(true)
            this.preventSelectLockedCellChange(true)
            this.scrollByPixelChange(true)
            this.scrollBarMobileStatusChange(true)
        },
        //  处理弹出框事件
        addPopoverEvent() {
            this.host.style.height = "calc(100vh - 40px)"
            this.host.style.width = "100vw"
            this.host.style.position = "absolute"
            this.host.style.top = "40px"
            this.host.style.left = "0"
            for (let i = 0; i < this.spread.getSheetCount(); i++) {
                let sheet = this.spread.getSheet(i)
                sheet.bind(GC.Spread.Sheets.Events.CellClick, () => {
                    this.$refs.popoverRef.hide()
                });
                sheet.bind(GC.Spread.Sheets.Events.TopRowChanged, () => {
                    this.$refs.popoverRef.hide()
                });
                sheet.bind(GC.Spread.Sheets.Events.ViewZoomed, () => {
                    this.$refs.popoverRef.hide()
                });
            }
        },
        // 编辑时滚动到合适位置
        inputMoveUpChange(value) {
            for (let i = 0; i < this.spread.getSheetCount(); i++) {
                let sheet = this.spread.getSheet(i)
                sheet.unbind(GC.Spread.Sheets.Events.EditStarting);
            }
            if (!value) {
                return
            }
            for (let i = 0; i < this.spread.getSheetCount(); i++) {
                let sheet = this.spread.getSheet(i)
                sheet.bind(GC.Spread.Sheets.Events.EditStarting, function (sender, args) {
                    let rect = sheet.getCellRect(args.row, args.col)
                    sheet.scroll(rect.y - 50, 0)
                });
            }
        },
        // 禁止区域选择
        preventRangeSelectChange(value) {
            let policy = value ? GC.Spread.Sheets.SelectionPolicy.single : GC.Spread.Sheets.SelectionPolicy.range
            for (let i = 0; i < this.spread.getSheetCount(); i++) {
                this.spread.getSheet(i).selectionPolicy(policy)
            }
        },
        // 禁止选择保护的单元格
        preventSelectLockedCellChange(value) {
            for (let i = 0; i < this.spread.getSheetCount(); i++) {
                let sheet = this.spread.getSheet(i)
                sheet.options.protectionOptions.allowSelectLockedCells = !value
            }
        },
        // 开启像素滚动
        scrollByPixelChange(value) {
            this.spread.options.scrollByPixel = value
            this.spread.options.scrollPixel = 1
        },
        scrollBarMobileStatusChange(value) {
            this.spread.options.scrollbarAppearance = Number(value)
            this.spread.options.scrollbarMaxAlign = value
        },
        /**保存填报数据 */
        async handleSubmitData() {
            let { template, user } = this.router.currentRoute.value.query
            console.log(template, user)
            if (!template || !user) {
                ElMessage({ message: '模板或用户名称不存在', type: 'error' })
            } else {
                let result = await saveRecord(template, user, this.spread.getActiveSheet().getDataSource().getSource())
                if (result == SUCCESS) {
                    ElMessage({ message: '保存成功', type: 'success' })
                } else {
                    ElMessage({ message: '保存失败', type: 'error' })
                }
            }
        }
    }
})
</script>
  
<style>
body {
    overflow: hidden;
}

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