const path = require("path");
const bodyParser = require("koa-bodyparser");
const fse = require("fs-extra");
const fs = require("fs");
const UPLOAD_DIR = path.resolve(__dirname, "..", "target");
const resolvePost = (req) =>
  new Promise((resolve) => {
    let chunk = "";
    req.on("data", (data) => {
      chunk += data;
    });
    req.on("end", () => {
      resolve(JSON.parse(chunk));
    });
  });

const pipeStream = (path, writeStream) =>
  new Promise((resolve) => {
      console.log(path,22);
    const readStream = fse.createReadStream(path);
    readStream.on("end", () => {
      fse.unlinkSync(path);
      resolve();
    });
    readStream.pipe(writeStream);
  });
const merge = async (filePath, filename, size) => {
  const chunkDir = path.join(UPLOAD_DIR, filename);
  console.log(chunkDir);
  //   let chunkPaths = await fse.readdir(path.join(chunkDir,""))
  let chunkPaths = await fse.readdir("./target/" + filename);
  console.log(chunkPaths, filePath);
  // 根据切片下标进行排序
  // 否则直接读取目录的获得的顺序可能会错乱
  chunkPaths.sort((a, b) => a.split("-")[1] - b.split("-")[1]);
  await Promise.all(
    chunkPaths.map((chunkPath, index) =>{
        console.log("./target/" + filename+"/"+chunkPath, filePath);
        return pipeStream(
            "./target/" + filename+"/"+chunkPath,
            // 指定位置创建可写流
            fse.createWriteStream(filePath, {
              start: index * size,
              end: (index + 1) * size,
              encoding:"utf-8"
              
            })
          )
    }
      
    )
  );
};
merge("./test.txt", "test.txt", 5);
