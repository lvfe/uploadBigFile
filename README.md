# uploadBigFile
断点续传，大文件上传

1. 简单的通过httppost 上传文件的前后台。
前端用react, 后端用koajs

2. 文件分块 同时上传
2.1. 控制并发量
3. 断点续传， 对文件块hash

4. webworker计算hash
5. requestIdleCallback计算hash
6. 慢启动调整文件块的大小
7. 可视化进度条