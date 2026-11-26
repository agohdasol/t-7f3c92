(function(root){'use strict';const A=root.Arkham,X=A.CampaignEngine,{H,queue,code}=A;
for(const id of ['02038','02039'])X.encounters.set(id,(s,e)=>A.moveCard(s,e.u,'threat',e.pi));
const initialize=H.initializeAsset;H.initializeAsset=(s,e)=>{initialize(s,e);const p=s.players[e.pi];if(code(s,e.u)==='02037'&&!p.flags.indebtedSetup){p.flags.indebtedSetup=true;p.resources=Math.max(0,p.resources-2);}};
const main=A.mainActions;A.mainActions=(s,withEffects=false)=>{const out=main(s,withEffects);if(s.pending||s.result||s.phase!=='investigation')return out;const p=s.players[s.current];for(const u of p.threat)if(['02038','02039'].includes(code(s,u)))X.action(s,out,withEffects,{id:'dwlWeakness:'+u,label:A.name(s,u)+' 제거',actions:2,card:code(s,u),effects:[{kind:'discard',u}]});return out;};
const end=H.endTurn;H.endTurn=(s,e)=>{end(s,e);const at=s.queue.findIndex(e=>e.kind==='turnEnded'),fx=s.players[e.pi].threat.filter(u=>['02038','02039'].includes(code(s,u))).map(u=>({kind:'damage',pi:e.pi,damage:code(s,u)==='02038'?1:0,horror:code(s,u)==='02039'?1:0,direct:true,source:u}));s.queue.splice(at>=0?at:0,0,...fx);};
A.Content.register({cards:['02037','02038','02039']});
})(typeof window==='undefined'?globalThis:window);
