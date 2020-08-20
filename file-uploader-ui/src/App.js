import React from 'react';
import './App.css';
import { request } from './utils/request';
import * as fs from 'fs';

function App() {
  let file;
  return (
    <div className="App">
      <input type="file" onChange={handlefileChange}/>
      <button onClick={(_)=>handleClick()}>upload</button>
    </div>
  );
  function handleClick(){
    const formData=new FormData();
    formData.append("chunk", "")
    formData.append("file", file);
    formData.append("filename", file.name)
    console.log(formData);
    request({
      url:'http://localhost:3000/uploader', 
      data:formData,
      headers: {},
      method: 'POST'
    }).then(res=>{
      console.log('loaded');
    })
  }
  function handlefileChange(event){
    [file] = event.target.files
    console.log(1, file);
  }
}

export default App;
