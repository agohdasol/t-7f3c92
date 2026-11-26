(function(root){'use strict';const A=root.Arkham,X=A.CampaignEngine,{H,D,queue,choice,opt,log,card,code,name,alive}=A;
const RULES={
'02083':'폭로 — 의지(5)를 테스트합니다. 모자란 차이마다 자신의 덱 맨 위에서 카드를 1장 버립니다.',
'02084':'급증. 폭로 — 자신의 위협 영역에 같은 카드가 없다면 이 카드를 놓습니다. 강제 — 자신의 덱에 카드가 없으면 피해 10을 받고 이 카드를 버립니다.',
'02085':'위험. 폭로 — 현재 주요목적 또는 주요사건에 부착합니다(각각 1장 제한). 모든 피해와 공포를 직접 피해·직접 공포로 취급합니다.',
'02086':'출현 — 단서가 가장 많은 장소. 보복.',
'02087':'먹잇감 — 손패가 가장 적은 조사자. 사냥꾼. 강제 — 교전한 조사자가 사술 또는 계약 카드를 뽑을 때, 그 조사자를 공격합니다.',
'02088':'폭로 — 자신의 위협 영역에 놓습니다. 조력자 자산을 플레이할 수 없으며, 조종하는 조력자의 인쇄된 글 상자를 백지화합니다. 강제 — 자신의 차례가 끝날 때 의지(3). 성공하면 이 카드를 버립니다.',
'02089':'폭로 — 자신의 장소에 부착합니다. 강제 — 라운드가 끝날 때 이 장소의 조사자들은 공포 1을 받습니다. 주요사건이 진행될 때 이 카드를 버립니다.',
'02090':'냉담한. 사냥꾼. 이 장소의 조사자들은 모든 능력값에 -1을 적용합니다.',
'02091':'폭로 — 의지(2)를 테스트합니다. 자신에게 놓인 피해마다 난이도 +1. 실패하면 공포 2를 받습니다.',
'02092':'폭로 — 자신의 위협 영역에 놓습니다. 능력 테스트 동안 능력값 -1. 강제 — 1 이상 차이로 테스트에 성공한 후 버립니다.',
'02093':'폭로 — 혼돈 토큰 1개 공개. 고대 표식이나 양수면 효과 없음. 다른 숫자면 피해 1. 해골·추종자·석판·옛것·자동 실패면 공포 2.',
'02094':'먹잇감 — 지식이 가장 낮은 조사자. 사냥꾼. 원거리·총·마법 자산으로 공격받을 때 전투값 -3.',
'02095':'출현 — 자신에게서 가장 먼 장소. 먹잇감 — 민첩이 가장 낮은 조사자. 사냥꾼. 보복.',
'02096':'폭로 — 괴물체 적이 없으면 급증. 있다면 그중 하나의 피해를 모두 회복하고 부착합니다. 강제 — 조사자가 이 적의 장소에 들어오거나 반대의 경우, 그 조사자는 공포 1.',
'02097':'이 적과 교전 중인 조사자는 자원을 획득할 수 없습니다.',
'02098':'보복. 강제 — 이 적이 자신을 공격한 후 자원 1개를 잃습니다.',
'02099':'폭로 — 교전하지 않은 범죄자 적이 없으면 급증. 있다면 그 적들이 각각 자신을 향해 1칸 이동합니다. 이 효과로 자신과 교전한 적은 즉시 공격합니다.',
'02100':'폭로 — 이야기 자산이 아닌 조종 중인 자산 1개를 자신의 덱에 섞고 덱 맨 위 3장을 버립니다. 같은 이름의 자산이 버려지면 공포 2.',
'02101':'위험. 폭로 — 자산·이벤트·능력 중 하나를 선택합니다. 모든 조사자는 손에서 그 종류를 모두 버립니다. 이번 단계에 뽑힌 첫 사본이 아니라면 두 종류를 선택합니다.',
'02102':'폭로 — 자신의 장소에 부착합니다. 이 장소로 들어오거나 나가는 이동의 추가 비용으로 의지(4)를 테스트합니다. 성공하면 버립니다. 실패하면 이동을 취소하거나 자신의 덱 맨 위 5장을 버립니다.'};
for(const[id,text]of Object.entries(RULES))if(D[id])D[id].text=text;
function surge(s,pi){queue(s,{kind:'encounterDraw',pi});}
function threat(s,e){A.moveCard(s,e.u,'threat',e.pi);}
function discard(s,e){A.discard(s,e.u);}
function test(s,e,difficulty,testKind){discard(s,e);queue(s,{kind:'startTest',pi:e.pi,skill:'willpower',difficulty,testKind,source:e.u});}
X.encounters.set('02083',(s,e)=>test(s,e,5,'dwl:mill'));
X.encounters.set('02084',(s,e)=>{const p=s.players[e.pi];if(!A.threat(s,e.pi,'02084'))threat(s,e);else discard(s,e);queue(s,{kind:'dwlCheckDeck',pi:e.pi},{kind:'encounterDraw',pi:e.pi});});
X.encounters.set('02085',(s,e)=>{const opts=['act','agenda'].filter(k=>!s.ext[k+'Attachments']?.length).map(target=>opt(target==='act'?'현재 주요목적에 부착':'현재 주요사건에 부착',{kind:'dwlLight',u:e.u,target},A[target==='act'?'actCard':'agendaCard'](s)));if(opts.length)choice(s,e.pi,'아포고몬의 빛 · 부착할 카드',opts);else discard(s,e);});
X.encounters.set('02088',(s,e)=>threat(s,e));X.encounters.set('02089',(s,e)=>{A.moveCard(s,e.u,'attachment');s.locations[s.players[e.pi].location].attachments.push(e.u);});
X.encounters.set('02091',(s,e)=>test(s,e,2+s.players[e.pi].damage,'dwl:deathWish'));
X.encounters.set('02092',(s,e)=>threat(s,e));
X.encounters.set('02093',(s,e)=>{discard(s,e);const token=s.bag[Math.floor(A.random(s)*s.bag.length)],n=/^[+-]?\d+$/.test(token)?Number(token):null;queue(s,{kind:'notice',title:'뒤틀린 운명 · '+A.tokenLabel(token),card:'02093',text:token==='elder_sign'||n>0?'효과가 없습니다.':n!==null?'피해 1을 받습니다.':'공포 2를 받습니다.',after:token==='elder_sign'||n>0?[]:[{kind:'damage',pi:e.pi,damage:n!==null?1:0,horror:n===null?2:0,source:e.u}]});});
X.encounters.set('02096',(s,e)=>{const enemies=s.enemies.filter(u=>A.isTrait(s,u,'Abomination'));if(!enemies.length){discard(s,e);surge(s,e.pi);return;}choice(s,e.pi,'변이된 야수 · 피해를 회복하고 부착할 괴물체',enemies.map(u=>opt(name(s,u),{kind:'dwlAltered',u:e.u,enemy:u},code(s,u))));});
X.encounters.set('02099',(s,e)=>{discard(s,e);const enemies=s.enemies.filter(u=>s.cards[u].engaged==null&&A.isTrait(s,u,'Criminal'));if(!enemies.length)surge(s,e.pi);else queue(s,enemies.map(u=>({kind:'dwlHunted',u,pi:e.pi})));});
X.encounters.set('02100',(s,e)=>{discard(s,e);const targets=s.players[e.pi].assets.filter(u=>!card(s,u).encounter_code&&!card(s,u).permanent);if(!targets.length){queue(s,{kind:'campaignMill',pi:e.pi,n:3});return;}choice(s,e.pi,'저 너머로 밀려나다 · 덱에 섞을 자산',targets.map(u=>opt(name(s,u),{kind:'dwlPushBeyond',pi:e.pi,u},code(s,u))));});
X.encounters.set('02101',(s,e)=>{discard(s,e);const phase=s.round+':'+s.phase;s.ext.flags.terrorPhase===phase?s.ext.flags.terrorCount++:(s.ext.flags.terrorPhase=phase,s.ext.flags.terrorCount=1);queue(s,{kind:'dwlTerrorChoice',pi:e.pi,n:s.ext.flags.terrorCount===1?1:2,chosen:[]});});
X.encounters.set('02102',(s,e)=>{A.moveCard(s,e.u,'attachment');s.locations[s.players[e.pi].location].attachments.push(e.u);});
H.dwlLight=(s,e)=>{A.moveCard(s,e.u,'attachment');s.ext[e.target+'Attachments']||=[];s.ext[e.target+'Attachments'].push(e.u);};
H.dwlAltered=(s,e)=>{s.cards[e.enemy].damage=0;A.moveCard(s,e.u,'attachment');s.cards[e.u].attachedEnemy=e.enemy;};
H.dwlPushBeyond=(s,e)=>{const title=ArkhamDeck.title(card(s,e.u));A.moveCard(s,e.u,'deck',e.pi);s.players[e.pi].deck=A.shuffle(s,s.players[e.pi].deck);if(X.mill(s,e.pi,3).some(u=>ArkhamDeck.title(card(s,u))===title))A.damage(s,e.pi,0,2,{source:'02100'});};
H.dwlTerrorChoice=(s,e)=>{if(!e.n)return;choice(s,e.pi,'저 너머의 공포 · 버릴 종류 '+e.n+'개 선택',[['asset','자산'],['event','이벤트'],['skill','능력']].filter(([id])=>!e.chosen.includes(id)).map(([id,label])=>opt(label,{...e,kind:'dwlTerrorDiscard',type:id})));};
H.dwlTerrorDiscard=(s,e)=>{for(const p of s.players)for(const u of p.hand.slice())if(card(s,u).type_code===e.type)A.discard(s,u);queue(s,{...e,kind:'dwlTerrorChoice',n:e.n-1,chosen:[...e.chosen,e.type]});};
H.dwlCheckDeck=(s,e)=>{const p=s.players[e.pi],u=p.threat.find(u=>code(s,u)==='02084');if((e.triggered||!p.deck.length)&&u&&!p.out){A.discard(s,u);queue(s,{kind:'damage',pi:e.pi,damage:10,horror:0,source:u});}};
const moved=A.cardMoved;A.cardMoved=(s,u,oldZone,owner,zone)=>{moved?.(s,u,oldZone,owner,zone);if(oldZone==='deck'&&owner!==null&&s.players[owner]?.threat.some(u=>code(s,u)==='02084')&&!s.players[owner].deck.length&&!s.queue.some(e=>e.kind==='dwlCheckDeck'&&e.pi===owner))queue(s,{kind:'dwlCheckDeck',pi:owner,triggered:true});};
const stat=A.modifyStat;A.modifyStat=(s,pi,skill,context,n)=>{n=stat?stat(s,pi,skill,context,n):n;n-=s.enemies.filter(u=>code(s,u)==='02090'&&s.cards[u].location===s.players[pi].location&&!A.isBlank(s,u)).length;return n;};
const play=A.canPlay;A.canPlay=(s,pi,u)=>play(s,pi,u)&&!(A.isTrait(s,u,'Ally')&&A.threat(s,pi,'02088'));
A.assetTextBlank=(s,u)=>A.isTrait(s,u,'Ally')&&A.threat(s,s.cards[u].owner,'02088');
const gain=H.gainResource;H.gainResource=(s,e)=>{if(s.enemies.some(u=>code(s,u)==='02097'&&s.cards[u].engaged===e.pi&&!A.isBlank(s,u)))return;gain(s,e);};
const damage=H.damage;H.damage=(s,e)=>damage(s,{...e,direct:e.direct||!!(s.ext?.actAttachments?.length||s.ext?.agendaAttachments?.length)});
const start=H.startTest;H.startTest=(s,e)=>start(s,{...e,bonus:(e.bonus||0)-s.players[e.pi].threat.filter(u=>code(s,u)==='02092').length});
const after=H.testAfter;H.testAfter=(s,e)=>{after(s,e);if(e.t.success&&e.t.margin>=1)for(const u of s.players[e.t.pi].threat.slice())if(code(s,u)==='02092')A.discard(s,u);};
const purpose=H.testPurpose;H.testPurpose=(s,e)=>{const t=e.t;if(t.testKind==='dwl:mill'){if(!t.success)X.mill(s,t.pi,t.failBy);return;}if(t.testKind==='dwl:deathWish'){if(!t.success)A.damage(s,t.pi,0,2,{source:t.source});return;}if(t.testKind==='dwl:barrier'){if(t.success){A.discard(s,t.target);queue(s,t.move);}else choice(s,t.pi,'불가사의한 장벽 · 이동 추가 비용',[opt('이동 취소',[]),opt('덱 맨 위 5장을 버리고 이동',[{kind:'campaignMill',pi:t.pi,n:5},t.move])]);return;}purpose(s,e);};
const end=H.endTurn;H.endTurn=(s,e)=>{const length=s.queue.length;end(s,e);const fx=s.players[e.pi].threat.filter(u=>code(s,u)==='02088').map(u=>({kind:'startTest',pi:e.pi,skill:'willpower',difficulty:3,testKind:'removeThreat',source:u,target:u}));if(fx.length){const at=s.queue.findIndex(e=>e.kind==='turnEnded');s.queue.splice(at<0?s.queue.length-length:at,0,...fx);}};
const round=H.roundEnd;H.roundEnd=(s,e)=>{const n=s.queue.length;round(s,e);const fx=[];for(const l of Object.values(s.locations))for(const u of l.attachments)if(code(s,u)==='02089')for(const p of A.playersAt(s,l.id))fx.push({kind:'damage',pi:p.id,damage:0,horror:1,source:u});X.append(s,n,fx);};
const moveFrom=H.moveFrom;H.moveFrom=(s,e)=>{const p=s.players[e.pi],barrier=[...(s.locations[p.location]?.attachments||[]),...(s.locations[e.location]?.attachments||[])].find(u=>code(s,u)==='02102'&&!(e.barriers||[]).includes(u));if(barrier){queue(s,{kind:'startTest',pi:e.pi,skill:'willpower',difficulty:4,testKind:'dwl:barrier',source:barrier,target:barrier,move:{...e,kind:'moveFrom',barriers:[...(e.barriers||[]),barrier]}});return;}moveFrom(s,e);};
const spawn=H.spawnEnemy;H.spawnEnemy=(s,e)=>{const id=code(s,e.u||e.id),locations=Object.keys(s.locations);if(!e.location&&['02086','02095'].includes(id)&&!e.spawnChosen){const scores=locations.map(l=>id==='02086'?s.locations[l].clues:A.distance(s,s.players[e.pi].location,l)),max=Math.max(...scores.filter(n=>n<999)),places=locations.filter((l,i)=>scores[i]===max);if(places.length>1){choice(s,e.pi,name(s,id)+' · 출현 장소',places.map(location=>opt(name(s,location),{...e,kind:'spawnEnemy',location,spawnChosen:true},location)));return;}e={...e,location:places[0]};}spawn(s,e);};
const prey=A.enemyPrey;A.enemyPrey=(s,u)=>({'02087':p=>-p.hand.length,'02094':p=>-A.stat(s,p.id,'intellect'),'02095':p=>-A.stat(s,p.id,'agility'),'02078':p=>A.stat(s,p.id,'intellect')}[code(s,u)]||prey?.(s,u));
H.dwlHunted=(s,e)=>{if(!s.enemies.includes(e.u)||s.cards[e.u].engaged!=null)return;const from=s.cards[e.u].location,to=s.players[e.pi].location,dist=A.distance(s,from,to),steps=s.locations[from].links.filter(l=>A.distance(s,l,to)<dist);if(!steps.length){if(from===to){A.engageAuto(s,e.u);queue(s,{...e,kind:'dwlHuntedAttack'});}return;}choice(s,e.pi,name(s,e.u)+' · 자신을 향해 이동',steps.map(location=>opt(name(s,location),[{kind:'enemyMove',u:e.u,location},{kind:'dwlHuntedAttack',u:e.u,pi:e.pi}],location)));};
H.dwlHuntedAttack=(s,e)=>{if(s.cards[e.u]?.engaged===e.pi)queue(s,{kind:'enemyAttack',u:e.u,pi:e.pi});};
const attack=H.enemyAttack;H.enemyAttack=(s,e)=>{const n=s.queue.length;attack(s,e);if(code(s,e.u)==='02098'&&!A.isBlank(s,e.u))X.append(s,n,[{kind:'dwlLoseResource',pi:e.pi,n:1}]);};
H.dwlLoseResource=(s,e)=>s.players[e.pi].resources=Math.max(0,s.players[e.pi].resources-e.n);
})(typeof window==='undefined'?globalThis:window);
