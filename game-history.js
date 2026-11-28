(function initializeHistory(root){
  'use strict';
  const KEY='solo-completed-games-v1',META='matchRecord',copy=x=>JSON.parse(JSON.stringify(x));
  const catalog={
    tkid:['더 킹 이즈 데드','tkid-solo-v1','TKID'],cm:['카롤루스 마그누스','cm-solo-v1','CM'],
    container:['컨테이너','container-solo-v1','ContainerGame'],manila:['마닐라','manila-solo-v1','Manila'],
    hellas:['헬라스','hellas-solo-v1','Hellas'],redcathedral:['붉은 대성당','redcathedral-solo-v1','RedCathedral'],
    ostia:['오스티아','ostia-solo-v1','Ostia'],hanami:['하나미','hanami-solo-v1','Hanami'],rebirth:['리버스','rebirth-solo-v1','Rebirth'],
    etchinstone:['에친스톤의 용들','etchinstone-solo-v1','Etchinstone'],teotihuacan:['테오티후아칸','teotihuacan-save-v1','Teotihuacan'],
    stupormundi:['스투포르 문디','stupormundi-save-v1','SMEngine'],andromedasedge:['안드로메다 엣지','andromedasedge-save-v1','AndromedasEdge'],
    worldorder:['월드 오더','worldorder-save-v1','WorldOrder'],greatlibrary:['대도서관','greatlibrary-save-v1','GreatLibraryEngine'],seti:['세티','seti-save-v1','SetiEngine'],mlem:['믈렘','mlem-solo-v1','Mlem'],shackleton:['섀클턴 베이스','shackleton-save-v1','Shackleton'],bloodhunt:['블러드 헌트','bloodhunt-save-v1','BloodHunt'],whitecastle:['백로성','whitecastle-save-v1','WhiteCastle'],kanban:['칸반 EV','kanban-save-v1','Kanban'],gaia:['가이아 프로젝트','gaia-save-v1','Gaia']
  };
  catalog.marvelchampions=['마블 챔피언스','mc-mobile-save-v1','MC'];
  catalog.arkham=['아컴호러 카드게임','arkham-save-v1','Arkham'];
  catalog.barcelona=['바르셀로나','barcelona-save-v1','Barcelona'];
  catalog.distilled=['디스틸드','distilled-save-v1','DistilledEngine'];
  catalog.nippon=['니폰: 자이바츠','nippon-zaibatsu-save-v1','NipponEngine'];
  catalog.galacticcruise=['갤럭틱 크루즈','galacticcruise-save-v1','GalacticCruise'];
  const gamesByKey=Object.fromEntries(Object.entries(catalog).map(([id,c])=>[c[1],id]));
  const difficulty={easy:'쉬움',normal:'보통',hard:'어려움'},species={mascamites:'마스카마이트',anomalies:'이상현상',oumuamua:'오우무아무아',centaurians:'센타우리안',exertians:'엑서티안',amoeba:'아메바',glyphids:'글리피드',arkhos:'아르코스'};
  const now=()=>new Date().toISOString(),uid=game=>game+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,12);
  const validDate=x=>typeof x==='string'&&Number.isFinite(Date.parse(x));
  const finite=x=>typeof x==='number'&&Number.isFinite(x),integer=x=>Number.isInteger(x)&&x>=0;
  function hash(x){let n=2166136261;for(const c of x)n=Math.imul(n^c.charCodeAt(0),16777619);return(n>>>0).toString(36);}
  function validMeta(m,game){return m&&m.version===1&&m.game===game&&typeof m.id==='string'&&m.id.length<150&&integer(m.turns)&&Array.isArray(m.playerTurns)&&m.playerTurns.every(integer)&&(m.startedAt===null||validDate(m.startedAt))&&(m.endedAt===null||validDate(m.endedAt));}
  function metadata(game,s,fresh=false){const old=s[META];if(validMeta(old,game))return copy(old);return {version:1,game,id:s.result?'legacy-'+game+'-'+hash(JSON.stringify([s.seed,s.result])):uid(game),startedAt:fresh?now():null,endedAt:null,full:fresh,turns:0,playerTurns:Array((s.players||[{}]).length).fill(0),lastTurn:null};}
  function actor(game,s){return ['container','ostia','andromedasedge','seti','shackleton','bloodhunt','whitecastle'].includes(game)?s.active:s.current??0;}
  function turnToken(game,s,a,method){
    if(s.result||s.tutorial||game==='gaia'||game==='nippon'||game==='galacticcruise')return null;
    if(game==='distilled'&&['mash','distiller','result-next'].includes(typeof a==='string'?a.split(':')[0]:a?.type))return null;
    if(game==='kanban'&&s.order?.[s.index]===-1)return null;
    if(game==='whitecastle')return a?.type==='place-die'?'turn-'+s.turn:null;
    if(game==='bloodhunt')return s.phase==='draw'?'turn-'+s.turn:null;
    if(game==='tkid')return ['play','pass'].includes(method)?'action-'+(s.actionCount||0)+'-'+(s.log||[]).length:null;
    if(game==='hellas')return a?.type==='choose'?'choice-'+s.round+'-'+s.used.length:null;
    if(game==='manila')return s.phase==='place'&&['place','pass'].includes(a?.type)?'place-'+s.voyage+'-'+s.round+'-'+s.placementIndex:null;
    if(game==='cm')return ['place','move','replenish'].includes(s.phase)?s.round+':'+s.turnIndex:null;
    if(game==='ostia'&&s.stage!=='play')return null;
    if(game==='seti'&&s.phase!=='play')return null;if(game==='shackleton'&&s.phase!=='main')return null;
    if(game==='greatlibrary'&&s.phase!=='main')return null;
    if(game==='worldorder'&&s.phase!=='action')return null;
    if(['setup','opening','draft','setup-crowns'].includes(s.phase)||String(s.phase).startsWith('setup'))return null;
    return integer(s.turn)?'turn-'+s.turn:null;
  }
  function fallbackTurns(game,s){
    if(game==='hellas'){const total=(s.players||[]).reduce((n,p)=>n+Object.values(p.stats?.chosen||{}).reduce((a,b)=>a+b,0),0);return {total,unit:'행동 선택',exact:true};}
    if(game==='cm')return {total:(s.round-1)*s.players.length+s.turnIndex+1,unit:'플레이어 턴',exact:true};
    if(game==='tkid'){const r=s.review;if(r?.complete&&integer(r.steps))return {total:r.steps,unit:'플레이어 턴',exact:true};const logs=(s.log||[]).filter(l=>['action','pass'].includes(l.kind));return {total:logs.length,unit:'기록된 행동·패스',exact:false};}
    if(game==='manila')return {total:null,unit:'조력자 배치 차례',exact:false};
    return {total:integer(s.turn)?s.turn:null,unit:game==='etchinstone'?'모험 턴':'게임의 턴 번호',exact:false};
  }
  function after(game,b,s,a,method){if(!s||typeof s!=='object')return s;const m=metadata(game,b),token=turnToken(game,b,a,method);
    if(token!==null&&token!==m.lastTurn){m.lastTurn=token;m.turns++;const who=actor(game,b);if(integer(who)&&who<m.playerTurns.length)m.playerTurns[who]++;}
    if(game==='gaia'||game==='nippon'||game==='galacticcruise'){m.turns=s.turn;m.playerTurns=s.players.map(p=>p.turns);}
    if(s.result&&!b.result)m.endedAt=now();else if(!s.result)m.endedAt=null;
    s[META]=m;if(s.result)m.completed=snapshot(game,s);else delete m.completed;return s;
  }
  function track(engine,game){if(!engine||engine.historyGame===game)return engine;const wrapped={...engine,historyGame:game};
    for(const name of ['newGame','setup','create'])if(typeof engine[name]==='function')wrapped[name]=function(...args){const s=engine[name](...args);if(s&&typeof s==='object'&&(s.players||game==='etchinstone'))s[META]=metadata(game,s,true);return s;};
    for(const method of ['act','apply','play','pass','customFederation','cancel'])if(typeof engine[method]==='function')wrapped[method]=function(b,...args){return after(game,b,engine[method](b,...args),args[0],method);};
    return wrapped;
  }
  function settings(game,s){const result=[],add=(label,value)=>{if(value!==null&&value!==undefined&&value!=='')result.push({label,value:String(value)});},yes=x=>x?'사용':'사용 안 함';
    const ais=(s.players||[]).filter(p=>p.isAI);if(ais.length){const ds=[...new Set(ais.map(p=>p.difficulty||s.difficulty||s.options?.difficulty||'normal'))];result.splice(0,result.length,...result.filter(x=>x.label!=='AI 난이도'));add('AI 난이도',ds.map(d=>difficulty[d]||d).join(' · '));}
    add('배치 시드',s.seed??s.options?.seed);
    if(game==='galacticcruise'){const d=root.GalacticCruise?.D;add('게임 구성','본판'+(s.options.advancements?' · 진보':'')+(s.options.accommodations?' · 숙박 시설':''));add('설계도',s.options.specializedBlueprints?'특화 설계도':s.options.cabinMatching?'객실 일치':'본판');add('고급 기술',yes(s.options.advancedTechnology));add('장소 보너스',yes(s.options.locationBonuses));add('시작 업그레이드',s.options.startingUpgrades?'한국어 초판 33장':'사용 안 함');add('첫 플레이어',s.players[s.initialFirst].name);add('전문가',d?.expertsById[s.expert]?.textKo||s.expert);add('기술',s.technologies.map(t=>d?.technologiesById[t.id]?.nameKo||t.id).join(' · '));add('회사 목표',d?.companyGoalsById[s.companyGoal]?.goals.map(g=>g.nameKo).join(' · ')||s.companyGoal);add('행동 배치',s.locations.map(l=>l.actions.map(k=>d?.actions[k]?.name||k).join(' + ')).join(' / '));add('손님 보너스',Object.entries(s.guestBonuses).map(([k,v])=>(d?.labels[k]||k)+': '+(d?.labels[v]||v)).join(' / '));for(const p of s.players)if(p.startChosen)add(p.name+' 시작 업그레이드',d?.startingUpgradesById[p.startChosen]?.nameKo||p.startChosen);}
    else if(game==='nippon'){add('게임 구성','본판'+(s.options.lateFactories?' · 후반 공장':'')+(s.options.commonGoals?' · 공통 목표':''));add('공장 면',s.options.randomSides?'A/B 무작위':'A면');add('첫 플레이어',s.players[s.initialFirst]?.name);for(const p of s.players){const d=root.NipponData||root.NipponEngine?.D;add(p.name+'의 시작 조건',(d?.startingA.find(a=>a.id===p.startA)?.textKo||p.startA)+' / '+(root.NipponEngine?.startBText?.(d?.startingB.find(b=>b.id===p.startB))||p.startB));}if(s.options.commonGoals)add('시대별 공통 목표',s.commonGoals.map(a=>a.map(k=>root.NipponData?.labels[k]||k).join(', ')).join(' / '));add('수요 배치',s.regions.map(r=>r.markets.map(m=>m.demandId+'@'+m.rotation).join(', ')).join(' / '));}
    else if(game==='distilled'){add('게임 구성','본판'+(s.options.expansion?' · 아프리카와 중동':'')+(s.options.promo?' · 프로모 미니 확장':'')+(s.options.caskStrength?' · 캐스크 스트렝스':''));add('제조법 모음집',s.options.flight);add('첫 플레이어',s.players[s.initialFirst??s.options.firstPlayer??0]?.name);for(const p of s.players)add(p.name+'의 증류업자',root.DistilledEngine?.getDistiller(s,p)?.name||p.distiller);add('증류주 대상',(s.awards||[]).map(a=>root.DistilledData?.awards?.find?.(d=>d.id===a.id)?.name||a.id).join(' · '));}
    else if(game==='barcelona'){add('게임 구성',s.options.expansion?'본판 · 그라시아 거리':'본판');add('프로모',[1,2,3,4].filter(i=>s.options['promo'+i]).map(i=>'프로모 '+i).concat(s.options.promoGracia?['그라시아 건물 보너스']:[]).join(' · ')||'없음');add('첫 플레이어',s.players[s.first].name);add('세르다 목표',(s.scoring||[]).map(k=>root.BarcelonaData?.goals.find(g=>g.id===k)?.name||k).join(' · '));add('도로 행동 배치',(s.actions||[]).map(k=>root.BarcelonaData?.actions[k]?.name||k).join(' / '));if(s.options.expansion){add('문화시설',s.amenities.map(k=>root.BarcelonaData?.goals.find(g=>g.id===k)?.name||k).join(' · '));add('육각형 자갈 배수',s.hexGoals.map(k=>root.Barcelona?.hexGoalText(k)||k).join(' · '));}}
    else if(game==='gaia'){add('게임 구성',s.lostFleet?'본판 · 잃어버린 함대':'본판');add('첫 플레이어',s.players[s.first]?.name);for(const p of s.players)add(p.name+'의 종족',root.GaiaData?.label(p.faction)||p.faction);add('라운드 점수 타일',(s.core?.tiles?.scorings?.round||[]).join(' · '));add('최종 점수 타일',(s.core?.tiles?.scorings?.final||[]).join(' · '));
    }else if(game==='kanban'){add('게임 구성','칸반 EV'+(s.options.speedcharger?' · 급속충전':'')+(s.options.specialGarage?' · 특별 차고 보너스':''));add('시작 선택',s.players[s.initialFirst]?.name);add('최종 목표 타일',Number(s.finalGoal)+1);add('공장 가동일',s.day);add('주간 / 생산주기',s.week+' / '+s.cycles);
    }else if(game==='whitecastle'){add('게임 구성','본판'+(s.options.matcha?' · 말차':'')+(s.options.boeki?' · 교역':''));add('훈련장 준비','공식 입문 배치');add('첫 플레이어',s.players[s.initialFirst]?.name);add('시간 타일',(s.timeBoard?.tiles||[]).join(' · '));add('다이묘 카드',root.WhiteCastle?.card(s.daimyo)?.name||s.daimyo);if(s.options.matcha)add('다도 타일',Object.values(s.teaCeremonies||{}).concat(s.pondCeremony).join(' · '));
    }else if(game==='bloodhunt'){add('게임 구성','기본판 · '+s.players.length+'인');add('시작 트럼프',root.BloodHuntData?.suits.find(t=>t.id===s.initialTrump)?.nameKo||s.initialTrump);add('첫 우선권',s.players[s.initialFirst]?.name);add('진행한 라운드',s.round);add('종료 조건',s.result?.reason);
    }else if(game==='seti'){
      add('우주 기관 확장',yes(s.options?.expansion));add('기관·빠른 시작',yes(s.options?.organizations));add('프로모 카드',yes(s.options?.promos));
      (s.aliens||[]).forEach((a,i)=>add(i?'오른쪽 외계 종족':'왼쪽 외계 종족',(species[a.species]||a.species)+(a.discovered?' · 발견':' · 미발견')));
      (s.players||[]).forEach(p=>{if(p.organization){const d=root.SetiData?.organizations?.find(o=>o.id===p.organization);add(p.name+'의 기관',d?.name||p.organization);}});
      if(root.SetiData) add('황금 점수 타일',(s.gold||[]).map(g=>root.SetiData.goldTiles[g.kind]?.name||g.kind).join(' · '));
     }else if(game==='shackleton'){add('확장',s.options?.expansion?'Below. Within. Above.':'본판');(s.selectedCorporations||[]).forEach((k,i)=>{const c=root.ShackletonData?.corporations.find(c=>c.id===k);add('기업 '+(i+1),(c?.name||k)+(c?.expansion?' · 확장 기업':' · 본판 기업'));});(s.players||[]).forEach(p=>{const a=root.ShackletonData?.agencies.find(a=>a.id===p.agency);if(a)add(p.name+'의 우주 기관',a.name+(a.expansion?' · 확장':''));});add('첫 선택 플레이어',s.players[s.first]?.name);
    }else if(game==='mlem'){add('게임 구성','기본판 · 우주비행사 8종 · 공통 목표 4종');add('첫 탐사 사령관',s.players[s.first]?.name);add('진행한 탐사',s.expedition);add('로켓 추락',s.failures||0);}
    else if(game==='redcathedral'){add('계약자 확장',yes(s.expansion));add('고급 설정',yes(s.advanced));add('길드',(s.guilds||[]).map(g=>(root.RedCathedral?.D?.guildNames[g.id]||g.id)+' '+g.variant).join(' · '));}
    else if(game==='ostia'){add('확장',[s.exp?.pirates?'해적':null,s.exp?.merchant?'상인':null,s.exp?.patronus?'후원자':null].filter(Boolean).join(' · ')||'본판');(s.players||[]).forEach(p=>add(p.name+'의 시작 항구',p.home));}
    else if(game==='hanami'){add('지도',s.map==='tokyo'?'도쿄':'일본');add('특수 타일',yes(s.specialTiles));add('능력',s.abilities==='special'?'특수 능력':'기본 능력');(s.players||[]).forEach(p=>{if(p.ability)add(p.name+'의 능력',root.Hanami?.abilityName?.(p.ability)||p.ability);});}
    else if(game==='rebirth')add('지도',s.map==='ireland'?'아일랜드':'스코틀랜드');
    else if(game==='etchinstone'){add('구성',{base:'본판',northvale:'Northvale',siege:'Siege'}[s.mode]||s.mode);add('추가 설정',[s.cavalier?'카발리에':null,s.glassCannon?'글라스 캐논':null,...s.mages||[]].filter(Boolean).join(' · ')||'없음');}
    else if(game==='teotihuacan'){add('시작 설정',s.setup==='random'?'무작위':'입문');add('행동판',(s.boards||[]).map(k=>({palace:'궁전',forest:'숲',quarry:'채석장',goldmine:'금광',alchemy:'연금술',nobles:'귀족',decoration:'장식',construction:'건설'}[k]||k)).join(' → '));add('신전 최종 보너스',Object.entries(s.templeBonuses||{}).map(([k,v])=>k+': '+v).join(' · '));}
    else if(game==='stupormundi'){add('시장',s.options?.market);add('종료 조건',(s.endReasons||[]).join(' · '));}
    else if(game==='andromedasedge'){add('목표 승점',s.terminus??s.target??s.goal??s.options?.target);(s.players||[]).forEach(p=>{const id=p.faction?.id||p.faction;const all=root.AndromedasEdge?.D?.factions||[];const f=Array.isArray(all)?all.find(x=>x.id===id):all[id];add(p.name+'의 세력',f?.name||id);});}
    else if(game==='worldorder'){const names={usa:'미국',china:'중국',russia:'러시아',eu:'유럽 연합'};(s.players||[]).forEach(p=>add(p.name+'의 국가',names[p.power]||p.power));add('추가 설정',s.executive?'행정 능력 사용':'기본');}
    else if(game==='container')add('은행 보드',yes(s.bank));
    else if(game==='manila')add('변형 규칙',yes(s.variant));
    else if(game==='hellas')add('지도',s.boardName==='pegasus'?'페가수스':'미노타우로스');
    else if(game==='tkid')add('왕위 판정',s.result?.type==='invasion'?'프랑스 침공':'대관식');
    else if(game==='greatlibrary')add('종료 조건',s.result?.cause||s.final?.cause);
    return result;
  }
  function snapshot(game,s){if(!catalog[game]||!s?.result||s.tutorial)return null;const m=metadata(game,s),r=s.result,people=s.players||[{name:'나',isAI:false}],winners=(game==='distilled'?s.winners:null)||r.winners||('winner'in r?[r.winner]:game==='etchinstone'?(r.win?[0]:[]):[]);
    let scoreLabel='최종 점수';const rows=game==='distilled'&&Array.isArray(r)?r:r.rows||r.ranking||r.scores||r.breakdown||[];
    const players=people.map((p,id)=>{const row=rows.find((x,k)=>(x.id??x.player??k)===id)||{};let score=row.total??row.score??row.vp;
      const detail=[];
      if(game==='galacticcruise'){for(const[k,label]of Object.entries({earned:'게임 중 획득 승점',progress:'마지막 진행 트랙',reputation:'종료 평판',segments:'구획',developments:'개발품 열',cockpits:'조종실·미발사 감점',supplies:'남은 물자'}))detail.push({label,value:String(row[k]??0)});detail.push({label:'발사 횟수',value:String(p.stats.launches)},{label:'손님 득점',value:String(p.stats.guestVP)});}
      if(game==='nippon'){for(const[k,label]of Object.entries({earned:'게임 중 획득 승점',resources:'남은 자원·생산품',money:'남은 엔화'}))detail.push({label,value:String(row[k]??0)});detail.push({label:'개인 목표',value:String((row.objectives||[]).reduce((n,o)=>n+o.score,0))},{label:'시대별 지역 점수',value:(p.stats?.periodVP||[]).join(' / ')},{label:'급여 부족 감점',value:String(p.stats?.salaryLost||0)});}
      if(game==='distilled'){for(const [k,label]of Object.entries({sales:'진행 중 획득 점수',warehouse:'숙성고',bottles:'술병 수집',upgrades:'증류소 업그레이드',money:'남은 돈'}))detail.push({label,value:String(row.breakdown?.[k]??0)});detail.push({label:'증류소 목표',value:String((row.breakdown?.goals||[]).reduce((n,g)=>n+g.points,0))});}
      if(game==='barcelona'){for(const [k,label]of Object.entries({earned:'누적 승점',warehouse:'창고',passengers:'승객',walk:'보행자'}))detail.push({label,value:String(row[k]||0)});detail.push({label:'모더니즘 프로젝트',value:String((row.projects||[]).reduce((a,b)=>a+b,0))});}
      if(game==='whitecastle'){for(const[k,label]of Object.entries({earned:'누적 점수',wealth:'동전·인장',resources:'남은 자원',time:'영향력',courtiers:'가신',warriors:'무사',gardeners:'정원사',geishas:'게이샤',gift:'선물'}))detail.push({label,value:String(row[k]??0)});}
      if(game==='tkid'){const invasion=r.type==='invasion',f=r.ranking?.[0]??0;score=invasion?Math.min(...p.court):p.court[f];scoreLabel=invasion?'완성 추종자 세트':'승리 세력의 추종자';detail.push({label:'궁정 추종자',value:p.court.join(' / ')});}
      if(game==='cm'){score=r.counts?.[id]??0;scoreLabel='보유 성';}
      if(game==='hanami'){score=row.points;scoreLabel='승리한 종류 수';detail.push({label:'총 획득 토큰',value:String(row.total??0)},{label:'종류별 토큰',value:(row.captured||p.captured||[]).join(' / ')});}
      if(game==='etchinstone')score=r.score;if(game==='gaia')score=r.scores[id];
      if(score===undefined&&finite(p.vp))score=p.vp;
      return {id,name:String(p.name||'플레이어 '+(id+1)),isAI:!!p.isAI,difficulty:p.isAI?(p.difficulty||s.difficulty||s.options?.difficulty||'normal'):null,score:finite(score)?score:null,winner:winners.includes(id),turns:m.full?m.playerTurns[id]??0:null,details:detail};
    });
    let turns=m.full?{total:m.turns,exact:true,unit:game==='manila'?'조력자 배치·패스 차례':game==='hellas'?'행동 선택':'플레이어 턴'}:fallbackTurns(game,s);
    return {version:1,id:m.id,game,gameName:catalog[game][0],startedAt:m.startedAt,endedAt:m.endedAt,recordedAt:now(),turns:turns.total,turnUnit:turns.unit,turnsExact:turns.exact,scoreLabel,players,settings:settings(game,s),outcome:game==='etchinstone'?(r.win?'승리':'패배'):'완료',reason:String(r.reason||r.cause||''),durationMs:m.startedAt&&m.endedAt?Math.max(0,Date.parse(m.endedAt)-Date.parse(m.startedAt)):null};
  }
  function validRecord(r){return r&&r.version===1&&typeof r.id==='string'&&r.id.length<=150&&catalog[r.game]&&typeof r.gameName==='string'&&typeof r.scoreLabel==='string'&&typeof r.turnUnit==='string'&&validDate(r.recordedAt)&&(r.durationMs===null||finite(r.durationMs)&&r.durationMs>=0)&&Array.isArray(r.players)&&r.players.length>=1&&r.players.length<=5&&r.players.every(p=>typeof p.name==='string'&&p.name.length<150&&typeof p.isAI==='boolean'&&(p.score===null||finite(p.score))&&typeof p.winner==='boolean'&&(p.turns===null||integer(p.turns)))&&Array.isArray(r.settings)&&r.settings.length<100&&r.settings.every(x=>typeof x.label==='string'&&typeof x.value==='string')&&(r.startedAt===null||validDate(r.startedAt))&&(r.endedAt===null||validDate(r.endedAt))&&(r.turns===null||integer(r.turns));}
  function recordStorage(storage){let store=root.HistoryStore;try{store=store||root.parent?.HistoryStore;}catch{}return store?store.get(storage):storage;}
  function read(storage){storage=recordStorage(storage);const raw=storage.getItem(KEY);if(raw===null)return [];const doc=JSON.parse(raw);if(doc?.format!==KEY||!Array.isArray(doc.records)||!doc.records.every(validRecord))throw Error('완료 기록을 읽을 수 없습니다. 기존 데이터는 보존했습니다.');return doc.records;}
  function signal(){if(typeof root.dispatchEvent==='function'&&typeof root.CustomEvent==='function')root.dispatchEvent(new root.CustomEvent('completed-games-changed'));}
  function deletedIds(storage){storage=recordStorage(storage);const raw=storage.getItem(KEY);if(!raw)return [];const d=JSON.parse(raw);return Array.isArray(d.deleted)?d.deleted.filter(id=>typeof id==='string'):[];}
  function write(storage,records){storage=recordStorage(storage);if(!Array.isArray(records)||!records.every(validRecord))throw Error('완료 기록 형식이 올바르지 않습니다.');const deleted=deletedIds(storage).filter(id=>!records.some(r=>r.id===id));storage.setItem(KEY,JSON.stringify({format:KEY,version:1,records,deleted}));signal();}
  function remove(storage,id){storage=recordStorage(storage);const records=read(storage),deleted=[...new Set([...deletedIds(storage),id])];storage.setItem(KEY,JSON.stringify({format:KEY,version:1,records:records.filter(r=>r.id!==id),deleted}));signal();}
  function replaceArchive(storage,records,deleted){storage=recordStorage(storage);read(storage);if(!Array.isArray(records)||!records.every(validRecord)||!Array.isArray(deleted)||!deleted.every(x=>typeof x==='string')||new Set(records.map(r=>r.id)).size!==records.length)throw Error('기록 형식이 올바르지 않습니다.');const active=new Set(records.map(r=>r.id));storage.setItem(KEY,JSON.stringify({format:KEY,version:1,records,deleted:[...new Set(deleted)].filter(id=>!active.has(id))}));signal();}
  function capture(storage,game,s){if(!s||s.version!==1||s.tutorial)return;const m=s[META];if(s.result){const cached=validMeta(m,game)&&m.completed;const r=validRecord(cached)&&cached.game===game&&cached.id===m.id?copy(cached):snapshot(game,s);if(!r||!validRecord(r))return;const records=read(storage);if(deletedIds(storage).includes(r.id))return;const at=records.findIndex(x=>x.id===r.id);if(at>=0){r.recordedAt=records[at].recordedAt;if(JSON.stringify(records[at])===JSON.stringify(r))return;records[at]=r;}else records.push(r);write(storage,records);}else if(validMeta(m,game)){const records=read(storage);if(records.some(x=>x.id===m.id))write(storage,records.filter(x=>x.id!==m.id));}}
  function wrapStorage(storage){if(!storage||storage.historyStorage)return storage;return {historyStorage:true,getItem:k=>storage.getItem(k),removeItem:k=>storage.removeItem(k),setItem(k,v){let saveError=null;try{storage.setItem(k,v);}catch(e){saveError=e;}const game=gamesByKey[k];if(game){let s;try{s=JSON.parse(v)?.state;}catch{}if(s)try{capture(storage,game,s);}catch(e){if(!saveError)throw e;}}if(saveError)throw saveError;}};}
  function install(game){const config=catalog[game];if(!config)return;root[config[2]]=track(root[config[2]],game);if(game==='teotihuacan'&&root.TeotihuacanTutorial)root.TeotihuacanTutorial=track(root.TeotihuacanTutorial,game);
    try{const original=root.parent?.SoloShelf?.storage||root.SoloStorage||root.localStorage;root.SoloStorage=wrapStorage(original);}catch{}
  }
  // The installer must precede the app's engine capture. Some older bundles
  // put responsive controls after their app, so the final script is not enough.
  function decorate(game,html){if(!catalog[game])return html;const shared=('('+initializeHistory.toString()+')(window);').replace(/<\/script/gi,'<\\/script');html=html.replace(/<script>\s*\(function initializeHistory\(root\)\{[\s\S]*?<\/script>/g,()=>'<script>'+shared+'</script>');if(html.includes('GameHistory.install('))return html;const apps=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].filter(m=>m[1].slice(0,350).includes(catalog[game][2])&&(m[1].includes('document.getElementById')||m[1].includes('HexTable.create')));if(apps.length!==1)throw Error('게임 시작 코드를 찾을 수 없습니다.');const at=apps[0].index,code=('('+initializeHistory.toString()+')(window);window.GameHistory.install('+JSON.stringify(game)+');').replace(/<\/script/gi,'<\\/script');return html.slice(0,at)+'<script>'+code+'</script>'+html.slice(at);}
  const api={recordStorage,KEY,META,catalog,track,install,wrapStorage,capture,snapshot,settings,read,write,remove,replaceArchive,validRecord,decorate};root.GameHistory=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='undefined'?globalThis:window);
