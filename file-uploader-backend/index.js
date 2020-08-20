const Koa = require('koa');
const app = new Koa();

const path = require('path')
const bodyParser = require('koa-bodyparser')
const fse = require("fs-extra");
const fs = require("fs");
const multiparty = require("multiparty");

const UPLOAD_DIR = path.resolve(__dirname, "..", "target"); // 大文件存储目录
app.use(bodyParser())

app.use(async ctx=>{
    const {req, res} = ctx;
    res.setHeader('Access-Control-Allow-Origin', "*")
    res.setHeader('Access-Control-Allow-Headers', '*')
    if (req.method === "OPTIONS") {
        res.status = 200
        res.end()
        return
     }
    if(ctx.url=='/uploader' && ctx.method==='POST'){
        console.log('in uploader');
        await handlefile(req)
        ctx.body = {msg:'ok'};
    } else if(ctx.url=='/merge' && ctx.method==='POST') {
        console.log('merge');
        await handleMerge(req);
        ctx.body = {msg:'ok'};
    } else {
        console.log('out in uploader');
        ctx.body = {msg:'sorry'};
    }
})

app.listen(3000);
const resolvePost = req =>
  new Promise(resolve => {
    let chunk = "";
    req.on("data", data => {
      chunk += data;
    });
    req.on("end", () => {
      resolve(chunk);
    });
 });
async function handleMerge(req){
    const filename = await resolvePost(req);
    const chunkdir = path.resolve(UPLOAD_DIR, filename);
    const chunPaths = await fse.readdir(path.resolve(UPLOAD_DIR, ''));
    await Promise.all(
        chunPaths.map((chunPath, index) =>
          pipeStream(
            chunPath,
            // 指定位置创建可写流 加一个put避免文件夹和文件重名
            // hash后不存在这个问题，因为文件夹没有后缀
            // fse.createWriteStream(path.resolve(dest, '../', 'out' + filename), {
            fse.createWriteStream(path.resolve(UPLOAD_DIR, '../', 'out' + filename, {
              start: index * size,
              end: (index + 1) * size
            })
          )
        )
      )
    )
    
    // console.log(chunPaths);
    // let start = 0;
    // let size = 40;
    // let streams = chunPaths.map(chunkpath=>{
    //     return fse.createReadStream(chunkpath, {
    //         start: start,
    //         end: start+size
    //     })
    // })
    // let ss;
    // streams.forEach(s=>{
    //    ss.pipe(s);
    // })
    // ss.end();

    // fs.writeFileSync(chunkdir, ss)
    // // let streamsW = chunPaths.map(chunkpath=>{
    // //     return fse.createWriteStream(chunkdir, {
    // //         start: start,
    // //         end: start+size
    // //     })
    // // })
    // console.log(chunkdir);
 
   
        
}
const pipeStream = (filePath, writeStream) =>
  new Promise(resolve => {
    const readStream = fse.createReadStream(filePath)
    readStream.on("end", () => {
      // 删除文件
      fse.unlinkSync(filePath)
      resolve()
    })
    readStream.pipe(writeStream)
  })
async function handlefile(req){
    var form = new multiparty.Form();
    form.parse(req, async function(error, fields, files){
        const [chunk] = files.chunk;
        const [hash] = fields.hash;
        const [filename] = fields.filename;
        const chunkdir = path.resolve(UPLOAD_DIR, filename);
        if(!fse.existsSync(chunkdir))
            await fse.mkdirs(chunkdir);

        await fse.move(chunk.path, `${chunkdir}/${hash}`)
        
  });
 
}