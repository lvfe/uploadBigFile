//web-worker
self.importScripts('spark-md5.min.js');

self.onmessage = e=>{
    const {chunkFilelist} = e.data;
    const spark = new self.SparkMD5.ArrayBuffer()
    let count = 0;
   
    const loadNext = index => {
        const reader = new FileReader()
        reader.readAsArrayBuffer(chunkFilelist[index].file)
        reader.onload = e => {
            count++;
            console.log(index, e.target.result);
            spark.append(e.target.result);
            if(count === chunkFilelist.length){
                self.postMessage({
                    hash: spark.end()
                });
            } else {
               
                loadNext(count)
            }
        }
    }
    loadNext(0)
}