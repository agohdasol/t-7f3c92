/* Rules see the temporary location; serialized state and the table retain physical positions. */
(function(root){'use strict';
const A=root.Arkham,X=A.CampaignEngine,{H,queue,code,card,name}=A,contexts=new WeakMap();
const scopes=s=>s.ptcAsIfLocations||[];
function top(s){const by=new Map();for(const x of scopes(s))by.set(x.pi,x);return by;}
function physical(s,pi){return contexts.get(s)?.physical[pi]??s.players[pi].location;}
function view(s,fn){if(!scopes(s).length||contexts.has(s))return fn();const active=top(s),ctx={physical:{},exposed:{}};for(const[pi,x]of active){ctx.physical[pi]=s.players[pi].location;ctx.exposed[pi]=x.location;s.players[pi].location=x.location;}contexts.set(s,ctx);try{return fn();}finally{for(const[pi]of active){const p=s.players[pi];if(p.location!==ctx.exposed[pi])ctx.physical[pi]=p.location;p.location=ctx.physical[pi];}contexts.delete(s);}}
A.physicalLocation=physical;
A.withRuleLocations=view;
const copy=A.copy;A.copy=x=>{const out=copy(x),ctx=x&&typeof x==='object'?contexts.get(x):null;if(ctx&&out.players)for(const[pi,l]of Object.entries(ctx.physical))out.players[pi].location=l;return out;};
Object.assign(A.uses,{'03027':3});
H.ptcAsIfBegin=(s,e)=>{s.ptcAsIfSerial=Math.max(s.ptcAsIfSerial||0,e.scopeId);s.ptcAsIfLocations=[...scopes(s),{id:e.scopeId,pi:e.pi,location:e.location,source:e.source}];};
H.ptcAsIfEnd=(s,e)=>{s.ptcAsIfLocations=scopes(s).filter(x=>x.id!==e.scopeId);};
const main=A.mainActions;A.mainActions=(s,fx=false)=>{let out=main(s,fx);if(s.pending||s.result||s.phase!=='investigation')return out;const pi=s.current,p=s.players[pi];for(const u of p.assets.filter(u=>code(s,u)==='03027'&&s.cards[u].uses>0&&!A.assetTextBlank?.(s,u)&&A.canTrigger?.(s,pi,u)!==false))for(const location of Object.values(s.locations).filter(l=>l.revealed)){const t=A.copy(s),scopeId=(s.ptcAsIfSerial||0)+1;t.ptcAsIfLocations=[...scopes(t),{id:scopeId,pi,location:location.id,source:u}];const generated=[];view(t,()=>{if(A.clueBlocked(t,pi)||location.attachments.some(v=>code(t,v)==='01174'))return;X.action(t,generated,true,{id:'ptcInTheKnow:'+u+':'+location.id,label:'사정에 밝다 · '+name(t,location.id)+' 원격 조사',pi,type:'investigate',source:u,uses:1,card:'03027',target:location.id,description:'조사자·적의 실제 위치를 옮기지 않습니다',effects:[{kind:'startTest',pi,source:u,skill:'intellect',difficulty:A.shroud(t,location.id),testKind:'investigate',location:location.id}]});});for(const a of generated)if(view(t,()=>X.def(t)?.filterAction?.(t,a,X))!==false)out.push({...a,effects:fx?[{kind:'ptcAsIfBegin',pi,source:u,location:location.id,scopeId},...a.effects,{kind:'ptcAsIfEnd',scopeId}]:undefined});}return out;};
const targets=A.enemyTargets;A.enemyTargets=(s,u,ps)=>(targets?targets(s,u,ps):ps).filter(p=>!top(s).has(p.id)||physical(s,p.id)===s.cards[u].location||s.cards[u].owner===p.id&&['weakness','basicweakness'].includes(card(s,u).subtype_code));
const activeEnemies=A.activeEnemies;A.activeEnemies=(s,pi)=>[...new Set([...activeEnemies(s,pi),...s.enemies.filter(u=>s.cards[u].ready&&A.isMassive(s,u)&&s.cards[u].location===physical(s,pi))])];
for(const key of Object.keys(H)){if(['ptcAsIfBegin','ptcAsIfEnd'].includes(key))continue;const body=H[key];H[key]=(s,e)=>view(s,()=>{const ctx=contexts.get(s),pi=e?.pi;if(key==='moveTo'&&ctx&&top(s).has(pi)){const p=s.players[pi],virtual=p.location;p.location=ctx.physical[pi];try{return body(s,e);}finally{ctx.physical[pi]=p.location;p.location=virtual;}}const result=body(s,e);if(key==='engageEnemy'&&ctx&&top(s).has(pi)&&s.cards[e.u]?.engaged===pi)s.cards[e.u].location=ctx.physical[pi];return result;});}
for(const key of ['stat','baseSkill','has','threat','blank','playersAt','mainActions','activeEnemies','canPlay','cardCost','actionCost','canCommit','canTrigger','commitIconValue','testValue','testMathResult','tokenValue','clueBlocked','canDiscover','damageAssets','discover','damage','heal','enemyDamage','beforeChoose','canPayCard','payCard'])if(typeof A[key]==='function'){const body=A[key];A[key]=(s,...args)=>view(s,()=>body(s,...args));}
for(const key of ['rank','choose','probability']){const body=A.AI[key];if(body)A.AI[key]=(s,...args)=>view(s,()=>body(s,...args));}
const finish=A.beforeScenarioFinish;A.beforeScenarioFinish=s=>{finish?.(s);delete s.ptcAsIfLocations;};
const coreFinish=H.finish;H.finish=(s,e)=>{coreFinish(s,e);if(s.result)delete s.ptcAsIfLocations;};
A.Content.register({cards:['03027']});
})(typeof window==='undefined'?globalThis:window);
