(function(root){'use strict';
const KEYS=['solo-completed-games-v1','solo-history-cloud-journal-v1','solo-history-cloud-connection-v1'];
function storageError(e){return /quota|exceeded|storage.*full/i.test(e?.name+' '+e?.message)?Error('기기의 기록 저장 공간이 부족합니다. 기존 기록과 전송 대기분은 보존했습니다. 기록 백업 후 다시 시도해 주세요.'):e;}
function create({storage,indexedDB=root.indexedDB,notify=()=>{},database='board-table-history-v1'}={}){
 const cache=new Map(KEYS.map(k=>[k,storage.getItem(k)])),dirty=new Map();let db=null,lastError=null,chain=Promise.resolve(),loaded=false;
 const initial=new Map(cache),special=k=>KEYS.includes(k);
 function open(){return new Promise((resolve,reject)=>{const r=indexedDB.open(database,1);r.onupgradeneeded=()=>r.result.createObjectStore('records');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(Error('기록 저장소를 여는 중입니다. 다른 Table 창을 닫고 다시 시도해 주세요.'));});}
 function readAll(){return new Promise((resolve,reject)=>{const tx=db.transaction('records','readonly'),s=tx.objectStore('records'),values=new Map();for(const k of KEYS){const r=s.get(k);r.onsuccess=()=>values.set(k,r.result??null);}tx.oncomplete=()=>resolve(values);tx.onabort=tx.onerror=()=>reject(tx.error||Error('기록 저장소를 읽을 수 없습니다.'));});}
 function commit(){if(!db||!dirty.size)return Promise.resolve();const values=new Map(dirty);return new Promise((resolve,reject)=>{const tx=db.transaction('records','readwrite'),s=tx.objectStore('records');for(const [k,v]of values)if(v===null)s.delete(k);else s.put(v,k);tx.oncomplete=()=>{for(const [k,v]of values){if(dirty.get(k)===v)dirty.delete(k);try{if(storage.getItem(k)===initial.get(k))storage.removeItem(k);}catch{}}lastError=null;resolve();};tx.onabort=tx.onerror=()=>reject(storageError(tx.error||Error('기록 저장에 실패했습니다. 기존 기록은 보존했습니다.')));});}
 const ready=(async()=>{if(!indexedDB){loaded=true;return;}db=await open();const persisted=await readAll();for(const k of KEYS){const old=initial.get(k),saved=persisted.get(k);if(!dirty.has(k))cache.set(k,saved===null?old:saved);if(old!==null&&saved!==null&&old!==saved){
   // Keep a recoverable copy if an older app window wrote after migration.
   await new Promise((resolve,reject)=>{const tx=db.transaction('records','readwrite');tx.objectStore('records').put(old,'legacy:'+Date.now()+':'+k);tx.oncomplete=resolve;tx.onabort=tx.onerror=()=>reject(tx.error);});
  }if(saved===null&&cache.get(k)!==null)dirty.set(k,cache.get(k));}
 loaded=true;await commit();notify({type:'ready'});
 })().catch(e=>{lastError=storageError(e);notify({type:'error',error:lastError});throw lastError;});
 ready.catch(()=>{});
 function queue(){chain=chain.catch(()=>{}).then(()=>ready).then(commit).catch(e=>{lastError=storageError(e);notify({type:'error',error:lastError});});}
 const api={historyRecordStorage:true,ready,getItem(k){return special(k)?cache.get(k)??null:storage.getItem(k);},setItem(k,v){if(!special(k))return storage.setItem(k,v);v=String(v);if(!indexedDB){storage.setItem(k,v);cache.set(k,v);return;}cache.set(k,v);dirty.set(k,v);if(loaded)queue();},removeItem(k){if(!special(k))return storage.removeItem(k);if(!indexedDB){storage.removeItem(k);cache.set(k,null);return;}cache.set(k,null);dirty.set(k,null);if(loaded)queue();},async flush(){await ready;await chain;if(dirty.size)await commit();if(lastError)throw lastError;},getError:()=>lastError};return api;
}
let shared=null;
function get(storage){if(storage?.historyRecordStorage)return storage;if(!root.indexedDB)return storage;if(!shared)shared=create({storage:root.localStorage,notify:e=>{if(root.dispatchEvent&&root.CustomEvent)root.dispatchEvent(new root.CustomEvent(e.type==='ready'?'completed-games-changed':'history-record-store-error',{detail:e}));}});return shared;}
const api={KEYS,create,get,storageError};root.HistoryStore=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='undefined'?globalThis:window);