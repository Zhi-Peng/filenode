import Router from 'koa-router';
import jwt from 'jsonwebtoken';
import { sqlAction } from '../../db/index.js';
import config from '../../config/index.js';
const router = new Router();
const uploadRootPath = config.file.uploadRootPath;

// 注册用户
const insertUser = value => {
  let _sql =
    'insert into users set email=?,password=?;';
  return sqlAction(_sql, value);
};
// 删除用户
const deleteUserData = name => {
  let _sql = `delete from users where name="${name}";`;
  return sqlAction(_sql);
};
// 查找用户
const findUser = email => {
  let _sql = `select * from users where email="${email}";`;
  return sqlAction(_sql);
};
// 更新用户
const updateUser = values => {
  let _sql = `update users set password=? where email=?`;
  return query(_sql, values);
};

router.get('/', async ctx => {
  const users = await findUser('zhipeng');
  users ? ctx.$util.success(ctx, users) : ctx.$util.fail(ctx, '获取用户失败');
});

// 登录
router.post('/', async ctx => {
  const body = ctx.request.body;
  const validField = ['email', 'password'];

  try {
    ctx.$util.validField(validField, body);

    const user = (await findUser(body.email))[0];
    if (!user) {
      return ctx.$util.fail(ctx, '此账号没有注册');
    } else if (body.password !== user.password) {
      return ctx.$util.fail(ctx, '密码错误');
    }

    user.token = jwt.sign({ ...user }, ctx.$config.JWTs.secret, {
      expiresIn: ctx.$config.JWTs.expiresIn
    });
    ctx.$util.success(ctx, user);
  } catch (err) {
    ctx.$util.fail(ctx, err.message);
  }
});

// 注册 TODO 这是要验证具体 email name 的正确性
router.post('/register', async ctx => {
  const body = ctx.request.body;
  const validField = ['password', 'email', 'code'];

  try {
    ctx.$util.validField(validField, body);
    const code = await ctx.$util.getRedis(body.email);

    if (code && code === body.code) {
      const user = (await findUser(body.email))[0];

      if (user && user.email === body.email) {
        return ctx.$util.fail(ctx, '此用户已注册');
      }
      await insertUser([
        body.email,
        body.password
      ]);
      // 清空验证码
      await ctx.$util.delRedis(body.email);
      ctx.$util.success(ctx);
    } else {
      ctx.$util.fail(ctx, '请填入正确的验正码');
    }
    // 注册成功要给用户创建一个根目录
    const uploadRootPath = config.file.uploadRootPath;
    ctx.$util.mkdir(uploadRootPath + '/' + body.email);
  } catch (err) {
    ctx.$util.fail(ctx, err.message);
  }
});

// TODO 忘记密码
router.post('/forget', async ctx => {
  const body = ctx.request.body;
  const validField = ['email', 'password', 'newPassword', 'code'];

  try {
    ctx.$util.validField(validField, body);
    const code = await ctx.$util.getRedis(body.email);

    if (code && code === body.code) {
      const user = (await findUser(body.email))[0];
      if (user) {
        await updateUser([body.password, body.email])
        await ctx.$util.delRedis(body.email);
        ctx.$util.success(ctx, '修改密码成功');
      } else {
        return ctx.$util.fail(ctx, '没有此用户');
      }
    } else {
      ctx.$util.fail(ctx, '请填入正确的验正码');
    }
  } catch (err) {
    ctx.$util.fail(ctx, err.message);
  }
});

// 修改密码 一般不用单独写，走忘记密码
// router.post('/edit', async ctx => {
//   const body = ctx.request.body;
//   const validField = ['name', 'password', 'newPassword'];

//   try {
//     ctx.$util.validField(validField, body);
//     const user = await userSchema.updateOne(
//       { name: body.name },
//       { password: body.password }
//     );
//     // const user = await userSchema.findOne({ name: body.name });
//     console.log(user, 'user');
//     if (!user) {
//       return ctx.$util.success(ctx, '账号或密码不正确');
//     }
//     if (user.password !== body.password) {
//       return ctx.$util.success(ctx, '原密码不正确');
//     }
//     await user.update({ password: body.newPassword });
//     ctx.$util.success(ctx, '修改密码成功');
//   } catch (err) {
//     ctx.$util.fail(ctx, err.message);
//   }
// });

// TODO 严格的话可以在 redis 保存 token 副本集，每当token 变更，删除副本 token,检验 token 副本里面没有就不能过

// TODO 注销用户  不用删除，关联的东西太多了， 直接加字段标识
// router.post('/logout', async ctx => {
//   try {
//     const data = await ctx.verify(ctx);
//     await userSchema.deleteOne({ name: data.name });
//     ctx.$util.success(ctx, '退出成功');
//   } catch (err) {
//     ctx.$util.fail(ctx, err.message);
//   }
// });

export default router.routes();
