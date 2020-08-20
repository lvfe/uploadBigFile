import React from 'react';
import './App.css';
import { request } from './utils/request';
import * as fs from 'fs';

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
    let requests = chunklist.map((item, index)=>{
      return {
        chunk: item.file,
        hash: file.name+'-'+index
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
}

export default App;
