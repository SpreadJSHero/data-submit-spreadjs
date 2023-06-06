<template>
    <el-aside>
        <el-menu 
            active-text-color="#ffd04b" 
            background-color="#95106b" 
            class="el-menu-vertical-demo"
            :collapse='!isCollapse' 
            text-color="#fff" 
            :default-active="$route.query.template ? $route.query.template : initialChoose"
            @select="handleChangeType"
        >
            <div class="collapse-area">
                <ArrowLeftBold color="white" class="switch-icon" v-if="isCollapse" @click="isCollapse = false"></ArrowLeftBold>
                <ArrowRightBold color="white" class="switch-icon" v-else @click="isCollapse = true"></ArrowRightBold>
            </div>

            <el-menu-item v-for="item in businessType" :key=item.value :index="item.value"
                :disabled="$route.path=='/preview' ? false : true"
            >
                <el-icon>
                    <component :is="item.icon"></component>
                </el-icon>
                <span>{{ item.label }}</span>
            </el-menu-item>
            <div class="github-box">
                <a href="https://github.com/SpreadJSHeor/data-submit-spreadjs" target="_blank">
                    <img width="40" src="../assets/github.png" />
                </a>
            </div>
        </el-menu>
    </el-aside>
</template>

<script>
import { defineComponent, reactive, toRefs } from "vue"
import baseSetting from "../config/baseSetting"
import {useRouter} from "vue-router"
import {
    Money,UserFilled, Odometer, Files, DataBoard, ArrowRightBold, ArrowLeftBold
} from "@element-plus/icons-vue"
export default defineComponent({
    components: {
        Money,UserFilled,Odometer,Files, DataBoard, ArrowRightBold, ArrowLeftBold
    },

    setup() {
        const router = useRouter()
        const businessType = baseSetting.businessType
        const pageData = reactive({
            initialChoose: businessType[0].value,
            isCollapse: true,
            businessType,
        })
        const handleChangeType = (event) => {
            // 切换右侧菜单触发
            router.push({
                query:{
                    template: event
                }
            })
            document.querySelector('li[data-id="fill-custom"]').click()
        }

        return ({
            ...toRefs(pageData),
            handleChangeType
        })
    }
})
</script>

<style>
.collapse-area{
    height: 40px;
    line-height: 40px;
}
.github-box {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
}
.switch-icon {
    width: 20px;
    margin-left: 20px;
    padding-top: 10px;
    display: block;
    cursor: pointer;
}
.el-menu-vertical-demo {
  height: 100%;
}
</style>