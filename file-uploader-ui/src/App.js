import React from 'react';
import './App.css';
import { request } from './utils/request';
import * as fs from 'fs';
import SparkMD5 from "spark-md5"

function App() {
  let file;
  let size = 40;
  let chunklist = [];
  return (
    <div className="App">
      <input type="file" onChange={handlefileChange}/>
      <button onClick={(_)=>handleClick()}>upload</button>
    </div>
  );
  async function handleClick(){
    // let hash = await calculateHashWebworker(chunklist);
    let hash = await calculateHashIdle(chunklist);
    console.log(hash);
    let requests = chunklist.map((item, index)=>{
      return {
        chunk: item.file,
        hash: hash+'-'+index
      }
    }).map(({chunk, hash}, index)=>{
      const formData=new FormData();
      formData.append("chunk", chunk)
      formData.append("filename", file.name)
      formData.append("hash", hash)
      request({
        url:'http://localhost:3000/uploader', 
        data:formData,
        headers: {},
        method: 'POST'
      }).then(res=>{
        console.log('loaded');
      })
    })

    await Promise.all(requests);
    await request({
      url:'http://localhost:3000/merge', 
      data:file.name,
      headers: {},
      method: 'POST'
    });
    
  }
  function handlefileChange(event){
    [file] = event.target.files
    chunklist = [];
    let cur = 0;
    while(cur<file.size){
      chunklist.push({file:file.slice(cur, cur+size)})
      cur+=size;
    }
  }
  function calculateHashWebworker(chunkFilelist){
    return new Promise(resolve=>{
      const worker = new Worker('./hash.js');
      worker.postMessage({chunkFilelist});
      worker.onmessage = e=>{
        const { hash } = e.data;
        resolve(hash);
      }
    })
  }

  function calculateHashIdle(chunklists) {
    return new Promise(resolve => {
      let count = 0;
      const spark = new SparkMD5.ArrayBuffer();
      const appendToSpark = async file => {
        return new Promise(resolve => {
          const reader = new FileReader();
          reader.readAsArrayBuffer(file);
          reader.onload = e => {
            spark.append(e.target.result);
            resolve();
          };
        });
      };
      const workLoop = async deadline => {
        while (count < chunklists.length && deadline.timeRemaining() > 1) {
          await appendToSpark(chunklists[count].file);
          count++;
          if (count < chunklists.length) {
            window.requestIdleCallback(workLoop);
          } else {
            resolve(spark.end());
          }
        }
      };
      window.requestIdleCallback(workLoop);
    });
  }
}

export default App;
