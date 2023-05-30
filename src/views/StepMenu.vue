<template>
   <el-menu 
        :default-active= $route.path
        class="el-menu-demo" 
        mode="horizontal" 
        background-color="#95106b"
        text-color="#fff" 
        active-text-color="#ffd04b" 
        @select="handleStepSelect"
    >
        <el-menu-item v-for="item in operateSteps" :key="item.router" :index="item.router" disabled=true>
        <!-- <el-menu-item v-for="item in operateSteps" :key="item.router" :index="item.router"> -->
        {{item.label}}
        </el-menu-item>
        <el-menu-item v-if="$route.path=='/fill'" disabled>
            <div class="color-gray">    
                当前为普通用户看到的页面，仅可以做填报操作，无其他权限，<a class="color-blue" href="">操作视频</a>
            </div>
        </el-menu-item>
        <el-menu-item disabled v-else>
            <div class="color-gray">
                当前为管理员看到的页面，可以保存模板、下发任务和查看汇总，<a class="color-blue" href="">操作视频</a>
            </div>
        </el-menu-item>
    </el-menu>
</template>
<script>
import { defineComponent,reactive,toRefs} from 'vue'
import { useRouter } from "vue-router"
import baseSetting from '../config/baseSetting'

export default defineComponent({
    setup() {
        const router = useRouter()
        const {operateSteps} = baseSetting
        const pageDate = reactive({
            operateSteps,
        })
        const handleStepSelect = (event) => {
            router.push({
                path:event,
                query: {
                    template: router.currentRoute.value.query.template,
                    user: router.currentRoute.value.query.user
                }
            })            
        }

        return {
            ...toRefs(pageDate),
            handleStepSelect
        }
    },
})

</script>

<style>
.list {
    display: flex;
    height: 40px;
    align-items: center;
    padding-left: 15px;

}

.item {
    width: 96px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: white;
    cursor: pointer;
    transition: border 0.3s, background-color 0.3s, color 0.3s;
    border-bottom: 2px solid transparent;
    box-sizing: border-box;
}

.item:hover {
    background-color: rgb(119, 13, 86);
}

.active {
    color: rgb(255, 208, 75);
    border-bottom: 2px solid rgb(255, 208, 75);
}

.el-menu-item.is-disabled{
    opacity: 1;
    cursor: default;
}
.color-gray{
    color: #aaa;
    display: flex;
    align-items: center;
}
.color-blue {
    color: #0ff00f !important;
}
</style>