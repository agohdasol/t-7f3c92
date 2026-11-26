(function(root){'use strict';const A=root.Arkham,X=A.CampaignEngine,{D,H,queue,choice,opt,notice,log,card,code,name,alive}=A,here=s=>s.scenario===103;
function left(s,id){const i=s.ext.train.indexOf(id);return i>0?s.ext.train[i-1]:null;}
function right(s,id){const i=s.ext.train.indexOf(id);return s.ext.train[i+1]||null;}
const entering=(s,pi,id)=>!!s.locations[id]&&(s.locations[id].revealed||!left(s,id)||!s.locations[left(s,id)]?.clues);
const KO={
'02165':['목표 — 조사자가 기관차에 들어가면 즉시 진행합니다.','기관차에 들어간 조사자는 민첩(3) 또는 힘(3)을 테스트합니다. 실패하면 각각 정신적 또는 육체적 트라우마 1.'],
'02166':['목표 — 기관차에 단서가 없으면 즉시 진행합니다.','결말 1.'],
'02172':['좌우 기차칸과 연결됩니다. 행동: 자원 3개 획득. “승객의 짐을 훔쳤다”를 기억합니다(단체 게임당 1번).',''],
'02173':['좌우 기차칸과 연결됩니다. 강제 — 공개한 후 조우 덱과 버린 카드에서 잡아채는 공포의 존재를 찾아 뽑습니다.',''],
'02174':['좌우 기차칸과 연결됩니다. 조사할 수 없습니다. 행동 + 자원 3개: 이곳의 단서 1개 발견.',''],
'02178':['폭로 — 자신의 덱 맨 위에서 카드 3장 버리기.',''],
'02179':['급증. 폭로 — 자신의 왼쪽 기차칸(없으면 현재 장소)에 놓습니다. 행동: 협상. 이 자산을 조종합니다. 강제 — 플레이 영역을 떠나면 모든 조사자가 공포 1.',''],
'02180':['폭로 — 의지(3). 실패하면 피해 2를 받고 이번 라운드 이 장소에서 나갈 수 없습니다. 이 피해는 가능하다면 자산에 먼저 할당해야 합니다.',''],
'02181':['폭로 — 자신의 장소의 모든 조사자는 행동 1번을 잃습니다. 피해가 4 이상인 해당 조사자들은 각자 조종 중인 자산 하나도 버립니다.',''],
'02182':['사냥꾼. 이 적과 교전 중인 조사자는 이동할 수 없습니다.',''],
'02183':['출현 — 오른쪽 장소(없으면 현재 장소). 소진 상태로 플레이 영역에 들어옵니다.','']};
for(let i=0;i<5;i++)KO['021'+(67+i)]=['좌우 기차칸과 연결됩니다. 강제 — 들어온 후 '+(i===4?'손에서 만능 아이콘이 있는 카드 1장을 버리거나 피해 1과 공포 1.':A.skillNames[['agility','combat','willpower','intellect'][i]]+' 아이콘 합계 2개 이상이 되도록 손에서 버리거나 '+(i<2?'피해':'공포')+' 2.'),''];
for(let i=0;i<11;i++){const id='021'+(67+i);KO[id]||=['기관차는 왼쪽 장소와 연결됩니다.'+(id==='02176'?' 강제 — 공개한 후 잡아채는 공포의 존재를 찾아 뽑습니다.':id==='02177'?' 강제 — 공개한 후 조우 카드를 3장 뽑습니다.':''),''];KO[id][1]='좌우 인접 기차칸과 연결됩니다. 왼쪽 장소의 단서를 모두 발견하기 전에는 이곳에 들어올 수 없습니다.';}
for(let i=0;i<5;i++)KO['021'+(60+i)]=['',i===4?'모든 조사자가 즉시 쓰러지고 정신적 트라우마 1을 받습니다. 결말 2.':'맨 왼쪽 장소 '+(i>=2?'2곳':'1곳')+'을 제거합니다. 단서가 없는 승점 장소는 승점 더미에 놓습니다. 그곳의 조사자들은 쓰러지고 적·자산은 버려집니다. 모든 조사자의 단서를 버립니다.'];
for(const[id,[text,back]]of Object.entries(KO)){D[id].text=text;D[id].back_text=back;}
function loseAction(s,p,n){A.loseActions(s,p.id,n);}
const T={...root.ArkhamDunwichData[3],start:null,intro:'열차 뒤편의 차원문이 객차를 삼키고 있습니다. 왼쪽 객차의 단서를 없애야 오른쪽의 새 객차에 들어갈 수 있습니다. 뒤로 사라지는 객차를 피해 기관차까지 도달하고 그곳의 단서를 모두 발견하세요.',layout:{},
setup(s){const cars=A.shuffle(s,['02167','02168','02169','02170','02171','02172','02173','02174']).slice(0,6),engine=A.shuffle(s,['02175','02176','02177'])[0];s.ext.train=[...cars,engine];s.ext.engine=engine;for(const[id,i]of s.ext.train.map((id,i)=>[id,i])){X.putLocation(s,id);s.ext.layout[id]=[i,0];}s.players.forEach(p=>p.location=cars[0]);s.ext.setupEntering=true;A.reveal(s,cars[0]);s.ext.setupEntering=false;s.bag.push({easy:'-2',standard:'-3',hard:'-4',expert:'-5'}[s.difficulty]);},
links(s){if(!s.ext.train)return;for(const[id,i]of s.ext.train.map((id,i)=>[id,i]))if(s.locations[id])s.locations[id].links=[s.ext.train[i-1],s.ext.train[i+1]].filter(id=>s.locations[id]);},
objective(s){return s.act===1?'기관차'+'까지 이동하세요 · 남은 객차 '+Math.max(0,s.ext.train.length-1)+'곳':'기관차의 단서 '+(s.locations[s.ext.engine]?.clues??0)+'개를 모두 발견하세요';},
filterAction(s,a){const p=s.players[s.current];if(a.type==='move'||a.id.startsWith('dukeInvestigate:')){if(!entering(s,p.id,a.target)||p.flags.trainStuck===s.round||s.enemies.some(u=>code(s,u)==='02182'&&s.cards[u].engaged===p.id))return false;}if(a.type==='investigate'&&p.location==='02174')return false;return true;},
actions(s,out,withEffects){const p=s.players[s.current],pi=p.id,add=c=>X.action(s,out,withEffects,c);if(p.location==='02172'&&!s.ext.flags.stolenLuggage)add({id:'train:luggage',label:'승객의 짐 훔치기 · 자원 3개',card:p.location,effects:[{kind:'trainSteal',pi},{kind:'gainResource',pi,n:3}]});if(p.location==='02174'&&s.locations[p.location].clues)add({id:'train:parlor',label:'특실칸 · 단서 1개 발견',card:p.location,resources:3,effects:[{kind:'discover',pi,n:1}]});for(const u of s.aside.filter(u=>code(s,u)==='02179'&&s.cards[u].location===p.location))add({id:'train:passenger:'+u,label:'무력한 승객 데려가기',type:'parley',card:'02179',effects:[{kind:'trainTakePassenger',pi,u}]});},
revealed(s,id){if(id==='02173'||id==='02176')queue(s,{kind:'trainFindGrappler',pi:s.current});if(id==='02177')queue(s,...Array.from({length:3},()=>({kind:'encounterDraw',pi:s.current})));},
moveTo(s,e,X,base){base(s,e);const i=['02167','02168','02169','02170','02171'].indexOf(e.location);if(i>=0)queue(s,{kind:'trainEntryCost',pi:e.pi,skill:['agility','combat','willpower','intellect','wild'][i],n:i===4?1:2,damage:i<2||i===4?(i===4?1:2):0,horror:i>=2?(i===4?1:2):0});if(e.location===s.ext.engine&&s.act===1){s.ext.enteringInvestigator=e.pi;queue(s,{kind:'advanceAct'});}return true;},
advanceAct(s){if(s.act===2)return[{kind:'trainEngineTest',pi:s.ext.enteringInvestigator??s.current}];return[{kind:'finish',resolution:'R1'}];},
advanceAgenda(s){if(s.agenda===6)return[...s.players.filter(alive).map(p=>({kind:'trainDefeat',pi:p.id,mental:true})),{kind:'finish',resolution:'R2'}];return[{kind:'trainRemoveCars',n:s.agenda>=4?2:1}];},
gainClue(s,e,X,base){base(s,e);if(s.act===2&&s.locations[s.ext.engine]?.clues===0)queue(s,{kind:'advanceAct'});return true;},
testPurpose(s,e,X,base){const t=e.t,p=s.players[t.pi];if(t.testKind==='train:engine'){if(!t.success)p[t.trauma==='physical'?'physicalTrauma':'mentalTrauma']++;return true;}if(t.testKind==='train:steam'){if(!t.success){p.flags.trainStuck=s.round;queue(s,{kind:'damage',pi:t.pi,damage:2,horror:0,source:t.source,assetsFirst:true});}return true;}return;},
spawnEnemy(s,e,X,base){if(code(s,e.u||e.id)!=='02183')return;const location=right(s,s.players[e.pi].location)||s.players[e.pi].location,u=e.u||A.uid(s,e.id);base(s,{...e,u,location,exhausted:true});return true;},
finish(s,e){const r=e.resolution==='R1'?'R1':'R2';s.campaign.flags.delayed=r==='R2';X.finish(s,{...e,resolution:r},{win:r==='R1',notes:[r==='R1'?'조사자'+'들이 무사히 던위치에 도착했다.':'조사자들의 던위치 도착이 지체되었다.',...(s.ext.flags.stolenLuggage?['승객의 짐을 훔쳤다.']:[])],summary:r==='R1'?'기관차를 다시 작동시켜 차원문을 벗어났습니다.':'열차에서의 경험이 남긴 상처와 잃어버린 물품을 기록했습니다.'});},next:()=>104,
token(s,t,x){const hard=['hard','expert'].includes(s.difficulty);if(x==='skull')return -s.agenda-(hard?1:0);if(x==='cultist')return hard?0:-1;if(x==='tablet')return hard?-4:-2;if(x==='elder_thing')return -3;}
};
H.trainSteal=s=>s.ext.flags.stolenLuggage=true;
H.trainTakePassenger=(s,e)=>{A.moveCard(s,e.u,'assets',e.pi);queue(s,{kind:'ensureSlots',pi:e.pi,newAsset:e.u});};
H.trainFindGrappler=(s,e)=>{const u=[...s.encounterDeck,...s.encounterDiscard].find(u=>code(s,u)==='02182');if(u)queue(s,{kind:'spawnEnemy',u,pi:e.pi});s.encounterDeck=A.shuffle(s,s.encounterDeck);};
H.trainEntryCost=(s,e)=>{if(e.n<=0)return;const p=s.players[e.pi],icons=u=>(card(s,u)['skill_'+e.skill]||0)+(e.skill==='wild'?0:card(s,u).skill_wild||0),cards=p.hand.filter(u=>!card(s,u).subtype_code&&icons(u)>0),total=cards.reduce((n,u)=>n+icons(u),0);choice(s,e.pi,'객실칸 · '+(e.skill==='wild'?'만능':A.skillNames[e.skill])+' 아이콘 '+e.n+'개 지불',[...(total>=e.n?cards.map(u=>opt(name(s,u)+' · '+icons(u)+'개',[{kind:'discard',u},{...e,kind:'trainEntryCost',n:e.n-icons(u),paying:true}],code(s,u))):[]),...(!e.paying?[opt('피해 '+e.damage+' / 공포 '+e.horror,{kind:'damage',pi:e.pi,damage:e.damage,horror:e.horror,source:s.players[e.pi].location})]:[])]);};
H.trainEngineTest=(s,e)=>choice(s,e.pi,'기관차 · 증기 괴생명체를 피하거나 견디기',[opt('민첩(3) · 실패 시 정신적 트라우마 1',{kind:'startTest',pi:e.pi,skill:'agility',difficulty:3,testKind:'train:engine',trauma:'mental'}),opt('힘(3) · 실패 시 육체적 트라우마 1',{kind:'startTest',pi:e.pi,skill:'combat',difficulty:3,testKind:'train:engine',trauma:'physical'})]);
H.trainDefeat=(s,e)=>{const p=s.players[e.pi];if(p.out)return;p.out='eliminated';if(e.mental)p.mentalTrauma++;A.eliminate(s,e.pi);log(s,p.name+' · 열차에서 탈락','defeat',e.pi);};
H.trainRemoveCars=(s,e)=>{const removed=s.ext.train.slice(0,e.n);for(const id of removed){const l=s.locations[id];if(!l)continue;for(const p of s.players.filter(p=>alive(p)&&p.location===id))H.trainDefeat(s,{pi:p.id});if(l.revealed&&!l.clues&&D[id].victory)s.victory.push(id);for(const u of s.aside.filter(u=>s.cards[u].location===id&&code(s,u)==='02179'))A.discard(s,u);X.removeLocation(s,id);}s.ext.train=s.ext.train.filter(id=>s.locations[id]);for(const p of s.players)p.clues=0;X.links(s);};
X.encounters.set('02178',(s,e)=>{A.discard(s,e.u);X.mill(s,e.pi,3);});
X.encounters.set('02179',(s,e)=>{A.moveCard(s,e.u,'aside',null);s.cards[e.u].location=left(s,s.players[e.pi].location)||s.players[e.pi].location;queue(s,{kind:'encounterDraw',pi:e.pi});});
X.encounters.set('02180',(s,e)=>{A.discard(s,e.u);queue(s,{kind:'startTest',pi:e.pi,skill:'willpower',difficulty:3,testKind:'train:steam',source:e.u});});
X.encounters.set('02181',(s,e)=>{A.discard(s,e.u);const fx=[];for(const p of A.playersAt(s,s.players[e.pi].location)){loseAction(s,p,1);if(p.damage>=4)fx.push({kind:'museumDiscardAsset',pi:p.id});}queue(s,fx);});
const move=H.moveFrom;H.moveFrom=(s,e)=>{if(here(s)&&(!entering(s,e.pi,e.location)||s.players[e.pi].flags.trainStuck===s.round||s.enemies.some(u=>code(s,u)==='02182'&&s.cards[u].engaged===e.pi)))return;move(s,e);};
const eliminated=A.beforeEliminate;A.beforeEliminate=(s,pi)=>{eliminated?.(s,pi);if(!here(s))return;const p=s.players[pi];if(p.out==='resigned')return;p.deckList.push('02178');p.flags.resolutionXP=(p.flags.resolutionXP||0)+1;for(const id of ['02140','02040','02080','02061'])if(p.deckList.includes(id)){p.deckList=p.deckList.filter(c=>c!==id);s.campaign.flags[{'02140':'necronomiconStolen','02040':'armitageKidnapped','02080':'morganKidnapped','02061':'riceKidnapped'}[id]]=true;}};
const moved=A.cardMoved;A.cardMoved=(s,u,old,owner,zone)=>{moved?.(s,u,old,owner,zone);if(here(s)&&code(s,u)==='02179'&&['assets','aside'].includes(old)&&['discard','encounterDiscard','removed'].includes(zone))queue(s,s.players.filter(alive).map(p=>({kind:'damage',pi:p.id,damage:0,horror:1,source:u})));};
const accept=H.acceptToken;H.acceptToken=(s,e)=>{accept(s,e);if(here(s)&&['hard','expert'].includes(s.difficulty)&&A.tokenHasEffect?.(s,s.test,e.item.token)!==false&&e.item.token==='cultist')s.queue=s.queue.map((x,i)=>i===0&&x.kind==='testMath'?{kind:'drawChaos'}:x);};
const after=H.testAfter;H.testAfter=(s,e)=>{const len=s.queue.length;after(s,e);if(!here(s))return;const t=e.t,hard=['hard','expert'].includes(s.difficulty),fx=[];if(t.tokens.some(x=>!x.ignored&&x.token==='cultist')&&!t.success&&s.phase==='investigation'&&s.current===t.pi){s.players[t.pi].actions=0;fx.push({kind:'endTurn',pi:t.pi});}if(t.tokens.some(x=>!x.ignored&&x.token==='tablet')){const enemies=s.enemies.filter(u=>A.isTrait(s,u,'Cultist'));if(hard)fx.push(...enemies.map(u=>({kind:'enemyDoom',u,n:1})));else if(enemies.length)fx.push({kind:'nearestDoom',pi:t.pi,enemies,n:1});}if(t.tokens.some(x=>!x.ignored&&x.token==='elder_thing')&&!t.success)fx.push({kind:'chooseDiscard',pi:t.pi,n:hard?t.failBy:1});X.append(s,len,fx);};
X.define(T);
})(typeof window==='undefined'?globalThis:window);
