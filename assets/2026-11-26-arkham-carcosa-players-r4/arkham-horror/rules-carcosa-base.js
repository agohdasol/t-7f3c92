(function(root){'use strict';const A=root.Arkham,{H,code,card}=A;
const place=A.canPlaceEnemyDamage;A.canPlaceEnemyDamage=(s,u,source,kind)=>{if(place?.(s,u,source,kind)===false)return false;if(A.isBlank(s,u))return true;const id=code(s,u),src=source&&card(s,source);if(id==='02255'&&code(s,source)!=='02254')return false;if(id==='03093'&&src?.faction_code!=='mythos'&&!A.isTrait(s,source,'Spell')&&!A.isTrait(s,source,'Relic'))return false;return true;};
// A revealed elder sign is treated as auto-fail while Daisy's Necronomicon is active.
const reaction=H.tokenReactions;H.tokenReactions=(s,e)=>reaction(s,s.test&&e.item.token==='elder_sign'&&A.threat(s,s.test.pi,'01009')?{...e,item:{...e.item,token:'auto_fail'}}:e);
})(typeof window==='undefined'?globalThis:window);
