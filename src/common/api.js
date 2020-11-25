import axios from 'axios';

import { Loading } from 'element-ui';
export function get(url, params){    
   let getUrl =  this.userApiUrl + url; 
   let loadingInstance = Loading.service();
    return new Promise((resolve, reject) =>{        
        axios.get(getUrl, {            
            params: params        
        }).then(res => {
            loadingInstance.close();
            resolve(res.data);
        }).catch(err =>{
            loadingInstance.close();
            reject(err.data)        
        })    
    });
}

export function post(url, params) {
    let posturl =  this.userApiUrl + url; 
    let that = this;
    let loadingInstance = Loading.service();
    return new Promise((resolve, reject) => {
        axios.post(posturl, that.$qs.stringify(params))
        .then(res => {
            loadingInstance.close();
            resolve(res.data);
        })
        .catch(err =>{
            loadingInstance.close();
            reject(err.data)
        })
    });
}
