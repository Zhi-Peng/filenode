# 批量获取客户详情和 获取客户详情的区别

1. > 批量获取里面没有个人标签
2. > 批量里面关联的用户是对象类型，单个关联的用户是列表数组

# mongoose updateMany 用法

1.  > const res = await customerCorpTags.updateMany({group_id: item.group_id}, {$set: {'tag.$': item.tag[0]}}, {upsert: true});
2.  > const res = await customerCorpTags.updateOne({group_id: item.group_id, 'tag.id': {$ne: item.tag[0].id}}, {$push: {tag: item.tag[0]}});
3.  > mongoose findOneAndUpdate 没有 $cond 但是 mongodb 的 findAndModify 有 $cond 这个操作符，所以 mongoose 一般用聚合

         //{
           //$set: {
             //tag: {
               //$map: {
                 //input: '$tag',
                 //in: {
                   //$mergeObjects: [
                     //'$$this',
                     //{
                       //$cond: [
                         //{
                           //$eq: ['$$this.id', item.tag[0].id],
                         //},
                         //item.tag[0],
                         //'$noval'
                       //]
                     //}
                   //]
                 //}
               //}
             //}
           //}
         //},
         //{ $set: {
             //tag: { $concatArrays: ['$tag', [item.tag[0]]] }
           //}
         //}

# updateOne 和 findOneAndUpdate 区别在于前者只更新一个，后者也更新一个，但是后者更新后可返回更新值

# yarn build 要安装，但可以缓存。 yarn build1 只打包，但是会慢一点。这两个当中有 5-10 秒的差别，有时间可以试试