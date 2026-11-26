/* Preview event windows on copies; only the chosen physical Painted World is changed. */
(function(root){'use strict';
const A=root.Arkham,P=A.PaintedWorld,{H,queue,choice,opt,code,name}=A,handlers=new Map();
const forwarding=new Set(['dwlGazeWindow','dwlReactiveSpawn','teamDefense','ptcHeroicWindow','enemyAttack']);
function staged(s){return Object.values(s.cards).some(c=>c.ptcPaintedOriginal&&!c.ptcPaintedPlaying&&c.zone==='hand');}
function canOffer(s,body,e,u,target){
 const t=A.copy(s),pi=t.cards[u].owner;t.pending=null;t.queue=[];t.ptcReactionPreview=true;
 P.begin(t,u,target,false);
 const hand=t.players[pi].hand;t.players[pi].hand=[u,...hand.filter(v=>v!==u)];
 body(t,A.copy(e));
 for(let n=0;n<12&&!t.pending&&!t.result&&forwarding.has(t.queue[0]?.kind);n++){const next=t.queue.shift();H[next.kind](t,next);}
 return !!t.pending?.options.some(o=>P.plays(o.effects,u));
}
function offer(s,key,body,e){
 if(s.result||s.pending||s.ptcReactionPreview||e?.ptcPaintedChecked||staged(s))return false;
 for(const p of s.players){
  if(p.out)continue;
  const copies=p.hand.filter(u=>code(s,u)==='03306'||p.investigator==='03003'&&code(s,u)==='03012'),options=[];
  for(const u of copies)for(const target of (code(s,u)==='03306'?A.eideticTargets(s,p.id):P.under(s,p.id)))if(canOffer(s,body,e,u,target))options.push(opt(name(s,u)+' · '+name(s,target)+' 복사',[
   {kind:code(s,u)==='03306'?'ptcEideticBegin':'ptcPaintedBegin',pi:p.id,u,target,playing:false},
   {kind:'ptcInvokeReaction',key,event:A.copy(e),u}
  ],code(s,target)));
  if(!options.length)continue;
  const copyLabel=code(s,copies[0])==='03306'?'완전기억능력':'그림 속 세계';options.push(opt(copyLabel+' 사용하지 않기',{kind:'ptcInvokeReaction',key,event:A.copy(e)}));
  choice(s,p.id,copyLabel+' · 반응 이벤트 선택',options,'복사할 이벤트를 선택한 뒤 반응을 확정하고 그 이벤트의 비용을 지불합니다. 완전기억능력은 버린 카드의 원본도 제거합니다.','reaction');
  return true;
 }
 return false;
}
function wrap(key){
 if(handlers.has(key)||!H[key])return;
 const body=H[key];handlers.set(key,body);
 H[key]=(s,e={})=>{if(!offer(s,key,body,e))body(s,e);};
}
H.ptcInvokeReaction=(s,e)=>{
 const body=handlers.get(e.key);if(!body)return;
 if(e.u){const p=s.players[s.cards[e.u].owner];p.hand=[e.u,...p.hand.filter(u=>u!==e.u)];queue(s,{kind:'ptcPaintedRestore',u:e.u});}
 const result=body(s,{...e.event,ptcPaintedChecked:true});
 if(e.key==='beforeSpawn'&&!result)queue(s,{...e.event,kind:'spawnEnemy',ptcPaintedChecked:true});
};
for(const key of ['encounterDraw','phaseWindow','damage','teamDefense','tokenReactions','testMath','dwlDrawnEncounter','revealCard','enemyAttack','dwlGazeWindow','dwlReactiveSpawn','ptcHeroicWindow','ptcTimeWarpWindow','ptcEatLeadWindow','ptcSurvivalWindow','ptcForcedDeathWindow','dwlOops','dwlBleeds'])wrap(key);
const spawn=A.beforeSpawn;if(spawn){handlers.set('beforeSpawn',spawn);A.beforeSpawn=(s,e)=>offer(s,'beforeSpawn',spawn,e)||spawn(s,e);}
P.wrapReaction=wrap;
A.Content.register({investigators:['03003']});
})(typeof window==='undefined'?globalThis:window);
