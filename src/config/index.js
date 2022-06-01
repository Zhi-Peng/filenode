import path from 'path';

const dirname = path.resolve(path.dirname('./'));
const fileRootPath = process.env.npm_lifecycle_event === 'pre' ? '/' : dirname;
const uploadRootPath = path.join(fileRootPath, 'files');
export default {
  app_name: '项目',
  app_momain: 'http://localhost:8000/',
  encryption: {
    Token: 'Ygr3RZ8KMUU2U',
    EncodingAESKey: '6WGy6YI29utByHz8GiLtSeFBw4ezZB6JTK5RVLFVkJH'
  },
  qiniu: {
    AK: 'laugswI0dIPYGhuSwsRegz0hgd8L5jDLLWtsKmBm',
    SK: 'MmpF89-Lia7Am0GBhdxwLhOCNrZZgeITv15QnkX3'
  },
  file: {
    uploadRootPath
  },
  mysql: {
    host: 'localhost',
    user: 'root',
    password: '!Ww771001201',
    database: 'demo',
    port: '3306'
  },

  redis: {},

  db: {
    host: '192.168.1.1',
    port: 8080,
    user: 'root',
    password: 'password',
    database: 'my database'
  },

  uploadPath: 'dist/upFile',

  JWTs: {
    secret: 'scscms',
    expiresIn: '2h'
  },

  emailServer: {
    service: 'SMTP',
    host: 'smtp.qq.com',
    port: 465,
    auth: {
      user: '329337249@qq.com',
      pass: 'jsplybyxzuwpcabb' // 邮箱授权码
    }
  }
};
