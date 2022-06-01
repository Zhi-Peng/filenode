import koa from 'koa';
import koaBody from 'koa-body';
import koaStatic from 'koa-static';
import router from './router/index.js';
import util from './util/index.js';
import config from './config/index.js';
import verify from './router/verify.js';
import { set, get, del } from './redis/index.js';
const app = new koa();
util.setRedis = set;
util.getRedis = get;
util.delRedis = del;
app.context.$util = util;
app.context.$config = config;

app.use(koaStatic(config.file.uploadRootPath));
app.use(koaBody({
  multipart: true
}));
app.use(async (ctx, next) => {
  // 设置跨域
  const contentType = 'application/json; chartset=utf-8'
   ctx.set('Content-Type', contentType)
   ctx.set("Access-Control-Allow-Origin", "*");
   ctx.set("Access-Control-Allow-Methods", "OPTIONS, GET, PUT, POST, DELETE");
  // end--------
  const roleValid = await verify(ctx);
  if (typeof roleValid === 'string') {
    util.fail(ctx, roleValid);
  }
  await next();
});
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.log(err, '路由里面 try catch 捕获错误');
  }
});
app.use(router.routes());
app.use(router.allowedMethods());
app.on('error', (err, ctx) => {
  console.log(err, ctx, '全局错误');
});
app.listen(9000, () => {
  console.log('9000 启动成功');
});