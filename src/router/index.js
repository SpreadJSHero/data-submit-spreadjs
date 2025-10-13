import {
    createRouter,
    createWebHashHistory
} from "vue-router";

const routes = [
    {
        path: "/",
        component: () => import("../views/PcView.vue"),
        children: [
            {
                path: '/preview',
                component: () => import("../components/OnlineDesigner.vue"),
            }, {
                path: '/fill',
                component: () => import("../components/SpreadDataFill.vue")
            }, {
                path: '/summary',
                component: () => import("../components/SummaryList.vue")
            }, {
                path: '/report',
                component: () => import("../components/Report.vue")
            }, {
                path: "/",
                redirect: '/preview?template=financialData',
            }
        ]
    }, {
        path: "/mobileFill",
        component: () => import("../views/MobileView.vue")
    }, {
        path: "/video",
        component: () => import("../views/video.vue")
    }
]


const router = createRouter({
    history: createWebHashHistory(),
    routes,
})
export default router