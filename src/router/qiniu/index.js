import Router from 'koa-router';
import qiniu from 'qiniu';
import config from '../../config/index.js';
// import request from 'request-promise';

const router = new Router();

qiniu.conf.ACCESS_KEY = config.qiniu.AK;
qiniu.conf.SECRET_KEY = config.qiniu.SK;
//上传到七牛后保存的文件名
const options = {
  scope: 'react1',
  expires: 3600 * 24
};

function uptoken() {
  var putPolicy = new qiniu.rs.PutPolicy(options);
  const uploadToken = putPolicy.uploadToken();
  return uploadToken;
}

router.get('/', async (ctx, next) => {
  const token = uptoken();
  ctx.$util.success(token);
});

export default router.routes();

// http(s)://upload-z2.qiniup.com    官方上传地址
// methods: {
//   async handleUpload (e) {
//     const file = e.target.files[0];
//     const key = file.name;
//     console.log(file, 'aaaaaaaaaaaaa');
//     const token = 'laugswI0dIPYGhuSwsRegz0hgd8L5jDLLWtsKmBm:VjdMWjbRF0ReT5gA7-fQ_UCjv0E=:eyJzY29wZSI6InJlYWN0MSIsImRlYWRsaW5lIjoxNjEyMzI0NTAzfQ==';
//     const qiniu = window.qiniu;
//     const observable = await qiniu.upload(file, key, token);
//     const subscription = await observable.subscribe(observable);
//     console.log(subscription, 'ffffffffffffff');
//   }
// },
// mounted() {

// },

// render () {
//   return (
//     <div>
//       <div onClick={this.handleUpload}>fafdsaf</div>
//       <input type="file" onChange={this.handleUpload}></input>
//     </div>
//   );
// }

// 最后一次成功案例
// <script>
// export default {
//   data () {
//     return {

//     };
//   },
//   components: {

//   },
//   render () {
//     return (
//       <div>fdasfasdf</div>
//     );
//   }
// };
// </script>

// <style lang="less" scoped>

// </style>
