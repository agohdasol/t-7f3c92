(function(root){'use strict';const A=root.Arkham,X=A.CampaignEngine,prior=A.AI.rank;
function steps(items){return(items||[]).flatMap(e=>[e,...steps(e.steps||e.fx||[]),...(e.test?[{...e.test,kind:'startTest'}]:[])]);}
function goal(s,pi){const p=s.players[pi],group=s.players.filter(A.alive).reduce((n,p)=>n+p.clues,0);if(s.scenario===105){if(s.act===1)return[s.ext.ruins];return s.enemies.filter(u=>A.code(s,u)==='02255').map(u=>s.cards[u].location);}if(s.scenario===106){if(s.act===3)return['02284'];if(s.act===2&&group>=2*s.players.length)return['02284'];return Object.values(s.locations).filter(l=>!l.revealed||l.clues>0).map(l=>l.id);}if(s.scenario===107){if(s.act===4&&p.clues>=2)return['02322'];if(s.act===2&&p.clues>=2||s.act===3&&p.clues>=2&&group>=3*s.players.length)return['02321'];return Object.values(s.locations).filter(l=>l.revealed&&l.clues>0).map(l=>l.id);}return[];}
function probability(s,t,extra=0){const n=A.stat(s,t.pi,t.skill,t.testKind==='investigate'?'investigate':'')+(t.base===undefined?0:t.base-(A.baseSkill?.(s,t.pi,t.skill,A.D[s.players[t.pi].investigator]['skill_'+t.skill])??A.D[s.players[t.pi].investigator]['skill_'+t.skill]))+(t.bonus||0)+extra;return s.bag.filter(token=>{const v=A.tokenValue(s,{...t,tokens:t.tokens||[],committed:t.committed||[]},token);return v!==-99&&Math.max(0,n+v)>=t.difficulty;}).length/s.bag.length;}
A.AI.probability=probability;
A.AI.rank=(s,level='hard')=>{const list=prior(s,level),pi=s.pending?.owner??s.current,p=s.players[pi],power=level==='hard'?3:level==='normal'?2:1;for(const a of list){const es=steps(a.effects),test=es.find(e=>e.kind==='startTest'),pay=es.find(e=>e.kind==='payAction');let score=a.score,reason=a.reason;
if(s.pending){const t=s.test;if(es.some(e=>e.kind==='dwlTalentBoost')){const e=es.find(e=>e.kind==='dwlTalentBoost');if(!t)score=-6;else{const committed=(t.committed||[]).reduce((n,x)=>n+A.commitIconValue(s,t,x.pi,x.u),0),gain=probability(s,t,committed+e.n)-probability(s,t,committed);score=gain*32-(e.doom?3+Math.max(0,A.doomTotal(s)+1-(A.D[A.agendaCard(s)].doom||99))*5:e.cost*1.5);}reason='추가 능력으로 늘어나는 성공 확률을 자원·파멸 비용과 비교했습니다.';}
if(es.some(e=>e.kind==='commitCard'&&A.code(s,e.u)==='02026')&&t){const committed=(t.committed||[]).reduce((n,x)=>n+A.commitIconValue(s,t,x.pi,x.u),0),before=probability(s,t,committed),after=probability(s,{...t,difficulty:t.difficulty*2},committed+1);score=(2*after-before)*16-3;reason='난이도가 두 배가 된 뒤에도 성공 가능성이 충분할 때 성공 효과를 두 번 받습니다.';}
if(es.some(e=>e.kind==='dwlDice')&&t){const token=es.find(e=>e.kind==='dwlDice').item.token,now=A.testValue(s,t)+A.tokenValue(s,t,token)>=t.difficulty;score=now?-5:probability(s,t,(t.committed||[]).reduce((n,x)=>n+A.commitIconValue(s,t,x.pi,x.u),0))*15-4;reason='성공할 토큰은 유지하고, 실패할 가능성이 클 때 자원을 써 다시 공개합니다.';}
if(es.some(e=>e.kind==='dwlDefiance')){const token=es.find(e=>e.kind==='dwlDefiance').token;score=s.bag.filter(x=>x===token).length*(token==='cultist'||token==='elder_thing'?3:2);reason='주머니에 있는 기호의 수와 추가 불이익을 고려해 무시할 기호를 선택합니다.';}
if(es.some(e=>e.kind==='broodAddClue'||e.kind==='broodLurePoint'||e.kind==='bloodUnlock'))score=35;
if(es.some(e=>e.kind==='dwlAutoSuccess'))score=25;
if(es.some(e=>e.kind==='dwlBonusAction'))score=25;
if(s.pending.title.startsWith('신속한 판단')&&test)score=probability(s,test,power)*(test.testKind==='fight'?35:test.testKind==='investigate'?30:20)-(pay?.n||1)*2;
if(es.some(e=>e.kind==='dwlJewel'))score=5;
if(es.some(e=>e.kind==='watchUse')){const e=es.find(e=>e.kind==='watchUse');score=e.skip?(e.phase==='enemy'&&A.activeEnemies(s,pi).length?25:e.phase==='mythos'&&A.doomTotal(s)+1>=(A.D[A.agendaCard(s)].doom||99)?28:-15):e.phase==='investigation'?30:e.phase==='upkeep'&&p.hand.length<5?12:-15;reason=e.skip?'현재 단계의 위험을 피하는 이득을 시계의 일회성 비용과 비교했습니다.':'자산을 새로 준비하지 않아도 추가 조사 차례를 활용할 수 있습니다.';}
if(!es.length&&s.pending.kind==='reaction')score=Math.max(score,0);
}else{
if(test){const pr=probability(s,test,power);if(test.testKind==='fight')score=pr*(25+Math.min(test.damage||1,A.enemyHp(s,test.target)-s.cards[test.target].damage)*9)+A.activeEnemies(s,pi).length*7-(pay?.n||1)*2;if(test.testKind==='investigate')score=pr*(20+Math.max(0,(test.clues||1)-1)*9)+(s.locations[p.location].clues?5:0)-(pay?.n||1)*2;if(test.testKind==='dwl:solution')score=s.round<6?14:2;}
const targets=goal(s,pi);if(a.type==='move'&&targets.length){const old=Math.min(...targets.map(l=>A.distance(s,p.location,l))),next=Math.min(...targets.map(l=>A.distance(s,a.target,l)));score=(old-next)*18+(s.locations[a.target]?.revealed?2:6);if(s.locations[p.location]?.clues&&p.clues<2*s.players.length)score-=10;reason='단서의 부족분과 현재 목표를 해결할 장소까지의 거리를 비교했습니다.';}
if(a.id==='hill:findpath')score=35;
if(a.id==='lost:search')score=Object.values(s.locations).some(l=>l.revealed&&l.clues)?10:42;
if(a.id==='brood:formula'||a.id==='hill:advance'||a.id==='lost:advance')score=90;
if(a.id.startsWith('brood:lure:')||a.id.startsWith('brood:powder:'))score=55;
if(s.scenario===107&&a.type==='resign'&&p.location==='02322'&&p.clues>=2)score=100;
if(es.some(e=>e.kind==='dwlSeekingAnswer'))score=probability(s,{pi,skill:'intellect',testKind:'investigate',difficulty:A.shroud(s,p.location)},power)*28;
if(es.some(e=>e.kind==='dwlToolEvent')&&a.card==='02186')score=p.hand.length<5?22:8;
if(es.some(e=>e.kind==='dwlToolEvent')&&a.card==='02266')score=36;
if(es.some(e=>e.kind==='playAsset')){const e=es.find(e=>e.kind==='playAsset'),d=A.card(s,e.u),text=d.enText||'',isWeapon=/Fight\./.test(text),already=p.assets.some(u=>/Fight\./.test(A.card(s,u).enText||'')&&(s.cards[u].uses>0||!A.uses[A.code(s,u)]));if(isWeapon&&!already)score+=12;if(isWeapon&&already)score-=6;if(['02028','02233','01033','02149','02108'].includes(d.code))score+=5;}
if(a.card==='02185'&&!test)score=-8;
}a.score=Number.isFinite(score)?score:-100;a.reason=reason;}list.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));return list;};A.AI.choose=(s,level='normal')=>A.AI.rank(s,level)[0];
})(typeof window==='undefined'?globalThis:window);
