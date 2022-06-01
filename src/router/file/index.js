import Router from 'koa-router';
import fs from 'fs';
import path from 'path';
import config from '../../config/index.js';
import { sqlAction } from '../../db/index.js';

// 插入文件入库
const insertData = value => {
  let _sql =
    'insert into files set md5=?,name=?,size=?;';
  return sqlAction(_sql, value);
};

const router = new Router();
const uploadRootPath = config.file.uploadRootPath;

const rename = () => {
  fs.renameSync(pathToFile, newPathToFile)
}

// 拼接目录
const formatDir = () => {
  const date = new Date();
  return `${date.getFullYear}-${date.getMonth()}`;
}

const types = ['', '/image', '/file', '/video']
router.post('/upload', async ctx => {
  const file = ctx.request.files.file;
  const thumbnail = ctx.request.files.thumbnail;
  const body = ctx.request.body;
  const validField = ['file', 'md5', 'type'];

  // 查数据库有没有此目录或文件
  // 是文件判段有没有 file 文件夹, 没有就创建, 有就再创建 2019-1 目录
  // 是图片判断有没有 image 文件夹,没有就创建, 有就再创建 2019-1 目录 和 Thumb 目录
  try {
    ctx.$util.validField(validField, {...body, file});
    await insertData([body.md5, file.originalFilename, file.size]);

    const type = body.type; // 1.图片 2.文件 3.视频
    const date = new Date, year = date.getFullYear(), month = date.getMonth();
    const dateFolder = `${uploadRootPath}/771001201@qq.com/${year}-${month}`;
    const fileFolder = dateFolder + types[type];
    const suffix = path.extname(file.originalFilename);
    ctx.$util.mkdir(dateFolder);
    ctx.$util.mkdir(fileFolder);

    file.originalFilename = `${body.md5}${suffix}`;
    const reader = fs.createReadStream(file.filepath);
    const upStream = fs.createWriteStream(`${fileFolder}/${file.originalFilename}`);
    reader.pipe(upStream);
    // 图片加缩略图
    if (type === 1) {
      ctx.$util.mkdir(fileFolder + '/thumb');
      ctx.$util.mkdir(`${fileFolder}/thumb/${year}-${month}`);
      const thumbPath = `${fileFolder}/thumb/${year}-${month}/${file.originalFilename}`;
      const reader = fs.createReadStream(thumbnail.filepath);
      const upStream = fs.createWriteStream(thumbPath);
      reader.pipe(upStream);
    }

    ctx.$util.success(ctx, '上传成功');
  } catch (err) {
    if (err.message.includes(body.md5)) {
      ctx.$util.fail(ctx, '此图片已经上传过');
    } else {
      ctx.$util.fail(ctx, err.message);
    }
  }
});

router.get('/folder/get', ctx => {
  const query = ctx.request.query;
  // TODO 这里的 dir 要和前端对应，前端用 encodeencodeURIComponent 这里就要用 decodeURIComponent 解
  const params = query.dir || '';
  const path = `${uploadRootPath}/${params}`;

  const dirs = ctx.$util.readdir(path);
  const data = dirs.map(name => {
    const type = ctx.$util.isFileType(`${path}/${name}`);
    const dir = {
      type,
      name
    };
    return dir;
  });

  ctx.$util.success(ctx, data);
});

router.get('/folderTree/get', ctx => {
  const data = ctx.$util.readTreeDir(uploadRootPath);
  ctx.$util.success(ctx, data);
});

router.post('/folder/create', ctx => {
  const body = ctx.request.body;
  const dirPath = body.dir ? `/${body.dir}` : '';
  const fullPath = `${uploadRootPath}${dirPath}/${body.name}`;

  const hasCreate = ctx.$util.hasFileAndFolder(fullPath);

  if (hasCreate) {
    return ctx.$util.fail(ctx, '此文件夹已存在');
  }

  ctx.$util.mkdir(fullPath)
    ? ctx.$util.success(ctx, '创建成功')
    : ctx.$util.fail(ctx, '没有这个目录,请输入正确的目录');
});

router.post('/folder/update', ctx => {
  const body = ctx.request.body;

  if (!(body.name && body.newName)) {
    return ctx.$util.fail(ctx, '文件夹参数不对');
  }

  const dirPath = body.dir ? `/${body.dir}` : '';
  const oldPath = `${uploadRootPath}${dirPath}/${body.name}`;
  const newPath = `${uploadRootPath}${dirPath}/${body.newName}`;

  ctx.$util.rename(oldPath, newPath)
    ? ctx.$util.success(ctx, '修改成功')
    : ctx.$util.fail(ctx, '修改失败');
});

router.post('/folder/delete', ctx => {
  const body = ctx.request.body;
  if (body.dir === undefined) {
    return ctx.$util.fail(ctx, '请传入要删除文件的路径');
  }
  let dirPath = `${uploadRootPath}/${body.dir}`;
  body.selectFileList.forEach(item => {
    const dir = `${dirPath}/${item.name}`;
    const isState = item.type === 1 ? ctx.$util.removeFile(dir) : ctx.$util.removeDir(dir);
    if (!isState) {
      return ctx.$util.fail(ctx, '删除失败或没有此文件夹');
    }
  });

  ctx.$util.success(ctx, '删除成功');
});

export default router.routes();
