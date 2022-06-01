import winston from 'winston';
import errCode from '../errorCode.js';
import fs from 'fs';
class FileAction {
  // 文件或目录是否存在
  hasFileAndFolder(path) {
    try {
      fs.accessSync(path);
      return true;
    } catch (err) {
      return false;
    }
  }

  // 判断是文件还是文件夹
  isFileType(path) {
    let type = 0;
    const stat = fs.statSync(path);
    if (stat.isFile()) type = 1;
    if (stat.isDirectory()) type = 2;

    return type;
  }

  // 读取目录
  readdir(path) {
    const filesPath = fs.readdirSync(path);
    return filesPath;
  }

  // 创建目录
  mkdir(path) {
    try {
      fs.mkdirSync(path);
      return true;
    } catch (error) {
      return false;
    }
  }

  // 重命名
  rename(oldPath, newPath) {
    try {
      fs.renameSync(oldPath, newPath);
      return true;
    } catch (error) {
      return false;
    }
  }

  removeDir(path) {
    const dir = this.readdir(path);
    dir.forEach(item => {
      const dir = `${path}/${item}`;
      const type = this.isFileType(dir);
      type === 1 ? this.removeFile(dir) : this.removeDir(dir);
    });

    try {
      fs.rmdirSync(path);
      return true;
    } catch (err) {
      return false;
    }
  }

  removeFile(path) {
    try {
      fs.unlinkSync(path);
      return true;
    } catch (err) {
      return false;
    }
  }

  readTreeDir = (path, parent) => {
    const directory = this.readdir(path);

    const arr = directory.map(name => {
      const filePath = `${path}/${name}`;
      const type = this.isFileType(filePath);
      const curParent = parent || { name };

      if (type === 2) {
        curParent.children = this.readTreeDir(filePath);
      }
      return curParent;
    });

    return arr;
  };
}

class Util extends FileAction {
  success(ctx, data, msg) {
    if (typeof data === 'string') {
      msg = data;
      data = undefined;
    }

    ctx.body = {
      msg,
      data,
      code: 200
    };
  }

  // 这里的钷误是业务错误可以控制也可以不报错
  fail(ctx, msg, code) {
    if (code && !errCode[code]) {
      throw new Error('未设置的错误');
    }

    ctx.body = {
      msg,
      code: code || 0
    };
  }

  logger(options) {
    return winston.createLogger({
      level: options.level || 'info',
      format: winston.format.json(),
      defaultMeta: { service: options.service || 'user-service' },
      transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
      ]
    });
  }
  // 验证字段有没有
  validField(fields, body) {
    fields.every(field => {
      if (!body[field]) {
        throw new Error(`${field} 字段不能为空`);
      }
      return body[field];
    });
  }

  $getClientIP(ctx) {
    let req = ctx.request;
    console.log(ctx.req, 2222);
    let ip =
      ctx.ip ||
      req.headers['x-forwarded-for'] ||
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress ||
      '';
    let arr = ip.match(/(\d{1,3}\.){3}\d{1,3}/);

    return arr ? arr[0] : '';
  }

  $readStream(ctx) {
    return new Promise(resolve => {
      let data = '';
      ctx.req.on('data', chunk => {
        data += chunk;
      });
      ctx.req.on('end', () => {
        resolve(data);
      });
    });
  }
}
export default new Util();
