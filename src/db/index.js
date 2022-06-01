import mysql from 'mysql2';
import config from '../config/index.js';

const pool = mysql.createPool(config.mysql);
export const sqlAction = (sql, values) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
      } else {
        connection.query(sql, values, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
          connection.release();
        });
      }
    });
  });
};

  // id INT NOT NULL AUTO_INCREMENT,
  // name VARCHAR(100) COMMENT '用户名',
  // email VARCHAR(50) NOT NULL COMMENT '邮箱',
  // password VARCHAR(100) NOT NULL COMMENT '密码',
  // phone VARCHAR(12) COMMENT '手机号',
  // roleType INT NOT NULL COMMENT '角色',
  // avator VARCHAR(100) COMMENT '头像',
  // create_time datetime DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  // update_time datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  // PRIMARY KEY (id)
// roleType [1-超管, 2-管理员, 3-员工, 4]
const users = `create table if not exists users(
  id int not null auto_increment,
  name varchar(100) comment '用户名',
  email varchar(50) not null comment '邮箱',
  password varchar(100) not null comment '密码',
  phone varchar(12) comment '手机号',
  avator varchar(100) comment '头像',
  create_time datetime default current_timestamp comment '注册时间',
  update_time datetime default current_timestamp on update current_timestamp comment '更新时间',
  primary key (id)
);`;

// "ext":"后缀名",
// "can_preview":"是否是预览类型，1可以预览，0不可以预览，默认可以预览'",-- 可以就存副本-不可以就只存一个主要的
// "need_scan":"是否需要扫描,1需要扫描 0不需要扫描  内容监管" 判断是否有 屏蔽字
// 再加一个是 文件 还是 文件夹
// TODO 防止盗图可以用服务层转和拼接 url, 直接放固定 url，网页就直接可打开可下载了, 可以加盐  可后做
// status 一个文件被多个文件夹或多个用户引用，状态为启用，当所有引用都没了，也就是所有用户都删除了就设置删除， 当某个用户全删除了此客户设为禁用
// 要建一个隐藏空间，要密码才有效 lock(锁)
// const files = `create table if not exists files(
//   name VARCHAR(50) NOT NULL COMMENT '文件名',
//   size INT NOT NULL COMMENT '文件大小',
//   mimetype VARCHAR(50) NOT NULL COMMENT '文件类型',
//   createTime datetime DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
//   updateTime datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
// )
// `

  // status int(2) not null comment '文件状态',
const files = `create table if not exists files(
  md5 varchar(32) not null comment '文件的MD5',
  name varchar(512) not null comment '文件名',
  suffix varchar(20) comment '文件后缀名',
  dirId varchar(64) comment '文件夹编号',
  size int(11) not null comment '文件大小(单位kb)',
  type int not null comment '1.图片 2.文件 3.视频',
  userId varchar(64) not null comment '用户编号',
  path varchar(1024) not null comment '文件地址',
  createTime datetime not null COMMENT '注册时间',
  primary key (md5)
)
`

// KEY wh_logrecord_user_name (user_name) 
// 本表的user_name字段与wh_logrecord_user_name表user_name字段建立外键 
// 括号外是建立外键的对应表，括号内是对应字段 
// 类似还有 KEY user(userid) 
// 当然，key未必都是外键 
// 文件夹
const dir = `create table if not exists dir(
  dirId int not null auto_increment comment '文件夹编号',
  isDir tinyint(1) not null comment '1-是目录0-不是目录',
  dirName varchar(20) not null comment '文件夹名称',
  dirUserId varchar(30) not null comment '创建人',
  dirPath varchar(1024) not null comment '文件夹地址',
  createTime datetime not null comment '注册时间',
  primary key (dirId)
)
`
// 文件浏览记录
const browseRecord = `create table if not exists browseRecord(
  id int not null auto_increment comment '浏览编号',
  fileId varchar(64) not null comment '文件编号',
  userId varchar(64) not null comment '用户编号',
  browseTime varchar(64) not null comment '浏览时间',
  primary key (id)
)
`

// 文件下载记录
const downloadRecord = `create table if not exists downloadRecord(
  id int not null auto_increment comment '下载编号',
  fileId varchar(64) comment '文件编号',
  userId varchar(64) comment '用户编号',
  downloadTime varchar(64) comment '浏览时间',
  primary key (id)
)
`
// 文件类型
const fileType = `create table if not exists fileType(
  cateId varchar(64) not null comment '类型编号',
  cateName varchar(100) comment '类型名称',
  cateStatus varchar(2) comment '类型状态',
  primary key (cateId)
)
`

/**
 * post方法，对应post请求
 * @param prize_name [奖品名字]
 * @param prize_num [奖品的量]
 * @param remain_num [奖品剩余的量]
 * @param prize_ratio [中奖概率]
 * @param time_begin [活动开始时间]
 * @param time_end [活动结束时间]
 * @param img [奖品图片]
 * @param type [奖品类型]
 */
const prize = `create table if not exists prize(
  id int not null auto_increment,
  name varchar(20) not null comment '奖品名',
  num int not null comment '奖品数量',
  remainNum int not null comment '剩余奖品数量',
  ratio int not null comment '中奖概率',
  timeBegin varchar(20) not null comment '活动开始时间',
  timeEnd varchar(20) not null comment '活动结束时间',
  img varchar(50) not null comment '奖品图片',
  type int not null comment '奖品类型',
  primary key (id)
)`;



let createTable = sql => {
  return sqlAction(sql, []);
};
let dropTable = sql => {
  return sqlAction(sql, []);
}

const dropUsers = `
  drop table if exists users
`;
const dropFiles = `
  drop table if exists files
`;
const dropDir = `
  drop table if exists dir
`;
const dropBrowseRecord = `
  drop table if exists browseRecord
`;
const dropDownloadRecord = `
  drop table if exists downloadRecord
`;
const dropFileType = `
  drop table if exists fileType
`;

// 删除表
// dropTable(dropUsers);
// dropTable(dropFiles);
// dropTable(dropDir);
// dropTable(dropBrowseRecord);
// dropTable(dropDownloadRecord);
// dropTable(dropFileType);

// 建表
createTable(users);
createTable(files);
createTable(dir);
createTable(browseRecord);
createTable(downloadRecord);
createTable(fileType);