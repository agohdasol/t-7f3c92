(function(root){'use strict';
const A=root.Arkham,prior=A.AI.rank,{code,card}=A;
const steps=fx=>(fx||[]).flatMap(e=>[e,...steps(e.steps||e.fx||[])]);
function probability(s,test,extra=0){const t={bonus:0,committed:[],tokens:[],...test},value=A.testValue(s,t)+extra;return s.bag.filter(x=>{const n=A.tokenValue(s,t,x);return n!==-99&&Math.max(0,value+n)>=t.difficulty;}).length/Math.max(1,s.bag.length);}
function cardValue(s,pi,u){const d=card(s,u),p=s.players[pi];let n=d.type_code==='skill'?5:7-(d.cost||0)*.35;if(/Fight\./.test(d.enText||'')&&d.type_code==='asset')n+=7;if(['01033','03024','03027','01087','03036','03037'].includes(d.code))n+=7;if(['01088','03033','03153','03194'].includes(d.code))n+=5;if(d.subtype_code)n=-20;if(p.assets.some(v=>card(s,v).name===d.name))n-=3;return n;}
function weaponValue(s,u){const d=card(s,u),text=d.enText||'';return d.type_code==='asset'&&/Fight\./.test(text)?(/additional damage|damage instead|damage for this attack/.test(text)?2:1):0;}
function reserve(s,pi,u){const p=s.players[pi],v=weaponValue(s,u);if(!v)return 0;const best=Math.max(0,...p.assets.filter(x=>!A.uses[code(s,x)]||s.cards[x].uses>0).map(x=>weaponValue(s,x)));return v>best?12:0;}
function forecast(s,t,level){const p=s.players[t.pi],base=probability(s,t),limit=level==='easy'?1:level==='normal'?2:3,icons=p.hand.filter(u=>card(s,u).type_code==='skill'||!reserve(s,t.pi,u)&&card(s,u).type_code==='event'&&(card(s,u).cost||0)>p.resources).map(u=>A.commitIconValue(s,{committed:[],...t},t.pi,u)).filter(n=>n>0).sort((a,b)=>b-a),extra=Math.min(limit,icons.slice(0,2).reduce((a,b)=>a+b,0));return base+(probability(s,t,extra)-base)*.65;}
function marginGain(s,t,n){const threshold=(t.committed||[]).some(x=>['02041','02229','02299','03233'].includes(code(s,x.u)))||t.ptcCheapShot||t.ptcGlyph==='03192';if(!threshold)return 0;const reward=v=>Math.max(0,Math.floor(v/2));return s.bag.reduce((sum,x)=>{const mod=A.tokenValue(s,t,x);if(mod===-99)return sum;const margin=A.testValue(s,t)+mod-t.difficulty;return sum+Math.min(2,Math.max(0,reward(margin+n)-reward(margin)));},0)/Math.max(1,s.bag.length);}
function canMinh(s,t,pi){return !s.players[pi].flags.round.minhCommit?.[pi]&&s.players.some(p=>p.investigator==='03002'&&!p.out&&!A.blank(s,p.id)&&p.location===s.players[pi].location&&!p.flags.round.minhCommit?.[pi])&&!t.committed.some(x=>x.pi===pi&&(t.ptcMinhIcons?.[x.u]||0)>0);}
A.AI.rank=(s,level='normal')=>{const list=prior(s,level),pi=s.pending?.owner??s.current,p=s.players[pi];if(!p)return list;const power=level==='hard'?48:level==='normal'?40:30,cache=new Map();
 function roleValue(role){if(cache.has(role))return cache.get(role);const t=A.copy(s);t.pending=null;t.queue=[];t.current=pi;t.phase='investigation';t.players[pi].actions=Math.max(1,p.actions);t.players[pi].flags.role=role;const ranked=prior(t,level).filter(a=>!['ptcLolaRole'].includes(a.id)&&!a.id.startsWith('ptcImprovisation:')),best=ranked[0]?.score||0,hand=p.hand.filter(u=>root.ArkhamDeck.classes(card(s,u)).includes(role)).reduce((n,u)=>n+cardValue(s,pi,u),0),value=best+hand*.16;cache.set(role,value);return value;}
 for(const a of list){const fx=steps(a.effects),test=fx.find(e=>e.kind==='startTest'),pay=fx.find(e=>e.kind==='payAction'),t=s.test||s.windowTest;let score=a.score,reason=a.reason;
  if(s.pending){
   const sophie=fx.find(e=>e.kind==='ptcSophieBonus'),boost=fx.find(e=>e.kind==='ptcEquipmentBonus'||e.kind==='dwlAxeBoost');
   if((sophie||boost)&&t){const n=sophie?2:boost.kind==='dwlAxeBoost'?2:boost.n,gain=probability(s,t,n)-probability(s,t),margin=marginGain(s,t,n),health=A.maxHealth(s,pi)-p.damage,cost=sophie?(p.damage>=3?10:2.5)+(health<=3?12:0)+(p.damage+1>=5?25:0):(pay?.resources||0)*1.8;score=gain*power+margin*3-cost-.1;reason=sophie?'소피가 늘리는 성공 가능성과 직접 피해·정신적 충격·다섯 번째 피해의 불이익을 함께 비교했습니다.':'이번 강화로 실제 늘어나는 성공 확률과 성공 차이 보상을 비용과 비교했습니다.';}
   const commit=fx.find(e=>e.kind==='commitCard');if(commit&&t){const d=card(s,commit.u),own=t.committed.filter(x=>x.pi===pi),beforeMinh=canMinh(s,t,pi)&&own.length?1:0,afterMinh=canMinh(s,t,pi)?1:0,icons=A.commitIconValue(s,t,pi,commit.u);score=(probability(s,t,icons+afterMinh)-probability(s,t,beforeMinh))*power-(d.type_code==='skill'?.6:2.2)-reserve(s,pi,commit.u);if(own.length&&probability(s,t,beforeMinh)>=.93)score-=6;const king=p.threat.some(u=>code(s,u)==='03011');if(king){const remaining=p.hand.filter(u=>A.canCommit(s,t,pi,u)!==false&&A.commitIconValue(s,t,pi,u)>0),needed=Math.max(0,3-own.length);if(remaining.length<needed)score=-100;else if(own.length<3)score+=5;}reason='실제 아이콘과 민 티 판의 추가 아이콘을 합산해 필요한 만큼만 소모합니다.';}
   const undo=fx.find(e=>e.kind==='ptcUncommit');if(undo&&t){const own=t.committed.filter(x=>x.pi===pi),remaining=p.hand.filter(u=>A.canCommit(s,t,pi,u)!==false&&A.commitIconValue(s,t,pi,u)>0);score=own.length<3&&remaining.length<3-own.length?15:-20;}
   if(fx.some(e=>e.kind==='ptcMinhWild')&&t)score=probability(s,t,1)>probability(s,t)||p.threat.some(u=>code(s,u)==='03011')?8:-1;
   if(fx.some(e=>e.kind==='ptcMarkDraw'||e.kind==='ptcKingRelease'||e.kind==='ptcBury'))score=15;
   if(fx.some(e=>e.kind==='ptcFieldwork'))score=8;
   const watch=fx.find(e=>e.kind==='ptcWatchCommit');if(watch&&t)score=probability(s,t,1)>=.65?watch.n*2.2:-watch.n;
   const daring=fx.find(e=>e.kind==='ptcDaringBonus');if(daring&&t){const n=A.testMathResult(s,t).margin;score=marginGain(s,t,2)*10-(A.D['03030'].cost||0)-1;if(n>=3&&!t.ptcGlyph)score=-3;}
   const copy=fx.find(e=>e.kind==='ptcPaintedBegin'||e.kind==='ptcEideticBegin');if(copy)score=3+cardValue(s,pi,copy.target)*.1;
   const store=fx.find(e=>e.kind==='ptcSefinaBeneath'||e.kind==='ptcPlanStore');if(store)score=cardValue(s,pi,store.u)+(['03023','01088','03153','03033','01023'].includes(code(s,store.u))?5:0);
   if(s.pending.title.includes('시작 손패를 8장')&&fx[0]?.kind==='discard')score=-cardValue(s,pi,fx[0].u);
   const role=fx.find(e=>e.kind==='ptcSetRole');if(role){score=roleValue(role.role);reason='현재 무기·도구와 손패에서 실제 사용할 행동이 가장 유리한 배역을 고릅니다.';}
   const funding=fx.find(e=>e.kind==='ptcRossAsk'&&e.pledges);if(funding&&s.pending.owner!==funding.pi){const pledge=funding.pledges.findLast(x=>x.pi===pi);score=pledge?.n||0;reason='필요한 물품을 플레이할 수 있도록 합의한 자원만 지원합니다.';}
   const warp=fx.find(e=>e.kind==='ptcTimeWarpUse');if(warp){const before=s.ptcActionFrames?.[warp.id]?.before;if(before){const playerBefore=before.players,damage=s.players.reduce((n,q,i)=>n+(q.damage-playerBefore[i].damage)*4+(q.horror-playerBefore[i].horror)*5,0),clues=s.players.reduce((n,q,i)=>n+(q.clues-playerBefore[i].clues)*8,0),assets=s.players.reduce((n,q,i)=>n+q.assets.filter(u=>!playerBefore[i].assets.includes(u)).length*8,0),kills=before.enemies.filter(u=>!s.enemies.includes(u)).length*10;score=damage-clues-assets-kills+(s.act===before.act?4:-30)-A.cardCost(s,pi,warp.u)*1.5-2;reason='방금 행동의 피해·공포 손실과 얻은 단서·자산·처치를 비교해 되돌릴 이득이 있을 때만 사용합니다.';}}
   const death=fx.find(e=>e.kind==='ptcCheatDeath');if(death)score=80;
   if(fx.some(e=>e.kind==='ptcArmorCancel'))score=8;
   if(s.pending.title.includes('끝내주는 운 · 취소할 양')){const e=fx.find(e=>e.kind==='damage');if(e)score=-(e.damage*4+e.horror*5);}
  }else{
   if(test&&['fight','evade','investigate'].includes(test.testKind)){const pr=forecast(s,test,level),danger=A.activeEnemies(s,pi).length;if(test.testKind==='fight')score=pr*(25+Math.min(test.damage||1,A.enemyHp(s,test.target)-s.cards[test.target].damage)*9)+danger*7-(pay?.n||1)*2;else if(test.testKind==='evade')score=pr*(danger?30:8);else score=pr*(20+Math.max(0,(test.clues||1)-1)*9)+(s.locations[test.location||p.location]?.clues?5:0)-(pay?.n||1)*2;reason='현재 능력값과 실제 소모할 만한 카드로 예상한 성공률을 행동 효율과 비교했습니다.';}
   const asset=fx.find(e=>e.kind==='playAsset');if(asset){const v=weaponValue(s,asset.u),best=Math.max(0,...p.assets.filter(u=>!A.uses[code(s,u)]||s.cards[u].uses>0).map(u=>weaponValue(s,u)));if(v>best)score+=15*(v-best);if(v&&v<=best)score-=8;}
   if(a.type==='resource'&&!A.activeEnemies(s,pi).length){const upgrade=p.hand.filter(u=>reserve(s,pi,u)>0&&A.cardCost(s,pi,u)>p.resources).sort((a,b)=>A.cardCost(s,pi,a)-A.cardCost(s,pi,b))[0];if(upgrade)score=Math.max(score,14+Math.max(0,5-s.round));}
   const sophie=fx.some(e=>e.kind==='ptcSophieBonus');if(sophie)score=-5;
   if(test?.testKind==='investigate'&&code(s,test.source)==='03027'){const location=s.locations[test.location],pr=probability(s,test,2);score=location?.clues?pr*27-(pay?.n||1)*2-1:-30;reason='실제 이동 없이 확보할 단서와 비밀·행동 비용을 비교했습니다.';}
   if(test?.testKind==='ptc:transmutation'){const base=A.stat(s,pi,'willpower'),gain=s.bag.reduce((n,x)=>{const v=A.tokenValue(s,test,x);return n+(v===-99?0:Math.min(3,Math.max(0,base+v-1)));},0)/s.bag.length;score=gain*(p.resources<3?6:2)-4;reason='성공 차이로 얻을 평균 자원과 행동·충전·피해 위험을 비교했습니다.';}
   const speaker=fx.find(e=>e.kind==='ptcSpiritSpeaker');if(speaker){const c=s.cards[speaker.u],doom=c.doom||0;if(speaker.mode==='hand')score=c.uses<=0&&p.resources>=A.cardCost(s,pi,speaker.u)&&p.actions>0?35:doom?25:-15;else score=doom?20+c.uses:c.uses&&p.resources<2&&!/Fight\./.test(card(s,speaker.u).enText||'')?c.uses*2-4:-15;reason='쓸 충전이 남은 마법은 유지하고, 소진된 마법을 회수해 다시 충전해 플레이합니다.';}
   if(fx.some(e=>e.kind==='ptcAngeredCharge'))score=9;
   const renfield=fx.find(e=>e.kind==='ptcRenfield');if(renfield){const doom=A.doomTotal(s),limit=A.D[A.agendaCard(s)]?.doom||99,early=renfield.doom&&doom+1<limit?5:0;score=(s.cards[renfield.u].doom+renfield.doom)*2+(p.resources<4?8:0)-early-1;reason='파멸로 주요사건을 앞당기는 위험과 이번에 얻는 자원을 비교했습니다.';}
   const insight=fx.find(e=>e.kind==='ptcArcaneInsight');if(insight){const normal={pi,skill:'intellect',difficulty:A.shroud(s,p.location),testKind:'investigate'},gain=probability(s,{...normal,difficulty:Math.max(0,normal.difficulty-2)})-probability(s,normal);score=s.locations[p.location].clues&&p.actions>0&&gain>.05?35+gain*10:-12;}
   const role=fx.find(e=>e.kind==='ptcChooseRole');if(role&&p.investigator==='03006'){const current=roleValue(p.flags.role||'neutral'),best=Math.max(...['guardian','seeker','rogue','mystic','survivor'].map(roleValue));score=best-current>2?Math.max(...list.filter(x=>x.id!==a.id).map(x=>x.score))+2:-10;reason='남은 라운드에서 더 강한 무기나 단서 행동을 사용할 수 있을 때 배역을 바꿉니다.';}
   if(fx.some(e=>e.kind==='ptcImprovisation'))score=!p.flags.round.lolaSwitch||!A.activeEnemies(s,pi).length?32:-10;
   const begin=fx.find(e=>e.kind==='ptcPaintedBegin'||e.kind==='ptcEideticBegin'),effective=begin?code(s,begin.target):a.card;
   if(effective==='01088'&&fx.some(e=>e.kind==='playEvent'))score=p.resources<3?22:p.resources<6?10:-5;
   if(begin&&test)score+=2;
   const drawStored=fx.find(e=>e.kind==='ptcSefinaDraw');if(drawStored){const copies=[...p.hand,...p.deck].filter(u=>code(s,u)==='03012').length;score=copies?-.5:cardValue(s,pi,drawStored.u)-3;}
   if(fx.some(e=>e.kind==='playEvent')&&effective==='03155')score=A.activeEnemies(s,pi).length&&p.horror&&p.actions>0?36:-5;
  }
  a.score=Number.isFinite(score)?score:-100;a.reason=reason;
 }
 list.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));return list;
};
A.AI.choose=(s,level='normal')=>A.AI.rank(s,level)[0];
})(typeof window==='undefined'?globalThis:window);
