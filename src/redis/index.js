import redis from 'redis';

// 创建客户端
const redisClient = redis.createClient({
  // url: 'redis://root:foobared@awesome.redis.server:6379'
  url: 'redis://localhost:6379'
});
redisClient.on('error', err => {
  console.log('redis 连接失败----', err);
});
redisClient.on('connect', () => {
  console.log('redis 连接成功');
});
export async function set(key, val, options = {}) {
  if (typeof val === 'object') {
    val = JSON.stringify(val);
  }
  redisClient.set(key, val);
  redisClient.expire(key, options.EX);
}
export function get(key) {
  return new Promise((resolve, reject) => {
    redisClient.get(key, (err, val) => {
      if (err) {
        return reject(err);
      }
      if (val === null) {
        return resolve(null);
      }

      resolve(val);
    });
  });
}
export function del(key) {
  return new Promise((resolve, reject) => {
    redisClient.del(key, (err, val) => {
      if (err) {
        reject(err);
        return;
      }
      if (val === null) {
        resolve(null);
        return;
      }
      try {
        resolve(JSON.parse(val));
      } catch (error) {
        resolve(val);
      }
    });
  });
}
