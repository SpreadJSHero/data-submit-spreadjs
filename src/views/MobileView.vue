<template>
    <el-row class="h-40" align="middle" justify="space-between">
        <el-col :span="16">
            <el-button size="small" :disabled="!canUndo" type="primary" @click="undo()">撤销</el-button>
            <el-button size="small" :disabled="!canRedo" type="primary" @click="redo()">回退</el-button>
            <el-button size="small" type="primary" @click="prev()">上一个</el-button>
            <el-button size="small" type="primary" @click="next()">下一个</el-button>
        </el-col>
        <el-col :span="8">
            <el-row align="midddle" justify="end">
                <el-col :span="10">
                    <el-popover ref="popoverRef" placement="bottom" :width="300" hide-after="50" trigger="click">
                        <template #reference>
                            <el-button size="small" type="success" style="margin-right: 16px">配置</el-button>
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
                            <div>
                                <span class="switch-label">移动后直接开启编辑</span>
                                <el-switch @change="prevNextStartEditingChange" v-model="prevNextStartEditing" inline-prompt active-text="是" inactive-text="否" />
                            </div>
                        </div>
                    </el-popover>
                </el-col>
                <el-col :span="10">
                    <el-button size="small" type="success" @click="handleSubmitData">保存</el-button>
                </el-col>
            </el-row>
        </el-col>
    </el-row>
    <el-divider />
    <common-dialog :title="title" :detail="detail" :hasShow='hasShow' :confirmEvent="closeWindow" :cancelEvent="closeDialog"></common-dialog>
    <div id="sheet-container"></div>
</template>
  
<script>
import { ref, defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { loadTemplate, initialTemplateData, setVersion } from "../utils/common"
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
        setVersion()
        this.initWorkbook()
    },
    data() {
        return {
            inputMoveUp: true,
            preventRangeSelect: true,
            preventSelectLockedCell: true,
            scrollByPixel: true,
            scrollBarMobileStatus: true,
            canUndo: false,
            canRedo: false,
            prevNextStartEditing: true,
            selRow: 0,
            selCol: 0,
            selectedSpan: null,
            direction: null,
            count: 0
        }
    },
    watch: {
        selectedSpan(newValue, oldValue) {
            if (!oldValue || !newValue) {
                return
            }
            let sheet = this.spread.getActiveSheet()
            if (oldValue.row == newValue.row && oldValue.col == newValue.col) {
                this.spread.suspendPaint()
                this.count++
                sheet.endEdit(true)
                this[this.direction]()
                return
            }
            while (this.count > 0) {
                this.spread.resumePaint()
                this.count--

            }
            if (this.prevNextStartEditing) {
                sheet.setActiveCell(this.selRow, this.selCol)
                sheet.startEdit(false)
            }

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
            this.listenAction()
            this.handleMobileFill()
        },
        listenAction() {
            this.spread.commandManager().addListener("myListener", () => {
                let cmdMgr = this.spread.undoManager()
                this.canUndo = cmdMgr.canUndo()
                this.canRedo = cmdMgr.canRedo()
            })
            this.spread.getActiveSheet().bind(GC.Spread.Sheets.Events.SelectionChanged, (e, info) => {
                this.selRow = info.newSelections[0].row
                this.selCol = info.newSelections[0].col
            });
        },
        undo() {
            let cmdMgr = this.spread.undoManager()
            cmdMgr.undo()
            this.canUndo = cmdMgr.canUndo()
            this.canRedo = cmdMgr.canRedo()
        },
        redo() {
            let cmdMgr = this.spread.undoManager()
            cmdMgr.redo()
            this.canUndo = cmdMgr.canUndo()
            this.canRedo = cmdMgr.canRedo()
        },
        prev() {
            this.direction = "prev"
            let sheet = this.spread.getActiveSheet()
            let colCount = sheet.getColumnCount()
            let rowCount = sheet.getRowCount()
            let curSelect = sheet.getSpan(this.selRow, this.selCol)
            let start_row = this.selRow
            let start_col = this.selCol - 1
            if (curSelect && curSelect.colCount > 1) {
                start_col = curSelect.col - 1
            }
            let isBreak = false
            let r = start_row, c = start_col
            for (; r >= 0; r--) {
                for (; c >= 0; c--) {
                    let span = sheet.getSpan(r, c)
                    if (span) {
                        // 第一次抵达此span
                        if (span.col + span.colCount - 1 == c) {
                            let style = sheet.getActualStyle(span.row, span.col)
                            if (!style.locked) {
                                sheet.setSelection(span.row, span.col, 1, 1)
                                sheet.showCell(span.row, span.col, GC.Spread.Sheets.VerticalPosition.nearest, GC.Spread.Sheets.HorizontalPosition.nearest)
                                this.selCol = span.col
                                this.selectedSpan = {
                                    row: span.row,
                                    col: span.col
                                }
                                if (this.prevNextStartEditing) {
                                    sheet.setActiveCell(span.row, span.col)
                                    sheet.startEdit(false)
                                }
                                isBreak = true
                                break
                            }
                        } else {
                            c = span.col - 1
                            this.selCol = c
                        }
                    } else {
                        let style = sheet.getActualStyle(r, c)
                        if (!style.locked) {
                            sheet.setSelection(r, c, 1, 1)
                            sheet.showCell(r, c, GC.Spread.Sheets.VerticalPosition.nearest, GC.Spread.Sheets.HorizontalPosition.nearest)
                            this.selCol = c
                            if (this.prevNextStartEditing) {
                                sheet.setActiveCell(r, c)
                                sheet.startEdit(false)
                            }
                            isBreak = true
                            break
                        }
                    }
                    this.selCol = c
                }
                if (isBreak) {
                    break
                }
                this.selRow = r - 1
                this.selCol = colCount - 1
                c = colCount - 1
            }
            if (!isBreak) {
                this.selRow = rowCount
                this.selCol = colCount
                this.prev()
            }

        },
        next() {
            this.direction = "next"
            let sheet = this.spread.getActiveSheet()
            let rowCount = sheet.getRowCount()
            let colCount = sheet.getColumnCount()
            let curSelect = sheet.getSpan(this.selRow, this.selCol)
            let start_row = this.selRow
            let start_col = this.selCol + 1
            if (curSelect && curSelect.colCount > 1) {
                start_col = curSelect.col + curSelect.colCount
            }
            let isBreak = false
            let r = start_row, c = start_col
            for (; r < rowCount; r++) {
                for (; c < colCount; c++) {
                    let span = sheet.getSpan(r, c)
                    if (span) {
                        // 第一次抵达此span
                        if (span.col == c) {
                            let style = sheet.getActualStyle(r, c)
                            if (!style.locked) {
                                sheet.setSelection(r, c, 1, 1)
                                sheet.showCell(r, c, GC.Spread.Sheets.VerticalPosition.nearest, GC.Spread.Sheets.HorizontalPosition.nearest)
                                this.selCol = c
                                this.selectedSpan = {
                                    row: span.row,
                                    col: span.col
                                }
                                if (this.prevNextStartEditing) {
                                    sheet.setActiveCell(r, c)
                                    sheet.startEdit(false)
                                }
                                isBreak = true
                                break
                            }
                        } else {
                            c = span.col + span.colCount
                            this.selCol = c
                        }
                    } else {
                        let style = sheet.getActualStyle(r, c)
                        if (!style.locked) {
                            sheet.setSelection(r, c, 1, 1)
                            sheet.showCell(r, c, GC.Spread.Sheets.VerticalPosition.nearest, GC.Spread.Sheets.HorizontalPosition.nearest)
                            this.selCol = c
                            if (this.prevNextStartEditing) {
                                sheet.setActiveCell(r, c)
                                sheet.startEdit(false)
                            }
                            isBreak = true
                            break
                        }
                    }
                    this.selCol = c
                }
                if (isBreak) {
                    break
                }
                this.selRow = r + 1
                this.selCol = 0
                c = 0
            }
            if (!isBreak) {
                this.selRow = 0
                this.selCol = 0
                this.next()
            }
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
        prevNextStartEditingChange(value) {
            this.prevNextStartEditing = value
        },
        /**保存填报数据 */
        async handleSubmitData() {
            let { template, user } = this.router.currentRoute.value.query
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