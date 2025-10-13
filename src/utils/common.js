import { BusinessType, RecordsData } from "../models"
import { ElMessage } from "element-plus"
import { getRecord, getTemplateReocords, clearAll } from './dbManager'
import baseSetting from "../config/baseSetting"
import localforage from "localforage"
const initialPrefix = "initial"

function getImageBase64(src) {
    let arr = src.split('.')
    let ext = arr[arr.length - 1]
    return new Promise((resolve, reject) => {
        try {
            let img = new Image();
            img.setAttribute("crossOrigin", 'Anonymous')
            img.src = src;
            img.onload = function () {
                var canvas = document.createElement("canvas");   //创建canvas DOM元素，并设置其宽高和图片一样
                canvas.width = img.width;
                canvas.height = img.height;
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, img.width, img.height); //使用画布画图
                var dataURL = canvas.toDataURL("image/" + ext);  //返回的是一串Base64编码的URL并指定格式
                canvas = null; //释放
                resolve(dataURL)
            }
            img.onerror = function () {
                resolve("")
            }
        }
        catch {
            resolve("")
        }
    });
}

function getPreivewConfig(distributeVisible, router) {

    let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig));
    config.ribbon.push({
        id: "fill-custom",
        text: "填报命令（定制按钮）",
        buttonGroups: [{
            label: "操作",
            thumbnailClass: "ribbon-thumbnail-editing",
            commandGroup: {
                children: ["saveTemplate", "distributeTask", "checkSummaryResult"]
            }
        },
        {
            label: "数据",
            commandGroup: {
                children: ["clearLocalData"]
            }
        },
        {
            label: "分析",
            commandGroup: {
                children: ["createDataReport"]
            }
        }]
    })
    config.commandMap = {
        saveTemplate: {
            title: "保存填报模板",
            text: "保存模板",
            iconClass: "save-template-icon",
            bigButton: true,
            commandName: "saveTemplate",
            execute: function (designer) {
                let binding = designer.getData("updatedTreeNode") || designer.getData("treeNodeFromJson") || designer.getData("oldTreeNodeFromJson")
                let json = designer.getWorkbook().toJSON()
                json.designerBindingPathSchema = JSON.parse(binding)
                let key = 'temp_' + router.currentRoute.value.query.template
                localforage.setItem(key, JSON.stringify(json))
                ElMessage.success("保存成功！")
            }
        },
        distributeTask: {
            title: "下发填报任务",
            text: "下发任务",
            iconClass: "distribute-icon",
            bigButton: true,
            commandName: "distributeTask",
            execute: function () {
                distributeVisible.value = true
            }
        },
        checkSummaryResult: {
            title: "查看汇总结果",
            text: "查看汇总",
            iconClass: "checksummary-icon",
            bigButton: true,
            commandName: "checkSummaryResult",
            execute: function () {
                router.push({
                    path: "/summary",
                    query: {
                        template: router.currentRoute.value.query.template
                    }
                })
            }
        },
        clearLocalData: {
            title: "清除本地数据",
            text: "清除数据",
            iconClass: "clear-local-icon",
            bigButton: true,
            commandName: "clearLocalData",
            execute: function () {
                localStorage.clear()
                clearAll();
            }
        },
        createDataReport: {
            title: "通过报表分析汇总数据",
            text: "报表分析",
            iconClass: "datarepory-icon",
            bigButton: true,
            commandName: "createDataReport",
            execute: function (designer) {
                let url = `http://${window.location.host}${window.location.pathname}#/report?template=${router.currentRoute.value.query.template}`
                window.open(url, "_blank")
            }
        },
    }
    return config
}

// 加载文件
const loadTemplate = async (spread, fileName, designer) => {
    let templateStr = await BusinessType.getTemplate(fileName)
    let template = JSON.parse(templateStr)
    spread.fromJSON(template)
    if (!designer) {
        return;
    }
    if (designer && template.designerBindingPathSchema) {
        designer.setData("treeNodeFromJson", JSON.stringify(template.designerBindingPathSchema))
        designer.setData("oldTreeNodeFromJson", JSON.stringify(template.designerBindingPathSchema))
        designer.setData("updatedTreeNode", JSON.stringify(template.designerBindingPathSchema));
    }
    designer.refresh();
}

const initialTemplateData = async (spread, router) => {
    // 加载初始绑定数据
    let template = router.currentRoute.value.query.template
    let user = router.currentRoute.value.query.user
    if (!template) {
        ElMessage({
            message: "填报模板为空,请检查路由参数",
            type: 'error'
        })
    } else if (!user) {
        ElMessage({
            message: "填报人员为空，请检查路由参数",
            type: 'error'
        })
    } else {
        //  当template和user都存在时，先查询localForage,如果没有当前用户记录，返回默认数据
        let result = await getRecord(template, user)
        // 当前模板的默认参数名称
        let defaultKey = initialPrefix + template[0].toUpperCase() + template.substr(1)
        let initialData = Object.assign(baseSetting[defaultKey], {
            name: user
        })
        if (result) {
            initialData = result
        }

        let sheet = spread.getActiveSheet()
        spread.bind(GC.Spread.Sheets.Events.TableRowsChanged, function (e, data) {
            let table = data.table
            let dr = table.dataRange()
            data.sheet.getRange(dr.row, dr.col, dr.rowCount, dr.colCount).locked(false)
            data.sheet.copyTo(dr.row, dr.col, dr.row + data.row + 1, dr.col, data.count, dr.colCount, GC.Spread.Sheets.CopyToOptions.style)

            for (let col = dr.col; col < dr.col + dr.colCount;) {
                let span = data.sheet.getSpan(dr.row + data.row, col)
                if (span) {
                    for (let rc = 1; rc <= data.count; rc++) {
                        data.sheet.addSpan(dr.row + data.row + rc, col, span.rowCount, span.colCount)
                        col = col + span.colCount
                    }
                } else {
                    col++
                }
            }

        });
        sheet.bind(GC.Spread.Sheets.Events.ValueChanged, function (e, info) {
            let curSheet = info.sheet
            let isValid = curSheet.isValid(info.row, info.col, info.newValue)
            if (!isValid) {
                curSheet.setValue(info.row, info.col, info.oldValue)
                let validator = curSheet.getDataValidator(info.row, info.col)
                ElMessage.error(validator.errorMessage())
            }
        })
        sheet.tables.all().forEach(table => {
            let dr = table.dataRange()
            let path = table.bindingPath()
            if (path && !initialData[path]) {
                initialData[path] = [{}]
            }
            sheet.getRange(dr.row, dr.col, dr.rowCount, dr.colCount).locked(false)
            for (let curRow = dr.row + 1; curRow < dr.row + dr.rowCount; curRow++) {
                sheet.copyTo(dr.row, dr.col, curRow, dr.col, 1, dr.colCount, GC.Spread.Sheets.CopyToOptions.style)
            }
        })
        let source = new GC.Spread.Sheets.Bindings.CellBindingSource(initialData)
        sheet.setDataSource(source)
        sheet.tables.all().forEach(table => {
            let dr = table.dataRange()
            let path = table.bindingPath()
            if (path && !initialData[path]) {
                initialData[path] = [{}]
            }
            sheet.getRange(dr.row, dr.col, dr.rowCount, dr.colCount).locked(false)
            for (let curRow = dr.row + 1; curRow < dr.row + dr.rowCount; curRow++) {
                sheet.copyTo(dr.row, dr.col, curRow, dr.col, 1, dr.colCount, GC.Spread.Sheets.CopyToOptions.style)
            }

            for (let col = dr.col; col < dr.col + dr.colCount;) {
                let span = sheet.getSpan(dr.row, col)
                console.log(span)
                if (span) {
                    for (let rc = dr.row + 1; rc < dr.row + dr.rowCount; rc++) {
                        console.log(rc, col, span.rowCount, span.colCount)
                        sheet.addSpan(rc, col, span.rowCount, span.colCount)
                    }
                    col = col + span.colCount
                } else {
                    col++
                }
            }
        })
    }
}

/***
 * 判断返回结果是字段是否存在为数组的情况
 */
const hasArrObject = (record) => {
    if (!record) {
        return []
    }
    let arrIndex = []
    Object.keys(record).forEach((key, index) => {
        if (record[key] instanceof Array) {
            arrIndex.push(index)
        }
    })
    return arrIndex
}

const hasObjItem = (record) => {
    if (!record) {
        return []
    }
    let itemIndex = []
    Object.keys(record).forEach((key, index) => {
        if (!Array.isArray(record[key]) && typeof record[key] == 'object') {
            itemIndex.push(index)
        }
    })
    return itemIndex
}

/**对应列设置多选选择器 */
const setMulitpleColumn = (row, col, sheet) => {
    let dataSource = sheet.getValue(row, col)
    let style = new GC.Spread.Sheets.Style()
    style.cellButtons = [
        {
            imageType: GC.Spread.Sheets.ButtonImageType.dropdown,
            command: "openMultiColumn",
            useButtonStyle: true,
        }
    ];
    style.dropDowns = [
        {
            type: GC.Spread.Sheets.DropDownType.multiColumn,
            option: {
                dataSource: dataSource,
            }
        }
    ];
    style.formatter = '=PROPERTY(@, "type")';
    sheet.setStyle(row, col, style)
}

const setObjCellFormat = (row, col, sheet) => {
    let obj = sheet.getValue(row, col)
    if (!obj) {
        return
    }
    let str = ""
    Object.keys(obj).forEach(key => {
        if (obj[key]) {
            str += `${key}: ${obj[key]}\n`
        }
    })
    sheet.getCell(row, col).wordWrap(true)
    sheet.setValue(row, col, str)
}

/**返回结果为数组时，将列样式设置为多列选择器，其余列自适应列宽 */
const adjustColumn = (sheet, arrIndex, objIndex) => {
    sheet.suspendPaint()
    let { rowCount, colCount, row, col } = sheet.getUsedRange(GC.Spread.Sheets.UsedRangeType.data)
    for (let j = row; j < row + rowCount; j++) {
        for (let i = 0; i < arrIndex.length; i++) {
            setMulitpleColumn(j, arrIndex[i], sheet)
        }
        for (let i = 0; i < objIndex.length; i++) {
            setObjCellFormat(j, objIndex[i], sheet)
        }
    }
    for (let i = col; i < col + colCount; i++) {
        sheet.autoFitColumn(i)
    }
    for (let i = row; i < row + rowCount; i++) {
        sheet.autoFitRow(i)
    }

    sheet.resumePaint()
}


/***执行汇总动作 */
const executeSummary = async (spread, router) => {
    spread.options.autoFitType = GC.Spread.Sheets.AutoFitType.cellWithHeader
    let template = router.currentRoute.value.query.template
    if (!template) {
        ElMessage({ message: '汇总模板不存在', type: 'error' })
    } else {
        let result = await getTemplateReocords(template)
        if (result.length == 0) {
            ElMessage({ message: '暂无汇总数据', type: 'error' })
        } else {
            let sheet = spread.getActiveSheet()
            sheet.name("汇总面板")
            sheet.setDataSource(result)
            let arrItemIndex = hasArrObject(result[0])
            let objItemIndex = hasObjItem(result[0])
            adjustColumn(sheet, arrItemIndex, objItemIndex)

        }
    }
}

const getSummaryData = async (template) => {
    return new Promise(async resolve => {
        if (!template) {
            ElMessage({ message: '汇总模板不存在', type: 'error' })
            resolve([])
        } else {
            let result = await getTemplateReocords(template)
            if (result.length == 0) {
                ElMessage({ message: '暂无汇总数据', type: 'error' })
                resolve([])
            } else {
                resolve(result)
            }
        }
    });
}

async function setVersion() {
    let version = await localforage.getItem("version")
    let newVersion = "18.2.3"
    if (version != newVersion) {
        await localforage.clear()
        localforage.setItem("version", newVersion)
    }
}

function getReportConfig(desinger, router) {
    let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig));
    let reportRibbon = config.ribbon.find(r => r.id === 'reportSheetDesign');
    console.log(reportRibbon)

    reportRibbon.buttonGroups.unshift({
        label: "操作",
        thumbnailClass: "ribbon-thumbnail-editing",
        commandGroup: {
            children: ["saveReport"]
        }
    })

    config.commandMap = {
        saveReport: {
            title: "保存报表模板",
            text: "保存报表",
            iconClass: "save-template-icon",
            bigButton: true,
            commandName: "saveReport",
            execute: function (designer) {
                let spread = designer.getWorkbook();
                spread.save(function (blob) {
                    let key = 'report_' + router.currentRoute.value.query.template
                    localforage.setItem(key, blob)
                    ElMessage.success("保存成功！")
                })

            }
        }
    };

    return config;
}

async function loadReport(designer, reportName) {

    return new Promise(async resolve => {
        let key = 'report_' + reportName
        let blob = await localforage.getItem(key)
        if (blob) {
            designer.getWorkbook().open(blob, function () {
                ElMessage.success("加载报表成功！")
                resolve();
            }, function(){
                resolve();
            })
        }
        resolve();
    });

}

export {
    getImageBase64,
    getPreivewConfig,
    loadTemplate,
    initialTemplateData,
    executeSummary,
    getSummaryData,
    setVersion,
    getReportConfig,
    loadReport
}