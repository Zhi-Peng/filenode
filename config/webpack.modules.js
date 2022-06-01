/**
 * 打包业务代码 和 node_modules
 */

import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';

// path.resolve() 当前项目的绝对路径
export default {
  mode: 'none',
  entry: {
    app: './index.js'
  },
  target: 'node',
  output: {
    path: path.join(path.resolve(), './build'),
    filename: '[name].js'
    // libraryTarget: 'commonjs'
  },
  resolve: {
    extensions: ['', '.js']
  },
  // 忽略 node 内置模块，如 fs path
  externalsPresets: { node: true },
  optimization: {
    // webpack 官网压缩内置模块
    // minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false //不将注释提取到单独的文件中
      })
    ],
    // moduleIds: 'hashed',
    // chunkIds: 'named',
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          // cacheGroupKey here is `commons` as the key of the cacheGroup
          name(module, chunks, cacheGroupKey) {
            return `vendor.chunk`;
          },
          chunks: 'all'
        }
      }
    }
  }
};
