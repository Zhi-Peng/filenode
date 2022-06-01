import Router from 'koa-router';
import fs from 'fs';
import path from 'path';
import config from '../../config/index.js';
import { sqlAction } from '../../db/index.js';

const router = new Router();
const uploadRootPath = config.file.uploadRootPath;

// 插入文件入库
const insertFile = values => {
  const _sql =
    'insert into files set userId=?,md5=?,name=?,suffix=?,size=?,type=?,path=?,createTime=?';
  return sqlAction(_sql, values);
};
// 查找单个路径文件
const findSingleFile = values => {
  const _sql =
  `select * from files where userId=? and md5=?`;
  return sqlAction(_sql, values);
};
// 查找所有路径文件
const findFile = values => {
  const _sql =
  `select * from files where userId=? and path=?`;
  return sqlAction(_sql, values);
};
// 查找路径正则匹配文件
const findRegexpFile = reg => {
  const _sql =
  `select * from files where path regexp '${reg}'`;
  return sqlAction(_sql);
};

// 删除文件
const deleteFile = values => {
  const _sql =
  `delete from files where userId=? and md5=?`;
  return sqlAction(_sql, values);
};
// 删除路径正则匹配文件
const deleteRegexpFile = reg => {
  const _sql =
  `delete from files where path regexp '${reg}'`;
  return sqlAction(_sql);
};
// 更新文件某个字段
const updateFile = (values, prop='name') => {
  const _sql = `update files set ${prop}=? where md5=?`;
  return sqlAction(_sql, values);
};

// 插入文件夹入库
const insertDir = values => {
  const _sql =
    'insert into dir set dirUserId=?,dirName=?,dirPath=?,isDir=1,createTime=?';
  return sqlAction(_sql, values);
};
// 查找所有文件夹
const findAllDir = values => {
  const _sql =
  `select * from dir where dirUserId=? and dirPath=?;`;
  return sqlAction(_sql, values);
};
// 查找文件夹
const findDir = values => {
  const _sql =
  `select * from dir where dirUserId=? and dirPath=? and dirName=?;`;
  return sqlAction(_sql, values);
};
// 更新文件夹某个属性
const updateDir = (values, prop = 'dirName') => {
  const _sql = `update dir set ${prop}=? where dirId=?`;
  return sqlAction(_sql, values);
};
// 删除文件夹
const deleteDir = values => {
  const _sql = `delete from dir where dirUserId=? and dirId=?`
  return sqlAction(_sql, values)
};
// 路径匹配删除文件夹
const deleteRegexpDir = reg => {
  const _sql = `delete from dir where dirPath regexp '${reg}'`
  return sqlAction(_sql)
};
// 更新正则匹配的文件
const updateRegFiles = (reg, oldPath, newPath) => {
  const _sql = `update files set path=replace(path,'${oldPath}','${newPath}') where path regexp '${reg}'`;
  return sqlAction(_sql);
};
// 更新正则匹配的文件夹
const updateRegDir = (reg, oldPath, newPath) => {
  const _sql = `update dir set dirPath=replace(dirPath,'${oldPath}','${newPath}') where dirPath regexp '${reg}'`;
  return sqlAction(_sql);
};

// 拼接目录
const joinDir = (date) => {
  date = date || new Date();
  return `${date.getFullYear()}-${date.getMonth()}`;
}

const types = ['', 'image', 'file', 'video']
router.post('/upload', async ctx => {
  console.log(33333);
  const file = ctx.request.files.file;
  const thumbnail = ctx.request.files.thumbnail;
  const body = ctx.request.body;
  const validField = ['file', 'md5', 'type'];

  // 查数据库有没有此目录或文件
  // 是文件判段有没有 file 文件夹, 没有就创建, 有就再创建 2019-1 目录
  // 是图片判断有没有 image 文件夹,没有就创建, 有就再创建 2019-1 目录 和 Thumb 目录
  try {
    ctx.$util.validField(validField, {...body, file});
    const suffix = path.extname(file.originalFilename);
    const i = file.originalFilename.indexOf(suffix);
    const name = file.originalFilename.substring(0, i);
    await insertFile(['771001201@qq.com', body.md5, name, suffix, file.size, body.type, body.path, '2022-06-07 15:18:44']);
    const type = body.type; // 1.图片 2.文件 3.视频
    const dateDir = joinDir();
    // /files/771001201@qq.com/image
    const dateFolder = `${uploadRootPath}/771001201@qq.com/${types[type]}`;
    // /files/771001201@qq.com/image/2022-06
    const fileFolder = dateFolder + '/' + dateDir;
    ctx.$util.mkdir(dateFolder);
    ctx.$util.mkdir(fileFolder);

    file.originalFilename = `${body.md5}${suffix}`;
    const reader = fs.createReadStream(file.filepath);
    const upStream = fs.createWriteStream(`${fileFolder}/${file.originalFilename}`);
    reader.pipe(upStream);
    // 图片加缩略图
    if (type === '1') {
      ctx.$util.mkdir(dateFolder + '/thumb');
      ctx.$util.mkdir(`${dateFolder}/thumb/${dateDir}`);
      const thumbPath = `${dateFolder}/thumb/${dateDir}/${file.originalFilename}`;
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

// 获取路径下的所有目录和文件
router.get('/folder/get', async ctx => {
  const query = ctx.request.query;
  // TODO 这里的 dir 要和前端对应，前端用 encodeencodeURIComponent 这里就要用 decodeURIComponent 解
  const path = query.dir || '';
  const dirs = await findAllDir(['771001201@qq.com', path]);
  const files = await findFile(['771001201@qq.com', path]) 
  const res = [...dirs, ...files];
  ctx.$util.success(ctx, res);
});

// 获取路径下的所有文件夹
router.get('/folder/dir', async ctx => {
  const query = ctx.request.query;
  // TODO 这里的 dir 要和前端对应，前端用 encodeencodeURIComponent 这里就要用 decodeURIComponent 解
  const path = query.dir || '';
  const dirs = await findAllDir(['771001201@qq.com', path]);
  ctx.$util.success(ctx, dirs);
});

router.get('/folderTree/get', ctx => {
  const data = ctx.$util.readTreeDir(uploadRootPath);
  ctx.$util.success(ctx, data);
});

// 创建
router.post('/folder/create', async ctx => {
  const body = ctx.request.body;
  const dirPath = body.dir;

  try {
    const res = await findDir(['771001201@qq.com', dirPath, body.name]);
    if (res.length) return ctx.$util.success(ctx, '此文件夹已存在');
    await insertDir(['771001201@qq.com', body.name, dirPath, '2022-06-07 15:18:44']);
    ctx.$util.success(ctx, '创建文件夹成功');
  } catch (err) {
    ctx.$util.fail(ctx, err.message);
  }
});

// 编辑文件夹名字
router.post('/folder/update', async ctx => {
  const body = ctx.request.body;

  if (!(body.newName && body.id)) {
    return ctx.$util.fail(ctx, '文件夹参数不对');
  }
  console.log(body, 8888);

  // 区别是文件还是文件夹
  try {
    const res = body.isDir
    ? await updateDir([body.newName, body.id])
    : await updateFile([body.newName, body.id]);

    res.changedRows
    ? ctx.$util.success(ctx, '修改成功')
    : ctx.$util.fail(ctx, '修改失败');
  } catch (err) {
    ctx.$util.fail(ctx, err.message);
  }
});

// 删除文件夹和文件
router.post('/folder/delete', async ctx => {
  const body = ctx.request.body;
  if (!body.fileList) {
    return ctx.$util.fail(ctx, '请传入要删除文件的列表');
  }

  try {
    // [
    //   { path: '', dirName: 'aa', isDir: 1 },
    //   { path: 'aa', dirName: 'bb', isDir: 1 },
    //   { path: 'aa/bb', dirName: 'cc', isDir: 1 },
    //   { path: 'aa', name: '111.png'}
    // ]
    const demo = (arr) => {
      const fileDiskPath = [];
      const thumbsDiskPath = [];
      arr.forEach(item => {
        const dateFolder = `${uploadRootPath}/771001201@qq.com/${types[item.type]}`,
          dateDir = joinDir(item.createTime),
          filePath = `${dateFolder}/${dateDir}/${item.md5}${item.suffix}`
          if (item.type === 1) {
            const thumbsPath = `${dateFolder}/thumb/${dateDir}/${item.md5}${item.suffix}`
            thumbsDiskPath.push(thumbsPath)
          }

        fileDiskPath.push(filePath);
      })

      // 删除磁盘文件
      fileDiskPath.forEach(item => {
        const isState = ctx.$util.removeFile(item)
        if (!isState) {
          console.log('删除磁盘文件失败');
        }
      });
      thumbsDiskPath.forEach(item => {
        const isState = ctx.$util.removeFile(item)
        if (!isState) {
          console.log('删除磁盘缩略图失败');
        }
      });
    }
    body.fileList.forEach(async item => {
      let getFiles;
      if (item.isDir) {
        // 获取
        getFiles = await findRegexpFile(`^${item.dirPath ? '/' : ''}${item.dirName}`);
        demo(getFiles)
        // 匹配删除当前目录的所有子目录
        deleteRegexpDir(`^${item.dirPath ? '/' : ''}${item.dirName}`)
        // 匹配删除当前目录的所有子文件    这个要先查了最后删除， 不然就查不到了
        deleteRegexpFile(`^${item.dirPath ? '/' : ''}${item.dirName}`)
        // 匹配删除当前目录
        deleteDir(['771001201@qq.com', item.dirId])
      } else {
        // 同级下面的文件也删除
        getFiles = await findSingleFile(['771001201@qq.com', item.md5])
        demo(getFiles)
        deleteFile(['771001201@qq.com', item.md5])
      }
    });

    ctx.$util.success(ctx, '删除成功');
  } catch (err) {
    ctx.$util.fail(ctx, err.message);
  }
});

// 移动文件夹和文件
router.post('/folder/move', async ctx => {
  const body = ctx.request.body;

  const validField = ['fileList'];
  ctx.$util.validField(validField, body);

  try {
    body.fileList.forEach(item => {
      if (item.isDir) {
        // 匹配移动当前目录的所有子目录
        const oldPath = `${item.dirPath ? item.dirPath + '/' : ''}${item.dirName}`;
        const newPath = `${body.newPath ? body.newPath + '/' : ''}${item.dirName}`;
        updateRegDir(`^${oldPath}`, oldPath, newPath)
        // // 匹配移动当前目录的所有子文件
        updateRegFiles(`^${oldPath}`, oldPath, newPath)
        // // 匹配删除当前目录
        updateDir([body.newPath, item.dirId], 'dirPath')
      } else {
        // 同级下面的文件也删除
        updateFile([body.newPath, item.md5], 'path')
      }
    })

    ctx.$util.success(ctx, '更新成功');
  } catch (err) {
    ctx.$util.fail(ctx, err.message);
  }
})

// 复制文件夹和文件
router.post('/folder/copy', async ctx => {
  const body = ctx.request.body;

  const validField = ['fileList'];
  ctx.$util.validField(validField, body);

  // 有就创建没有就更新到此目录
  try {
    body.fileList.forEach(item => {
      if (item.isDir) {
        // 匹配移动当前目录的所有子目录
        const oldPath = `${item.dirPath ? item.dirPath + '/' : ''}${item.dirName}`;
        const newPath = `${body.newPath ? body.newPath + '/' : ''}${item.dirName}`;
        updateRegDir(`^${oldPath}`, oldPath, newPath)
        // // 匹配移动当前目录的所有子文件
        updateRegFiles(`^${oldPath}`, oldPath, newPath)
        // // 匹配删除当前目录
        updateDir([body.newPath, item.dirId], 'dirPath')
      } else {
        // 同级下面的文件也删除
        updateFile([body.newPath, item.md5], 'path')
      }
    })

    ctx.$util.success(ctx, '更新成功');
  } catch (err) {
    ctx.$util.fail(ctx, err.message);
  }
})

export default router.routes();
