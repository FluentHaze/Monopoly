import { createRouter, createWebHashHistory } from 'vue-router';
import routes from './routes';

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const oldIndex = from.meta.moveIndex;
  const newIndex = to.meta.moveIndex;
  if (oldIndex && newIndex) {
    if (oldIndex > newIndex) to.meta.transition = 'slide-left';
    else to.meta.transition = 'slide-right';
  } else {
    to.meta.transition = 'slide-right';
  }

  if (to.meta.title) {
    document.title = (to.meta.title + ' · 幸运冒险岛') as string;
  }
  next();
});

router.afterEach(() => {});

export default router;
