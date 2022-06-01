/**
 * 1、只打包业务代码, 经测试，此方案速度最快
 * 2、这样经测试最合理，只打包业务，node_modules 单独上传再打包镜像, 因为打包 node_modules webpack 处理不了二进制，如 koa-body 包，会出现很多未知问题
 * 3、node_modules 可打成公共私有镜像，另启项目可直接用
 */

import path from 'path';

const dependencies = {
  "crypto-js": "^4.0.0",
  "jsonwebtoken": "^8.5.1",
  "koa": "^2.13.0",
  "koa-body": "^5.0.0",
  "koa-router": "^9.4.0",
  "koa-static": "^5.0.0",
  "mongoose": "^5.10.11",
  "mysql2": "^2.3.3",
  "nodemailer": "4.0.1",
  "qiniu": "^7.3.2",
  "redis": "3.1.2",
  "request": "^2.88.2",
  "request-promise": "^4.2.6",
  "winston": "^3.3.3"
}

function nodeExternals(context, request, callback) {
  const externals = {};
  for (const p in dependencies) {
      externals[p] = 'commonjs ' + p;
  }
  return externals;
}

export default {
  mode: 'none',
  entry: {
    app: './index.js'
  },
  target: 'node',
  output: {
    path: path.join(path.resolve(), './build'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['', '.js']
  },
  // 忽略 node 内置模块，如 fs path
  externalsPresets: { node: true },
  optimization: {
    minimize: true
  },
  externals: nodeExternals(),
};
