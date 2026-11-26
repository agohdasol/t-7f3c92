(function(root){'use strict';
const A=root.Arkham,{H,queue,choice,opt,code}=A;
const flat=fx=>(fx||[]).flatMap(e=>[e,...flat(e.steps||e.fx)]);
const pay=H.payAction;H.payAction=(s,e)=>{pay(s,e);if(e.type==='fight'&&e.source&&A.isTrait(s,e.source,'Firearm')&&s.cards[e.source].uses>0&&!s.players[e.pi].out)queue(s,{kind:'ptcEatLeadWindow',pi:e.pi,source:e.source});};
H.ptcEatLeadWindow=(s,e)=>{const p=s.players[e.pi],u=A.findHand(s,e.pi,'03304');if(!u||!A.canPlay(s,e.pi,u)||p.resources<A.cardCost(s,e.pi,u)||s.cards[e.source]?.uses<=0)return;choice(s,e.pi,'“총알 맛 좀 봐라!” · 총 전투 기능 활성화',[...Array.from({length:s.cards[e.source].uses+1},(_,i)=>s.cards[e.source].uses-i).map(n=>opt('추가 탄약 '+n+'발 · 토큰 '+(n+1)+'개 중 1개 해결',[{kind:'fastCard',pi:e.pi,u},{kind:'ptcEatLeadSpend',pi:e.pi,source:e.source,n},{...e}],'03304')),opt('사용하지 않기',[])],'기본 공격의 탄약은 이미 지불했습니다. 추가로 소비할 탄약을 선택하세요.','reaction');};
H.ptcEatLeadSpend=(s,e)=>{const t=flat(s.queue).find(x=>x.kind==='startTest'&&x.pi===e.pi&&x.source===e.source);if(!t||s.cards[e.source].uses<e.n)return;s.cards[e.source].uses-=e.n;t.ptcAmmoExtra=(t.ptcAmmoExtra||0)+e.n;};
function pick(s,t){t.drawnIndices||=[];const left=s.bag.map((token,index)=>({token,index})).filter(x=>!t.drawnIndices.includes(x.index)),x=left.length?left[Math.floor(A.random(s)*left.length)]:{token:'auto_fail',index:-1};t.drawnIndices.push(x.index);return x;}
const draw=H.drawChaos;H.drawChaos=(s,e)=>{const t=s.test;if(!t?.ptcAmmoExtra)return draw(s,e);const n=1+t.ptcAmmoExtra+(e.statue?1:0);if(e.statue){s.cards[e.statue].uses--;if(s.cards[e.statue].uses<=0)A.discard(s,e.statue);}const items=Array.from({length:n},()=>pick(s,t));choice(s,t.pi,'“총알 맛 좀 봐라!” · 해결할 토큰 1개',items.map(item=>opt(A.tokenLabel(item.token)+' · 보정 '+A.tokenValue(s,t,item.token),{kind:'tokenReactions',item})),'선택한 토큰 하나만 해결하며, 나머지 토큰의 보정값과 효과를 무시합니다.','token');};
const main=A.mainActions;A.mainActions=(s,fx=false)=>main(s,fx).filter(a=>a.card!=='03304');
A.Content.register({cards:['03304']});
})(typeof window==='undefined'?globalThis:window);
