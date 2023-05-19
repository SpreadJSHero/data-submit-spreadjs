<template>
    <el-config-provider :size="size" :z-index="zIndex" :locale="locale">
      <common-header></common-header>
      <div class="common-layout">
        <el-container>
          <aside-menu/>
          <el-container>
            <el-header class="el-header-demo">
              <step-menu @select="handleStepSelect" />
            </el-header>
            <el-main class="main">
              <router-view />
            </el-main>
          </el-container>
        </el-container>
      </div>
    </el-config-provider>
  </template>
  
  <script>
  import { defineComponent, reactive, toRefs } from 'vue'
  import { ElConfigProvider } from 'element-plus'
  import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
  import OnlineDesigner from '../components/OnlineDesigner.vue';
  import CommonHeader from '../views/CommonHeader.vue'
  import StepMenu from '../views/StepMenu.vue'
  import AsideMenu from "../views/AsideMenu.vue"
  import baseSetting from '../config/baseSetting'
  
  export default defineComponent({
    components: {
      ElConfigProvider,
      OnlineDesigner,
      CommonHeader,
      StepMenu,
      AsideMenu
    },
    setup() {
      //流程步骤
      const operateSteps = baseSetting.operateSteps
      //用户池
      const users = baseSetting.users;
  
      const reactiveData = reactive({
        // 维护响应式变化数据
        operateStep: undefined,
        user: users[2],
        isCollapse: false
      })
  
  
      return {
        zIndex: 3000,
        size: 'small',
        locale: zhCn,
        operateSteps,
        ...toRefs(reactiveData)
      }
    },
    mounted() {
    },
    methods: {
      handleStepSelect(value) {
        console.log(value)
      }
    }
  })
  </script>
  
  <style>
  .el-header {
    padding: 0 10px;
    background-color: #95106b;
  }
  
  .el-aside {
    width: auto;
  }
  
  .el-dropdown {
    color: #fff;
    line-height: 60px
  }
  
  .example-showcase .el-dropdown-link {
    cursor: pointer;
    color: #fff;
    display: flex;
    align-items: center;
  }
  
  .el-select .el-input {
    margin-top: 16px;
  }
  
  .el-switch{
    margin-top: 16px;
    margin-left: 20px;
  }
  
  .el-menu-demo,
  .el-header-demo{
    height: 40px;
  }
  .main {
    overflow-x: hidden;
  }
  </style>
  