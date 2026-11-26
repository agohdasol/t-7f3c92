(function(root){'use strict';
const A=root.Arkham,X=A.CampaignEngine,{H,queue,choice,opt,card,code,name}=A;
const DESPERATE=new Set(['03116','03117','03118','03119']),READY=[...DESPERATE,'03039','03228','03231','03233','03235','03272','03312'];
const engaged=(s,pi)=>s.enemies.filter(u=>s.cards[u].engaged===pi||A.isMassive(s,u)&&s.cards[u].ready&&s.cards[u].location===s.players[pi].location);
const charged=d=>/Uses\s*\(\d+\s+charges?\)/i.test(d.enText||d.real_text||'');
const canCommit=A.canCommit;A.canCommit=(s,t,pi,u)=>{
 if(canCommit?.(s,t,pi,u)===false)return false;
 const id=code(s,u),same=t.committed.some(x=>code(s,x.u)===id);
 if(DESPERATE.has(id))return !same&&A.maxSanity(s,pi)-s.players[pi].horror<=3;
 if(id==='03233')return pi===t.pi;
 if(id==='03272')return engaged(s,pi).length>0;
 return true;
};
const icons=A.modifyCommitIcons;A.modifyCommitIcons=(s,t,pi,u,n)=>{
 n=icons?icons(s,t,pi,u,n):n;
 if(code(s,u)==='03272'&&['willpower','combat','agility'].includes(t.skill))n+=engaged(s,pi).length;
 if(code(s,u)==='03235')n+=(t.ptcPower?.[u]?.length||0)*(t.skill==='willpower'?2:1);
 return n;
};
const commit=H.commitCard;H.commitCard=(s,e)=>{
 const id=code(s,e.u),p=s.players[e.pi];
 if(!e.ptcCostDone&&id==='03233'){
  choice(s,e.pi,'“잘 봐!” · 추가 비용',Array.from({length:Math.min(3,p.resources)+1},(_,n)=>opt('자원 '+n+' 소비 · 1 이상 차이로 성공 시 자원 '+(n*2)+' 획득',{...e,kind:'ptcWatchCommit',n},id)));
  return;
 }
 if(!e.ptcCostDone&&id==='03235'){queue(s,{...e,kind:'ptcPowerCost',spent:[]});return;}
 commit(s,e);
};
H.ptcWatchCommit=(s,e)=>{const p=s.players[e.pi];if(!p.hand.includes(e.u)||p.resources<e.n)return;p.resources-=e.n;s.test.ptcWatch||={};s.test.ptcWatch[e.u]=e.n;queue(s,{kind:'commitCard',pi:e.pi,u:e.u,ptcCostDone:true});};
H.ptcPowerCost=(s,e)=>{
 const p=s.players[e.pi],spent=e.spent||[],counts=u=>spent.filter(x=>x===u).length;
 const options=spent.length<3?p.assets.filter(u=>charged(card(s,u))&&s.cards[u].uses>counts(u)).map(u=>opt(name(s,u)+' · 충전 1회 추가 소비',[{...e,kind:'ptcPowerCost',spent:[...spent,u]}],code(s,u))):[];
 options.push(opt('충전 '+spent.length+'회 소비하고 소모 확정',{...e,kind:'ptcPowerCommit',spent}));
 choice(s,e.pi,'힘의 격류 · 충전 추가 비용 '+spent.length+'/3',options,'소비한 충전마다 의지 아이콘과 만능 아이콘을 각각 1개 추가합니다. 소진하거나 기능을 격발하는 비용이 아닙니다.');
};
H.ptcPowerCommit=(s,e)=>{const p=s.players[e.pi];if(!p.hand.includes(e.u))return;const counts={};for(const u of e.spent)counts[u]=(counts[u]||0)+1;for(const[u,n]of Object.entries(counts))if(!p.assets.includes(u)||s.cards[u].uses<n)return;for(const[u,n]of Object.entries(counts))s.cards[u].uses-=n;s.test.ptcPower||={};s.test.ptcPower[e.u]=e.spent.slice();queue(s,{kind:'commitCard',pi:e.pi,u:e.u,ptcCostDone:true});};
const refund=A.refundCommit;A.refundCommit=(s,t,pi,u)=>{refund?.(s,t,pi,u);if(t.ptcWatch?.[u]!==undefined){s.players[pi].resources+=t.ptcWatch[u];delete t.ptcWatch[u];}if(t.ptcPower?.[u]){for(const source of t.ptcPower[u])if(s.players[pi].assets.includes(source))s.cards[source].uses++;delete t.ptcPower[u];}};
const success=A.successEffects;A.successEffects=(s,t)=>{
 const fx=success?.(s,t)||[];if(!t.success)return fx;
 for(const x of t.committed){const id=code(s,x.u),base={pi:x.pi,cardCode:id};
  if(id==='03039')fx.push({...base,kind:'ptcResourceful',label:'임기응변 · 생존자 카드 회수'});
  if(id==='03228')fx.push({...base,kind:'ptcInspiring',label:'고무적인 존재 · 조력자 준비·회복'});
  if(id==='03231')fx.push({...base,pi:t.pi,kind:'ptcEureka',label:'유레카! · 덱 위 3장 검색'});
  if(id==='03233'&&t.margin>=1)fx.push({...base,kind:'gainResource',n:2*(t.ptcWatch?.[x.u]||0),label:'“잘 봐!” · 건 자원의 두 배 획득'});
 }
 return fx;
};
H.ptcResourceful=(s,e)=>{const p=s.players[e.pi],ids=p.discard.filter(u=>(root.ArkhamDeck.classes(card(s,u))).includes('survivor')&&card(s,u).name!==A.D['03039'].name&&A.canMoveCard?.(s,u,'discard',e.pi,'hand',e.pi)!==false);if(ids.length)choice(s,e.pi,'임기응변 · 생존자 카드 회수',ids.map(u=>opt(name(s,u),{kind:'returnCard',pi:e.pi,u},code(s,u))));};
H.ptcInspiring=(s,e)=>{const candidates=A.playersAt(s,s.players[e.pi].location).flatMap(p=>p.assets).filter(u=>A.isTrait(s,u,'Ally'));if(!candidates.length)return;const options=[];for(const u of candidates){const c=s.cards[u];for(const which of ['damage','horror'])if(c[which]>0)options.push(opt(name(s,u)+' 준비 · '+(which==='damage'?'피해':'공포')+' 1 회복',{kind:'ptcInspireAlly',u,which},code(s,u)));if(!c.ready&&!c.damage&&!c.horror)options.push(opt(name(s,u)+' 준비',{kind:'ptcInspireAlly',u},code(s,u)));}if(options.length)choice(s,e.pi,'고무적인 존재 · 조력자 선택',options);};
H.ptcInspireAlly=(s,e)=>{const c=s.cards[e.u];if(c?.zone!=='assets')return;c.ready=true;if(e.which)c[e.which]=Math.max(0,c[e.which]-1);};
H.ptcEureka=(s,e)=>{const p=s.players[e.pi],top=p.deck.slice(-3);if(!top.length)return;choice(s,e.pi,'유레카! · 덱 위 3장 중 카드 뽑기',[...top.map(u=>opt(name(s,u),[{kind:'ptcSearchDraw',pi:e.pi,u},{kind:'shuffleDeck',pi:e.pi}],code(s,u))),opt('찾지 않고 섞기',{kind:'shuffleDeck',pi:e.pi})]);};
H.ptcSearchDraw=(s,e)=>{if(!s.players[e.pi].deck.includes(e.u))return;H.returnCard(s,e);A.cardDrawn?.(s,e.pi,e.u);};
const chaos=H.beforeChaos;H.beforeChaos=(s,e)=>{if(s.test?.committed.some(x=>code(s,x.u)==='03312')){s.test.drawnIndices||=[];queue(s,{kind:'tokenReactions',item:{token:'elder_sign',index:-1}});return;}chaos(s,e);};
const clean=H.cleanupTest;H.cleanupTest=(s,e)=>{for(const x of e.t.committed)if(code(s,x.u)==='03312'&&s.cards[x.u].zone==='aside')A.moveCard(s,x.u,'removed',x.pi);clean(s,e);};
A.Content.register({cards:READY});
})(typeof window==='undefined'?globalThis:window);
