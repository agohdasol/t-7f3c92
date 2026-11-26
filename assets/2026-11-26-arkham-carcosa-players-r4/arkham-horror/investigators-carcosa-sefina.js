(function(root){'use strict';const A=root.Arkham,X=A.CampaignEngine,{H,D,queue,choice,opt,code,card,name}=A;
const handSize=A.openingHandSize;A.openingHandSize=(s,pi)=>s.players[pi].investigator==='03003'?13:handSize?.(s,pi)||5;
const setup=A.playerSetup;A.playerSetup=(s,pi)=>{setup?.(s,pi);if(s.players[pi].investigator==='03003')s.players[pi].beneath=[];};
const mulligan=H.mulligan;H.mulligan=(s,e)=>{if(s.players[e.pi].investigator!=='03003')return mulligan(s,e);queue(s,{kind:'ptcSefinaOpening',pi:e.pi});};
H.ptcSefinaOpening=(s,e)=>{const p=s.players[e.pi];p.beneath||=[];const list=p.hand.filter(u=>card(s,u).type_code==='event'&&code(s,u)!=='03012');if(p.beneath.length>=5||!list.length||p.hand.length<=8){queue(s,{kind:'ptcSefinaKeep',pi:e.pi});return;}choice(s,e.pi,'세피나 루소 · 이벤트를 조사자 밑에 놓기 '+p.beneath.length+'/5',[...list.map(u=>opt(name(s,u),[{kind:'ptcSefinaBeneath',pi:e.pi,u},{...e,kind:'ptcSefinaOpening'}],code(s,u))),opt('여기까지 · 손패 8장 선택',{kind:'ptcSefinaKeep',pi:e.pi})],'시작 카드 13장 중 이벤트를 최대 5장까지 보관합니다. 그림 속 세계는 조사자 밑에 놓을 수 없습니다. 남은 카드 중 8장을 시작 손패로 가집니다.');};
H.ptcSefinaBeneath=(s,e)=>{const p=s.players[e.pi];if(!p.hand.includes(e.u)||p.beneath.length>=5||code(s,e.u)==='03012'||card(s,e.u).type_code!=='event')return;A.moveCard(s,e.u,'beneath',e.pi);};
H.ptcSefinaKeep=(s,e)=>{const p=s.players[e.pi];if(p.hand.length>8){choice(s,e.pi,'세피나 루소 · 시작 손패를 8장으로 '+p.hand.length+'/8',p.hand.map(u=>opt(name(s,u)+' 버리기',[{kind:'discard',u},{...e,kind:'ptcSefinaKeep'}],code(s,u))),'이벤트 보관을 마쳤습니다. 멀리건은 할 수 없습니다.');return;}H.finishMulligan(s,{pi:e.pi});p.flags.sefinaOpeningDone=true;};
H.ptcSefinaDraw=(s,e)=>{if(!s.players[e.pi].beneath.includes(e.u))return;A.moveCard(s,e.u,'hand',e.pi);A.cardDrawn?.(s,e.pi,e.u);};
H.ptcSefinaSign=(s,e)=>{const p=s.players[e.pi];if(p.out||!p.beneath.length)return;A.optional(s,e.pi,'세피나 루소 · 보관한 이벤트 뽑기',p.beneath.map(u=>opt(name(s,u),{kind:'ptcSefinaDraw',pi:e.pi,u},code(s,u))));};
const token=A.tokenOverride;A.tokenOverride=(s,t,x)=>x==='elder_sign'&&s.players[t.pi].investigator==='03003'&&!A.blank(s,t.pi)?3:token?.(s,t,x);
const accept=H.acceptToken;H.acceptToken=(s,e)=>{accept(s,e);const t=s.test;if(t&&e.item.token==='elder_sign'&&!A.blank(s,t.pi)&&!A.threat(s,t.pi,'01009')&&A.tokenHasEffect(s,t,'elder_sign')&&s.players[t.pi].investigator==='03003')queue(s,{kind:'ptcSefinaSign',pi:t.pi});};
const reveal=H.revealCard;H.revealCard=(s,e)=>{if(code(s,e.u)!=='03013')return reveal(s,e);const p=s.players[e.pi];if(p.beneath.length){const u=p.beneath[Math.floor(A.random(s)*p.beneath.length)];A.moveCard(s,u,'removed',e.pi);A.log(s,'히아데스 성단 · 보관한 '+name(s,u)+' 제거','card',e.pi);queue(s,{kind:'ptcStarsFinish',pi:e.pi,u:e.u});}else queue(s,{kind:'damage',pi:e.pi,damage:1,horror:1,source:e.u},{kind:'ptcStarsFinish',pi:e.pi,u:e.u});};
H.ptcStarsFinish=(s,e)=>{const p=s.players[e.pi];if(p.out)return;if(p.deck.length>=5){A.moveCard(s,e.u,'deck',e.pi);p.deck=A.shuffle(s,p.deck);}else A.discard(s,e.u);};
function under(s,pi){return(s.players[pi].beneath||[]).filter(u=>card(s,u).type_code==='event'&&!card(s,u).exceptional&&code(s,u)!=='03012');}
function begin(s,u,target,playing=false){const c=s.cards[u];if(c.ptcPaintedOriginal)return;c.ptcPaintedOriginal=code(s,u);c.ptcPaintedFrom=target;c.ptcPaintedPlaying=playing;c.code=code(s,target);if(playing)A.PaintedWorld?.onPlay?.(s,u);}
function restore(s,u,force=false){const c=s.cards[u];if(!c?.ptcPaintedOriginal||c.zone==='attachment'&&!force)return;c.code=c.ptcPaintedOriginal;delete c.ptcPaintedOriginal;delete c.ptcPaintedFrom;delete c.ptcPaintedPlaying;delete c.ptcEideticRemoved;}
function flat(fx){return(fx||[]).flatMap(e=>[e,...flat(e.steps||e.fx)]);}
const PLAY=new Set(['fastCard','playEvent','dwlToolEvent','dwlShortcut','dwlSeekingAnswer','lucky','preventDamage','ptcTimeWarpUse']);
function plays(fx,u){return flat(fx).some(e=>PLAY.has(e.kind)&&e.u===u||e.ward===u||e.kind==='ptcCancelEncounter'&&e.event===u);}
A.PaintedWorld={under,begin,restore,plays,flat};
const destination=A.cardMoveDestination;A.cardMoveDestination=(s,u,from,to)=>{to=destination?.(s,u,from,to)||to;return s.cards[u].ptcPaintedOriginal&&s.cards[u].ptcPaintedPlaying&&to==='discard'?'removed':to;};
const moved=A.cardMoved;A.cardMoved=(s,u,from,owner,to)=>{moved?.(s,u,from,owner,to);const c=s.cards[u];if(!c.ptcPaintedOriginal)return;if(to==='victory'){const at=s.victory.lastIndexOf(c.code);if(at>=0)s.victory[at]=c.ptcPaintedOriginal;restore(s,u);}else if(to==='hand'||to==='deck'||from==='attachment'&&to!=='attachment')restore(s,u,true);};
H.ptcPaintedBegin=(s,e)=>{if(!s.players[e.pi].hand.includes(e.u)||code(s,e.u)!=='03012'||!under(s,e.pi).includes(e.target))return;begin(s,e.u,e.target,!!e.playing);};
H.ptcPaintedRestore=(s,e)=>restore(s,e.u);
const beforeChoice=A.beforeChoose;A.beforeChoose=(s,o)=>{beforeChoice?.(s,o);for(const c of Object.values(s.cards))if(c.ptcPaintedOriginal&&!c.ptcPaintedPlaying&&c.zone==='hand'){if(plays(o.effects,c.id)){c.ptcPaintedPlaying=true;A.PaintedWorld.onPlay?.(s,c.id);o.effects=[...(o.effects||[]),{kind:'ptcPaintedRestore',u:c.id}];}else restore(s,c.id);}};
const main=A.mainActions;A.mainActions=(s,fx=false)=>{let list=main(s,fx).filter(a=>a.card!=='03012'||a.type!=='play');if(s.pending||s.result||s.phase!=='investigation')return list;const pi=s.current,p=s.players[pi];if(p.investigator==='03003'&&!A.blank(s,pi))for(const u of p.beneath||[])X.action(s,list,fx,{id:'ptcSefinaDraw:'+u,label:'세피나 루소 · '+name(s,u)+' 뽑기',card:'03003',noAoO:true,effects:[{kind:'ptcSefinaDraw',pi,u}]});if(s.ptcCopyPreview)return list;
for(const u of p.hand.filter(u=>code(s,u)==='03012'))for(const target of under(s,pi)){const t=A.copy(s);t.ptcCopyPreview=true;begin(t,u,target,true);for(const action of main(t,true).filter(a=>a.card===code(s,target)&&flat(a.effects).some(e=>e.u===u||e.source===u))){list.push({...action,id:'ptcPainted:'+u+':'+target+':'+action.id,label:'그림 속 세계 · '+action.label,card:'03012',description:action.description+' · '+name(s,target)+' 복사',effects:fx?[{kind:'ptcPaintedBegin',pi,u,target,playing:true},...action.effects,{kind:'ptcPaintedRestore',u}]:undefined});}}
return list;};
function restoreAll(s,pi){for(const c of Object.values(s.cards))if(c.ptcPaintedOriginal&&(pi===undefined||c.owner===pi))restore(s,c.id,true);}
const finishEvent=H.finishEvent;H.finishEvent=(s,e)=>{finishEvent(s,e);restore(s,e.u);};
const boundary=A.effectBoundary;A.effectBoundary=s=>{boundary?.(s);for(const c of Object.values(s.cards))if(c.ptcPaintedOriginal&&c.zone!=='attachment')restore(s,c.id);};
const eliminate=A.beforeEliminate;A.beforeEliminate=(s,pi)=>{eliminate?.(s,pi);restoreAll(s,pi);};
const finish=A.beforeScenarioFinish;A.beforeScenarioFinish=s=>{finish?.(s);restoreAll(s);};
const coreFinish=H.finish;H.finish=(s,e)=>{restoreAll(s);coreFinish(s,e);};
// Registered by the reaction-copy module after its timing checks pass.
A.Content.register({cards:['03012','03013']});
})(typeof window==='undefined'?globalThis:window);
