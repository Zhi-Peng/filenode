import Router from 'koa-router';
import nodemailer from 'nodemailer';
import config from '../../config/index.js';

async function sendEmail(email, title, text) {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport(config.emailServer, {
      from: '<' + config.emailServer.auth.user + '>'
    });
    transporter.sendMail(
      {
        to: email,
        subject: title,
        text
      },
      (error, info) => {
        transporter.close();
        error && console.log('发邮件错误：', error.message);
        resolve(error ? error.message : '');
      }
    );
  });
}
const router = new Router();

router.use(async (ctx, next) => {
  // ctx.logger = ctx.logger({service: 'user'})
  await next();
});

router.post('/', async ctx => {
  const body = ctx.request.body;
  const validField = ['email'];

  try {
    ctx.$util.validField(validField, body);

    let loopNum = 4, code = '';
    code = await ctx.$util.getRedis(body.email);

    if (!code) {
      code = '';
      while (loopNum--) {
        const codeItem = Math.floor(Math.random() * 10);
        code += codeItem;
      }
      ctx.$util.setRedis(body.email, code, { EX: 60 });
      // await sendEmail(body.email, '验证码', `您的验证码为 ${code} (四位数字)`);
      // return ctx.$util.success(ctx, '验证码已发送，请注意查收邮件!');
      return ctx.$util.success(ctx, `验证码为 (${code})`);
    }
    // return ctx.$util.success(ctx, `验证码为 (${code})`);
    return ctx.$util.success(ctx, '不能频繁地送，请等待 60 秒。');
  } catch (err) {
    // ctx.logger.log({ level: 'error', message: err.message });
    ctx.$util.fail(ctx, err.message);
  }
});

export default router.routes();
