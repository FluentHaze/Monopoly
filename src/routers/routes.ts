export default [
    {path: '/:pathMatch(.*)*', redirect: '/'},
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/monopoly/index.vue'),
        meta: {title: '大富翁', keepAlive: true, moveIndex: 1, },
    },
]