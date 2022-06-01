import Router from 'koa-router';
import { sqlAction } from '../../db/index.js';

const router = new Router();

router.use(async (ctx, next) => {
  await next();
});

// router.use(Token.checkToken)
// //用户参与次数验证
// router.use(usersignService.checkUser)
// //ip参与次数验证
// router.use(ipService.checkIp)
// //ip黑名单
// router.use(ipBlacklistService.checkIp)
// //用户黑名单
// router.use(blacklistService.checkUser)
// //抽奖接口
// router.get('/getPrize', luckyConstructor.prizeGet)
// //礼品的颁发
// router.use(couponService.setCoupon)
// //中奖纪录
// router.use(recodingsService.createData)

const checkIp = async (ctx, next) => {
  await next();
};

router.use(checkIp);
// TODO 忘记密码
router.get('/checkIp', async ctx => {
  ctx.$util.success('fdsaf');
});

router.post('/upload', async ctx => {
  const body = ctx.request.body;
  const validField = [
    'prize_name',
    'prize_num',
    'remain_num',
    'prize_ratio',
    'time_begin',
    'time_end',
    'img',
    'type'
  ];
  try {
    ctx.$util.validField(validField, body);

    ctx.$util.success(body);
  } catch (err) {
    ctx.$util.fail(err.message);
  }
});
export default router.routes();
