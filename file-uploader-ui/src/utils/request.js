export const request = ({url, method, data, headers })=>{
    return new Promise((resolve, reject)=>{
        const xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.send(data);
        xhr.onerror = function(...err){
            reject(err)
        }
        xhr.onload = function(...data){
            resolve(data)
        }
    })
}