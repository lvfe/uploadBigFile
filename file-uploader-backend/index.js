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
        handlefile(req)
        ctx.body = {msg:'ok'};
    } else {
        console.log('out in uploader');
        ctx.body = {msg:'sorry'};
    }
})

app.listen(3000);

function handlefile(req){
    var form = new multiparty.Form();
    form.parse(req, function(error, fields, files){
     console.log(error);
    console.table(fields);
    console.log(files);
      var input_file = files.file[0];
      var uploaded_path = input_file.path;
      var buf = new Buffer(1024*input_file.size);
 
    //   获取文件的内容，作为一个base，这里只是读取文件的内容，并没有存储
      fs.open(uploaded_path, 'r+', function(err, fd) {
         if (err) {
             return console.error(err);
         }
         fs.read(fd, buf, 0, buf.length, 0, function(err, bytes){
            if (err){
               console.log(err);
            }
             
            var a = buf.slice(0, bytes).toString().split('\r\n');
            var b = a.map(function(a_item){
              return a_item.split(',');            
            })
            console.log(b);   
 
         });
      });
  })
 
}