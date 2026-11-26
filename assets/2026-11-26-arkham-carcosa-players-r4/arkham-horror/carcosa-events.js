(function(root){'use strict';
const A=root.Arkham,X=A.CampaignEngine,{H,queue,choice,opt,code,card,name}=A;
const READY=['03023','03026','03029','03033','03034','03038','03108','03152','03155','03158','03191','03194','03196','03197','03229','03237','03238','03239','03265','03273','03307','03314'];
const turn=s=>s.round+':'+s.turns,phase=s=>A.phaseKey(s),bad=x=>['skull','cultist','tablet','elder_thing','auto_fail'].includes(x);
const physical=(s,pi)=>s.playerWindowContext||{phase:s.phase,current:s.current,turnDone:s.players[s.current]?.turnDone};
const ownTurn=(s,pi)=>{const c=physical(s,pi);return s.turnInProgress!==false&&c.phase==='investigation'&&c.current===pi&&!c.turnDone;};
const anyTurn=s=>{const c=physical(s);return c.phase==='investigation'&&!c.turnDone;};
const flat=fx=>(fx||[]).flatMap(e=>[e,...flat(e.steps||e.fx)]);
const cost=A.modifyCardCost;A.modifyCardCost=(s,pi,u,n)=>Math.max(0,(cost?cost(s,pi,u,n):n)-(s.ptcImmediateDiscount?.pi===pi?s.ptcImmediateDiscount.n:0));
const strip=fx=>(fx||[]).filter(e=>e.kind!=='opportunity').map(e=>e.kind==='payAction'?{...e,n:0}:e.steps?{...e,steps:strip(e.steps)}:e);
A.immediatePlayChoices=(s,pi,config={})=>{const t=A.copy(s);t.pending=null;t.queue=[];t.current=pi;t.phase='investigation';t.players[pi].actions=99;t.ptcImmediateDiscount={pi,n:config.discount||0};return A.mainActions(t,true).flatMap(a=>{const e=flat(a.effects).find(e=>s.players[pi].hand.includes(e.u)&&['playAsset','playEvent','dwlToolEvent','dwlShortcut','dwlSeekingAnswer'].includes(e.kind));if(!e||config.assetOnly&&card(s,e.u).type_code!=='asset'||config.allowed&&!config.allowed.includes(e.u)||config.traits&&!config.traits.some(tr=>A.isTrait(s,e.u,tr)))return[];return[opt(a.label,[{kind:'ptcNestedPlayCost',pi,u:e.u},...strip(a.effects),...(config.after||[])],a.card)];});};
H.ptcNestedPlayCost=()=>{};
A.canPutAsset=(s,pi,u)=>{const d=card(s,u);if(d.type_code!=='asset'||d.permanent)return false;if(d.is_unique&&s.players.some(p=>p.assets.some(v=>card(s,v).name===d.name)))return false;if(/Composure/.test(d.real_traits||'')&&s.players[pi].assets.some(v=>/Composure/.test(card(s,v).real_traits||'')))return false;const t=A.copy(s);A.moveCard(t,u,'assets',pi);return A.slotConflicts(t,pi).every(k=>t.players[pi].assets.some(v=>v!==u&&!card(t,v).permanent&&String(card(t,v).real_slot||'').toLowerCase().includes(k.toLowerCase())));};
const canReturn=(s,u,pi)=>A.canMoveCard?.(s,u,s.cards[u].zone,s.cards[u].owner,'hand',pi)!==false;
const charged=d=>!(/Uses\s*\(/i.test(d.enText||'')&&!/Uses\s*\(\d+\s+charges?\)/i.test(d.enText||''));
const main=A.mainActions;A.mainActions=(s,fx=false)=>{let out=main(s,fx);if(s.pending||s.result||s.phase!=='investigation')return out;out=out.filter(a=>!READY.includes(a.card));const pi=s.current,p=s.players[pi],near=A.playersAt(s,p.location),enemies=s.enemies.filter(u=>s.cards[u].location===p.location),engaged=u=>s.cards[u].engaged===pi||A.isMassive(s,u)&&s.cards[u].ready;
 for(const u of p.hand){const id=code(s,u);if(!READY.includes(id)||!A.canPlay(s,pi,u)||id==='03314')continue;let targets=[null],actions=1,type='play',noAoO=false;
  if(id==='03023'&&!p.hand.some(v=>card(s,v).type_code==='asset'))continue;
  if(id==='03026'||id==='03307')targets=near.filter(q=>q.deck.length).map(q=>q.id);
  if(id==='03029'){if(!ownTurn(s,pi))continue;actions=0;targets=p.hand.filter(v=>A.isTrait(s,v,'Item')&&A.canPutAsset(s,pi,v));}
  if(id==='03033'&&!p.hand.some(v=>A.isTrait(s,v,'Spell')||A.isTrait(s,v,'Ritual')))continue;
  if(id==='03034')targets=Object.values(s.locations).filter(l=>l.revealed&&l.id!==p.location).map(l=>l.id);
  if(id==='03038'){actions=0;targets=Object.keys(s.locations);}
  if(id==='03108'){if(!anyTurn(s)||A.maxSanity(s,pi)-p.horror<5)continue;actions=0;targets=enemies.filter(v=>!A.isElite(s,v));}
  if(id==='03152')targets=enemies.filter(v=>!engaged(v)&&A.canPlaceEnemyDamage?.(s,v,u,'damage')!==false);
  if(id==='03155'){if(!ownTurn(s,pi))continue;actions=0;}
  if(id==='03158')targets=p.assets.filter(v=>A.isTrait(s,v,'Ally')&&canReturn(s,v,pi));
  if(id==='03191'){if(!p.clues)continue;targets=near.filter(q=>q.horror>0||q.threat.some(v=>A.isTrait(s,v,'Terror'))).map(q=>q.id);}
  if(id==='03194'){targets=enemies;type='fight';}
  if(id==='03197')targets=near.flatMap(q=>q.assets).filter(v=>A.isTrait(s,v,'Spell')||A.isTrait(s,v,'Relic'));
  if(id==='03229'){if(p.flags.turn.taken>0)continue;targets=enemies.filter(v=>engaged(v)&&A.canPlaceEnemyDamage?.(s,v,u,'damage')!==false);noAoO=true;}
  if(id==='03237')targets=enemies.filter(v=>!s.cards[v].ready&&!A.isElite(s,v));
  if(id==='03238')targets=s.players.flatMap(q=>q.discard).filter(v=>A.canPutAsset(s,pi,v)&&A.isTrait(s,v,'Ally')&&A.canMoveCard?.(s,v,'discard',s.cards[v].owner,'assets',pi)!==false);
  if(id==='03265')targets=near.filter(q=>q.id!==pi&&!q.turnDone).map(q=>q.id);
  if(id==='03273'&&!p.discard.some(v=>card(s,v).type_code==='skill'&&A.isTrait(s,v,'Innate')&&canReturn(s,v,pi)))continue;
  if(id==='03307')actions=0;
  for(const target of targets){const resources=id==='03238'?A.modifyCardCost(s,pi,u,Math.max(0,card(s,target).cost||0)):A.cardCost(s,pi,u);X.action(s,out,fx,{id:'ptcEvent:'+u+':'+target,label:name(s,u)+(target!==null?' · '+(typeof target==='number'?s.players[target].name:name(s,target)):''),pi,type,actions,resources,card:id,target,noAoO,effects:[{kind:'playEvent',pi,u,target}]});}
 }
 return out;
};
const play=H.playEvent;H.playEvent=(s,e)=>{const id=code(s,e.u);if(!READY.includes(id))return play(s,e);const p=s.players[e.pi];A.moveCard(s,e.u,'aside',e.pi);A.cardPlayed?.(s,e.pi,e.u);A.log(s,p.name+' · '+name(s,e.u),'card',e.pi);let fx=[];
 if(id==='03023')fx=[{kind:'ptcSequenceAssets',pi:e.pi,left:3}];
 if(id==='03026'||id==='03307')fx=[{kind:'ptcEventSearch',pi:e.target,count:id==='03026'?6:999}];
 if(id==='03029')fx=[{kind:'ptcSleight',pi:e.pi,u:e.target}];
 if(id==='03033')fx=[{kind:'ptcUncage',pi:e.pi}];
 if(id==='03034')fx=[{kind:'moveFrom',pi:e.pi,location:e.target,forced:true},{kind:'ptcAstralToken',pi:e.pi}];
 if(id==='03038'){A.moveCard(s,e.u,'attachment',e.pi);s.locations[e.target].attachments.push(e.u);}
 if(id==='03108')s.cards[e.target].ptcAnatomy={turn:turn(s),n:(s.cards[e.target].ptcAnatomy?.turn===turn(s)?s.cards[e.target].ptcAnatomy.n:0)+2};
 if(id==='03152'||id==='03229')fx=[{kind:'enemyDamage',pi:e.pi,u:e.target,n:id==='03152'?2:1,source:e.u}];
 if(id==='03155')p.flags.ptcFightFlight=s.round;
 if(id==='03158'){const discount=Math.max(0,card(s,e.target).cost||0);A.moveCard(s,e.target,'hand',e.pi);fx=[{kind:'ptcCallingFavors',pi:e.pi,discount}];}
 if(id==='03191')fx=[{kind:'ptcLogicalReasoning',pi:e.pi,target:e.target}];
 if(id==='03194')fx=[{kind:'startTest',pi:e.pi,target:e.target,source:e.u,skill:'combat',difficulty:A.enemyStat(s,e.target,'fight'),testKind:'fight',damage:1,ptcCheapShot:true}];
 if(id==='03196'){for(const v of p.discard.slice())A.moveCard(s,v,'deck',e.pi);p.deck=A.shuffle(s,p.deck);A.moveCard(s,e.u,'removed',e.pi);fx=[{kind:'draw',pi:e.pi}];}
 if(id==='03197')fx=[{kind:'ptcRecharge',pi:e.pi,u:e.target}];
 if(id==='03237')fx=[{kind:'startTest',pi:e.pi,target:e.target,source:e.u,skill:'agility',difficulty:A.enemyStat(s,e.target,'evade'),testKind:'ptc:waylay'}];
 if(id==='03238')fx=[{kind:'ptcPutAlly',pi:e.pi,u:e.target}];
 if(id==='03239')fx=[{kind:'ptcSupplies',pi:e.pi,left:4}];
 if(id==='03265')s.players[e.target].actions++;
 if(id==='03273')fx=[{kind:'ptcTrueSurvivor',pi:e.pi,left:3}];
 if(id==='03314')p.flags.ptcInfighting=phase(s);
 if(A.isTrait(s,e.u,'Spell')&&A.has(s,e.pi,'01012'))fx.push({kind:'heirloom',pi:e.pi});fx.push({kind:'finishEvent',u:e.u});queue(s,fx);
};
H.ptcSequenceAssets=(s,e)=>{if(!e.left||s.players[e.pi].out)return;const opts=A.immediatePlayChoices(s,e.pi,{assetOnly:true,discount:1,after:[{...e,left:e.left-1}]});if(opts.length)choice(s,e.pi,'만사에 대비하라 · 자산 '+(4-e.left)+'/3',[...opts,opt('플레이 마치기',[])],'자산을 한 장씩 플레이하며, 매번 자원 비용을 1만큼 줄입니다.');};
H.ptcUncage=(s,e)=>{const opts=A.immediatePlayChoices(s,e.pi,{traits:['Spell','Ritual'],discount:3});if(opts.length)choice(s,e.pi,'영혼 해방 · 마법 또는 의식 플레이',opts,'자원 비용을 3만큼 줄이고 행동을 추가로 소비하지 않습니다.');};
H.ptcEventSearch=(s,e)=>{const p=s.players[e.pi],top=p.deck.slice(-e.count);if(!top.length)return;choice(s,e.pi,'갖은 수단과 방법을 동원해서 · 카드 뽑기',[...top.map(u=>opt(name(s,u),[{kind:'ptcSearchDraw',pi:e.pi,u},{kind:'shuffleDeck',pi:e.pi}],code(s,u))),opt('찾지 않고 섞기',{kind:'shuffleDeck',pi:e.pi})]);};
H.ptcSleight=(s,e)=>{if(!s.players[e.pi].hand.includes(e.u)||!A.canPutAsset(s,e.pi,e.u))return;s.players[e.pi].flags.ptcSleight||=[];s.players[e.pi].flags.ptcSleight.push({u:e.u,turn:turn(s)});queue(s,{kind:'playAsset',pi:e.pi,u:e.u,putIntoPlay:true});};
H.ptcAstralToken=(s,e)=>{if(!s.players[e.pi].out)queue(s,{kind:'dwlOutsideToken',pi:e.pi,after:{...e,kind:'ptcAstralResolve'}});};
H.ptcAstralResolve=(s,e)=>{const token=e.token;A.log(s,'유체 이탈 · '+A.tokenLabel(token),'token',e.pi);if(!bad(token))return;const ids=s.players[e.pi].assets.filter(u=>A.isTrait(s,u,'Item')||A.isTrait(s,u,'Ally'));if(ids.length)choice(s,e.pi,'유체 이탈 · 물품 또는 조력자 버리기',ids.map(u=>opt(name(s,u),{kind:'discard',u},code(s,u))));else queue(s,{kind:'damage',pi:e.pi,damage:1,horror:0});};
H.ptcCallingFavors=(s,e)=>{const ids=s.players[e.pi].deck.slice(-9).filter(u=>A.isTrait(s,u,'Ally'));choice(s,e.pi,'도움 요청 · 덱 위 9장에서 조력자 플레이',[...ids.map(u=>opt(name(s,u),[{kind:'ptcFavorsDraw',pi:e.pi,u},{kind:'ptcFavorsPlay',pi:e.pi,u,discount:e.discount},{kind:'shuffleDeck',pi:e.pi}],code(s,u))),opt('찾지 않고 섞기',{kind:'shuffleDeck',pi:e.pi})]);};
H.ptcFavorsDraw=(s,e)=>{if(s.players[e.pi].deck.includes(e.u))A.moveCard(s,e.u,'hand',e.pi);};
H.ptcFavorsPlay=(s,e)=>{const opts=A.immediatePlayChoices(s,e.pi,{assetOnly:true,allowed:[e.u],discount:e.discount});if(opts.length)choice(s,e.pi,'도움 요청 · 조력자 비용 지불',opts);else if(s.players[e.pi].hand.includes(e.u))A.moveCard(s,e.u,'deck',e.pi);};
H.ptcLogicalReasoning=(s,e)=>{const p=s.players[e.target],opts=p.horror?[opt(p.name+' · 공포 2 회복',{kind:'heal',pi:e.target,damage:0,horror:2})]:[];for(const u of p.threat.filter(u=>A.isTrait(s,u,'Terror')))opts.push(opt(name(s,u)+' 버리기',{kind:'discard',u},code(s,u)));if(opts.length)choice(s,e.pi,'논리적 추론 · 효과 선택',opts);};
H.ptcRecharge=(s,e)=>queue(s,{kind:'dwlOutsideToken',pi:e.pi,after:{...e,kind:'ptcRechargeResolve'}});
H.ptcRechargeResolve=(s,e)=>{if(s.cards[e.u]?.zone!=='assets')return;const token=e.token;A.log(s,'재충전 · '+A.tokenLabel(token),'token',e.pi);if(bad(token))A.discard(s,e.u);else if(charged(card(s,e.u)))H.addUse(s,{u:e.u,n:3});};
H.ptcPutAlly=(s,e)=>{if(!A.canPutAsset(s,e.pi,e.u)||s.cards[e.u]?.zone!=='discard')return;const c=s.cards[e.u];if(c.originalOwner==null)c.originalOwner=c.owner;queue(s,{kind:'playAsset',pi:e.pi,u:e.u,putIntoPlay:true});};
H.ptcSupplies=(s,e)=>{if(!e.left)return;const ids=A.playersAt(s,s.players[e.pi].location).flatMap(p=>p.assets).filter(u=>/Uses\s*\(\d+\s+supplies?\)/i.test(card(s,u).enText||''));choice(s,e.pi,'비상 물자 · 남은 배분 '+e.left,[opt('자원 '+e.left+'개 획득',{kind:'gainResource',pi:e.pi,n:e.left}),...ids.map(u=>opt(s.players[s.cards[u].owner].name+' · '+name(s,u)+' 소모품 1개 추가',[{kind:'addUse',u,n:1},{...e,left:e.left-1}],code(s,u)))]);};
H.ptcTrueSurvivor=(s,e)=>{if(!e.left)return;const p=s.players[e.pi],ids=p.discard.filter(u=>card(s,u).type_code==='skill'&&A.isTrait(s,u,'Innate')&&canReturn(s,u,e.pi));if(ids.length)choice(s,e.pi,'진정한 생존자 · 타고난 능력 회수 '+(4-e.left)+'/3',ids.map(u=>opt(name(s,u),[{kind:'returnCard',pi:e.pi,u},{...e,left:e.left-1}],code(s,u))));};
const stat=A.modifyStat;A.modifyStat=(s,pi,skill,context,n)=>(stat?stat(s,pi,skill,context,n):n)+(s.players[pi].flags.ptcFightFlight===s.round&&['combat','agility'].includes(skill)?s.players[pi].horror:0);
const value=A.modifyTestValue;A.modifyTestValue=(s,t,n)=>(value?value(s,t,n):n)+(t.ptcCheapShot?A.stat(s,t.pi,'agility'):0);
const enemyStat=A.modifyEnemyStat;A.modifyEnemyStat=(s,u,k,n)=>Math.max(0,(enemyStat?enemyStat(s,u,k,n):n)-(['fight','evade'].includes(k)&&s.cards[u].ptcAnatomy?.turn===turn(s)&&anyTurn(s)?s.cards[u].ptcAnatomy.n:0));
const success=A.successEffects;A.successEffects=(s,t)=>{const out=success?.(s,t)||[];if(t.success&&t.ptcCheapShot&&t.margin>=2)out.push({kind:'ptcCheapEvade',pi:t.pi,u:t.target,cardCode:'03194',label:'비겁한 싸움 · 자동 회피'});if(t.success&&t.testKind==='ptc:waylay')out.push({kind:'killEnemy',pi:t.pi,u:t.target,cardCode:'03237',label:'잠복 공격 · 적 쓰러뜨리기'});return out;};
H.ptcCheapEvade=(s,e)=>{if(s.enemies.includes(e.u))H.evadeEnemy(s,e);};
const end=H.endTurn;H.endTurn=(s,e)=>{const n=s.queue.length;end(s,e);if(s.actionInterrupts?.at(-1)?.pi===e.pi)return;const p=s.players[e.pi],ids=(p.flags.ptcSleight||[]).filter(x=>x.turn===turn(s)&&s.cards[x.u]?.zone==='assets');p.flags.ptcSleight=[];X.append(s,n,ids.map(x=>({kind:'returnCard',pi:e.pi,u:x.u})));};
const aloof=A.isAloof;A.isAloof=(s,u)=>aloof(s,u)||!A.isElite(s,u)&&!!s.locations[s.cards[u]?.location]?.attachments.some(v=>code(s,v)==='03038');
const phaseEnd=A.phaseEndEffects;A.phaseEndEffects=(s,p)=>[...(phaseEnd?.(s,p)||[]),...(p==='enemy'?Object.values(s.locations).filter(l=>s.enemies.some(u=>s.cards[u].location===l.id&&s.cards[u].ready)).flatMap(l=>l.attachments.filter(u=>code(s,u)==='03038').map(u=>({kind:'discard',u}))):[])];
const phaseWindow=H.phaseWindow;H.phaseWindow=(s,e)=>{if(s.phase==='enemy'&&!e.ptcInfightingChecked){const u=A.findHand(s,e.pi,'03314');if(u&&A.canPlay(s,e.pi,u)&&s.players[e.pi].resources>=A.cardCost(s,e.pi,u)){choice(s,e.pi,'적 단계 시작 · 내분',[opt('내분 플레이',[{kind:'fastCard',pi:e.pi,u},{kind:'ptcInfighting',pi:e.pi},{...e,kind:'phaseWindow',ptcInfightingChecked:true}],'03314'),opt('사용하지 않기',{...e,kind:'phaseWindow',ptcInfightingChecked:true})],'이번 적 단계 동안 정예가 아닌 적이 당신에게 하는 공격을 모두 취소합니다.','reaction');return;}}phaseWindow(s,e);};
H.ptcInfighting=(s,e)=>{s.players[e.pi].flags.ptcInfighting=phase(s);};
const attack=H.enemyAttack;H.enemyAttack=(s,e)=>{if(s.players[e.pi].flags.ptcInfighting===phase(s)&&!A.isElite(s,e.u))return;attack(s,e);};
A.playerWindowCards=[...(A.playerWindowCards||[]),'03029','03038','03108','03155','03307'];
A.Content.register({cards:READY});
})(typeof window==='undefined'?globalThis:window);
