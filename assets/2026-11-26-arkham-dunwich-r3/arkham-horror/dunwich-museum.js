(function(root){'use strict';const A=root.Arkham,X=A.CampaignEngine,{D,H,queue,choice,opt,log,code,card,name,alive}=A;
const here=s=>s.scenario===102,horror=s=>X.find(s,'02141',['enemies']),shadow=s=>s.ext.shadowResources||0;
const ko={
'02122':['조사자들이 함께 단서 2개를 소비해 진행합니다. 박물관 입구에서 힘(5) 행동으로 문을 부수어 진행할 수도 있습니다.','단서를 소비했다면 애덤 린치를 조종할 조사자를 선택하고 박물관 로비를 공개합니다. 문을 부쉈다면 로비를 공개하고 부수고 들어가다로 진행합니다.'],
'02123':['목표 — 조사자가 제한 구역에 들어가면 진행합니다.','공포의 추격자를 찾아 제한 구역에 준비 상태로 놓습니다.'],
'02124':['목표 — 조사자가 제한 구역에 들어가면 진행합니다.','해럴드 월스테드를 조종할 조사자를 선택한 뒤 공포의 추격자를 제한 구역에 준비 상태로 놓습니다.'],
'02125':['목표 — 제한 구역에 단서가 없으면 진행합니다.','네크로노미콘을 파괴할지(결말 1), 보관할지(결말 2) 선택합니다.'],
'02126':['이곳의 조사자는 자원을 획득할 수 없습니다. 행동: 후퇴.',''],
'02127':['각 전시장과 연결됩니다. 행동 + 이곳 조사자들이 함께 조사자당 단서 1개 소비: 전시 덱 맨 위 장소를 미공개 상태로 놓습니다.','문이 잠겨 있어 들어갈 수 없습니다. 입구에서 행동: 힘(5). 성공하면 주요목적 1을 진행합니다.'],
'02128':['행동 2번: 자신의 덱 맨 위 6장에서 카드 1장을 골라 손에 넣고 나머지를 덱에 섞습니다(차례당 1번).',''],
'02129':['행동 2번: 플레이 중인 전시장 하나의 공개 면 또는 전시 덱 맨 위 카드를 확인합니다(차례당 1번).',''],
'02130':['자원이 4개 이하라면 조사할 수 없습니다.',''],'02131':['손패가 4장 이하라면 조사할 수 없습니다.',''],
'02132':['강제 — 들어온 후 남은 행동을 모두 잃고 즉시 차례를 끝냅니다. 이곳에서 민첩 +2.',''],
'02133':['강제 — 이곳의 조사 테스트에 실패한 후 조종 중인 자산 하나를 버립니다.',''],
'02134':['강제 — 들어온 후 손에서 무작위 카드 2장을 버립니다.',''],
'02135':['강제 — 이곳의 조사 테스트에 실패한 후 행동 1번을 잃습니다.',''],
'02136':['강제 — 이곳의 조사 테스트에 실패한 후 공포 1.',''],
'02137':['공포의 추격자가 이곳에 있다면 조사할 수 없습니다.',''],
'02138':['미스캐토닉 장소를 조사할 때 지식 +2. 강제 — 플레이 영역을 떠나면 게임에서 제거하고 캠페인 동안 석판 토큰 1개 추가.',''],
'02139':['경비실의 행동 2번 기능을 행동 1번으로 취급합니다. 강제 — 플레이 영역을 떠나면 게임에서 제거하고 캠페인 동안 석판 토큰 1개 추가.',''],
'02141':['사냥꾼. 보복. 강제 — 적 단계 시작 시 토큰 1개를 공개합니다. 해골·추종자·석판·옛것·자동 실패라면 준비합니다. 강제 — 플레이 영역을 떠나면 공허에 놓습니다.',''],
'02142':['공포의 추격자가 공허로 가도 부착된 상태를 유지합니다. 이 카드의 자원마다 적의 전투값·체력·회피값 +1. 자원이 3개 이상이면 거대한을 얻습니다.',''],
'02143':['폭로 — 공포의 추격자가 있다면 준비시키고 자신과 교전시킨 뒤 자신의 장소의 모든 조사자를 공격합니다. 없다면 급증.',''],
'02144':['폭로 — 의지(3). 공포의 추격자가 자신의 장소에 있다면 난이도 +2. 실패하면 덱 맨 위 5장을 버리거나, 직접 피해 1을 받고 자신의 조력자마다 피해 1.',''],
'02145':['폭로 — 지식(3). 모자란 차이마다 행동 1번을 잃습니다.',''],
'02146':['폭로 — 공포의 추격자가 있다면 파멸 1. 없다면 찾아서 자신과 교전한 상태로 출현시킵니다. 조우 덱을 섞습니다.','']};
for(const[id,[text,back]]of Object.entries(ko)){D[id].text=text;D[id].back_text=back;}
const M={...root.ArkhamDunwichData[2],intro:'박물관에 보관된 네크로노미콘을 찾습니다. 입구를 열고 전시 덱을 탐색하세요. 유일한 괴수는 쓰러뜨려도 공허로 사라졌다가 더 강해져 돌아옵니다. 제한 구역의 단서를 없애면 책의 운명을 결정합니다.',layout:{'02126':[0,1],'02127':[1,1]},
setup(s){const office=A.shuffle(s,['02128','02129'])[0],admin=A.shuffle(s,['02130','02131'])[0],exhibits=A.shuffle(s,['02132','02133','02134','02135','02136']);X.putLocation(s,office);X.putLocation(s,admin);s.ext.layout[office]=[0,0];s.ext.layout[admin]=[0,2];s.ext.exhibitDeck=[...A.shuffle(s,['02137',...exhibits.slice(0,2)]),...A.shuffle(s,exhibits.slice(2))];s.ext.shadowResources=0;s.ext.shadowAttached=false;},
links(s){if(s.locations['02127']?.revealed)for(const id of Object.keys(s.locations).filter(id=>A.isTrait(s,id,'Exhibit'))){if(!s.locations['02127'].links.includes(id))s.locations['02127'].links.push(id);}},
objective(s){return s.act===1?'입구에서 단서 2개 소비 또는 문 부수기':s.act===2?'전시 덱에서 제한 구역을 찾으세요':'제한 구역의 단서 '+(s.locations['02137']?.clues??'?')+'개를 없애세요';},
filterAction(s,a){const p=s.players[s.current];if((a.type==='move'||a.id.startsWith('dukeInvestigate:'))&&a.target==='02127'&&!s.locations['02127'].revealed)return false;if(a.type==='investigate'){if(p.location==='02130'&&p.resources<=4||p.location==='02131'&&p.hand.length<=4||p.location==='02137'&&horror(s)&&s.cards[horror(s)].location==='02137')return false;}return true;},
actions(s,out,fx){const p=s.players[s.current],pi=p.id,add=c=>X.action(s,out,fx,c);if(s.act===1){const ids=X.group(s);if(X.canSpend(s,2,ids))add({id:'museum:clues',label:'단서 2개로 박물관 열기',actions:0,card:'02122',effects:[{kind:'spendClues',n:2,eligible:ids,after:[{kind:'museumEntry',method:'clues'},{kind:'advanceAct'}]}]});if(p.location==='02126')add({id:'museum:break',label:'박물관 문 부수기 · 힘(5)',card:'02127',effects:[{kind:'startTest',pi,skill:'combat',difficulty:5,testKind:'museum:entry'}]});}if(p.location==='02126')add({id:'museum:resign',label:'박물관에서 후퇴',type:'resign',card:p.location,effects:[{kind:'resign',pi}]});if(p.location==='02127'&&s.ext.exhibitDeck.length){const ids=X.group(s,'02127'),n=s.players.length;if(X.canSpend(s,n,ids))add({id:'museum:exhibit',label:'전시 덱의 다음 장소 열기',card:p.location,effects:[{kind:'spendClues',n,eligible:ids,after:[{kind:'museumExhibit'}]}]});}if(['02128','02129'].includes(p.location)&&p.flags.turn.museumOffice!==p.turnCount){const actions=A.has(s,pi,'02139')?1:2;add({id:'museum:office',label:p.location==='02128'?'경비실 · 덱 맨 위 6장에서 카드 찾기':'경비실 · 전시장 미리 확인',actions,card:p.location,effects:[{kind:'setFlag',pi,key:'turn.museumOffice',value:p.turnCount},p.location==='02128'?{kind:'searchDeck',pi,count:6}:{kind:'museumPeek',pi}]});}const nec=p.assets.find(u=>code(s,u)==='02140');if(nec)add({id:'museum:nec',label:'네크로노미콘 · 자원 2개',card:'02140',effects:[{kind:'gainResource',pi,n:2}]});},
advanceAct(s){if(s.act===2){s.ext.acts[1]=s.ext.entry==='clues'?'02123':'02124';A.reveal(s,'02127');return s.ext.entry==='clues'?[{kind:'museumChooseAsset',code:'02139'}]:[];}if(s.act===3)return[...(s.ext.entry==='clues'?[]:[{kind:'museumChooseAsset',code:'02138'}]),{kind:'museumSummon',location:'02137',pi:s.lead,relocate:true}];return[{kind:'museumBookChoice'}];},
advanceAgenda(s){if(s.agenda<=3)return[{kind:'museumAgendaHorror'}];return[...s.players.filter(alive).map(p=>({kind:'defeatByAgenda',pi:p.id})),{kind:'finish',resolution:'none'}];},
moveTo(s,e,X,base){base(s,e);const fx=[];if(e.location==='02132'){s.players[e.pi].actions=0;fx.push({kind:'endTurn',pi:e.pi});}if(e.location==='02134')fx.push({kind:'randomDiscard',pi:e.pi,n:2});if(e.location==='02137'&&s.act===2)fx.push({kind:'advanceAct'});queue(s,fx);return true;},
gainClue(s,e,X,base){base(s,e);if(s.act===3&&s.locations['02137']?.clues===0)queue(s,{kind:'advanceAct'});return true;},
enemyPhase(s,e,X,base){base(s,e);const u=horror(s);if(u)queue(s,{kind:'dwlOutsideToken',pi:s.lead,after:{kind:'museumReadyFromToken',u}});return true;},
spawnEnemy(s,e,X,base){if(code(s,e.u||e.id)!=='02141')return;if(!e.u||s.cards[e.u].zone!=='enemies'){if(s.ext.shadowAttached)s.ext.shadowResources++;else s.ext.shadowAttached=true;}base(s,e);return true;},
testPurpose(s,e,X,base){const t=e.t,p=s.players[t.pi];if(t.testKind==='museum:entry'){if(t.success){s.ext.entry='break';queue(s,{kind:'advanceAct'});}return true;}if(t.testKind==='museum:passage'){if(!t.success)choice(s,t.pi,'장막 너머로 가는 길',[opt('덱 맨 위 5장 버리기',{kind:'campaignMill',pi:t.pi,n:5}),opt('직접 피해 1과 조력자마다 피해 1',[{kind:'damage',pi:t.pi,damage:1,horror:0,direct:true,source:t.source},...p.assets.filter(u=>A.isTrait(s,u,'Ally')).map(u=>({kind:'assetDamage',u,damage:1}))])]);return true;}if(t.testKind==='museum:exhibit'){if(!t.success)A.loseActions(s,p.id,t.failBy);return true;}base(s,e);if(t.testKind==='investigate'&&!t.success){if(p.location==='02133')queue(s,{kind:'museumDiscardAsset',pi:t.pi});if(p.location==='02135')A.loseActions(s,p.id,1);if(p.location==='02136')A.damage(s,t.pi,0,1,{source:'02136'});}return true;},
finish(s,e){const r=e.resolution||'none',notes=[],flags=s.campaign.flags;if(r==='R1'){flags.necronomiconDestroyed=true;notes.push('조사자들이 네크로노미콘을 파괴했다.');}else if(r==='R2'){flags.necronomiconTaken=true;notes.push('조사자들이 네크로노미콘을 보관했다.');}else{flags.necronomiconMissing=true;notes.push('조사자들이 네크로노미콘을 되찾지 못했다.');}const info={win:r!=='none',notes,summary:'박물관에서의 결과와 혼돈 주머니의 변화를 캠페인에 기록했습니다.'};if(r==='R2'&&!s.ext.flags.bookGranted){s.ext.flags.bookGranted=true;s.bag.push('elder_thing');queue(s,{kind:'campaignGrantCard',code:'02140',after:[{kind:'finish',resolution:r}]});return;}X.finish(s,e,info);},next:()=>103,
token(s,t,x){const hard=['hard','expert'].includes(s.difficulty),same=horror(s)&&s.cards[horror(s)].location===s.players[t.pi].location;if(x==='skull')return same?(hard?-4:-3):(hard?-2:-1);if(x==='cultist')return hard?-3:-1;if(x==='tablet')return hard?-4:-2;if(x==='elder_thing')return hard?-5:-3;}
};
H.museumEntry=(s,e)=>s.ext.entry=e.method;
H.museumChooseAsset=(s,e)=>choice(s,s.lead,D[e.code].name+' · 조종할 조사자',s.players.filter(alive).map(p=>opt(p.name,{kind:'campaignStoryAsset',code:e.code,pi:p.id},e.code)));
H.museumExhibit=s=>{const id=s.ext.exhibitDeck.pop();if(!id)return;const index=Object.keys(s.ext.layout).length-2;s.ext.layout[id]=[2+index%2,Math.floor(index/2)];X.putLocation(s,id);X.links(s);log(s,'새 전시장 배치 · 아직 미공개','location');};
H.museumPeek=(s,e)=>{const options=Object.keys(s.locations).filter(l=>A.isTrait(s,l,'Exhibit')&&!s.locations[l].revealed).map(l=>opt('플레이 중인 전시장 확인',{kind:'notice',title:'전시장 공개 면 확인',card:l,text:D[l].text},l));if(s.ext.exhibitDeck.length)options.push(opt('전시 덱 맨 위 확인',{kind:'notice',title:'전시 덱 맨 위',card:s.ext.exhibitDeck.at(-1),text:D[s.ext.exhibitDeck.at(-1)].text}));choice(s,e.pi,'확인할 전시장',options);};
H.museumSummon=(s,e)=>{const existing=horror(s);if(existing){if(e.relocate){Object.assign(s.cards[existing],{location:e.location,ready:true,engaged:null});A.engageAuto(s,existing);}return;}const u=X.find(s,'02141')||A.uid(s,'02141');queue(s,{kind:'spawnEnemy',u,location:e.location,pi:e.pi,engage:e.engage});};
H.museumAgendaHorror=s=>{const u=horror(s);if(u)s.cards[u].doom++;else queue(s,{kind:'museumSummon',location:'02127',pi:s.lead});X.shuffleEncounter(s);};
H.museumBookChoice=s=>choice(s,s.lead,'네크로노미콘을 어떻게 할까요?',[opt('파괴한다',{kind:'finish',resolution:'R1'}),opt('보관한다 · 옛것 토큰 1개 추가',{kind:'finish',resolution:'R2'})]);
H.museumDiscardAsset=(s,e)=>{const items=s.players[e.pi].assets.filter(u=>!card(s,u).permanent);if(items.length)choice(s,e.pi,'조종 중인 자산 1개 버리기',items.map(u=>opt(name(s,u),{kind:'discard',u},code(s,u))));};
X.encounters.set('02143',(s,e)=>{A.discard(s,e.u);const u=horror(s);if(!u){queue(s,{kind:'encounterDraw',pi:e.pi});return;}s.cards[u].ready=true;s.cards[u].engaged=e.pi;s.cards[u].location=s.players[e.pi].location;queue(s,A.playersAt(s,s.players[e.pi].location).map(p=>({kind:'enemyAttack',u,pi:p.id})));});
X.encounters.set('02144',(s,e)=>{A.discard(s,e.u);const u=horror(s);queue(s,{kind:'startTest',pi:e.pi,skill:'willpower',difficulty:3+(u&&s.cards[u].location===s.players[e.pi].location?2:0),testKind:'museum:passage',source:e.u});});
X.encounters.set('02145',(s,e)=>{A.discard(s,e.u);queue(s,{kind:'startTest',pi:e.pi,skill:'intellect',difficulty:3,testKind:'museum:exhibit',source:e.u});});
X.encounters.set('02146',(s,e)=>{A.discard(s,e.u);const u=horror(s);if(u)s.cards[u].doom++;else queue(s,{kind:'museumSummon',pi:e.pi,location:s.players[e.pi].location,engage:e.pi});s.encounterDeck=A.shuffle(s,s.encounterDeck);});
const moved=A.cardMoved;A.cardMoved=(s,u,old,owner,zone)=>{moved?.(s,u,old,owner,zone);const id=code(s,u);if(here(s)&&id==='02141'&&old==='enemies'&&zone!=='enemies'&&!s.cards[u].leavingBlank){A.moveCard(s,u,'void',null);s.cards[u].damage=0;return;}if(['02138','02139'].includes(id)&&!A.assetTextBlank?.(s,u)&&old==='assets'&&zone!=='assets'){A.moveCard(s,u,'removed',owner);s.bag.push('tablet');}};
const massive=A.isMassive;A.isMassive=(s,u)=>massive(s,u)||here(s)&&code(s,u)==='02141'&&shadow(s)>=3;
const stat=A.modifyStat;A.modifyStat=(s,pi,k,context,n)=>{n=stat?stat(s,pi,k,context,n):n;if(here(s)&&k==='agility'&&s.players[pi].location==='02132')n+=2;if(k==='intellect'&&A.has(s,pi,'02140'))n++;if(k==='intellect'&&context==='investigate'&&A.has(s,pi,'02138')&&A.isTrait(s,s.players[pi].location,'Miskatonic'))n+=2;return n;};
const hp=A.modifyEnemyHp,enemyStat=A.modifyEnemyStat;A.modifyEnemyHp=(s,u,n)=>(hp?hp(s,u,n):n)+(here(s)&&code(s,u)==='02141'?shadow(s):0);A.modifyEnemyStat=(s,u,k,n)=>(enemyStat?enemyStat(s,u,k,n):n)+(here(s)&&code(s,u)==='02141'?shadow(s):0);
const gain=H.gainResource;H.gainResource=(s,e)=>{if(here(s)&&s.players[e.pi].location==='02126')return;gain(s,e);};
const move=H.moveFrom;H.moveFrom=(s,e)=>{if(here(s)&&e.location==='02127'&&!s.locations['02127'].revealed)return;move(s,e);};
const after=H.testAfter;H.testAfter=(s,e)=>{const len=s.queue.length;after(s,e);if(!here(s))return;const t=e.t,hard=['hard','expert'].includes(s.difficulty),fx=[];if(t.tokens.some(x=>!x.ignored&&x.token==='cultist')&&!t.success&&!horror(s))fx.push({kind:'museumSummon',pi:t.pi,location:s.players[t.pi].location});if(t.tokens.some(x=>!x.ignored&&x.token==='tablet')){if(hard){const u=horror(s);if(u&&s.cards[u].location===s.players[t.pi].location)fx.push({kind:'enemyAttack',u,pi:t.pi});}else fx.push({kind:'dropClues',pi:t.pi,n:1});}if(t.tokens.some(x=>!x.ignored&&x.token==='elder_thing')&&!t.success)fx.push({kind:'museumDiscardAsset',pi:t.pi});X.append(s,len,fx);};
H.museumReadyFromToken=(s,e)=>{if(s.enemies.includes(e.u)&&['skull','cultist','tablet','elder_thing','auto_fail'].includes(e.token))s.cards[e.u].ready=true;};
X.define(M);
})(typeof window==='undefined'?globalThis:window);
