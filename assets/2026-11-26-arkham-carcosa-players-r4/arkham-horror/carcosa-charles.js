(function(root){'use strict';
const A=root.Arkham,X=A.CampaignEngine,{H,queue,choice,opt,code,card,name}=A;
const flat=fx=>(fx||[]).flatMap(e=>[e,...flat(e.steps||e.fx)]),item=(s,u)=>card(s,u)?.type_code==='asset'&&A.isTrait(s,u,'Item');
function lenders(s,pi,u){if(!item(s,u))return[];return A.playersAt(s,s.players[pi].location).filter(p=>p.id!==pi&&p.resources>0&&p.assets.some(v=>code(s,v)==='03149'&&!A.assetTextBlank?.(s,v))).map(p=>p.id);}
function discounts(s,pi){return(s.ptcRossDiscounts||[]).filter(x=>s.players[x.pi]?.location===s.players[pi].location);}
function consume(s,pi,u){if(!item(s,u))return;const ids=new Set(discounts(s,pi).map(x=>x.id));s.ptcRossDiscounts=(s.ptcRossDiscounts||[]).filter(x=>!ids.has(x.id));}
const cost=A.modifyCardCost;A.modifyCardCost=(s,pi,u,n)=>Math.max(0,(cost?cost(s,pi,u,n):n)-(item(s,u)?discounts(s,pi).length:0));
A.canPayCard=(s,pi,u,n=A.cardCost(s,pi,u))=>s.players[pi].resources+lenders(s,pi,u).reduce((n,i)=>n+s.players[i].resources,0)>=n;
A.payCard=(s,pi,u,n,after,onCancel=[])=>queue(s,{kind:'ptcRossPlan',pi,u,cost:n,steps:[{kind:'payAction',pi,type:'play',n:0,resources:n,playedCard:u},...after],onCancel});
const main=A.mainActions;A.mainActions=(s,fx=false)=>{if(s.pending||s.result||s.phase!=='investigation')return main(s,fx);const pi=s.current,p=s.players[pi],out=main(s,true),near=A.playersAt(s,p.location),funders=near.filter(q=>q.id!==pi&&q.assets.some(u=>code(s,u)==='03149'&&!A.assetTextBlank?.(s,u))),hasFunding=funders.some(q=>q.resources>0)||discounts(s,pi).length;
 let result=out;
 if(hasFunding){const t=A.copy(s);t.players[pi].resources+=funders.reduce((n,q)=>n+q.resources,0);const isItem=a=>flat(a.effects).find(e=>e.kind==='playAsset'&&item(s,e.u)&&!e.putIntoPlay);result=out.filter(a=>!isItem(a));for(const a of main(t,true)){const played=isItem(a),pay=flat(a.effects).find(e=>e.kind==='payAction');if(!played||!pay)continue;result.push({...a,id:'ptcRossItem:'+played.u+':'+a.id,description:a.description+' · 같은 장소의 찰스 로스 소유자에게 자원 지원 요청 가능',effects:[{kind:'ptcRossPlan',pi,u:played.u,cost:pay.resources||0,steps:a.effects,isAction:true}]});}}
 for(const u of p.assets.filter(u=>code(s,u)==='03149'&&s.cards[u].ready&&!A.assetTextBlank?.(s,u)&&A.canTrigger?.(s,pi,u)!==false))X.action(s,result,true,{id:'ptcRossDiscount:'+u,label:'찰스 로스 변호사 · 소진 / 같은 장소 다음 물품 비용 −1',pi,actions:0,source:u,exhaust:true,card:'03149',effects:[{kind:'ptcRossDiscount',pi}]});
 return fx?result:result.map(a=>({...a,effects:undefined}));
};
H.ptcRossDiscount=(s,e)=>{s.ptcRossSerial=(s.ptcRossSerial||0)+1;s.ptcRossDiscounts=[...(s.ptcRossDiscounts||[]),{pi:e.pi,id:s.ptcRossSerial}];};
H.ptcRossPlan=(s,e)=>{if(s.players[e.pi].out)return;const ids=lenders(s,e.pi,e.u),next={...e,kind:'ptcRossAsk',lenders:ids,pledges:[],frameID:e.isAction?s.ptcActionSerial:null};if(!e.cost||!ids.length){queue(s,{...next,kind:'ptcRossFinalize'});return;}if(s.players[e.pi].resources<e.cost){queue(s,next);return;}choice(s,e.pi,name(s,e.u)+' · 비용 '+e.cost,[opt('내 자원 '+e.cost+'개로 결제',{...next,kind:'ptcRossFinalize'}),opt('찰스 로스 소유자에게 지원 요청',next),opt('플레이 취소',{...next,kind:'ptcRossCancel'})],'다른 플레이어가 지원할 자원 수를 직접 선택합니다. 결제를 확정하기 전에는 자원이나 행동을 소비하지 않습니다.');};
H.ptcRossAsk=(s,e)=>{const remaining=e.cost-e.pledges.reduce((n,x)=>n+x.n,0),pi=e.lenders[0],rest=e.lenders.slice(1);if(remaining<=0||pi===undefined){queue(s,{...e,kind:'ptcRossFinalize'});return;}const cap=Math.min(remaining,s.players[pi].resources);choice(s,pi,s.players[e.pi].name+'의 '+name(s,e.u)+' · 자원 지원',Array.from({length:cap+1},(_,i)=>cap-i).map(n=>opt(n?'자원 '+n+'개 지원':'지원하지 않기',{...e,kind:'ptcRossAsk',lenders:rest,pledges:[...e.pledges,{pi,n}]})),'지원할 양을 선택하세요. 모든 비용을 낼 수 있을 때만 자원을 소비합니다.');};
H.ptcRossFinalize=(s,e)=>{const pledged=e.pledges.reduce((n,x)=>n+x.n,0),self=e.cost-pledged;if(s.players[e.pi].resources<self||e.pledges.some(x=>s.players[x.pi].resources<x.n)){choice(s,e.pi,'지원 합계로도 비용이 부족합니다',[opt('지원 수량 다시 선택',{...e,kind:'ptcRossAsk',lenders:lenders(s,e.pi,e.u),pledges:[]}),opt('행동·자원 소비 없이 취소',{...e,kind:'ptcRossCancel'})]);return;}for(const x of e.pledges)s.players[x.pi].resources-=x.n;const steps=A.copy(e.steps),pay=flat(steps).find(x=>x.kind==='payAction');if(pay)pay.resources=self;consume(s,e.pi,e.u);queue(s,steps);};
H.ptcRossCancel=(s,e)=>{if(e.isAction&&s.ptcActionFrames)delete s.ptcActionFrames[e.frameID];queue(s,e.onCancel||[]);};
const played=H.playAsset;H.playAsset=(s,e)=>{played(s,e);if(!e.putIntoPlay&&s.cards[e.u]?.zone==='assets')consume(s,e.pi,e.u);};
const book=H.bookCost;H.bookCost=(s,e)=>{const next=s.queue.find(x=>x.kind==='playAsset'&&x.u===e.u&&x.pi===e.pi);if(item(s,e.u)&&next&&lenders(s,e.pi,e.u).length){s.queue.splice(s.queue.indexOf(next),1);A.payCard(s,e.pi,e.u,e.cost,[{kind:'ptcRossBookSecret',book:e.book},next]);return;}book(s,e);consume(s,e.pi,e.u);};
H.ptcRossBookSecret=(s,e)=>{if(s.cards[e.book].uses>0)s.cards[e.book].uses--;};
H.ptcYorickFundingCancel=(s,e)=>{s.players[e.pi].flags.round.yorick=false;};
A.playerWindowCards=[...(A.playerWindowCards||[]),'03149'];
A.Content.register({cards:['03149']});
})(typeof window==='undefined'?globalThis:window);
