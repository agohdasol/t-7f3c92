(function(root){'use strict';
const A=root.Arkham,X=A.CampaignEngine,{H,D,queue,choice,opt,card,code,name}=A;
const WEAPONS={
 '03020':{bonus:0,damage:2,uses:1},
 '03035':{bonus:2,damage:1,exhaust:true},
 '03037':{bonus:2,damage:1},
 '03110':{bonus:0,damage:2,retaliate:true},
 '03147':{bonus:0,damage:1,engagedBonus:true},
 '03190':{bonus:2,damage:2,uses:1,ignoreRetaliate:true},
 '03309':{bonus:1,damage:2,uses:1,lupara:true}
},READY=[...Object.keys(WEAPONS),'03036','03021','03114'];
Object.assign(A.uses,{'03020':6,'03190':4,'03309':2});
const active=(s,pi,u)=>s.players[pi].assets.includes(u)&&!A.assetTextBlank?.(s,u)&&A.canTrigger?.(s,pi,u)!==false;
const engaged=(s,pi)=>s.enemies.filter(u=>s.cards[u].engaged===pi||A.isMassive(s,u)&&s.cards[u].ready&&s.cards[u].location===s.players[pi].location);
const turn=s=>s.round+':'+s.turns;
const moved=A.cardMoved;A.cardMoved=(s,u,from,owner,to)=>{moved?.(s,u,from,owner,to);if(to==='assets'&&from!=='assets'&&code(s,u)==='03309')s.cards[u].ptcEnteredTurn=turn(s);};
const damageAssets=A.damageAssets;A.damageAssets=(s,pi)=>[...new Set([...(damageAssets?damageAssets(s,pi):s.players[pi].assets),...A.playersAt(s,s.players[pi].location).filter(p=>p.id!==pi).flatMap(p=>p.assets.filter(u=>code(s,u)==='03021'&&!A.assetTextBlank?.(s,u)))])];
const opportunity=H.opportunity;H.opportunity=(s,e)=>{if(s.players[e.pi].out)return;if(e.actionType==='engage'&&s.players[e.pi].assets.some(u=>code(s,u)==='03147'&&!A.assetTextBlank?.(s,u)))return;opportunity(s,e);};
const main=A.mainActions;A.mainActions=(s,fx=false)=>{
 let out=main(s,fx);if(s.pending||s.result||s.phase!=='investigation')return out;
 const pi=s.current,p=s.players[pi],local=s.enemies.filter(u=>s.cards[u].location===p.location),t=s.test||s.windowTest;
 out=out.filter(a=>!(READY.includes(a.card)&&a.type==='play'));
 const add=c=>X.action(s,out,fx,{pi,...c});
 for(const u of p.hand){const id=code(s,u);if(READY.includes(id)&&A.canPlay(s,pi,u))add({id:'ptcEquipmentPlay:'+u,label:name(s,u)+' 플레이',card:id,type:'play',resources:A.cardCost(s,pi,u),noAoO:id==='03309',effects:[{kind:'playAsset',pi,u}]});}
 for(const u of p.assets){if(!active(s,pi,u))continue;const id=code(s,u),c=s.cards[u],w=WEAPONS[id];
  if(w&&(!w.uses||c.uses>0)&&(!w.exhaust||c.ready))for(const target of local){const fresh=w.lupara&&c.ptcEnteredTurn===turn(s),bonus=w.bonus+(w.engagedBonus?engaged(s,pi).length:0)+(fresh?1:0),damage=w.damage+(fresh?1:0);add({id:'ptcWeapon:'+u+':'+target,label:D[id].name+' · '+name(s,target)+' · 힘 +'+bonus+' / 피해 '+damage,type:'fight',source:u,uses:w.uses||0,exhaust:!!w.exhaust,card:id,target,effects:[{kind:'startTest',pi,skill:'combat',bonus,difficulty:A.enemyStat(s,target,'fight'),testKind:'fight',damage,source:u,target,ptcRetaliate:!!w.retaliate,ignoreRetaliate:!!w.ignoreRetaliate}]});}
  if(id==='03035'&&c.ready&&t?.pi===pi&&t.source&&A.isTrait(s,t.source,'Spell'))add({id:'ptcAthameBoost:'+u,label:'영혼이 깃든 의식용 단검 · 소진 / 이번 마법 테스트 능력값 +2',actions:0,source:u,exhaust:true,card:id,effects:[{kind:'ptcEquipmentBonus',pi,n:2}]});
  if(id==='03036'){
   if(!(s.locations[p.location].attachments||[]).some(v=>code(s,v)==='01174')&&!A.clueBlocked(s,pi))add({id:'ptcLanternInvestigate:'+u,label:'랜턴 · 장막값 −1로 조사',type:'investigate',source:u,card:id,target:p.location,effects:[{kind:'startTest',pi,skill:'intellect',difficulty:Math.max(0,A.shroud(s,p.location)-1),testKind:'investigate',source:u,location:p.location}]});
   for(const target of local.filter(target=>A.canPlaceEnemyDamage?.(s,target,u,'damage')!==false))add({id:'ptcLanternDamage:'+u+':'+target,label:'랜턴 버리기 · '+name(s,target)+'에게 피해 1',source:u,card:id,target,noAoO:true,costEffects:[{kind:'discard',u}],effects:[{kind:'enemyDamage',pi,u:target,n:1,source:u}]});
  }
  if(id==='03037'&&s.locations[p.location].clues&&!A.clueBlocked(s,pi)&&A.canDiscover?.(s,pi,p.location)!==false)add({id:'ptcShovelClue:'+u,label:'묘지기의 삽 버리기 · 단서 1개 발견',source:u,card:id,costEffects:[{kind:'discard',u}],effects:[{kind:'discover',pi,n:1}]});
 }
 return out;
};
H.ptcEquipmentBonus=(s,e)=>{const t=s.test||s.windowTest;if(t?.pi===e.pi&&!s.players[e.pi].out)t.bonus+=e.n;};
const purpose=H.testPurpose;H.testPurpose=(s,e)=>{const t=e.t,already=!!s.cards[t.target]&&!A.isBlank(s,t.target)&&(card(s,t.target)?.enText||'').includes('Retaliate'),length=s.queue.length;purpose(s,e);if(t.testKind==='fight'&&!t.success&&t.ptcRetaliate&&!already&&s.enemies.includes(t.target)&&s.cards[t.target].ready)X.append(s,length,[{kind:'enemyAttack',u:t.target,pi:t.pi}]);};
A.playerWindowCards=[...(A.playerWindowCards||[]),'03035'];
A.Content.register({cards:READY});
})(typeof window==='undefined'?globalThis:window);
