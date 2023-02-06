<template>
  <el-config-provider :size="size" :z-index="zIndex" :locale="locale">
    <div class="common-layout">
      <el-container>
        <el-aside>
          <el-menu 
            active-text-color="#ffd04b" 
            background-color="#545c64" 
            class="el-menu-vertical-demo"
            :collapse='isCollapse' 
            :default-active="choosedType.value" 
            text-color="#fff"
            @select="handleChangeType"
            >
            <el-switch v-model="isCollapse" 
              style="--el-switch-on-color: #FFD048; --el-switch-off-color: #DCDFE6"
            />
            <el-menu-item v-for="item in businessType" :key=item.value :index="item.value" >
              <el-icon>
                <component :is="item.icon"></component>
              </el-icon>
              <span>{{ item.label }}</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-container>
          <el-header>
            <el-row align="middle">
              <el-col :span="16">
                <el-menu 
                  default-active="/preview"
                  class="el-menu-demo" 
                  mode="horizontal" 
                  background-color="#545c64"
                  text-color="#fff" 
                  active-text-color="#ffd04b" 
                  router = "true"
                  @select="handleStepSelect"
                >
                  <el-menu-item v-for="item in operateSteps" :key="item.value" :index="item.router">
                    {{item.label}}
                 </el-menu-item>
                </el-menu>
              </el-col>
              <el-col :span="8" style="text-align: right">
                <el-avatar @click="handleChangeUser" style="cursor: pointer">{{ user.userName }}</el-avatar>
              </el-col>
            </el-row>
          </el-header>
          <el-main>
            <online-designer />
          </el-main>
        </el-container>
      </el-container>
    </div>
  </el-config-provider>
</template>

<script>
import { defineComponent } from 'vue'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import OnlineDesigner from './components/OnlineDesigner.vue';
import {
  Document, Setting, Money,
  ArrowDown, UserFilled, User,
  Avatar, Odometer, DataBoard,
  ArrowLeft, ArrowRight
} from "@element-plus/icons-vue"
import { reactive, toRefs } from 'vue';

export default defineComponent({
  components: {
    ElConfigProvider,
    OnlineDesigner,
    UserFilled, Avatar,
    Document, Setting, Money, ArrowDown,
    User, Odometer, DataBoard, ArrowLeft,
    ArrowRight
  },
  setup() {
    //业务类型
    const businessType = [
      {
        value: 'financialData',
        label: "金融指标补录",
        icon: 'Money'
      }, {
        value: 'personData',
        label: "人员信息统计",
        icon: 'UserFilled'
      }, {
        value: 'limsData',
        label: '实验室数据采集',
        icon: 'Odometer',
      }, {
        value: 'customDesigner',
        label: '自定义设计 ',
        icon: 'DataBoard'
      }
    ]

    //流程步骤
    const operateSteps = [
      {
        value: 'preview',
        label: '模板预览',
        router: "/preview"
      }, {
        value: 'write',
        label: '数据填报',
        router: "/write"
      }, {
        value: 'summary',
        label: '数据汇总',
        router: '/summary'
      }
    ]

    //用户池
    const users = [
      {
        userId: 0,
        userName: '张三'
      }, {
        userId: 1,
        userName: '李四'
      }, {
        userId: 2,
        userName: '王五'
      }
    ]

    const reactiveData = reactive({
      // 维护响应式变化数据
      choosedType: businessType[0],
      operateStep: undefined,
      user: users[2],
      isCollapse: false
    })

    const handleChangeType = (value) => {
      // 切换业务类型
      reactiveData.changeType = value
      console.log(value, reactiveData.choosedType)
    }

    const handleStepSelect = (value) => {
      // 切花流程步骤
      reactiveData.operateStep = value
      console.log(reactiveData.operateStep, value)
    }

    const handleCollapse = () => {
      reactiveData.isCollapse != reactiveData.isCollapse
    }

    const handleChangeUser = () => {
      let preUser = reactiveData.user
      console.log(preUser)
      if (preUser.userId == users.length - 1) {
        reactiveData.user = users[0]
        // Object.assign(reactiveData,{user:users[0]})
      } else {
        let i = preUser.userId + 1
        reactiveData.user = users[i]
        // Object.assign(reactiveData,{user:users[i]})
      }
    }


    return {
      zIndex: 3000,
      size: 'small',
      locale: zhCn,
      businessType,
      operateSteps,
      ...toRefs(reactiveData),
      handleChangeType,
      handleStepSelect,
      handleChangeUser,
      handleCollapse
    }
  },

})
</script>

<style>
.el-header {
  padding: 0 10px;
  background-color: #545C64;
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
</style>
