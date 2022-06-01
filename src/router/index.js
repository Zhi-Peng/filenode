import Router from 'koa-router';
const router = new Router();

const modules = ['user', 'emailVerify', 'file', 'qiniu', 'prize'];

modules.forEach(async item => {
  router.use(`/${item}`, (await import(`./${item}/index.js`)).default);
});

export default router;
