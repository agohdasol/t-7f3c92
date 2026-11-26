/* Touch UI for the Marvel Champions mobile port. Renders the engine state and answers its questions. */
(function () {
  'use strict';
  const MC = window.MC;
  const KEY = 'mc-mobile-save-v1';
  const $app = document.getElementById('app');
  const Online = MC.Online;
  function resetOnlineState() {
    return { active: false, role: null, code: null, myIdx: 0, runGen: 0, gameId: null, askId: 0, showId: 0, lastSeenShowId: 0, lastAnsweredKey: null, lastAskKey: null, lastHostSyncKey: '', guestLoadingSeq: 0 };
  }
  const onlineCkptKey = code => 'mc-online-ckpt-' + code;
  const UI = { g: null, pending: null, overlay: null, sheet: null, sel: null, error: null, suppressClick: false, hero: 'spider_man', scen: 'rhino', screen: 'home', returnScreen: 'home', edit: null, toast: '', mode: '1p', deckSlot: 0, firstPick: 0, viewP: 0, lockView: false, splitView: false, joinCode: '', onlineBusy: false, onlineErr: '', online: resetOnlineState() };
  const SKEY = 'mc-selected-deck', SKEY2 = 'mc-selected-deck-2', MKEY = 'mc-mode', FKEY = 'mc-first-pick';
  try { UI.deckId = localStorage.getItem(SKEY) || 'starter-spider_man'; } catch (e) { UI.deckId = 'starter-spider_man'; }
  try { UI.deckId2 = localStorage.getItem(SKEY2) || 'starter-captain_marvel'; } catch (e) { UI.deckId2 = 'starter-captain_marvel'; }
  try { const m = localStorage.getItem(MKEY); UI.mode = (m === '2p' || m === 'online') ? m : '1p'; } catch (e) { UI.mode = '1p'; }
  try { const fp = localStorage.getItem(FKEY); UI.firstPick = fp === 'rnd' ? 'rnd' : fp === '1' ? 1 : 0; } catch (e) { UI.firstPick = 0; }
  const Deck = MC.Deck, Store = MC.DeckStore;
  function selectedDeck(slot) {
    const id = slot === 1 ? UI.deckId2 : UI.deckId;
    const all = Store.all();
    return Store.get(id) || all[slot === 1 ? Math.min(1, all.length - 1) : 0];
  }
  function selectDeck(id, slot) {
    const s = slot != null ? slot : UI.deckSlot;
    if (s === 1) { UI.deckId2 = id; try { localStorage.setItem(SKEY2, id); } catch (e) { /* ignore */ } }
    else { UI.deckId = id; try { localStorage.setItem(SKEY, id); } catch (e) { /* ignore */ } }
  }
  function saveMode() {
    try { localStorage.setItem(MKEY, UI.mode); localStorage.setItem(FKEY, String(UI.firstPick)); } catch (e) { /* ignore */ }
  }
  // opponent choice: villain, difficulty, modular set
  const VKEY = 'mc-scenario';
  try { Object.assign(UI, JSON.parse(localStorage.getItem(VKEY) || '{}')); } catch (e) { /* ignore */ }
  if (!MC.scenarios[UI.scen] || MC.scenarios[UI.scen].hidden) UI.scen = 'rhino';
  if (!MC.modsOf(UI.modular).length) UI.modular = MC.scenarios[UI.scen].defaultModular;
  UI.expert = !!UI.expert; UI.std2 = UI.std2 === 3 ? 3 : !!UI.std2; UI.exp2 = !!UI.exp2;
  // campaign logs (the original keeps them in campaign_settings.json; here per browser)
  const CKEY = 'mc-campaign-logs';
  const loadCLogs = () => { try { return JSON.parse(localStorage.getItem(CKEY) || '{}') || {}; } catch (e) { return {}; } };
  const saveCLog = (id, log) => { const all = loadCLogs(); if (log) all[id] = log; else delete all[id]; try { localStorage.setItem(CKEY, JSON.stringify(all)); } catch (e) { /* ignore */ } };
  const campaignFor = key => { const S = MC.scenarios[key]; return S && !S.base ? MC.campaignOfPack(S.pack) : null; }; // challenges never run as part of a campaign
  const activeCampaign = () => { const c = campaignFor(UI.scen); return c && UI.campaign === c ? c : null; };
  function saveScen() { try { localStorage.setItem(VKEY, JSON.stringify({ scen: UI.scen, campaign: UI.campaign, underling: UI.underling, expert: UI.expert, modular: UI.modular, std2: UI.std2, exp2: UI.exp2, schemes: UI.schemes, cameo: UI.cameo })); } catch (e) { /* ignore */ } }
  function cameoList(hk) { const out = []; for (const [k, H] of Object.entries(MC.heroes)) if (k !== hk) for (const [id, nm] of (H.allies || [])) out.push({ id, nm, hero: H.name }); return out; }
  function cameoFor(deck) { // Cameo (58031): an identity-specific ally of another identity, picked before the game (it must be loaded)
    if (!deck || !deckIds(deck).includes('58031')) return null; const hk = Deck.heroKeyOf(deck) || UI.hero, L = cameoList(hk);
    if (!L.some(x => x.id === UI.cameo)) { UI.cameo = L.length ? L[Math.floor(Math.random() * L.length)].id : null; saveScen(); } return UI.cameo; }
  function schemesFor(k) { const S = MC.scenarios[k]; if (!S || !S.mainOptions) return null; const c = (UI.schemes || {})[k]; return c === 'random' ? 'random' : Array.isArray(c) ? c : null; } // Civil War: the chosen main scheme per stage (default: the leader's)
  const VDESC = {
    rhino: '강한 공격과 돌진으로 밀어붙입니다. 주 음모가 한 단계뿐이라 처음 하기 좋습니다.',
    klaw: '공격할 때마다 강화 카드를 1장 더 받습니다. 방어망과 「불멸의」 클로 부가 음모가 그를 지켜 줍니다.',
    ultron: '내 덱 맨 위 카드를 뒤집어 드론 하수인으로 만듭니다. 드론이 쌓이기 전에 정리하는 게 관건입니다.',
    risky_business: '노먼 오스본은 피해를 입지 않고 범죄 기업의 악명 카운터만 깎입니다. 악명이 바닥나면 그린 고블린으로 변하고, 광기가 바닥나면 다시 노먼으로 돌아옵니다.',
    mutagen_formula: '고블린 하수인이 끝없이 몰려옵니다. 두 번째 주 음모는 고블린 적이 많을수록 빨리 차니 하수인 정리가 핵심입니다.',
    the_wrecking_crew: '빌런 넷이 한꺼번에 나옵니다. 활성 빌런 한 명만 공격·음모를 하고, 각자 부가 음모에 위협을 쌓습니다. 위협 10이 되면 강력한 효과가 터지니 넷 모두 쓰러뜨리세요.',
    crossbones: '무기를 들면 공격이 관통을 얻습니다. 실험 무기 덱에서 무기가 계속 나옵니다.',
    absorbing_man: '환경 카드의 특성을 흡수해 효과가 바뀝니다. 지연 카운터가 쌓일수록 환경 효과가 강해집니다.',
    taskmaster: '히어로로 변신할 때마다 피해를 줍니다. 붙잡힌 동료를 구출하면 손으로 가져올 수 있습니다.',
    zola: '실험 카운터가 3개 쌓이면 하수인이 나옵니다. 기술 부착물로 하수인이 강해집니다.',
    red_skull: '부가 음모가 매 라운드 하나씩 나오고, 레드 하우스가 있는 동안 레드 스컬은 피해를 입지 않습니다.',
    brotherhood_of_badoon: '바둔 함선이 포격 카운터를 모으다 4개가 되면 간접 피해를 줍니다. 밀라노를 소진해 음모의 위협을 3씩 걷어 낼 수 있습니다.',
    infiltrate_the_museum: '콜렉터가 있는 동안 플레이에서 버려지는 카드는 모두 콜렉션으로 갑니다. 콜렉션이 5장이 되면 패배하니, 히어로 행동으로 꾸준히 꺼내세요.',
    escape_the_museum: '콜렉터는 쓰러지지 않고 뒤집힐 뿐입니다. 주 음모의 위협을 0으로 만들어 다음 단계로 나아가는 것이 승리 방법입니다. 3단계 위협을 모두 없애면 탈출 성공.',
    nebula: '기술 부착물이 네뷸라에게 붙어 활성화할 때마다 특수 능력이 터집니다. 회피 카운터가 쌓일수록 주 음모가 빨라지니 밀라노로 추진기를 쏘세요.',
    ronan: '파워 스톤을 가진 쪽이 강해집니다. 공격으로 3 이상 피해를 주면 스톤을 빼앗습니다. 로난이 스톤을 들고 있으면 2단계 주 음모의 위협을 제거할 수 없습니다.',
    the_once_and_future_kang: '캉 I을 쓰러뜨리면 시간의 지배자가 무작위 3단계(크로노폴리스·피할 수 없는 운명·라마-투트의 왕국·현재와 미래의 전쟁)로 보내고, 거기서 다른 캉을 상대합니다. 그 캉을 쓰러뜨리거나 3단계를 완료하면 4단계에서 최종 캉과 싸웁니다. 의무 카드가 플레이 영역에 계속 남습니다.',
    the_hood: '모듈 세트를 처음에 모두 따로 두고 단계마다 무작위로 섞어 넣습니다. 후드의 「비열한 수」는 조우 덱 위 카드를 버리고, 후드 세트가 아닌 카드를 뒷면 조우 카드로 줍니다.',
    sandman: '도시 거리의 모래 카운터가 쌓일수록 조우 덱이 빠르게 깎입니다. 샌드맨의 공격은 간접 피해이고, 정체성이 맞으면 「솟구치는 모래」가 터집니다. 캐릭터를 소진해 모래를 치울 수 있습니다.',
    venom: '베놈을 공격해 피해를 주면 정체성에 뒷면 강화 카드가 쌓이고, 베놈이 활성화할 때 모두 가져갑니다. 종탑에 종 카운터를 모아 울리면 베놈이 약해집니다.',
    mysterio: '환각 카드가 내 덱과 버림 더미로 섞여 들어옵니다. 덱에서 조우 카드를 뽑거나 버리면 뒷면 조우 카드로 받고 1장을 더 뽑습니다.',
    sinister_six: '여섯 빌런이 따로 대기하다 매복으로 나타납니다. 활성 빌런만 활성화하고, 공격해 피해를 주면 다음 빌런에게 순서가 넘어갑니다. 빌런을 쓰러뜨려도 이기지 못합니다. 「마지막 빛」 부가 음모를 두 번 비워 탈출해야 이깁니다.',
    venom_goblin: '주 음모 세 장(로어·미드타운·어퍼 맨해튼)이 동시에 진행됩니다. 조우 카드는 글라이더가 있는 음모에만 영향을 줍니다. 어느 하나가 완료되면 공생체 환경으로 뒤집히고, 공생체 환경이 둘이 되면 패배합니다.',
  };
  const MDESC = {
    bomb_scare: '위기 부가 음모가 주 음모의 위협 제거를 막습니다. 하이드라 폭탄병이 위협을 더합니다.',
    masters_of_evil: '마스터즈 오브 이블 하수인 넷이 차례로 나와 손패를 버리게 하고 동료를 묶습니다.',
    under_attack: '빌런에게 갑옷과 무기를 붙여 보복과 강인함을 줍니다. 아군 전체에 피해를 흩뿌립니다.',
    legions_of_hydra: '마담 하이드라와 경호 병사들. 하이드라 군단 음모가 있는 동안 마담 하이드라는 피해를 입지 않습니다.',
    the_doomsday_chair: 'M.O.D.O.K.와, 하수인이 쓰러질 때 한 번 살려 주는 생체기계 업그레이드.',
    goblin_gimmicks: '고블린 글라이더·호박 폭탄 같은 장비와, 빌런에게 강화 카드를 더 주는 협박, 빌런을 회복시키는 재생 치유.',
    a_mess_of_things: '스콜피온이 공격한 캐릭터를 기절시키고, 기절한 캐릭터가 많을수록 엉망진창 음모에 위협이 쌓입니다.',
    power_drain: '일렉트로와 전기 배반 카드들. 조우 덱을 버리며 나온 강화 아이콘만큼 간접 피해를 주거나 빌런을 회복시킵니다.',
    running_interference: '툼스톤이 손패의 자원을 버리게 하고, 꽁꽁 묶임은 변신과 준비를 막습니다. 언론 보도는 공개 효과를 두 번 해결하게 합니다.',
    hydra_assault: '하이드라 화염병과 제트 기병. 방어하지 않은 공격에 지원 카드를 잃습니다.',
    weapon_master: '빌런에게 관통·원거리 무기를 붙이고, 무기가 있으면 쇄도합니다.',
    hydra_patrol: '선동 하수인과 위기 부가 음모. 순찰대를 격파하면 하이드라 하수인이 몰려옵니다.',
    band_of_badoon: '바둔 암살자·전쟁군주 등 강화 카드로 나오면 아이콘이 늘어나는 하수인들.',
    menagerie_medley: '사이오닉 유령, 경호·순찰 서번트 봇, 간접 피해로 공격하는 우주상어.',
    space_pirates: '공격해 피해를 주면 손이나 덱의 카드를 게임에서 제거하는 해적들. 경보가 울리면 모든 적 공격 +1.',
    kree_militants: '순찰·경호 크리 병사와 공격 피해를 줄이는 크리 전투 갑옷.',
    badoon_headhunter: '승리 2의 바둔 현상금 사냥꾼과 쇄도 카드들.',
    temporal: '고대 전사·치타우리 병사·티라노사우루스와, 격파해도 조우 덱으로 돌아가는 시간 포털.',
    anachronauts: '아나크로노츠 간부 다섯. 강화 카드로 나오면 강화 카드를 더 줍니다.',
    master_of_time: '의무 카드가 쌓일수록 강해지는 캉(시간의 지배자)과, 캉을 공격할 수 없게 하는 캉에 대한 두려움.',
    beasty_boys: '기절·혼란 상태인 아군이 피해를 더 받습니다. 그리핀은 맞은 캐릭터를 기절시키고, 맨드릴은 혼란을 퍼뜨립니다.',
    brothers_grimm: '그림 형제가 활성화할 때마다 부착물을 찾아 꺼내고, 그 부착물들은 적이 활성화한 뒤 터지며 뒷면 조우 카드를 줍니다.',
    crossfires_crew: '크로스파이어는 남은 체력이 가장 적은 캐릭터를 노리고, 미스터 피어가 교전 중이면 카드 효과로 준비할 때 [정신] 1이 더 듭니다.',
    mister_hyde: '캘빈 자보가 쓰러지면 미스터 하이드가 나옵니다. 자가 실험이 있는 동안 [브루트] 적이 받을 피해는 그 음모의 위협 제거로 바뀝니다.',
    ransacked_armory: '남은 체력이 가장 많은 하수인에게 무기·장비가 붙습니다. 붙일 하수인이 없으면 하수인을 불러오거나 쇄도합니다.',
    sinister_syndicate: '[범죄자] 하수인 다섯. 비틀·부메랑·쇼커·스피드 데몬·화이트 래빗이 각자 다른 방식으로 괴롭힙니다.',
    state_of_emergency: '가속 부가 음모 넷과, 부가 음모의 공개 시 능력을 다시 터뜨리는 도시 전역의 위기.',
    streets_of_mayhem: '장소 환경 넷. 하나만 남으며, 모든 캐릭터의 공격·보복·견고 등을 바꿉니다.',
    wrecking_crew: '악랄함(활성화마다 강화 카드) 하수인 넷과 [엘리트] 보복을 주는 최고의 인재.',
    city_in_chaos: '장소·퍼소나 지원의 문구를 지우는 부가 음모와 압도·관통의 라이노.',
    down_to_earth: '일상 모습에서 다루는 조우 카드들. 이벤트 비용을 올리는 친구와 가족, 저지할 수 없는 봉사 활동.',
    goblin_gear: '빌런에게 폭탄과 고급 글라이더(한 번 더 활성화)를 붙입니다.',
    guerrilla_tactics: '적마다 가속·위험 아이콘을 늘리고, 적 전원에게 공격·음모 +1을 줍니다.',
    osborn_tech: '쇄도하는 빌런용 장비 여섯 종. 영웅 행동으로 떼어낼 수 있습니다.',
    personal_nightmare: '정체성 전용 카드를 노리는 환각. 히어로 문구를 막고, 손에 든 카드 수만큼 위협이 늘어납니다.',
    sinister_assault: '악랄함 엘리트 하수인 여섯(닥터 옥토퍼스·일렉트로·홉고블린·크레이븐·스콜피온·벌처).',
    symbiotic_strength: '빌런에게 뒷면 강화 카드를 쌓고, 공격하려 하면 거미줄에 묶어 기절시킵니다.',
    whispers_of_paranoia: '동료를 하수인으로 바꾸고, 네메시스 하수인과 부가 음모를 불러옵니다.',
  };
  const KW = {
    '글라이더': '글라이더 카운터가 놓인 주 음모입니다. 조우 카드가 "주 음모"에 주는 효과(가속 토큰 포함)는 이 음모에만 적용됩니다. 플레이어 카드는 아무 주 음모에나 쓸 수 있습니다.',
    '예상': '지금 상태 그대로 턴을 끝내면 빌런 단계에서 일어날 일입니다. 강화 카드와 새로 공개될 조우 카드는 미리 알 수 없어서 빠져 있습니다. 히어로 형태면 적들이 공격하고, 일상 형태면 음모를 꾸밉니다.',
    '경호': '경호 하수인이 플레이 영역에 있으면 빌런을 공격할 수 없습니다. 먼저 경호 하수인을 쓰러뜨려야 합니다.',
    '속공': '이 하수인이 당신과 교전하는 순간 당신이 히어로 형태라면 곧바로 공격합니다.',
    '보복': '이 캐릭터를 공격하고 쓰러뜨리지 못하면, 공격한 캐릭터가 적힌 수만큼 피해를 받습니다.',
    '위기': '이 부가 음모가 있는 동안 주 음모에서 위협을 제거할 수 없습니다.',
    '가속': '빌런 단계마다 주 음모에 위협이 1씩 더 쌓입니다.',
    '위험': '빌런 단계에 받는 조우 카드가 1장 늘어납니다.',
    '콜렉션': '콜렉터가 수집한 카드입니다. 콜렉션이 5장이 되면 패배합니다. 주 음모의 히어로 행동(라운드당 1번)으로 1장씩 꺼낼 수 있습니다.',
    '견고': '견고한 캐릭터는 같은 종류의 상태 카드가 2장 있어야 기절하거나 혼란에 빠집니다.',
    '의무': '이 시나리오의 의무 카드는 해결한 뒤에도 내 플레이 영역에 남아 효과를 냅니다. 일상 모습일 때 카드에 적힌 비용을 치르는 행동으로 버릴 수 있습니다.',
    '강인': '다음에 받을 피해를 한 번 통째로 막고 사라집니다.',
    '기절': '다음 공격(적이라면 다음 공격 활성화) 대신 기절만 풀립니다.',
    '혼란': '다음 저지(적이라면 다음 음모 활성화) 대신 혼란만 풀립니다.',
    '압도': '하수인이나 동료를 쓰러뜨리고 남은 피해가 빌런이나 히어로에게 넘어갑니다.',
    '쇄도': '이 카드를 처리한 뒤 조우 카드를 1장 더 공개합니다.',
    '강화': '빌런이 공격하거나 음모를 꾸밀 때 조우 덱에서 뒤집는 카드입니다. 카드 오른쪽 아래 아이콘 수만큼 수치가 늘고, ★ 표시가 있으면 추가 효과도 있습니다.',
    '환경': '플레이 영역에 계속 남아 규칙을 바꾸는 조우 카드입니다.',
    '임무 구역': '에이지 오브 아포칼립스 캠페인의 임무 구역입니다. 여기 있는 동료는 문구가 없고, 임무팀의 행동으로 임무 시도를 할 때만 쓰입니다. 감독관과 임무에 보낸 하수인도 여기에 있습니다.',
    '챌린지': '챌린지 규칙 카드입니다. 게임 내내 플레이 영역에 남아 있고 어떤 효과로도 버릴 수 없습니다. 승리 조건을 바꾸는 챌린지는 조건을 채우지 못하고 이기면 패배로 처리합니다(원본과 같음).',
    '드론': '내 덱 맨 위 카드를 뒷면으로 놓은 하수인입니다. 기본 공격 1, 음모 1, 체력 1이고 쓰러지면 내 버림 더미로 갑니다.',
    '후속 피해': '동료가 공격하거나 저지하면 카드에 적힌 만큼 자신도 피해를 받습니다.',
    '주 음모 단계': '주 음모 위협이 목표에 닿으면 다음 단계로 넘어갑니다. 마지막 단계에서 닿으면 패배합니다.',
    '수치': '▲·▼ 표시는 카드에 인쇄된 값에서 부착 카드나 효과로 바뀐 현재 값입니다.'
  };
  const kwChip = (label, kw, cls) => `<span class="chip kw${cls ? ' ' + cls : ''}" data-act="kw" data-id="${esc(kw)}" role="button">${label}</span>`;
  try { UI.auto = localStorage.getItem('mc-auto') !== '0'; } catch (e) { UI.auto = true; }
  UI.hist = [];
  const RKEY = 'mc-records-v1';
  function loadRec() { try { return JSON.parse(localStorage.getItem(RKEY) || '{}'); } catch (e) { return {}; } }
  function addRec(g) {
    const r = loadRec(), sc = g.s.scen || {}, k = sc.key + (sc.expert ? '+X' : '');
    r[k] = r[k] || { win: 0, lose: 0 }; r[k][g.s.over] = (r[k][g.s.over] || 0) + 1;
    r.hist = (r.hist || []).concat({ t: Date.now(), k, mod: sc.modular, deck: g.s.deckName, res: g.s.over, round: g.s.round }).slice(-50);
    try { localStorage.setItem(RKEY, JSON.stringify(r)); } catch (e) { /* ignore */ }
  }
  function recText(k) { const r = loadRec()[k]; return r && (r.win || r.lose) ? `${r.win}승 ${r.lose}패` : ''; }
  const modNames = m => MC.modsOf(m).map(k => MC.modulars[k].name).join('·');
  const scenLabel = (key, expert, mod) => `${UI.std2 === 3 && MC.sets.standard_iii ? (expert ? '표준 III+' : '표준 III') : UI.std2 && MC.sets.standard_ii ? (expert ? '표준 II+' : '표준 II') : (expert ? '' : '표준')}${expert ? (UI.exp2 && MC.sets.expert_ii ? '숙련 II' : '숙련') : ''} · ${(MC.scenarios[key] || {}).asideMods ? `따로 둔 모듈 ${MC.modsOf(mod).length}개` : (modNames(mod) || '모듈 없음')}`;

  const RES = { R: '물', B: '정', Y: '에', G: '와' };
  const CNTL = { attempt: '시도', training: '훈련', command: '지휘', progress: '진행', research: '연구', shift: '변환', web: '웹', snoop: '감시', damage: '피해', energy: '에너지', arrow: '화살', attack: '공격', medical: '의료', infamy: '악명', madness: '광기', time: '시간', mental: '정신', ammo: '탄약', delay: '지연', test: '실험', threat: '위협', glory: '영광', mystic: '신비', reflection: '반사', physical: '물리',
    barrage: '포격', evasion: '회피', growth: '성장', charge: '충전', pym: '핌', poison: '독', fury: '분노', vengeance: '복수', chi: '기', soul: '영혼', invocation: '발동', size: '크기', acceleration: '가속', power: '힘', psionic: '사이오닉', leadership: '리더십', operative: '요원', warrior: '전사', freeze: '빙결', judo: '유도', magnet: '자석', bomb: '폭탄', steel: '강철', ratings: '시청률', teleport: '순간이동', sword: '검', stake: '말뚝', clue: '단서', charge: '충전', pursuit: '추격', psi: '사이', power: '힘', charm: '매혹', shatter: '파쇄', synergy: '시너지', doubt: '의심', emergency: '긴급', growth: '성장', recon: '정찰', alert: '경계', bird: '새', target: '표적', test2: '시험', lock: '잠금', secret: '비밀', leap: '도약', parley: '협상', bystander: '시민', mission: '임무', deploy: '배치', missile: '미사일', operation: '작전', supply: '보급', staff: '인력', ap: '만능', accelTok: '가속', torch: '횃불', skill: '기술', rebirth: '부활', labor: '과업', fuel: '연료', stronghold: '거점' };
  Object.assign(CNTL, { boR: '정전 칸(물리)', boB: '정전 칸(정신)', boY: '정전 칸(에너지)' }); for (const r of [1, 2, 3]) for (const c of [1, 2, 3]) CNTL['t' + r + c] = `틱택토 ${r}-${c}`; // Deadpool's printed boxes
  const cntChips = c => Object.entries(c.cnt || {}).filter(([, v]) => v > 0).map(([k, v]) => `<span class="chip">${CNTL[k] || k} ${v}</span>`).join('');
  const TYPE_KO = { environment: '환경', hero: '히어로', alter: '일상', ally: '동료', event: '이벤트', support: '지원', upgrade: '업그레이드', pside: '플레이어 부가 음모', resource: '자원', villain: '빌런', main: '주 음모', side: '부가 음모', minion: '하수인', treachery: '배반', attachment: '부착', obligation: '의무' };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const J = s => MC.josa(s);
  // cards printed sideways: schemes, plus the odd hero side whose scan is landscape (Archangel)
  const LAND_SCANS = new Set(['42001c']);
  const isLand = id => ['main', 'side'].includes((MC.cards[id] || {}).type) || LAND_SCANS.has(id);
  // Cards whose scan hasn't been converted yet are drawn as a plain text card (SVG) instead of a broken image.
  const MISSING = new Set(), TEXTURI = new Map();
  // villain thumbnails of packs whose card data isn't loaded yet
  const villainHint = id => { for (const X of Object.values(MC.scenarios)) if ((X.villains || []).concat(X.villainsExpert || []).includes(id)) return { name: X.name.split(':')[0], type: 'villain', enc: true }; return { name: '', type: '' }; };
  const svgWrap = (t, n) => { const out = []; let line = ''; for (const ch of t) { line += ch; if (line.length >= n && ch === ' ') { out.push(line.trim()); line = ''; } else if (line.length >= n + 3) { out.push(line); line = ''; } } if (line.trim()) out.push(line.trim()); return out.slice(0, 4); };
  function textCard(id) {
    const d = MC.cards[id] || villainHint(id), land = isLand(id);
    const W = land ? 435 : 300, H = land ? 300 : 435; // same 710:1030 shape as the scans
    const enc = d.enc, bg = d.type === 'villain' ? '#5b1620' : enc ? '#2a2333' : '#1d2b45';
    const st = [d.cost != null && `비용 ${d.cost}`, d.hp != null && `체력 ${d.hp}${d.hpStar ? '★' : ''}`, d.atk != null && `공 ${d.atk}`, d.sch != null && `음 ${d.sch}`, d.thw != null && `저 ${d.thw}`, d.target != null && `목표 ${d.target}${d.targetStar ? '★' : ''}`, d.start != null && `시작 ${d.start}${d.startStar ? '★' : ''}`].filter(Boolean);
    const stl = st.length > 2 && !land ? [st.slice(0, 2).join(' · '), st.slice(2).join(' · ')] : [st.join(' · ')];
    const lines = svgWrap(d.name, land ? 11 : 7);
    const x = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><rect x="4" y="4" width="${W - 8}" height="${H - 8}" rx="18" fill="${bg}" stroke="#8b93b8" stroke-width="4"/>`
      + `<text x="${W / 2}" y="${H * 0.18}" font-family="sans-serif" font-size="26" fill="#b9c0dc" text-anchor="middle">${x(TYPE_KO[d.type] || '')}</text>`
      + lines.map((l, i) => `<text x="${W / 2}" y="${H * 0.36 + i * 46}" font-family="sans-serif" font-weight="700" font-size="40" fill="#fff" text-anchor="middle">${x(l)}</text>`).join('')
      + stl.map((l, i) => `<text x="${W / 2}" y="${H - 30 - (stl.length - 1 - i) * 32}" font-family="sans-serif" font-size="26" fill="#e8d9a0" text-anchor="middle">${x(l)}</text>`).join('')
      + `<text x="${W / 2}" y="${H - 40 - stl.length * 32}" font-family="sans-serif" font-size="18" fill="#7f88aa" text-anchor="middle">이미지 준비 중</text></svg>`;
    const uri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    TEXTURI.set(uri, id);
    return uri;
  }
  // Card scans come in bundles of base64 AVIF (img/<pack>.t.js thumbnails per pack, full size in img/f/ chunks below),
  // because one artifact can hold only a limited number of files. Each image becomes a blob URL on first use.
  const IMG = { t: {}, f: {} }, IMGURL = { t: {}, f: {} }, IMGLOAD = {};
  MC.registerImages = (key, size, map) => { Object.assign(IMG[size], map); };
  let imgRenderT = 0;
  // Full-size scans (600px, re-encoded from the original JPGs) come in small chunks, img/f/<pack>-<n>.js of about
  // 24 cards each, listed in img/f/index.js, so opening one card fetches one chunk instead of a whole pack.
  const FCHUNK = {}; let fIndex = null;
  MC.registerFullIndex = map => { for (const ch in map) for (const id of map[ch]) FCHUNK[id] = ch; };
  function fullBundle(id) {
    if (!fIndex) fIndex = Promise.resolve(MC.loadScript('img/f/index.js')).then(() => 'done', () => 'fail');
    return fIndex.then(() => FCHUNK[id] && imgBundle('f/' + FCHUNK[id]));
  }
  function imgBundle(key, size) {
    const k = size ? key + '.' + size : key;
    if (!IMGLOAD[k]) IMGLOAD[k] = MC.loadScript(`img/${k}.js`).then(() => {
      IMGLOAD[k] = 'done';
      // swap text cards for the real scans in place (a full re-render could swallow a tap in progress)
      clearTimeout(imgRenderT); imgRenderT = setTimeout(() => {
        for (const im of document.querySelectorAll('img')) {
          const src = im.getAttribute('src'), id = TEXTURI.get(src); if (!id) continue;
          const full = im.classList.contains('full') || !!im.closest('.reveal');
          const u = urlFor(id, full ? 'f' : 't') || urlFor(id, 't'); if (u && u !== src) im.src = u;
        }
      }, 30);
    }, () => { IMGLOAD[k] = 'fail'; }); // missing bundle: text cards, never block the game
    return IMGLOAD[k];
  }
  setTimeout(() => imgBundle('covers', 't'), 0); // hero and villain pictures for the pickers
  const imgReady = (key, size) => ['done', 'fail'].includes(IMGLOAD[key + '.' + size]);
  function urlFor(id, size) {
    if (IMGURL[size][id]) return IMGURL[size][id];
    const b = IMG[size][id]; if (!b) return null;
    const bin = atob(b), u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    delete IMG[size][id];
    const url = URL.createObjectURL(new Blob([u8], { type: 'image/avif' }));
    TEXTURI.set(url, id); // lets a thumbnail standing in for a full-size scan be upgraded later
    return (IMGURL[size][id] = url);
  }
  // reprints share the original printing's scan; o.noLoad: show the text card rather than fetching a bundle
  function img(id, size, o) {
    size = size || 't';
    const l = (MC.catalog && MC.catalog.links || {})[id]; if (l && MC.cards[l]) id = l;
    if (id === 'DRONE') return `img/${size}/DRONE.avif`;
    if (/^ch24/.test(id)) return textCard(id); // challenge cards have no printed scan (the original draws them as text too)
    const u = urlFor(id, size); if (u) return u;
    const pk = MC.packOf(id);
    if (size === 'f') { fullBundle(id); return urlFor(id, 't') || (pk && !(o && o.noLoad) && imgBundle(pk, 't'), textCard(id)); }
    if (pk && !(o && o.noLoad)) imgBundle(pk, 't');
    return textCard(id);
  }
  document.addEventListener('error', ev => {
    const im = ev.target; if (!im || im.tagName !== 'IMG') return;
    const m = /img\/[tf]\/([^/]+)\.avif$/.exec(im.getAttribute('src') || ''); if (!m || (!MC.cards[m[1]] && !villainHint(m[1]).name)) return;
    MISSING.add(m[1]); im.src = textCard(m[1]);
  }, true);
  // resource icons: the original project's icon font (public/fonts/ChampionsIcons.ttf, from MarvelCDB): P fist, M mental, E energy, W wild
  const RES_GLYPH = { R: 'P', B: 'M', Y: 'E', G: 'W' };
  const resHTML = r => r ? `<span class="res">${r.split('').map(l => `<span class="ri ${l}" role="img" aria-label="${MC.RES_KO[l] || l}"><i class="mi" aria-hidden="true">${RES_GLYPH[l] || ''}</i></span>`).join('')}</span>` : '';
  const gl = (ch, label, cls) => `<i class="mi${cls ? ' ' + cls : ''}" role="img" aria-label="${label}" title="${label}">${ch}</i>`;
  function cardText(t) {
    if (!t) return '';
    let s = esc(t)
      .replace(/&lt;(\/?)(b|i)&gt;/g, '<$1$2>').replace(/&lt;hr \/&gt;/g, '<hr>')
      .replace(/\[mental\]/g, resHTML('B')).replace(/\[physical\]/g, resHTML('R')).replace(/\[energy\]/g, resHTML('Y')).replace(/\[wild\]/g, resHTML('G'))
      .replace(/\[per_hero\]/g, gl('G', '플레이어당')).replace(/\[per_group\]/g, gl('G', '그룹당')).replace(/\[star\]/g, gl('S', '★', 'star')).replace(/\[boost\]/g, gl('B', '강화', 'boost'))
      .replace(/\[crisis\]/g, gl('C', '위기')).replace(/\[acceleration\]/g, gl('A', '가속')).replace(/\[hazard\]/g, gl('H', '위험')).replace(/\[amplify\]/g, gl('F', '증폭')).replace(/\[unique\]/g, gl('U', '고유')).replace(/\[cost\]/g, gl('D', '비용')).replace(/\n/g, '<br>');
    return s;
  }

  // ---------------------------------------------------------------- engine I/O
  const io = {
    ask(q, g) {
      return new Promise(res => {
        UI.pending = { q, res };
        UI.sheet = null;
        if (g && g.players > 1 && q.owner != null && !UI.lockView) UI.viewP = q.owner;
        if (q.type === 'pay') UI.sel = new Set(q.suggestion || []);
        else if (q.type === 'select' || q.type === 'cleanup') UI.sel = new Set();
        else UI.sel = null;
        render();
      });
    },
    show(ev) { return new Promise(res => { UI.overlay = { ev, res, t0: Date.now(), ms: autoMs(ev) }; armAuto(); render(); }); },
    onLog() { schedule(); },
    save(g) {
      const snap = g.snapshot();
      UI.lastSnap = snap;
      try { localStorage.setItem(KEY, JSON.stringify(snap)); } catch (e) { /* storage unavailable */ }
      // undo history: every main prompt of the current player phase
      const h = UI.hist, cap = g.players > 1 ? 30 : 60;
      if (h.length && h[h.length - 1].round !== snap.round) h.length = 0;
      h.push(snap); if (h.length > cap) h.shift();
    },
    gameOver(g) {
      try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
      UI.lastSnap = null; UI.hist = [];
      addRec(g);
      UI.csaved = false;
      return new Promise(res => { UI.overlay = { ev: { type: 'over' }, res }; render(); });
    }
  };
  // countdown bar drawn from the overlay's own clock so a re-render or a hold never makes it jump
  const elapsedOf = o => (o.elapsed || 0) + (o.held ? 0 : Date.now() - o.t0);
  const barHTML = o => `<span class="bar" style="animation-duration:${o.ms}ms;animation-delay:-${Math.min(o.ms, elapsedOf(o))}ms"></span>`;
  function autoMs(ev) { return !UI.auto ? 0 : ev.type === 'boost' ? 1700 : ev.type === 'reveal' ? 2600 : 0; }
  function armAuto() {
    clearTimeout(UI.ovT);
    const o = UI.overlay;
    if (o && o.ms && !o.held) UI.ovT = setTimeout(() => { if (UI.overlay === o && !o.held) contOverlay(); }, Math.max(0, o.ms - elapsedOf(o)));
  }
  // hold-to-pause: only touch the DOM classes here (no re-render) so the finger's target element survives until release
  function holdOverlay() {
    const o = UI.overlay; if (!o || !o.ms || o.held) return;
    o.elapsed = elapsedOf(o); o.held = true; clearTimeout(UI.ovT);
    const el = document.querySelector('.reveal'); if (el) el.classList.add('held');
  }
  function releaseOverlay() {
    const o = UI.overlay; if (!o || !o.held) return;
    if (o.ms - o.elapsed < 700) o.ms = o.elapsed + 700; // leave a moment to react after letting go
    o.held = false; o.t0 = Date.now();
    const el = document.querySelector('.reveal');
    if (el) { el.classList.remove('held'); const bar = el.querySelector('.bar'); if (bar) bar.outerHTML = barHTML(o); }
    armAuto();
  }
  function contOverlay() {
    const o = UI.overlay; if (!o || o.ev.type === 'over') return;
    clearTimeout(UI.ovT); UI.overlay = null; render(); o.res();
  }
  function canUndo() {
    const q = UI.pending && UI.pending.q;
    if (UI.online.active && UI.online.role !== 'host') return false;
    if (UI.pending && UI.pending.remote) return false;
    return !!(UI.g && q && q.type === 'main' && !UI.overlay && UI.hist.length >= 2);
  }
  function undo() {
    if (!canUndo()) return;
    UI.hist.pop(); const prev = UI.hist.pop();
    if (UI.online.active && UI.online.role === 'host') startOnlineHostGame(prev, true);
    else startGame(prev, true);
    toast('직전 행동을 되돌렸습니다');
  }
  let raf = 0;
  function schedule() { if (!raf) raf = requestAnimationFrame(() => { raf = 0; render(); }); }
  function resolve(val) {
    const p = UI.pending; if (!p || p.remote) return;
    UI.pending = null; UI.sheet = null; UI.sel = null;
    render();
    p.res(val);
  }

  // ---------------------------------------------------------------- pack loading
  // Card data and scripts come in per pack. A screen asks for what it shows; until it's there we draw a spinner.
  const deckIds = d => [].concat(String((d.hero || [])[0] || '').split(','), d.hero_deck || [], d.player_deck || []).filter(Boolean);
  UI.loads = {};
  function need(packs, scripts) {
    if (MC.isLoaded(packs, scripts)) return true;
    if (UI.loadErr) return false;
    const key = packs.join(',') + (scripts ? '+s' : '');
    if (!UI.loads[key]) UI.loads[key] = MC.loadPacks(packs, scripts).then(() => { delete UI.loads[key]; render(); }, e => { delete UI.loads[key]; UI.loadErr = e; render(); });
    return false;
  }
  function renderLoading() {
    $app.innerHTML = UI.loadErr
      ? `<div class="loading"><div>카드 파일을 불러오지 못했습니다.<br><small>${esc(UI.loadErr.message)}</small></div><button class="btn pri" data-act="retryload">다시 시도</button><button class="btn" data-act="home">처음으로</button></div>`
      : '<div class="loading"><div class="spin"></div><div>카드 불러오는 중…</div></div>';
  }

  function startGame(state, keepHist) {
    clearTimeout(UI.ovT);
    UI.overlay = null; UI.sheet = null; UI.pending = null; UI.error = null;
    if (!keepHist) UI.hist = [];
    let opts = null;
    if (!state) {
      if (UI.mode === '2p') {
        const d0 = selectedDeck(0), d1 = selectedDeck(1);
        const hk0 = Deck.heroKeyOf(d0) || UI.hero, hk1 = Deck.heroKeyOf(d1) || 'captain_marvel';
        const first = UI.firstPick === 'rnd' ? (Math.random() < 0.5 ? 0 : 1) : (UI.firstPick === 1 ? 1 : 0);
        opts = { players: [{ hero: hk0, deck: d0, cameo: cameoFor(d0) }, { hero: hk1, deck: d1, cameo: cameoFor(d1) }], first, scenario: UI.scen, underling: UI.underling, expert: UI.expert, campaign: activeCampaign() ? { id: activeCampaign(), log: loadCLogs()[activeCampaign()] || {} } : null, modular: UI.modular, std2: UI.std2, exp2: UI.exp2, schemes: schemesFor(UI.scen) };
      } else {
        const deck = selectedDeck(0);
        opts = { hero: Deck.heroKeyOf(deck) || UI.hero, scenario: UI.scen, underling: UI.underling, expert: UI.expert, campaign: activeCampaign() ? { id: activeCampaign(), log: loadCLogs()[activeCampaign()] || {} } : null, modular: UI.modular, std2: UI.std2, exp2: UI.exp2, schemes: schemesFor(UI.scen), cameo: cameoFor(deck), deck };
      }
    }
    const packs = MC.packsFor(state ? MC.idsForState(state) : MC.idsForGame(opts));
    if (!MC.isLoaded(packs, true) || !packs.every(pk => imgReady(pk, 't'))) {
      UI.g = null; UI.screen = 'loading'; render();
      Promise.all([MC.loadPacks(packs, true)].concat(packs.map(pk => imgBundle(pk, 't')))).then(() => startGame(state, keepHist), e => { UI.loadErr = e; render(); });
      return;
    }
    if (state) UI.g = MC.Game.restore(io, state);
    else UI.g = MC.Game.create(io, opts);
    UI.viewP = UI.g.s.ctx || 0;
    UI.screen = 'game';
    render();
    UI.g.run().then(() => render()).catch(err => { UI.error = err; console.error(err); render(); });
  }
  function loadSave() { try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } }

  // ---------------------------------------------------------------- online 2p helpers
  const guestDummyIo = { ask: () => new Promise(() => {}), show: () => Promise.resolve() };
  function buildHostLobbyData() {
    const d = selectedDeck(0);
    return {
      scen: UI.scen, underling: UI.underling, expert: UI.expert, modular: UI.modular,
      std2: UI.std2, exp2: UI.exp2, schemes: schemesFor(UI.scen),
      campaign: activeCampaign() ? { id: activeCampaign(), log: loadCLogs()[activeCampaign()] || {} } : null,
      firstPick: UI.firstPick,
      hostDeck: d,
      hostDeckSummary: { name: d.name, heroKey: Deck.heroKeyOf(d) || UI.hero, aspects: Deck.aspects(d) },
      hostCameo: cameoFor(d)
    };
  }
  function buildGuestLobbyPatch(extra) {
    const d = selectedDeck(0);
    return Object.assign({
      deck: d,
      deckSummary: { name: d.name, heroKey: Deck.heroKeyOf(d) || UI.hero, aspects: Deck.aspects(d) },
      cameo: cameoFor(d)
    }, extra || {});
  }
  function syncLobbySelection(resetGuestReady) {
    if (!Online || !Online.code) return;
    if (Online.role === 'host') Online.updateHostLobby(buildHostLobbyData());
    else if (Online.role === 'guest') Online.updateGuestLobby(buildGuestLobbyPatch(resetGuestReady ? { ready: false } : {}));
  }
  function copyText(text, okMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => toast(okMsg || '클립보드에 복사했습니다'), () => toast(`코드: ${text}`));
    } else toast(`코드: ${text}`);
  }
  function startOnlineHostGame(state, keepHist) {
    clearTimeout(UI.ovT);
    UI.overlay = null; UI.sheet = null; UI.pending = null; UI.error = null;
    if (!keepHist) UI.hist = [];
    const hd = Online.hostDoc, gd = Online.guestDoc;
    const lobby = (hd && hd.lobby) || buildHostLobbyData();
    let opts = null;
    if (!state) {
      const d0 = lobby.hostDeck || selectedDeck(0);
      const d1 = (gd && gd.deck) ? gd.deck : selectedDeck(1);
      const hk0 = Deck.heroKeyOf(d0) || UI.hero, hk1 = Deck.heroKeyOf(d1) || 'captain_marvel';
      const first = lobby.firstPick === 'rnd' ? (Math.random() < 0.5 ? 0 : 1) : (lobby.firstPick === 1 ? 1 : 0);
      opts = {
        players: [
          { hero: hk0, deck: d0, cameo: lobby.hostCameo || cameoFor(d0) },
          { hero: hk1, deck: d1, cameo: (gd && gd.cameo) || cameoFor(d1) }
        ],
        first, scenario: lobby.scen, underling: lobby.underling, expert: lobby.expert,
        campaign: lobby.campaign, modular: lobby.modular, std2: lobby.std2, exp2: lobby.exp2, schemes: lobby.schemes
      };
    }
    const packs = MC.packsFor(state ? MC.idsForState(state) : MC.idsForGame(opts));
    if (!MC.isLoaded(packs, true) || !packs.every(pk => imgReady(pk, 't'))) {
      UI.g = null; UI.screen = 'loading'; render();
      Promise.all([MC.loadPacks(packs, true)].concat(packs.map(pk => imgBundle(pk, 't')))).then(() => startOnlineHostGame(state, keepHist), e => { UI.loadErr = e; render(); });
      return;
    }
    UI.online.active = true;
    UI.online.role = 'host';
    UI.online.code = Online.code;
    UI.online.myIdx = 0;
    const myGen = ++UI.online.runGen;
    const gameId = 'g-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
    UI.online.gameId = gameId;
    UI.online.askId = 0;
    UI.online.showId = 0;
    Online.cancelWaiter();

    const hostIo = {
      separateCleanup: true,
      ask(q, g) {
        if (!UI.online.active || UI.online.runGen !== myGen) return new Promise(() => {});
        const owner = q.owner != null ? q.owner : g.s.ctx;
        const sq = Online.sanitizeQuestion(Object.assign({}, q, { owner }));
        const askId = ++UI.online.askId;
        const snap = g.snapshot();
        UI.lastSnap = snap;
        try { localStorage.setItem(onlineCkptKey(UI.online.code), JSON.stringify(snap)); } catch (e) { /* ignore */ }
        Online.publishHostState({ status: 'playing', gameId, state: snap, pendingAsk: { id: askId, owner, q: sq }, showEv: null });
        return new Promise(res => {
          if (!UI.online.active || UI.online.runGen !== myGen) return;
          if (owner === 0) {
            UI.pending = { q: sq, res };
            UI.sheet = null;
            if (sq.type === 'pay') UI.sel = new Set(sq.suggestion || []);
            else if (sq.type === 'select' || sq.type === 'cleanup') UI.sel = new Set();
            else UI.sel = null;
            render();
          } else {
            UI.pending = { q: sq, remote: true, res };
            UI.sheet = null;
            UI.sel = null;
            render();
            Online.waitForGuestAnswer(gameId, askId, val => {
              if (!UI.online.active || UI.online.runGen !== myGen) return;
              if (UI.pending && UI.pending.res === res) {
                UI.pending = null;
                render();
                res(val);
              }
            });
          }
        });
      },
      show(ev, g) {
        if (!UI.online.active || UI.online.runGen !== myGen) return Promise.resolve();
        const showId = ++UI.online.showId;
        const sev = Online.sanitizeShow(ev);
        const snap = g ? g.snapshot() : UI.lastSnap;
        Online.publishHostState({ status: 'playing', gameId, state: snap, pendingAsk: null, showEv: { id: showId, ev: sev } });
        return new Promise(res => {
          UI.overlay = { ev, res, t0: Date.now(), ms: autoMs(ev) };
          armAuto();
          render();
        });
      },
      onLog() { schedule(); },
      save(g) {
        if (!UI.online.active || UI.online.runGen !== myGen) return;
        const snap = g.snapshot();
        UI.lastSnap = snap;
        try { localStorage.setItem(onlineCkptKey(UI.online.code), JSON.stringify(snap)); } catch (e) { /* ignore */ }
        const h = UI.hist, cap = 30;
        if (h.length && h[h.length - 1].round !== snap.round) h.length = 0;
        h.push(snap); if (h.length > cap) h.shift();
      },
      gameOver(g) {
        if (!UI.online.active || UI.online.runGen !== myGen) return Promise.resolve();
        const snap = g.snapshot();
        try { localStorage.removeItem(onlineCkptKey(UI.online.code)); } catch (e) { /* ignore */ }
        UI.lastSnap = null; UI.hist = [];
        addRec(g);
        UI.csaved = false;
        Online.publishHostState({ status: 'over', gameId, state: snap, pendingAsk: null, showEv: null });
        return new Promise(res => { UI.overlay = { ev: { type: 'over' }, res }; render(); });
      }
    };

    if (state) UI.g = MC.Game.restore(hostIo, state);
    else UI.g = MC.Game.create(hostIo, opts);
    UI.viewP = 0;
    UI.lockView = true;
    UI.splitView = false;
    UI.screen = 'game';
    render();
    UI.g.run().then(() => render()).catch(err => {
      if (UI.online.runGen !== myGen) return;
      UI.error = err; console.error(err); render();
    });
  }
  function applyGuestHostDoc(hostDoc) {
    if (!Online || Online.role !== 'guest' || !hostDoc) return;
    if (hostDoc.status === 'closed') {
      clearTimeout(UI.ovT);
      UI.online = resetOnlineState();
      UI.g = null; UI.pending = null; UI.overlay = null; UI.sheet = null; UI.error = null;
      UI.screen = 'home';
      Online.leaveRoom({ closeIfHost: false, silent: true });
      toast('방장이 게임을 종료했습니다');
      return;
    }
    if (hostDoc.status === 'lobby') {
      if (UI.screen === 'game' || UI.g) {
        clearTimeout(UI.ovT);
        UI.online = resetOnlineState();
        UI.g = null; UI.pending = null; UI.overlay = null; UI.sheet = null; UI.error = null;
        UI.screen = 'lobby';
      }
      render();
      return;
    }
    if ((hostDoc.status === 'playing' || hostDoc.status === 'over') && hostDoc.state) {
      const packs = MC.packsFor(MC.idsForState(hostDoc.state));
      if (!MC.isLoaded(packs, true) || !packs.every(pk => imgReady(pk, 't'))) {
        const lseq = ++UI.online.guestLoadingSeq;
        UI.g = null; UI.screen = 'loading'; render();
        Promise.all([MC.loadPacks(packs, true)].concat(packs.map(pk => imgBundle(pk, 't')))).then(() => {
          if (UI.online.guestLoadingSeq === lseq && Online.role === 'guest' && Online.hostDoc) applyGuestHostDoc(Online.hostDoc);
        }, e => { UI.loadErr = e; render(); });
        return;
      }
      const entering = UI.screen !== 'game';
      UI.online.active = true;
      UI.online.role = 'guest';
      UI.online.code = Online.code;
      UI.online.myIdx = 1;
      UI.online.gameId = hostDoc.gameId;
      UI.g = MC.Game.restore(guestDummyIo, hostDoc.state);
      if (entering) {
        UI.viewP = 1;
        UI.lockView = true;
        UI.splitView = false;
        UI.screen = 'game';
      }
      if (hostDoc.showEv && hostDoc.showEv.id && hostDoc.showEv.id !== UI.online.lastSeenShowId) {
        UI.online.lastSeenShowId = hostDoc.showEv.id;
        clearTimeout(UI.ovT);
        UI.overlay = { ev: hostDoc.showEv.ev, res: () => { render(); }, t0: Date.now(), ms: autoMs(hostDoc.showEv.ev) };
        armAuto();
      }
      if (hostDoc.status === 'over') {
        UI.pending = null;
        if (!UI.overlay || UI.overlay.ev.type !== 'over') {
          clearTimeout(UI.ovT);
          UI.overlay = { ev: { type: 'over' }, res: () => {} };
        }
        render();
        return;
      }
      const pa = hostDoc.pendingAsk;
      if (pa) {
        const askKey = `${hostDoc.gameId}:${pa.id}`;
        if (pa.owner === 1 && UI.online.lastAnsweredKey !== askKey) {
          if (UI.online.lastAskKey !== askKey) {
            UI.online.lastAskKey = askKey;
            UI.sheet = null;
            if (pa.q.type === 'pay') UI.sel = new Set(pa.q.suggestion || []);
            else if (pa.q.type === 'select' || pa.q.type === 'cleanup') UI.sel = new Set();
            else UI.sel = null;
          }
          UI.pending = {
            q: pa.q,
            res: val => {
              UI.online.lastAnsweredKey = askKey;
              UI.pending = { q: pa.q, remote: true, submitted: true };
              render();
              Online.sendGuestAnswer(hostDoc.gameId, pa.id, val);
            }
          };
        } else {
          UI.pending = { q: pa.q, remote: true, submitted: UI.online.lastAnsweredKey === askKey };
          if (UI.online.lastAskKey !== askKey) { UI.online.lastAskKey = askKey; UI.sel = null; }
        }
      } else {
        UI.pending = null;
      }
      render();
    }
  }

  // ---------------------------------------------------------------- pieces
  function cardEl(g, uid, o) {
    o = o || {};
    const c = g.c(uid), d = g.d(uid);
    const cls = ['card'];
    if (isLand(c.id)) cls.push('land');
    if (c.ex) cls.push('ex');
    if (o.can) cls.push('can');
    if (o.cand) cls.push('cand');
    if (o.big) cls.push('big');
    let b = '';
    if (c.dmg > 0) b += `<span class="badge dmg">${c.dmg}</span>`;
    if (d.type === 'main' || d.type === 'side') b += `<span class="badge thr">${c.threat}</span>`;
    const cnt = Object.values(c.cnt).filter(v => v > 0);
    if (cnt.length) b += `<span class="badge cnt">${cnt.join('/')}</span>`;
    const attr = o.inert ? `data-zoom="${uid}"` : `data-uid="${uid}" tabindex="0" role="button"`;
    return `<div class="${cls.join(' ')}" ${attr} aria-label="${esc(d.name)}"><img src="${img(c.id)}" alt="" decoding="async" draggable="false">${b}${o.extra || ''}</div>`;
  }
  function statusChips(g, uid) {
    const c = g.c(uid); let s = '';
    if (c.stun) s += kwChip('기절', '기절', 'st stun');
    if (c.conf) s += kwChip('혼란', '혼란', 'st conf');
    if (c.tough) s += kwChip('강인', '강인', 'st');
    if (c.stunH) s += kwChip('기절 1/2', '견고', 'st');
    if (c.confH) s += kwChip('혼란 1/2', '견고', 'st');
    return s;
  }
  const STAT_KO = { atk: '공격', sch: '음모', thw: '저지', def: '방어', rec: '회복' };
  function statChips(g, uid, keys) {
    const d = g.d(uid);
    return keys.filter(k => d[k] != null).map(k => {
      const v = g.stat(uid, k), base = d[k] || 0;
      return v === base ? `<span class="chip">${STAT_KO[k]} ${v}</span>` : kwChip(`${STAT_KO[k]} ${v}${v > base ? '▲' : '▼'}`, '수치', 'mod');
    }).join('');
  }
  // one chip with several stats, e.g. "공격 2 · 음모 1"; ▲/▼ marks values changed from the printed card
  function statsChip(g, uid, keys) {
    const d = g.d(uid); let modded = false;
    const parts = keys.filter(k => d[k] != null).map(k => {
      const v = g.stat(uid, k), b = d[k] || 0; if (v !== b) modded = true;
      return `${STAT_KO[k]} ${v}${v > b ? '▲' : v < b ? '▼' : ''}`;
    });
    if (!parts.length) return '';
    return modded ? kwChip(parts.join(' · '), '수치', 'mod') : `<span class="chip">${parts.join(' · ')}</span>`;
  }
  function statLine(g, uid) {
    const d = g.d(uid); let modded = false;
    const parts = [['atk', '공'], ['sch', '음']].filter(([k]) => d[k] != null).map(([k, l]) => {
      const v = g.stat(uid, k), b = d[k] || 0; if (v !== b) modded = true;
      return `${l}${v}${v > b ? '▲' : v < b ? '▼' : ''}`;
    });
    if (!parts.length) return '';
    return modded ? kwChip(parts.join(' '), '수치', 'mod') : `<span class="chip">${parts.join(' ')}</span>`;
  }
  function forecastHTML(g) {
    if (!g.e.main || g.s.phase !== 'player') return '';
    if (g.players > 1) {
      const f = g.forecastAll(), left = f.target - f.after, thr = f.accel + f.totalSch;
      const rows = [`<div>위협 <b>+${thr}</b></div>`];
      for (const pf of f.perPlayer) {
        rows.push(`<div class="pfore"><div class="pn"><span class="pdot p${pf.pi}"></span><b>${esc(pf.name)}</b></div><div class="pd">${pf.hero ? `공 ${pf.atk} (${pf.attacks}회)` : `음 +${pf.sch}`} · 조우 ${pf.enc}${pf.pending ? `<i>+${pf.pending}</i>` : ''}</div></div>`);
      }
      rows.push(left === Infinity ? `<div class="mu">목표 없음</div>` : left <= 0 ? `<div class="danger">목표 도달 → ${f.special ? '음모 효과' : f.last ? '패배' : '다음 단계'}</div>` : `<div class="mu">목표까지 ${left}</div>`);
      return `<div class="fore" data-act="kw" data-id="예상" role="button"><div class="fh">빌런 단계 예상</div>${rows.join('')}</div>`;
    }
    const f = g.forecast(), left = f.target - f.after, thr = f.accel + f.sch;
    const rows = [`<div>위협 <b>+${thr}</b>${!f.hero && f.boost ? '<i>+강화</i>' : ''}</div>`,
      f.hero ? `<div>피해 <b>${f.atk}</b>${f.boost ? '<i>+강화</i>' : ''} <span class="mu">(${f.attacks}회)</span></div>` : '<div class="mu">일상: 적들이 음모</div>',
      `<div>조우 <b>${f.enc}</b>장${f.pending ? ` <i>+대기 ${f.pending}</i>` : ''}</div>`,
      left === Infinity ? `<div class="mu">목표 없음</div>` : left <= 0 ? `<div class="danger">목표 도달 → ${f.special ? '음모 효과' : f.last ? '패배' : '다음 단계'}</div>` : `<div class="mu">목표까지 ${left}</div>`];
    return `<div class="fore" data-act="kw" data-id="예상" role="button"><div class="fh">빌런 단계 예상</div>${rows.join('')}</div>`;
  }
  function hpChip(g, uid, short) {
    const left = g.hpLeft(uid), max = g.maxHp(uid);
    const thr = g.c(uid).threat > 0 && ['hero', 'alter', 'ally', 'minion', 'villain'].includes(g.d(uid).type) ? `<span class="chip thr">위협 ${g.c(uid).threat}</span>` : ''; // MojoMania: threat on characters
    return `<span class="chip hp${left <= Math.ceil(max / 3) ? ' low' : ''}">${short ? '♥' : '체력 '}${left}/${max}</span>${thr}`;
  }
  function attsEl(g, uid, mark) {
    const a = g.c(uid).att; if (!a.length) return '';
    return `<div class="atts">${a.map(x => cardEl(g, x, mark(x))).join('')}</div>`;
  }

  // ---------------------------------------------------------------- render
  function render() {
    if (!UI.g) {
      if (UI.screen === 'loading') renderLoading();
      else if (UI.screen === 'lobby') renderLobby();
      else if (UI.screen === 'decks') renderDecks();
      else if (UI.screen === 'villains') renderVillains();
      else if (UI.screen === 'edit' && UI.edit) renderEditor();
      else renderStart();
      return;
    }
    renderGame();
  }
  function renderPlayerZone(g, pi, mark, active) {
    return g.withPlayerSync(pi, () => {
      const s = g.s, e = s.e, p = s.ps[pi], id = p.identity;
      if (p.eliminated) {
        return `<section class="zone mine p${pi}${active ? ' active' : ''}" data-p="${pi}"><span class="cap p${pi}">${esc(g.nm(id))} · 탈락</span><div class="info" style="padding:16px 12px">이 히어로는 쓰러져 탈락했습니다</div></section>`;
      }
      let me = `<div class="slot idslot">${cardEl(g, id, Object.assign(mark(id), { big: true }))}<div class="chips"><span class="chip form">${g.isHero() ? '히어로' : '일상'}</span>${p.laborDeck ? `<span class="chip">과업 덱 ${p.laborDeck.length} · 선물 덱 ${(p.giftDeck || []).length}</span>` : ''}${(e.victory || []).length ? `<span class="chip">승리 표시 ${e.victory.length}장</span>` : ''}${(() => { const ps = (p.pset || []).filter(u => !g.sc(u).playFromSetAside && !(p.laborDeck || []).includes(u) && !(p.giftDeck || []).includes(u)); if (!ps.length) return ''; const names = [...new Set(ps.map(u => g.nm(u)))]; return `<span class="chip">따로 둠: ${esc(names.length === 1 ? names[0] : names[0] + ' 외')} ${ps.length}장</span>`; })()}${hpChip(g, id)}${statsChip(g, id, g.isHero() ? ['thw', 'atk', 'def'] : ['rec'])}${statusChips(g, id)}${cntChips(g.c(id))}${p.toll ? '<span class="chip warnc">다음 이벤트 비용 +3</span>' : ''}${g.c(id).under.some(x => g.d(x).enc) ? `<span class="chip warnc">뒷면 강화 ${g.c(id).under.filter(x => g.d(x).enc).length}</span>` : ''}</div>${attsEl(g, id, mark)}</div>`;
      if (g.sc(id).showEncTop && g.s.phase === 'player' && g.e.deck[0]) me += `<div class="slot">${cardEl(g, g.e.deck[0], mark(g.e.deck[0]))}<div class="chips"><span class="chip">조우 덱 맨 위 (공개)</span></div></div>`; // Falcon
      if (g.sc(id).showTopCard && p.deck[0]) me += `<div class="slot">${cardEl(g, p.deck[0], mark(p.deck[0]))}<div class="chips"><span class="chip">덱 맨 위 (공개)</span></div></div>`; // Magik
      if ((p.inv || []).length || (p.invDiscard || []).length) {
        const top = (p.inv || [])[0];
        me += `<div class="slot">${top ? cardEl(g, top, mark(top)) : ''}<div class="chips"><span class="chip">인보케이션 ${(p.inv || []).length}장</span><span class="chip">버림 ${(p.invDiscard || []).length}</span></div></div>`;
      }
      for (const u of (p.obl || [])) { const un = g.c(u).under.length; me += `<div class="slot">${cardEl(g, u, mark(u))}<div class="chips">${kwChip('의무', '의무', 'st')}${g.c(u).threat ? `<span class="chip thr">위협 ${g.c(u).threat}</span>` : ''}${un ? `<span class="chip">아래 ${un}장</span>` : ''}${cntChips(g.c(u))}</div>${attsEl(g, u, mark)}</div>`; }
      for (const u of (p.pset || [])) if (g.sc(u).playFromSetAside) me += `<div class="slot">${cardEl(g, u, mark(u))}<div class="chips"><span class="chip">따로 둠</span></div></div>`; // Death-Glow
      for (const u of p.allies) me += `<div class="slot">${cardEl(g, u, mark(u))}<div class="chips">${hpChip(g, u)}${statsChip(g, u, ['atk', 'thw'])}${statusChips(g, u)}</div>${attsEl(g, u, mark)}</div>`;
      for (const u of p.upgrades.concat(p.supports)) {
        const cnt = Object.entries(g.c(u).cnt).filter(([, v]) => v > 0).map(([k, v]) => `<span class="chip">${CNTL[k] || k} ${v}</span>`).join('');
        const fd = (g.c(u).fd ? '<span class="chip">뒷면</span>' : '') + ((g.c(u).under || []).length ? `<span class="chip">아래 ${g.c(u).under.length}장</span>` : '');
        me += `<div class="slot${g.c(u).fd ? ' dim' : ''}">${cardEl(g, u, mark(u))}<div class="chips">${fd}${cnt}</div>${attsEl(g, u, mark)}</div>`;
      }
      const pCls = g.players > 1 ? ` p${pi}` : '';
      const firstTag = g.players > 1 && g.s.first === pi ? ' (선)' : '';
      return `<section class="zone mine${pCls}${active ? ' active' : ''}" data-p="${pi}"><span class="cap${pCls}">${esc(g.nm(id))}${firstTag}</span><button class="cnts" data-act="${g.players > 1 ? 'discards-p' : 'discards'}" data-id="${pi}">${g.players > 1 ? '' : '내 '}덱 <b>${p.deck.length}</b> · 버림 <b>${p.discard.length}</b></button><div class="row" id="mine-row-${pi}">${me}</div></section>`;
    });
  }
  function renderStrip(g, pi, q) {
    return g.withPlayerSync(pi, () => {
      const p = g.s.ps[pi], id = p.identity;
      const isFirst = g.s.first === pi ? '<span class="chip">선</span>' : '';
      if (p.eliminated) {
        return `<button type="button" class="pstrip p${pi} dead" data-act="focusp" data-id="${pi}"><span class="ps-nm">${esc(g.nm(id))}</span><span class="ps-meta"><span class="chip">탈락</span></span></button>`;
      }
      const ex = g.c(id).ex ? '<span class="chip">소진</span>' : '';
      const fd = p.facedown.length ? `<span class="chip warnc">조우 ${p.facedown.length}</span>` : '';
      const needAct = q && q.owner === pi ? '<span class="chip form">선택 대기</span>' : '';
      return `<button type="button" class="pstrip p${pi}" data-act="focusp" data-id="${pi}" data-peekp="${pi}"><span class="ps-nm">${esc(g.nm(id))}</span><span class="ps-meta">${isFirst}<span class="chip form">${g.isHero() ? '히어로' : '일상'}</span>${hpChip(g, id, true)}<span class="chip">손 ${p.hand.length}</span>${ex}${fd}${needAct}</span><span class="ps-hint">길게: 손패</span></button>`;
    });
  }
  function minionSlotHTML(g, u, mark) {
    const d = g.d(u), ret = g.stat(u, 'retaliate');
    return `<div class="slot">${cardEl(g, u, mark(u))}<div class="chips">${hpChip(g, u, true)}${statLine(g, u)}${cntChips(g.c(u))}${d.guard || g.c(u).att.some(a => g.sc(a).grantGuard) ? kwChip('경호', '경호', 'st') : ''}${d.quickstrike ? kwChip('속공', '속공') : ''}${ret > 0 ? kwChip('보복 ' + ret, '보복') : ''}${statusChips(g, u)}</div>${attsEl(g, u, mark)}</div>`;
  }
  function renderGame() {
    const g = UI.g, s = g.s, q = UI.pending && UI.pending.q;
    const remoteWait = !!(UI.pending && UI.pending.remote);
    const actsBy = {};
    if (q && q.type === 'main' && !remoteWait) q.actions.forEach((a, i) => { if (a.uid) (actsBy[a.uid] = actsBy[a.uid] || []).push(i); });
    const cands = new Set(q && q.type === 'target' && !remoteWait ? q.cands : []);
    const mark = uid => ({ can: !!actsBy[uid], cand: cands.has(uid) });
    const phaseKo = { player: '플레이어 단계', villain: '빌런 단계', setup: '준비', over: '게임 종료' }[s.phase] || '';
    const multi = g.players > 1;
    const viewP = multi ? (s.ps[UI.viewP] ? UI.viewP : 0) : 0;
    const isWide = multi && window.innerWidth >= 1000;

    // enemy side: row 1 = villain, main scheme and the villain-phase preview; row 2 (wraps) = side schemes, environment, minions
    const e = s.e;
    let en = '', sub = '';
    for (const v of (e.villains || [])) if (v !== e.villain) {
      const vret = g.stat(v, 'retaliate');
      sub += `<div class="slot">${cardEl(g, v, mark(v))}<div class="chips">${hpChip(g, v)}${statsChip(g, v, ['atk', 'sch'])}${vret > 0 ? kwChip('보복 ' + vret, '보복') : ''}${statusChips(g, v)}</div>${attsEl(g, v, mark)}</div>`;
    }
    if (e.villain) {
      const vret = g.stat(e.villain, 'retaliate');
      en += `<div class="slot">${cardEl(g, e.villain, Object.assign(mark(e.villain), { big: true }))}<div class="chips">${hpChip(g, e.villain)}${statsChip(g, e.villain, ['atk', 'sch'])}${vret > 0 ? kwChip('보복 ' + vret, '보복') : ''}${statusChips(g, e.villain)}${(() => { const c = g.c(e.villain), n = (c.fdBoost || 0) + (c.fdCards || []).length; return n ? `<span class="chip">뒷면 강화 ${n}</span>` : ''; })()}${g.c(e.villain).noDmg === s.round + ':' + s.phase ? '<span class="chip">이번 단계 피해 없음</span>' : ''}</div>${attsEl(g, e.villain, mark)}</div>`;
    }
    if (e.main) {
      const t = g.mainTarget(), th = g.c(e.main).threat, nst = (e.mainStages || []).length;
      en += `<div class="slot mainslot">${cardEl(g, e.main, mark(e.main))}<div class="chips">${e.mainX ? kwChip('글라이더', '글라이더') : ''}${nst > 1 ? kwChip(`${e.mainIdx + 1}/${nst}단계`, '주 음모 단계') : ''}<span class="chip thr">위협 ${th}/${t === Infinity ? '∞' : t}</span>${g.c(e.main).cnt.magnet ? `<span class="chip">자석 ${g.c(e.main).cnt.magnet}</span>` : ''}${g.crisis() ? kwChip('위기', '위기', 'st') : ''}</div>${attsEl(g, e.main, mark)}</div>`;
    }
    for (const mx of (e.mainX || []).slice().reverse()) sub = `<div class="slot">${cardEl(g, mx, mark(mx))}<div class="chips">${kwChip('주 음모', '주 음모')}<span class="chip thr">위협 ${g.c(mx).threat}/${g.targetOf(mx)}</span>${g.c(mx).cnt.accelTok ? `<span class="chip">가속 토큰 ${g.c(mx).cnt.accelTok}</span>` : ''}</div>${attsEl(g, mx, mark)}</div>` + sub;
    if (e.main2) sub = `<div class="slot">${cardEl(g, e.main2, mark(e.main2))}<div class="chips">${kwChip('두 번째 주 음모', '주 음모')}<span class="chip thr">위협 ${g.c(e.main2).threat}/${g.targetOf(e.main2)}</span></div>${attsEl(g, e.main2, mark)}</div>` + sub;
    en += forecastHTML(g);
    for (const u of e.sides) {
      const d = g.d(u), under = g.c(u).under.length;
      sub += `<div class="slot">${cardEl(g, u, mark(u))}<div class="chips"><span class="chip thr">위협 ${g.c(u).threat}</span>${d.accel ? kwChip('가속', '가속', 'st') : ''}${d.hazard ? kwChip('위험', '위험', 'st') : ''}${d.crisis ? kwChip('위기', '위기', 'st') : ''}${under ? `<span class="chip">아래 ${under}장</span>` : ''}${g.c(u).att.filter(x => g.d(x).type === 'ally').map(x => `<span class="chip">${esc(g.nm(x))} 체력 ${g.hpLeft(x)}/${g.maxHp(x)}</span>`).join('')}${cntChips(g.c(u))}</div>${attsEl(g, u, mark)}</div>`;
    }
    for (const u of (e.mission || [])) sub += `<div class="slot">${cardEl(g, u, mark(u))}<div class="chips">${kwChip('임무 구역', '임무 구역', 'st')}${g.d(u).hp ? hpChip(g, u, true) : ''}</div>${attsEl(g, u, mark)}</div>`;
    for (const u of (e.rules || [])) sub += `<div class="slot">${cardEl(g, u, mark(u))}<div class="chips">${kwChip('챌린지', '챌린지', 'st')}</div></div>`;
    for (const u of (e.env || [])) sub += `<div class="slot">${cardEl(g, u, mark(u))}<div class="chips">${kwChip('환경', '환경')}${cntChips(g.c(u))}</div>${attsEl(g, u, mark)}</div>`;
    if ((e.coll || []).length) { const top = e.coll[e.coll.length - 1]; sub += `<div class="slot">${cardEl(g, top, mark(top))}<div class="chips">${kwChip(`콜렉션 ${e.coll.length}장`, '콜렉션', 'st')}</div></div>`; }
    if (!multi) {
      for (const u of e.minions) sub += minionSlotHTML(g, u, mark);
    } else if (e.minions.length) {
      let groups = '';
      for (let pi = 0; pi < s.ps.length; pi++) {
        const ms = g.engagedMinions(pi);
        if (ms.length) groups += `<div class="eng-group p${pi}"><span class="eng-tag p${pi}">${esc(g.playerName(pi))} 교전</span><div class="eng-row">${ms.map(u => minionSlotHTML(g, u, mark)).join('')}</div></div>`;
      }
      if (groups) sub += `<div class="eng-wrap">${groups}</div>`;
    }

    // player side
    let playersHTML = '';
    if (!multi) {
      playersHTML = renderPlayerZone(g, 0, mark, true);
    } else if (isWide || UI.splitView) {
      playersHTML = s.ps.map((_, pi) => renderPlayerZone(g, pi, mark, pi === viewP)).join('');
    } else {
      const others = s.ps.map((_, pi) => pi).filter(pi => pi !== viewP);
      playersHTML = others.map(pi => renderStrip(g, pi, q)).join('') + renderPlayerZone(g, viewP, mark, true);
    }

    const vp = s.ps[viewP];
    const logs = s.log.slice(-2);
    const hand = vp.eliminated
      ? '<span class="info">탈락한 히어로입니다</span>'
      : (vp.hand.map(u => {
        const c = g.c(u);
        return `<div class="${['card', actsBy[u] ? 'can' : '', cands.has(u) ? 'cand' : ''].join(' ')}" data-uid="${u}" tabindex="0" role="button" aria-label="${esc(g.d(u).name)}"><img src="${img(c.id)}" alt="" decoding="async" draggable="false">${resHTML(g.d(u).res)}</div>`;
      }).join('') || '<span class="info">손에 카드가 없습니다</span>');

    const totalPending = s.ps.reduce((t, p) => t + (p.facedown || []).length, 0);
    const viewP2 = s.ps[viewP];
    const onlinePill = UI.online.active ? `<button class="online-pill" data-act="online-copy" title="방 코드 복사">방 ${esc(UI.online.code)}</button>` : '';
    const extraControls = multi
      ? `<button class="iconbtn${UI.lockView ? ' on' : ''}" data-act="togglelock" aria-label="자동 화면 전환 잠금" title="${UI.lockView ? '자동 전환 꺼짐' : '자동 전환 켜짐'}">${UI.lockView ? '🔒' : '🔓'}</button><button class="iconbtn${UI.splitView ? ' on' : ''}" data-act="togglesplit" aria-label="둘 다 펼치기" title="둘 다 펼치기">◫</button>`
      : '';
    const undoBtn = (!UI.online.active || UI.online.role === 'host')
      ? `<button class="iconbtn sym" data-act="undo"${canUndo() ? '' : ' disabled'} aria-label="직전 행동 되돌리기" title="되돌리기">↶</button>`
      : '';

    let html = `
      <header class="top">
        <span class="rnd">R${s.round}</span>
        <span class="phase${s.phase === 'villain' ? ' v' : ''}">${phaseKo}</span>
        ${onlinePill}
        <span class="sp"></span>
        ${extraControls}
        ${undoBtn}
        <button class="iconbtn" data-act="log">기록</button>
        <button class="iconbtn sym" data-act="menu" aria-label="메뉴" title="메뉴"><svg class="burger" viewBox="0 0 18 14" aria-hidden="true"><path d="M1 1.5h16M1 7h16M1 12.5h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg></button>
      </header>
      <div class="board${multi ? ' two' : ''}${UI.splitView ? ' split' : ''}" id="board">
      <section class="zone enemy"><span class="cap red">${esc(e.villain ? (e.villains ? `활성 빌런: ${g.nm(e.villain)} · 남은 빌런 ${e.villains.length}` : (g.romanStage(g.d(e.villain).stage) ? `${g.nm(e.villain)} · ${g.romanStage(g.d(e.villain).stage)}단계` : g.nm(e.villain))) : '빌런')}</span><button class="cnts" data-act="ediscards">조우 덱 <b>${e.deck.length}</b> · 버림 <b>${e.discard.length}</b>${Object.entries(e.sub || {}).map(([k, L]) => { const n = L.filter(x => g.c(x).zone === 'aside').length; return ` · ${({ ew: '실험 무기', ss: '부가 음모 덱' })[k] || k} <b>${n}</b>`; }).join('')}${e.asideMods ? ` · 따로 둔 모듈 <b>${e.asideMods.filter(m => !m.used).length}</b>` : ''}${viewP2.usedOnce && viewP2.usedOnce.sectorScan && e.deck.length ? ` · 맨 위 <b>${esc(g.nm(e.deck[0]))}</b>` : ''}${totalPending ? ` · <em>대기 ${totalPending}</em>` : ''}</button><div class="row top1">${en}</div>${sub ? `<div class="row sub${e.sides.length + (e.env || []).length + e.minions.length > 4 ? ' dense' : ''}">${sub}</div>` : ''}</section>
      <div class="ticker" data-act="log">${logs.map(l => `<div class="k-${l.k}">${l.p != null ? `<span class="pdot p${l.p}"></span>` : ''}${esc(l.m)}</div>`).join('') || '<div>&nbsp;</div>'}</div>
      ${playersHTML}
      </div>
      ${promptHTML(g, q, viewP)}<!--OFFBOARD-->
      <section class="hand${multi ? ` p${viewP}` : ''}"><div class="row" id="hand-row">${hand}</div></section>`;
    if (q && q.type === 'target') { // candidates that are not drawn on the board (set-aside pile, decks, discard piles, collapsed player): show them under the prompt
      const miss = q.cands.filter(u => !html.includes(`data-uid="${u}"`));
      if (miss.length) html = html.replace('<!--OFFBOARD-->', `<section class="hand offb"><div class="row">${miss.map(u => { const ctrl = multi ? g.controllerOf(u) : null; return `<div class="card cand" data-uid="${u}" tabindex="0" role="button" aria-label="${esc(g.d(u).name)}"><img src="${img(g.c(u).id)}" alt="" decoding="async" draggable="false">${ctrl != null ? `<span class="pbadge p${ctrl}" style="position:absolute;top:-7px;left:-4px;z-index:4">${esc(g.playerName(ctrl))}</span>` : ''}</div>`; }).join('')}</div></section>`);
    }
    html += sheetHTML(g, q);
    html += overlayHTML(g);
    html += toastHTML();
    // animate a sheet/overlay only the first time it appears, not on every re-render
    const key = (UI.sheet ? 'S' + UI.sheet.kind + (UI.sheet.uid || '') + (UI.sheet.pi != null ? UI.sheet.pi : '') : q ? 'Q' + q.type + q.title + (q.owner != null ? q.owner : '') : '') + '|' + (UI.overlay ? 'O' + UI.overlay.ev.type + (UI.overlay.ev.uid || '') : '');
    if (key !== UI.animKey) { html = html.replace('class="scrim"', 'class="scrim anim"').replace('class="reveal"', 'class="reveal anim"'); UI.animKey = key; }
    const keepIds = ['hand-row'].concat(s.ps.map((_, pi) => `mine-row-${pi}`));
    const keep = keepIds.map(k => { const el = document.getElementById(k); return el ? el.scrollLeft : 0; });
    const bEl = document.getElementById('board'), bTop = bEl ? bEl.scrollTop : 0;
    const fxSnap = MC.fx ? MC.fx.before(g) : null; // animations (fx.js): where every card was
    $app.innerHTML = html;
    keepIds.forEach((k, i) => { const el = document.getElementById(k); if (el) el.scrollLeft = keep[i]; });
    const b2 = document.getElementById('board'); if (b2) b2.scrollTop = bTop;
    if (MC.fx) try { MC.fx.after(g, fxSnap); } catch (e) { console.error(e); } // ...and what changed
  }

  function promptHTML(g, q, viewP) {
    let msg = '', btns = '';
    const multi = g.players > 1, owner = q && q.owner != null ? q.owner : g.s.ctx;
    const pBadge = multi && q ? `<span class="pbadge p${owner}">${esc(g.playerName(owner))}</span>` : '';
    const pCls = multi && q ? ` p${owner}` : '';
    if (UI.error) { msg = `오류가 발생했습니다<small>${esc(UI.error.message)}</small>`; btns = '<button class="btn" data-act="menu">메뉴</button>'; }
    else if (UI.pending && UI.pending.remote) {
      if (UI.pending.submitted) {
        msg = `${pBadge}응답을 방장에게 전송했습니다…<small>잠시만 기다려 주세요</small>`;
      } else {
        const sub = q && q.title ? q.title : '상대가 행동을 고르고 있습니다';
        msg = `${pBadge}${esc(g.playerName(owner))}의 선택을 기다리는 중…<small>${esc(sub)}</small>`;
      }
      return `<div class="prompt${pCls} remote"><div class="msg">${msg}</div></div>`;
    } else if (!q) msg = g.s.phase === 'over' ? '게임이 끝났습니다' : '진행 중…';
    else if (q.type === 'main') {
      msg = `${pBadge}행동을 고르세요<small>노란 카드 탭: 행동 · 길게 누르기: 확대</small>`;
      if (multi && viewP != null && owner !== viewP) btns += `<button class="btn sm" data-act="focusp" data-id="${owner}">차례 보기</button>`;
      for (const r of q.actions.filter(a => a.kind === 'request')) {
        btns += `<button class="btn sm" data-act="reqopen" data-id="${r.targetPlayer}">${esc(g.playerName(r.targetPlayer))} 요청</button>`;
      }
      const endAct = q.actions.find(a => a.kind === 'end');
      btns += `<button class="btn pri" data-act="end">${esc(endAct ? endAct.label : '턴 종료')}</button>`;
    } else if (q.type === 'target') {
      msg = `${pBadge}${esc(q.title)}<small>초록색으로 빛나는 카드를 탭하세요</small>`;
      if (q.cancelable) btns = '<button class="btn" data-act="cancel">취소</button>';
    } else msg = `${pBadge}${esc(q.title || '')}`;
    return `<div class="prompt${pCls}"><div class="msg">${msg}</div>${btns ? `<div class="pbtns">${btns}</div>` : ''}</div>`;
  }

  function detailHTML(g, uid) {
    const c = g.c(uid), d = g.d(uid), land = isLand(c.id);
    const st = [];
    const isChar = ['hero', 'alter', 'ally', 'villain', 'minion'].includes(d.type);
    if (d.cost != null && !d.enc) st.push(`<span class="chip">비용 ${d.cost}</span>`);
    if (d.res) st.push(`<span class="chip">자원 ${resHTML(d.res)}</span>`);
    if (isChar && c.zone) {
      if (d.thw != null) st.push(`<span class="chip">저지 ${g.stat(uid, 'thw')}</span>`);
      if (d.atk != null) st.push(`<span class="chip">공격 ${g.stat(uid, 'atk')}</span>`);
      if (d.def != null) st.push(`<span class="chip">방어 ${g.stat(uid, 'def')}</span>`);
      if (d.rec != null) st.push(`<span class="chip">회복 ${g.stat(uid, 'rec')}</span>`);
      if (d.sch != null) st.push(`<span class="chip">음모 ${g.stat(uid, 'sch')}</span>`);
      if (d.hp != null && c.zone !== 'hand' && c.zone !== 'deck') st.push(hpChip(g, uid));
    }
    if (d.boost) st.push(`<span class="chip thr">강화 ${d.boost}</span>`);
    return `<div class="detail${land ? ' landwrap' : ''}"><img class="full${land ? ' land' : ''}" data-fxuid="${uid}" src="${img(c.id, 'f')}" alt="${esc(d.name)}">
      <div class="meta"><div class="nm">${esc(d.name)}</div><div class="ty">${TYPE_KO[d.type] || ''}${d.traits && d.traits.length ? ' · ' + esc(d.traits.join(', ')) : ''}</div>
      <div class="statline">${st.join('')}${statusChips(g, uid)}</div>${d.text ? `<div class="cardtext">${cardText(d.text)}</div>` : ''}</div></div>`;
  }

  function detailByIdHTML(id) {
    const d = MC.cards[id], land = isLand(id), st = [];
    if (d.cost != null) st.push(`<span class="chip">비용 ${d.cost}</span>`);
    if (d.res) st.push(`<span class="chip">자원 ${resHTML(d.res)}</span>`);
    ['thw', 'atk', 'def', 'rec', 'sch', 'hp'].forEach((k, i) => { if (d[k] != null) st.push(`<span class="chip">${['저지', '공격', '방어', '회복', '음모', '체력'][i]} ${d[k]}${d[k + 'Star'] ? '*' : ''}</span>`); });
    if (d.cls && MC.ASPECTS[d.cls]) st.push(`<span class="asp ${MC.ASPECTS[d.cls].css}">${MC.ASPECTS[d.cls].ko}</span>`);
    if (d.maxDeck) st.push(`<span class="chip">덱마다 최대 ${d.maxDeck}장</span>`);
    return `<div class="detail${land ? ' landwrap' : ''}"><img class="full${land ? ' land' : ''}" src="${img(id, 'f')}" alt="${esc(d.name)}">
      <div class="meta"><div class="nm">${esc(d.name)}</div><div class="ty">${TYPE_KO[d.type] || ''}${d.traits && d.traits.length ? ' · ' + esc(d.traits.join(', ')) : ''}</div>
      <div class="statline">${st.join('')}</div>${d.text ? `<div class="cardtext">${cardText(d.text)}</div>` : ''}</div></div>`;
  }
  function sheetHTML(g, q) {
    // explicit sheets first (card detail, log, menu), then the engine's question
    if (UI.sheet) {
      const sh = UI.sheet;
      const ds = deckSheetHTML(); if (ds) return ds;
      if (!g && sh.kind !== 'cardId') return '';
      if (sh.kind === 'card') {
        let acts = '';
        if (!sh.zoomOnly && q && q.type === 'main' && !(UI.pending && UI.pending.remote)) {
          q.actions.forEach((a, i) => { if (a.uid === sh.uid) acts += `<button class="btn opt${a.kind === 'play' ? ' pri' : ''}" data-act="act" data-i="${i}">${esc(J(actLabel(g, a, q)))}</button>`; });
        }
        return `<div class="scrim" data-act="close-bg"><div class="sheet" role="dialog">${detailHTML(g, sh.uid)}<div class="opts">${acts}<button class="btn" data-act="close">닫기</button></div></div></div>`;
      }
      if (sh.kind === 'cardId') {
        return `<div class="scrim" data-act="close-bg"><div class="sheet" role="dialog">${detailByIdHTML(sh.id)}<div class="opts"><button class="btn" data-act="close">닫기</button></div></div></div>`;
      }
      if (sh.kind === 'log') {
        const rows = g.s.log.slice().reverse().map(l => `<div class="k-${l.k}"><span class="r">R${l.r}</span>${l.p != null ? `<span class="pdot p${l.p}"></span>` : ''}${esc(l.m)}</div>`).join('');
        return `<div class="scrim" data-act="close-bg"><div class="sheet" role="dialog"><h3>게임 기록</h3><div class="sub">최신 순</div><div class="log">${rows}</div><div class="btnrow"><button class="btn" data-act="close">닫기</button></div></div></div>`;
      }
      if (sh.kind === 'kw') {
        return `<div class="scrim" data-act="close-bg"><div class="sheet" role="dialog"><h3>${esc(sh.id === '예상' ? '다음 빌런 단계 예상' : sh.id)}</h3><div class="cardtext">${esc(KW[sh.id] || '')}</div>
          <div class="btnrow"><button class="btn" data-act="glossary">용어 전체 보기</button><button class="btn pri" data-act="close">닫기</button></div></div></div>`;
      }
      if (sh.kind === 'glossary') {
        const rows = Object.entries(KW).filter(([k]) => k !== '예상').map(([k, v]) => `<div class="gl"><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join('');
        return `<div class="scrim" data-act="close-bg"><div class="sheet" role="dialog"><h3>용어 설명</h3><div class="sub">게임 화면의 밑줄 친 칩을 탭해도 볼 수 있습니다.</div>${rows}<div class="btnrow"><button class="btn pri" data-act="close">닫기</button></div></div></div>`;
      }
      if (sh.kind === 'endconfirm') {
        return `<div class="scrim" data-act="close-bg"><div class="sheet" role="dialog"><h3>턴을 끝낼까요?</h3><div class="sub">아직 할 수 있는 것이 있습니다.</div><ul class="todo">${sh.lines.map(l => `<li>${esc(l)}</li>`).join('')}</ul>
          <div class="btnrow"><button class="btn" data-act="close">돌아가기</button><button class="btn pri" data-act="end2">턴 종료</button></div></div></div>`;
      }
      if (sh.kind === 'menu') {
        const discBtns = g.players > 1
          ? g.s.ps.map((p, pi) => `<button class="btn opt" data-act="discards-p" data-id="${pi}"><span class="pdot p${pi}"></span>${esc(g.playerName(pi))} 버림 더미 (${p.discard.length})</button>`).join('')
          : `<button class="btn opt" data-act="discards">내 버림 더미 보기 (${g.p.discard.length})</button>`;
        const menuSub = UI.online.active
          ? `온라인 2인 (${UI.online.role === 'host' ? '방장 · A' : '참여자 · B'}) · 방 코드 ${esc(UI.online.code)}`
          : '진행 상황은 내 행동 차례마다 이 기기에 자동 저장됩니다.';
        const copyBtn = UI.online.active ? `<button class="btn opt" data-act="online-copy">방 코드 복사 (${esc(UI.online.code)})</button>` : '';
        const undoMenuBtn = (!UI.online.active || UI.online.role === 'host')
          ? `<button class="btn opt" data-act="undo"${canUndo() ? '' : ' disabled'}>↶ 직전 행동 되돌리기${UI.hist.length > 1 ? ` (이번 라운드 ${UI.hist.length - 1}번까지)` : ''}</button>`
          : '';
        const quitLabel = UI.online.active
          ? (UI.online.role === 'host' ? '온라인 게임 종료하고 나가기' : '방에서 나가기')
          : '이 게임 포기하고 처음으로';
        return `<div class="scrim" data-act="close-bg"><div class="sheet" role="dialog"><h3>메뉴</h3><div class="sub">${menuSub}</div>
          <div class="opts">${copyBtn}${undoMenuBtn}
          <button class="btn opt" data-act="toggleauto">공개 카드 자동 넘김: <b>${UI.auto ? '켜짐' : '꺼짐'}</b></button>
          <button class="btn opt" data-act="glossary">용어 설명</button>
          ${discBtns}<button class="btn opt" data-act="ediscards">조우 버림 더미 보기 (${g.e.discard.length})</button><button class="btn opt red" data-act="quit">${quitLabel}</button><button class="btn" data-act="close">닫기</button></div></div></div>`;
      }
      if (sh.kind === 'peekhand') {
        const p = g.s.ps[sh.pi];
        const cards = p ? p.hand.map(u => `<div class="pick" data-uid="${u}">${cardEl(g, u, { inert: true })}${resHTML(g.d(u).res)}</div>`).join('') : '';
        return `<div class="scrim" data-act="close-bg"><div class="sheet p${sh.pi}" role="dialog"><h3>${esc(g.playerName(sh.pi))}의 손패 (${p ? p.hand.length : 0}장)</h3><div class="sub">카드를 길게 누르면 확대됩니다</div><div class="grid">${cards || '<div class="sub">손에 카드가 없습니다</div>'}</div><div class="btnrow"><button class="btn pri" data-act="close">닫기</button></div></div></div>`;
      }
      if (sh.kind === 'pile') {
        const cards = sh.list.map(u => `<div class="pick" data-uid="${u}">${cardEl(g, u, { inert: true })}</div>`).join('') || '<div class="sub">비어 있습니다</div>';
        return `<div class="scrim" data-act="close-bg"><div class="sheet" role="dialog"><h3>${esc(sh.title)}</h3><div class="sub">카드를 길게 누르면 확대됩니다</div><div class="grid">${cards}</div><div class="btnrow"><button class="btn" data-act="close">닫기</button></div></div></div>`;
      }
    }
    if (!q || (UI.pending && UI.pending.remote)) return '';
    if (UI.overlay && UI.overlay.ev && UI.overlay.ev.type !== 'over') return '';
    const pCls = g && g.players > 1 && q.owner != null ? ` p${q.owner}` : '';
    const pBadge = g && g.players > 1 && q.owner != null ? `<span class="pbadge p${q.owner}">${esc(g.playerName(q.owner))}</span>` : '';
    if (q.type === 'choice' || q.type === 'window' || q.type === 'defend' || q.type === 'request') {
      const opts = q.options.map(o => {
        const u = o.uid && g.c(o.uid) ? o.uid : null;
        return `<button class="btn opt" data-act="opt" data-id="${esc(o.id)}">${u ? cardEl(g, u, { inert: true }) : ''}<span>${esc(J(o.label))}</span></button>`;
      }).join('');
      const sub = q.type === 'window' ? '지금 사용할 수 있는 카드나 능력이 있습니다.' : q.type === 'defend' ? '방어할 캐릭터를 고르세요. 강화 카드는 방어를 정한 뒤 공개됩니다.' : q.type === 'request' ? '요청에 따라 사용할 행동이나 이벤트를 고르세요.' : '';
      return `<div class="scrim"><div class="sheet${pCls}" role="dialog"><h3>${pBadge}${esc(q.title)}</h3>${sub ? `<div class="sub">${sub}</div>` : ''}<div class="opts">${opts}${q.type === 'window' ? '<button class="btn" data-act="pass">사용하지 않음</button>' : ''}${q.type === 'request' ? '<button class="btn" data-act="pass">취소</button>' : ''}</div></div></div>`;
    }
    if (q.type === 'cleanup') {
      const secs = q.players.map(pl => {
        const cards = pl.cards.map(u => `<div class="pick${UI.sel.has(u) ? ' on' : ''}" data-act="tog" data-key="${u}">${cardEl(g, u, { inert: true })}${resHTML(g.d(u).res)}</div>`).join('');
        const left = pl.cards.filter(u => !UI.sel.has(u)).length;
        return `<div class="clean-sec"><div class="clean-hd"><span class="pdot p${pl.pi}"></span><span>${esc(pl.name)}</span><span class="chip">손 크기 ${pl.hs} · 남길 카드 ${left}장</span></div><div class="grid">${cards || '<div class="sub">손에 카드가 없습니다</div>'}</div></div>`;
      }).join('');
      return `<div class="scrim"><div class="sheet" role="dialog"><h3>${esc(q.title)}</h3><div class="sub">버릴 카드를 탭해 고른 뒤, 각자 손 크기까지 카드를 뽑습니다.</div>${secs}<div class="btnrow"><button class="btn pri" data-act="cleanok">정리 완료 (${UI.sel.size}장 버림)</button></div></div></div>`;
    }
    if (q.type === 'pay') {
      const letters = g.lettersOf([...UI.sel], q.sources);
      const ok = g.payOk(letters, q.cost);
      const cards = q.sources.filter(x => x.kind === 'card').map(x => `<div class="pick${UI.sel.has(x.key) ? ' on' : ''}" data-act="tog" data-key="${x.key}">${cardEl(g, x.uid, { inert: true })}${resHTML(x.res)}</div>`).join('');
      const abil = q.sources.filter(x => x.kind === 'ability').map(x => `<button class="btn abil${UI.sel.has(x.key) ? ' on' : ''}" data-act="tog" data-key="${x.key}">${resHTML(x.res)} ${esc(x.label)}</button>`).join('');
      const need = `비용 ${q.cost.n}${q.cost.req ? ' · 필요 ' + resHTML(q.cost.req) : ''}`;
      return `<div class="scrim"><div class="sheet${pCls}" role="dialog"><h3>${pBadge}${esc(q.title)}</h3><div class="sub">${need}. 손에서 버릴 카드나 자원 능력을 고르세요. 추천 조합이 미리 선택되어 있습니다.</div>
        ${abil}<div class="grid">${cards}</div>
        <div class="paybar">선택: ${letters.length ? resHTML(letters.join('')) : '없음'} <span class="${ok ? 'ok' : 'no'}">${ok ? '지불 가능' : '부족'}</span></div>
        <div class="btnrow">${q.cancelable ? '<button class="btn" data-act="paycancel">취소</button>' : ''}<button class="btn pri" data-act="payok"${ok ? '' : ' disabled'}>지불</button></div></div></div>`;
    }
    if (q.type === 'select') {
      const cards = q.cards.map(u => `<div class="pick${UI.sel.has(u) ? ' on' : ''}" data-act="tog" data-key="${u}">${cardEl(g, u, { inert: true })}${resHTML(g.d(u).res)}</div>`).join('');
      return `<div class="scrim"><div class="sheet${pCls}" role="dialog"><h3>${pBadge}${esc(q.title)}</h3><div class="sub">카드를 탭해 고르고, 길게 누르면 확대됩니다.</div><div class="grid">${cards}</div>
        <div class="btnrow"><button class="btn pri" data-act="selok">${q.confirm || '확정'} (${UI.sel.size}장)</button></div></div></div>`;
    }
    return '';
  }
  function actLabel(g, a, q) {
    if (a.kind === 'play') {
      const pi = q && q.owner != null ? q.owner : g.s.ctx;
      const cost = g.withPlayerSync(pi, () => g.cardCost(a.uid).n);
      return `플레이 (비용 ${cost})`;
    }
    return a.label;
  }

  function overlayHTML(g) {
    if (UI.error && !UI.overlay) return '';
    const o = UI.overlay; if (!o) return '';
    const ev = o.ev;
    // auto-advancing overlays pause only while a finger is held on them; the background tap itself does nothing
    const bg = o.ms ? 'noop' : 'cont';
    const btn = o.ms
      ? `<button class="btn pri cdown" data-act="cont">${barHTML(o)}<span class="lb">계속</span></button><div class="hint2"><span class="h-off">누르고 있는 동안 멈춥니다</span><span class="h-on">멈춤 · 손을 떼면 이어집니다</span></div>`
      : '<button class="btn pri" data-act="cont">계속</button>';
    if (ev.type === 'reveal') {
      const c = g.c(ev.uid);
      return `<div class="reveal${o.held ? ' held' : ''}" data-act="${bg}"><div class="ttl">${esc(ev.title || '조우 카드 공개')}</div><img class="${isLand(c.id) ? 'land' : ''}" data-fxuid="${ev.uid}" src="${img(c.id, 'f')}" alt="${esc(g.nm(ev.uid))}">${btn}</div>`;
    }
    if (ev.type === 'boost') {
      return `<div class="reveal${o.held ? ' held' : ''}" data-act="${bg}"><div class="ttl y">강화 카드</div><div class="boosts n${Math.min(ev.cards.length, 3)}">${ev.cards.map(u => `<img class="${isLand(g.c(u).id) ? 'land' : ''}" data-fxuid="${u}" src="${img(g.c(u).id, 'f')}" alt="${esc(g.nm(u))}">`).join('')}</div><div class="big">+${ev.icons}</div>${btn}</div>`;
    }
    if (ev.type === 'over') {
      const win = g.s.over === 'win', sc = g.s.scen || {}, S = MC.scenFor(sc.key, sc.underling);
      const rec = recText(sc.key + (sc.expert ? '+X' : ''));
      return `<div class="reveal"><div class="ttl${win ? ' y' : ''}">${win ? '승리!' : '패배'}</div><div class="big" style="font-size:22px;text-align:center;max-width:300px">${esc(g.s.overReason)}</div>
        ${S && rec ? `<div class="hint2">${esc(S.name)}(${sc.expert ? '숙련' : '표준'}) 통산 ${rec} · 라운드 ${g.s.round}</div>` : ''}
        ${g.s.campaign ? `<div class="hint2" style="max-width:320px">캠페인 「${esc((MC.CAMPAIGN_DEFS[g.s.campaign.id] || {}).name || '')}」${win ? ` · 남은 생명력 ${g.s.ps.length > 1 ? g.s.ps.filter(p => !p.eliminated).map(p => `${esc(g.nm(p.identity))} ${Math.max(1, g.hpLeft(p.identity))}`).join(' · ') : Math.max(1, g.hpLeft(g.idt()))}` : ''}${g.s.campaign.changed ? ' · 게임 중 바뀐 기록 있음' : ''}<br>${UI.csaved ? '캠페인 기록에 반영했습니다. 캠페인 안내서의 나머지 내용은 상대 화면에서 직접 고쳐 주세요.' : `<button class="btn" data-act="csave" style="margin-top:8px">캠페인 기록에 반영</button>`}</div>` : ''}
        <div class="btnrow" style="width:min(320px,90vw)"><button class="btn" data-act="log">기록 보기</button><button class="btn pri" data-act="newgame">처음으로</button></div></div>`;
    }
    return '';
  }

  function aspChip(key) { return String(key || '').split(';').map(k => MC.ASPECTS[k]).filter(Boolean).map(a => `<span class="asp ${a.css}">${a.ko}</span>`).join(''); }
  function renderStart() {
    const save = loadSave();
    const deck = selectedDeck(0), deck2 = selectedDeck(1);
    const needIds = UI.mode === '2p' ? deckIds(deck).concat(deckIds(deck2)) : deckIds(deck);
    if (!need(MC.packsFor(needIds))) return renderLoading();
    const hk = Deck.heroKeyOf(deck) || UI.hero, hk2 = Deck.heroKeyOf(deck2) || 'captain_marvel';
    const H = MC.heroes[hk], H2 = MC.heroes[hk2], S = MC.scenFor(UI.scen, UI.underling);
    const v = Deck.validate(deck), v2 = Deck.validate(deck2);
    const vst = UI.expert ? S.villainsExpert : S.villains;
    const saveS = save && save.scen && MC.scenarios[save.scen.key] && MC.scenFor(save.scen.key, save.scen.underling);
    const save2p = save && Array.isArray(save.ps) && save.ps.length > 1;
    const dupHero = UI.mode === '2p' && hk === hk2;
    const soloOnlyChal = UI.mode === '2p' && S.challenge === 'ch2419';
    const cantStart = dupHero || soloOnlyChal;
    const deckBtn = (d, vd, slot, label) => `<button class="deckcard${UI.mode === '2p' ? ` p${slot}` : ''}" data-act="decks-slot" data-id="${slot}">
      <span class="dl">${label}</span>
      <span class="dn">${esc(d.name)}</span>
      <span class="ds">${Deck.aspects(d).map(aspChip).join('')}<span class="chip${vd.total >= 40 && vd.total <= 50 ? '' : ' warnc'}">${vd.total}장</span>${vd.warn.length ? `<span class="chip warnc">확인 ${vd.warn.length}</span>` : ''}<span class="go">덱 고르기·편집 ›</span></span>
    </button>`;
    let bodyHTML = '';
    if (UI.mode === 'online') {
      const sess = Online ? Online.savedSession() : null;
      const nick = Online ? Online.nickname : '';
      const statusCls = Online && Online.mode === 'cloud' ? '' : ' local';
      bodyHTML = `
        <p class="lede">다른 기기(또는 로컬 테스트 시 다른 브라우저 탭)와 방 코드로 연결해 2인 협력 플레이를 합니다.</p>
        <div class="online-box">
          <div class="online-status${statusCls}"><span class="dot"></span><span>${esc(Online ? Online.statusText() : '연결 준비 중…')}</span></div>
          ${Online && Online.mode === 'cloud' ? '<div class="hint" style="margin:0">Claude 아티팩트 공유 시 상대에게 <b>기여자</b> 이상 권한을 주어야 실시간 통신이 됩니다.</div>' : ''}
          <label class="crow" style="border:0;padding:0"><span>내 닉네임</span><input id="online-nick" type="text" maxlength="20" value="${esc(nick)}" placeholder="예: 스파이더맨"></label>
        </div>
        ${deckBtn(deck, v, 0, '내 덱')}
        ${UI.onlineErr ? `<div class="warnbox">${esc(UI.onlineErr)}</div>` : ''}
        ${sess ? `<button class="btn pri wide grow" data-act="online-rejoin"${UI.onlineBusy ? ' disabled' : ''}>이전 방 다시 들어가기 (${esc(sess.code)} · ${sess.role === 'host' ? '방장' : '참여자'})</button>` : ''}
        <div class="online-box">
          <button class="btn pri wide" data-act="online-create"${UI.onlineBusy ? ' disabled' : ''}>${UI.onlineBusy ? '연결 중…' : '새 방 만들기 (방장)'}</button>
          <div class="join-row">
            <input id="join-code" class="code-in" type="text" maxlength="4" value="${esc(UI.joinCode)}" placeholder="ABCD" aria-label="4자리 방 코드">
            <button class="btn" data-act="online-join"${UI.onlineBusy ? ' disabled' : ''}>방 참여</button>
          </div>
        </div>
        <div class="howto"><b>진행 방식</b> 방장이 규칙 엔진을 실행하고, 참여자는 자기 히어로의 차례와 방어·대응 결정을 내립니다. 방장이 나가면 게임이 종료됩니다.</div>`;
    } else {
      const vsBlock = UI.mode === '2p'
        ? `<div class="vs vs2">
            <div class="heroes2">
              <div class="pick2"><img src="${img(H.hero)}" alt="${esc(H.name)}"><div class="t">${esc(H.name)}</div><div class="s"><span class="pbadge p0">A</span>${esc(deck.name)}</div></div>
              <div class="pick2"><img src="${img(H2.hero)}" alt="${esc(H2.name)}"><div class="t">${esc(H2.name)}</div><div class="s"><span class="pbadge p1">B</span>${esc(deck2.name)}</div></div>
            </div>
            <div class="x">VS</div>
            <button class="pick2 tap" data-act="villains"><img src="${img(vst[0] || (S.setAside || [])[0])}" alt="${esc(S.name)}"><div class="t">${esc(S.name)}</div><div class="s">${esc(scenLabel(UI.scen, UI.expert, UI.modular))}</div><div class="go">상대 바꾸기 ›</div></button>
          </div>`
        : `<div class="vs">
            <div class="pick2"><img src="${img(H.hero)}" alt="${esc(H.name)}"><div class="t">${esc(H.name)}</div><div class="s">${esc(deck.name)}</div></div>
            <div class="x">VS</div>
            <button class="pick2 tap" data-act="villains"><img src="${img(vst[0] || (S.setAside || [])[0])}" alt="${esc(S.name)}"><div class="t">${esc(S.name)}</div><div class="s">${esc(scenLabel(UI.scen, UI.expert, UI.modular))}</div><div class="go">상대 바꾸기 ›</div></button>
          </div>`;
      const firstRow = UI.mode === '2p'
        ? `<div class="crow"><span>선 플레이어</span><div class="chiprow" style="padding:0"><button class="fchip${UI.firstPick === 0 ? ' on' : ''}" data-act="pickfirst" data-id="0">A (${esc(H.name)})</button><button class="fchip${UI.firstPick === 1 ? ' on' : ''}" data-act="pickfirst" data-id="1">B (${esc(H2.name)})</button><button class="fchip${UI.firstPick === 'rnd' ? ' on' : ''}" data-act="pickfirst" data-id="rnd">무작위</button></div></div>`
        : '';
      bodyHTML = `
        <p class="lede">${UI.mode === '2p' ? '한 기기에서 히어로 2명을 번갈아 조작하는 투핸드 모드입니다. 요청, 대신 방어, 라운드별 선 플레이어 교대를 모두 지원합니다.' : '원본 커뮤니티 빌드의 규칙 엔진을 옮긴 모바일판입니다. 히어로와 성향 카드로 덱을 짜고, 확장팩의 빌런 시나리오와 모듈을 골라 도전합니다.'}</p>
        ${vsBlock}
        ${activeCampaign() ? `<p class="hint">캠페인 「${esc(MC.CAMPAIGN_DEFS[activeCampaign()].name)}」: 저장된 캠페인 기록대로 준비합니다. 기록은 상대 화면에서 고칩니다.</p>` : ''}
        ${UI.mode === '1p' && cameoFor(deck) ? `<label class="crow"><span>카메오: 덱에 섞을 다른 히어로의 전용 동료</span><select id="cameo-sel">${cameoList(hk).map(x => `<option value="${x.id}"${x.id === UI.cameo ? ' selected' : ''}>${esc(x.nm)} (${esc(x.hero)})</option>`).join('')}</select></label>` : ''}
        ${S.challenge ? `<p class="hint">챌린지 「${esc(S.name)}」: ${esc(S.rule || '')}${MC.challengeWarn(S, hk, deck) ? `<br><b>⚠ 히어로 조건: ${esc(MC.challengeWarn(S, hk, deck))}</b> (원본처럼 막지는 않습니다)` : ''}</p>` : ''}
        ${dupHero ? '<div class="warnbox">두 플레이어가 같은 히어로를 쓸 수 없습니다. 히어로 A와 B의 덱을 서로 다르게 골라 주세요.</div>' : ''}
        ${soloOnlyChal ? '<div class="warnbox">「외로운 늑대」 챌린지는 1인 전용입니다. 투핸드에서는 다른 시나리오를 골라 주세요.</div>' : ''}
        ${UI.mode === '2p' ? deckBtn(deck, v, 0, '히어로 A 덱') + deckBtn(deck2, v2, 1, '히어로 B 덱') + firstRow : deckBtn(deck, v, 0, '플레이할 덱')}
        ${save ? `<button class="btn pri wide grow" data-act="resume">이어하기 · ${save2p ? '2인 · ' : ''}라운드 ${save.round}${saveS ? ' · ' + esc(saveS.name) + (save.scen.expert ? '(숙련)' : '') : ''}${save.deckName ? ' · ' + esc(save.deckName) : ''}</button><button class="btn wide" data-act="start"${cantStart ? ' disabled' : ''}>이 덱·상대로 새 게임</button>` : `<button class="btn pri wide" data-act="start"${cantStart ? ' disabled' : ''}>게임 시작</button>`}
        <div class="howto"><b>조작</b> 노란 테두리 카드는 지금 쓸 수 있습니다. 탭하면 행동 목록, 길게 누르면 확대.<br>
          <b>자원</b> 비용을 낼 때 추천 조합이 미리 골라져 있으니 바꾸고 싶으면 탭해서 고치세요.<br>
          <b>승리</b> 빌런의 마지막 단계까지 쓰러뜨리면 승리. ${UI.mode === '2p' ? '모든 히어로가 쓰러지거나' : '히어로 체력이 0이 되거나'}, 마지막 단계 주 음모의 위협이 목표에 닿으면 패배.</div>`;
    }
    $app.innerHTML = `<div class="start">
      <h1><span>마블 챔피언스</span></h1><div><button type="button" class="fchip fx-toggle${MC.fx && MC.fx.isOn() ? ' on' : ''}" aria-pressed="${!!(MC.fx && MC.fx.isOn())}">${MC.fx ? MC.fx.label() : ''}</button></div>
      <div class="mode-seg" role="group" aria-label="플레이 인원"><button type="button" class="${UI.mode === '1p' ? 'on' : ''}" data-act="mode1p">1인 솔로</button><button type="button" class="${UI.mode === '2p' ? 'on' : ''}" data-act="mode2p">2인 투핸드</button><button type="button" class="${UI.mode === 'online' ? 'on' : ''}" data-act="modeonline">2인 온라인</button></div>
      ${bodyHTML}
    </div>${toastHTML()}${UI.sheet ? sheetHTML(null, null) : ''}`;
  }

  function renderLobby() {
    if (!Online || !Online.code) { UI.screen = 'home'; return renderStart(); }
    const isHost = Online.role === 'host';
    const hd = Online.hostDoc || {};
    const gd = Online.guestDoc && Online.guestDoc.joined ? Online.guestDoc : null;
    const lobby = hd.lobby || buildHostLobbyData();
    const hostDeck = lobby.hostDeck || selectedDeck(0);
    const guestDeck = gd && gd.deck ? gd.deck : null;
    const needIds = deckIds(hostDeck).concat(guestDeck ? deckIds(guestDeck) : []).concat(MC.idsForGame({
      scenario: lobby.scen, underling: lobby.underling, expert: lobby.expert,
      modular: lobby.modular, std2: lobby.std2, exp2: lobby.exp2
    }));
    if (!need(MC.packsFor(needIds))) return renderLoading();

    const hk0 = (lobby.hostDeckSummary && lobby.hostDeckSummary.heroKey) || Deck.heroKeyOf(hostDeck) || UI.hero;
    const H0 = MC.heroes[hk0] || MC.heroes.spider_man;
    const v0 = Deck.validate(hostDeck);
    const hk1 = guestDeck ? (Deck.heroKeyOf(guestDeck) || 'captain_marvel') : (gd && gd.deckSummary && gd.deckSummary.heroKey);
    const H1 = hk1 ? MC.heroes[hk1] : null;
    const v1 = guestDeck ? Deck.validate(guestDeck) : null;
    const S = MC.scenFor(lobby.scen || 'rhino', lobby.underling);
    const vst = lobby.expert ? S.villainsExpert : S.villains;
    const dupHero = !!(gd && hk0 && hk1 && hk0 === hk1);
    const soloOnlyChal = S.challenge === 'ch2419';
    const canStart = isHost && gd && gd.ready && !dupHero && !soloOnlyChal;
    const fpLabel = lobby.firstPick === 'rnd' ? '무작위' : lobby.firstPick === 1 ? `B (${H1 ? H1.name : '참여자'})` : `A (${H0.name})`;

    $app.innerHTML = `<header class="top"><button class="iconbtn" data-act="online-leave">‹ 나가기</button><span class="rnd">온라인 대기실</span><span class="sp"></span><span class="online-pill">${Online.mode === 'cloud' ? '클라우드' : '로컬'}</span></header>
      <div class="scroll">
        <div class="room-code-row">
          <div><div style="font-size:11.5px;color:var(--muted)">방 코드</div><div class="room-code">${esc(Online.code)}</div></div>
          <button class="btn sm pri" data-act="online-copy">코드 복사</button>
        </div>
        ${Online.error ? `<div class="warnbox">${esc(Online.error)}</div>` : ''}
        <h4 class="sec">플레이어</h4>
        <div class="lobby-players">
          <div class="lobby-slot p0">
            <div class="ls-hd"><span class="pbadge p0">A · 방장</span><span class="ls-nm">${esc(hd.hostName || '방장')}</span><span class="ready-tag on">방장</span></div>
            <div class="ls-body">
              <img src="${img(H0.hero)}" alt="${esc(H0.name)}">
              <div class="ls-meta"><div class="ls-hero">${esc(H0.name)}</div><div class="ls-deck">${esc(hostDeck.name)}</div>
                <div class="ds">${Deck.aspects(hostDeck).map(aspChip).join('')}<span class="chip${v0.total >= 40 && v0.total <= 50 ? '' : ' warnc'}">${v0.total}장</span></div></div>
            </div>
            ${isHost ? '<button class="btn sm" data-act="online-mydeck">내 덱 바꾸기</button>' : ''}
          </div>
          <div class="lobby-slot p1">
            <div class="ls-hd"><span class="pbadge p1">B · 참여자</span><span class="ls-nm">${gd ? esc(gd.guestName || '게스트') : '대기 중…'}</span><span class="ready-tag${gd && gd.ready ? ' on' : ''}">${gd ? (gd.ready ? '준비 완료' : '준비 중') : '미접속'}</span></div>
            ${gd && guestDeck ? `<div class="ls-body">
              <img src="${img(H1 ? H1.hero : '01001a')}" alt="${esc(H1 ? H1.name : '')}">
              <div class="ls-meta"><div class="ls-hero">${esc(H1 ? H1.name : '히어로')}</div><div class="ls-deck">${esc(guestDeck.name)}</div>
                <div class="ds">${Deck.aspects(guestDeck).map(aspChip).join('')}<span class="chip${v1.total >= 40 && v1.total <= 50 ? '' : ' warnc'}">${v1.total}장</span></div></div>
            </div>` : '<div class="hint" style="margin:6px 0">상대가 방 코드 <b>' + esc(Online.code) + '</b>로 들어오기를 기다리는 중입니다.</div>'}
            ${!isHost ? '<button class="btn sm" data-act="online-mydeck">내 덱 바꾸기</button>' : ''}
          </div>
        </div>
        <h4 class="sec">빌런 시나리오</h4>
        <div class="vrow sel">
          <img src="${img(vst[0] || (S.setAside || [])[0])}" alt="${esc(S.name)}">
          <div class="dmeta">
            <div class="dn">${esc(S.name)}</div>
            <div class="ds"><span class="chip">${lobby.expert ? '숙련' : '표준'}</span><span class="chip">${esc(modNames(lobby.modular) || '기본')}</span><span class="chip">선: ${esc(fpLabel)}</span></div>
            ${isHost ? '<button class="btn sm" data-act="online-villains" style="align-self:flex-start;margin-top:4px">상대 바꾸기 ›</button>' : '<div class="vd">방장이 시나리오와 선 플레이어를 정합니다.</div>'}
          </div>
        </div>
        ${isHost ? `<div class="crow" style="margin-top:10px"><span>선 플레이어</span><div class="chiprow" style="padding:0"><button class="fchip${lobby.firstPick === 0 ? ' on' : ''}" data-act="online-first" data-id="0">A (${esc(H0.name)})</button><button class="fchip${lobby.firstPick === 1 ? ' on' : ''}" data-act="online-first" data-id="1">B (${esc(H1 ? H1.name : '참여자')})</button><button class="fchip${lobby.firstPick === 'rnd' ? ' on' : ''}" data-act="online-first" data-id="rnd">무작위</button></div></div>` : ''}
        ${dupHero ? '<div class="warnbox">두 플레이어가 같은 히어로를 쓸 수 없습니다. 서로 다른 히어로 덱을 골라 주세요.</div>' : ''}
        ${soloOnlyChal ? '<div class="warnbox">「외로운 늑대」 챌린지는 1인 전용입니다. 다른 시나리오를 골라 주세요.</div>' : ''}
        <div style="margin-top:14px">
          ${isHost
            ? `<button class="btn pri wide" data-act="online-start"${canStart ? '' : ' disabled'}>${!gd ? '상대 접속 대기 중…' : !gd.ready ? '상대 준비 대기 중…' : '게임 시작'}</button>`
            : `<button class="btn ${gd && gd.ready ? '' : 'pri '}wide" data-act="online-ready">${gd && gd.ready ? '준비 취소' : '준비 완료'}</button>`}
        </div>
      </div>${toastHTML()}${UI.sheet ? sheetHTML(null, null) : ''}`;
  }

  // ---------------------------------------------------------------- opponent picker
  function miniRow(ids) {
    const uniq = [...new Set(ids)].filter(id => MC.cards[id]);
    return `<div class="minirow">${uniq.map(id => `<div class="card mini${isLand(id) ? ' land' : ''}" data-zoomid="${id}" role="button" tabindex="0" aria-label="${esc(MC.cards[id].name)} 확대"><img src="${img(id)}" alt="" loading="lazy" decoding="async"></div>`).join('')}</div>`;
  }
  function schemeHTML(k, S) { // Civil War leaders: pick each stage's main scheme (the original defaults to the leader's own)
    const c = schemesFor(k), rnd = c === 'random', cur = i => rnd ? null : (Array.isArray(c) && c[i]) || S.mainOptions[i][0][0];
    const nm = id => (MC.cards[id] || {}).name || id;
    const desc = id => { const b = MC.cards[id.replace(/a$/, 'b')]; let t = String((b && b.text) || '').replace(/<[^>]+>/g, '').replace(/\[per_hero\]/g, '/인').replace(/\[star\]\s*/g, '');
      t = t.replace(/당신의 팀에 플레이어가 2명 이상이라면, 이 스테이지는 교란 2\/인를 얻습니다\.\s*/, '').replace(/이 스테이지가 완료되면, 플레이어들은 게임에서 패배합니다\.\s*/, '').trim(); return t.length > 70 ? t.slice(0, 68) + '…' : t; };
    return `<h4 class="sec">주 음모 구성</h4><div class="chiprow wrap"><button class="fchip${!c ? ' on' : ''}" data-act="pickscheme" data-id="default">기본 구성</button><button class="fchip${rnd ? ' on' : ''}" data-act="pickscheme" data-id="random">무작위</button></div>` +
      S.mainOptions.map((st, i) => `<div class="mlabel">${i + 1}단계</div><div class="chiprow wrap">${st.map((x, j) => `<button class="fchip schip${cur(i) === x[0] ? ' on' : ''}" data-act="pickscheme" data-id="${i}:${x[0]}">${esc(nm(x[0]))}${j === 0 ? ' ★' : ''}${desc(x[0]) ? `<br><small>${esc(desc(x[0]))}</small>` : ''}</button>`).join('')}</div>`).join('') +
      `<p class="hint">★는 이 리더의 기본 주 음모입니다. 원본도 따로 고르지 않으면 기본 구성으로 시작합니다.</p>`;
  }
  function renderVillains() {
    if (!need(MC.packsFor(MC.idsForGame({ scenario: UI.scen, underling: UI.underling, expert: UI.expert, modular: UI.modular, std2: UI.std2, exp2: UI.exp2 })))) return renderLoading();
    const S = MC.scenFor(UI.scen, UI.underling), mine = MC.modsOf(UI.modular), defs = MC.modsOf(S.defaultModular);
    const vpacks = [...new Set(Object.values(MC.scenarios).map(X => X.pack))], vp = vpacks.includes(UI.vpack) ? UI.vpack : 'all';
    let lastPack = null;
    const rows = Object.entries(MC.scenarios).filter(([, X]) => !X.hidden && (vp === 'all' || X.pack === vp)).map(([k, X0]) => { const X = MC.scenFor(k, UI.underling);
      const sel = k === UI.scen, st = UI.expert ? X.villainsExpert : X.villains;
      const head = vp === 'all' && vpacks.length > 1 && X.pack !== lastPack ? `<div class="mlabel">${esc((MC.catalog.packs[X.pack] || {}).name || X.pack)}</div>` : '';
      lastPack = X.pack;
      return head + vrow(k, X, sel, st);
    }).join('');
    const vfilter = vpacks.length > 1 ? `<div class="chiprow wrap packrow">${[['all', '전체']].concat(vpacks.map(p => [p, (MC.catalog.packs[p] || {}).name || p])).map(([k, l]) => `<button class="fchip${vp === k ? ' on' : ''}" data-act="vpack" data-id="${esc(k)}">${esc(l)}</button>`).join('')}</div>` : '';
    function vrow(k, X, sel, st) {
      const soloLocked = UI.mode === '2p' && X.challenge === 'ch2419';
      return `<button class="vrow${sel ? ' sel' : ''}" data-act="pickscen" data-id="${k}" aria-pressed="${sel}"${soloLocked ? ' disabled style="opacity:.45"' : ''}>
        <img src="${img(st[0] || (X.setAside || [])[0])}" alt="">
        <div class="dmeta"><div class="dn">${esc(X.name)}${soloLocked ? ' <span class="chip warnc">1인 전용</span>' : ''}</div>${X.title && X.title !== X.name ? `<div class="en">${esc(X.title)}</div>` : ''}
          <div class="ds"><span class="chip">빌런 ${(UI.expert ? X.stagesExpert : X.stages).map(g0roman).join('·')}</span><span class="chip">주 음모 ${X.main.length}단계</span><span class="chip">추천 ${esc(modNames(X.defaultModular))}</span>${recText(k + (UI.expert ? '+X' : '')) ? `<span class="chip rec">${UI.expert ? '숙련' : '표준'} ${recText(k + (UI.expert ? '+X' : ''))}</span>` : ''}</div>
          <div class="vd">${esc(VDESC[k] || (X.challenge ? `${(MC.scenarios[X.base] || {}).name || ''} 챌린지 — ${X.rule || ''}` : ''))}</div></div></button>`;
    }
    const st = UI.expert ? S.villainsExpert : S.villains;
    const modBtn = ([k, m]) => `<button class="fchip${mine.includes(k) ? ' on' : ''}" data-act="pickmod" data-id="${k}">${esc(m.name)}${defs.includes(k) ? ' ★' : ''}</button>`;
    const mpacks = [...new Set(Object.values(MC.modulars).map(m => m.pack))];
    const mods = mpacks.length > 1
      ? mpacks.map(p => `<div class="mlabel">${esc((MC.catalog.packs[p] || {}).name || p)}</div><div class="chiprow wrap">${Object.entries(MC.modulars).filter(([, m]) => m.pack === p).map(modBtn).join('')}</div>`).join('')
      : `<div class="chiprow wrap">${Object.entries(MC.modulars).map(modBtn).join('')}</div>`;
    const own = S.crew ? S.crew.flatMap(m => [m.side].concat(m.deck)) : S.encounter.concat(S.setAside || []);
    const prev = document.querySelector('.scroll.vscroll'), top = prev ? prev.scrollTop : 0;
    $app.innerHTML = `<header class="top"><button class="iconbtn" data-act="home">${UI.returnScreen === 'lobby' ? '‹ 대기실' : '‹ 처음'}</button><span class="rnd">상대</span><span class="sp"></span></header>
      <div class="scroll vscroll">
        <h4 class="sec">빌런</h4>
        ${vfilter}<div class="decklist">${rows}</div>
        ${S.challenge ? `<h4 class="sec">챌린지</h4><p class="hint">${esc(S.rule || '')}</p><p class="hint">기반 시나리오: ${esc((MC.scenarios[S.base] || {}).name || S.base)}. 원본은 챌린지를 숙련 난이도로 진행해서 고르면 숙련으로 바뀝니다(바꿀 수 있음). 히어로 조건은 원본처럼 막지 않고 시작 화면에서 경고만 합니다.</p>` : ''}
        ${campaignFor(UI.scen) ? campaignHTML(campaignFor(UI.scen)) : ''}
        ${S.mainOptions ? schemeHTML(UI.scen, S) : ''}
        ${S.underlings ? `<h4 class="sec">언더링 빌런</h4><div class="chiprow wrap">${S.underlings.map(k => `<button class="fchip${S.underling === k ? ' on' : ''}" data-act="pickul" data-id="${k}">${esc((MC.scenarios[k] || {}).name || k)}</button>`).join('')}</div>` : ''}
        <h4 class="sec">난이도</h4>
        <div class="chiprow"><button class="fchip${UI.expert ? '' : ' on'}" data-act="pickdiff" data-id="std">표준</button><button class="fchip${UI.expert ? ' on' : ''}" data-act="pickdiff" data-id="exp">숙련</button></div>
        ${MC.sets.standard_ii && !S.crew ? `<div class="mlabel">기본 세트</div><div class="chiprow wrap"><button class="fchip${UI.std2 ? '' : ' on'}" data-act="pickstd" data-id="1">표준</button><button class="fchip${UI.std2 === true ? ' on' : ''}" data-act="pickstd" data-id="2">표준 II</button>${MC.sets.standard_iii ? `<button class="fchip${UI.std2 === 3 ? ' on' : ''}" data-act="pickstd" data-id="3">표준 III</button>` : ''}</div>${UI.expert && MC.sets.expert_ii ? `<div class="mlabel">숙련 세트</div><div class="chiprow wrap"><button class="fchip${UI.exp2 ? '' : ' on'}" data-act="pickexp" data-id="1">숙련</button><button class="fchip${UI.exp2 ? ' on' : ''}" data-act="pickexp" data-id="2">숙련 II</button></div>` : ''}<p class="hint">표준 II·숙련 II는 후드 확장의 대체 기본 세트입니다. 표준 II에는 빌런에게 견고를 주는 「만만찮은 적」이 처음부터 깔립니다.${MC.sets.standard_iii ? ' 표준 III(에이지 오브 아포칼립스)은 「과거의 추격」에 추격 카운터가 쌓이면 숙적이 나타납니다.' : ''}</p>` : ''}
        <p class="hint">${S.crew ? (UI.expert ? '숙련: 빌런 넷이 모두 B면(더 강한 쪽)으로 나옵니다.' : '표준: 빌런 넷이 모두 A면으로 나옵니다.') : `${UI.expert ? '숙련' : '표준'}: 빌런 ${(UI.expert ? S.stagesExpert : S.stages).map(g0roman).join('·')}단계로 진행합니다. ${UI.expert ? '기본 세트에 ' + (UI.exp2 && MC.sets.expert_ii ? '숙련 II 세트(잔인한 의도·파멸·수색 섬멸·치고받기)' : '숙련 세트(탈진·마스터플랜·포화 속에서)') + '가 더해집니다.' : '기본 조우 세트가 섞입니다.'}`}</p>
        ${S.crew ? '<h4 class="sec">모듈 세트</h4><p class="hint">이 시나리오는 모듈 세트·기본 세트·의무·네메시스 카드를 쓰지 않습니다. 빌런 넷이 각자 조우 덱 15장을 씁니다.</p>' : `<h4 class="sec">모듈 세트 <small>★ 추천${(S.modCount || 1) > 1 ? ` · 이 시나리오는 ${S.modCount}개를 씁니다 (탭해서 켜고 끄기)` : ''}</small></h4>${S.asideMods ? '<p class="hint">고른 모듈 세트는 처음에 모두 따로 둡니다. 준비 단계에 무작위로 1세트를 조우 덱에 섞고, 후드 II·III, 약속된 번영, 범죄 국가, 현장 모집이 나올 때마다 1세트씩 더 섞습니다.</p>' : ''}
        ${mods}
        ${mine.map(k => MDESC[k] ? `<p class="hint">${mine.length > 1 ? `<b>${esc(MC.modulars[k].name)}</b>: ` : ''}${esc(MDESC[k])}</p>` : '').join('')}`}
        <h4 class="sec">이번 상대 카드 <small>탭하면 확대</small></h4>
        <div class="mlabel">빌런 · 주 음모</div>${miniRow((S.crew ? S.crew.map(m => UI.expert ? m.b : m.a) : st).concat(S.main.map(x => x[1])))}
        <div class="mlabel">${esc(S.name)} 조우 카드</div>${miniRow(own)}
        ${mine.map(k => `<div class="mlabel">${esc(MC.modulars[k].name)} 모듈</div>${miniRow(MC.modulars[k].cards)}`).join('')}
        <div class="mlabel">${UI.std2 === 3 && MC.sets.standard_iii ? '표준 III 세트' : UI.std2 && MC.sets.standard_ii ? '표준 II 세트' : '표준 세트'}</div>${miniRow(MC.stdSet({ std2: UI.std2 }))}
        ${UI.expert ? `<div class="mlabel">${UI.exp2 && MC.sets.expert_ii ? '숙련 II 세트' : '숙련 세트'}</div>${miniRow(MC.expSet({ exp2: UI.exp2 }))}` : ''}
        <button class="btn pri wide" data-act="home" style="margin-top:14px">${UI.returnScreen === 'lobby' ? '이 상대로 정하고 대기실로' : '이 상대로 정하기'}</button>
      </div>${UI.sheet ? sheetHTML(null, null) : ''}`;
    const sc = document.querySelector('.scroll.vscroll'); if (sc) sc.scrollTop = top;
  }
  function campaignHTML(cid) {
    const on = UI.campaign === cid, def = MC.CAMPAIGN_DEFS[cid], log = loadCLogs()[cid] || {}, F = MC.CAMPAIGN_FIELDS[cid] || [];
    const nm = id => { const c = MC.cards[String(id).split(',')[0]]; return c ? c.name : (MC.CAMPAIGN_VAL_KO[id] || id); };
    const row = f => {
      const k = f.description, v = log[k] == null ? '' : String(log[k]), lab = esc(MC.campaignLabel(k));
      if (f.type === 'number') return `<label class="crow"><span>${lab}</span><span class="cin">${f.random ? `<button class="fchip" data-act="crand" data-key="${esc(k)}">무작위</button>` : ''}<input type="number" inputmode="numeric" data-ckey="${esc(k)}" value="${esc(v)}"></span></label>`;
      if (f.type === 'select') return `<label class="crow"><span>${lab}</span><select data-ckey="${esc(k)}"><option value="">—</option>${f.options.map(o => `<option value="${esc(o)}"${o === v ? ' selected' : ''}${(f.disabledOptions || []).includes(o) ? ' disabled' : ''}>${esc(nm(o))}</option>`).join('')}</select></label>`;
      if (f.type === 'checkbox') { const sel = v ? v.split(';') : []; return `<div class="crow"><span>${lab}</span><span class="cchk">${f.options.map(o => `<button class="fchip${sel.includes(o) ? ' on' : ''}" data-act="ctog" data-key="${esc(k)}" data-id="${esc(o)}">${esc(nm(o))}</button>`).join('')}</span></div>`; }
      if (f.type === 'campaignRandom') return `<div class="crow"><span>${lab}</span><span class="cin"><button class="fchip" data-act="cpick" data-id="${esc(f.randomType)}">무작위</button><output>${esc(UI.cpick && UI.cpick[f.randomType] || f.emptyText || '')}</output></span></div>`;
      return `<label class="crow"><span>${lab}${f.type === 'card' ? ' (카드 ID)' : ' (;로 구분)'}</span><input type="text" data-ckey="${esc(k)}" value="${esc(v)}" placeholder="${esc(f.tooltip || '예: 01089;01090')}"></label>`;
    };
    return `<h4 class="sec">캠페인</h4><div class="chiprow"><button class="fchip${on ? '' : ' on'}" data-act="pickcamp" data-id="">사용 안 함</button><button class="fchip${on ? ' on' : ''}" data-act="pickcamp" data-id="${cid}">${esc(def.name)} 캠페인</button></div>
      ${on ? `<p class="hint">원본과 같은 방식입니다: 시나리오가 끝나면 캠페인 안내서에 따라 아래 기록을 고치고, 다음 시나리오를 고르면 기록대로 준비됩니다. 게임이 끝날 때 남은 생명력과 게임 중 바뀐 기록은 자동으로 반영할 수 있습니다.</p>
        <div class="clog">${F.map(row).join('')}</div><div class="chiprow"><button class="fchip" data-act="cclear">캠페인 기록 초기화</button></div>` : ''}`;
  }
  function campaignRandomPick(cid, type) {
    const SC = ['Art Museum Heist', 'The Getaway', 'Protection Racket', 'The Raft Breakout', 'Stop the Presses!'], UL = ['Bullseye', 'Electro', 'Hammerhead', 'Purple Man', 'Typhoid Mary'];
    const L = loadCLogs()[cid] || {}, sample = (a, n) => { const r = a.slice(), o = []; while (r.length && o.length < n) o.push(r.splice(Math.floor(Math.random() * r.length), 1)[0]); return o; };
    if (type === 'scenarios') { const left = SC.filter(x => !['Completed', 'Failed'].includes(L[`${x} Status`])); const p = sample(left, 2); return p.length ? p.map(x => MC.campaignLabel(`${x} Status`).replace(/ 결과$/, '')).join(' / ') : '남은 시나리오가 없습니다'; }
    const used = new Set(SC.map(x => L[`${x} Villain`]).filter(Boolean)); const p = sample(UL.filter(x => !used.has(x)), 1); return p.length ? MC.CAMPAIGN_VAL_KO[p[0]] || p[0] : '남은 부하가 없습니다';
  }
  const g0roman = n => ['', 'I', 'II', 'III', 'IV'][n] || String(n);

  // ---------------------------------------------------------------- deck list
  function renderDecks() {
    const list = Store.all();
    if (!need(MC.packsFor(list.flatMap(deckIds)))) return renderLoading();
    const curId = UI.mode === '2p' && UI.deckSlot === 1 ? UI.deckId2 : UI.deckId;
    const rows = list.map(d => {
      const v = Deck.validate(d), hk = Deck.heroKeyOf(d), H = hk && MC.heroes[hk];
      const sel = d.id === curId;
      return `<div class="deckrow${sel ? ' sel' : ''}">
        <img src="${img(H ? H.hero : '01001a')}" alt="">
        <div class="dmeta"><div class="dn">${esc(d.name)}${d.starter ? ' <span class="chip">기본 제공</span>' : ''}</div>
          <div class="ds">${Deck.aspects(d).map(aspChip).join('')}<span class="chip${v.total >= 40 && v.total <= 50 ? '' : ' warnc'}">${v.total}장</span>${v.warn.length ? `<span class="chip warnc">확인 ${v.warn.length}</span>` : ''}</div></div>
        <div class="dbtns">
          <button class="btn${sel ? ' pri' : ''} sm" data-act="pickdeck" data-id="${esc(d.id)}">${sel ? '선택됨' : '선택'}</button>
          <button class="btn sm" data-act="editdeck" data-id="${esc(d.id)}">편집</button>
          <button class="btn sm" data-act="moredeck" data-id="${esc(d.id)}" aria-label="더 보기">⋯</button>
        </div></div>`;
    }).join('');
    const title = UI.mode === '2p' ? `히어로 ${UI.deckSlot === 1 ? 'B' : 'A'} 덱` : '덱';
    $app.innerHTML = `<header class="top"><button class="iconbtn" data-act="home">${UI.returnScreen === 'lobby' ? '‹ 대기실' : '‹ 처음'}</button><span class="rnd">${title}</span><span class="sp"></span><button class="iconbtn" data-act="import">가져오기</button></header>
      <div class="scroll"><div class="store">${esc(Store.status)}</div>
        <button class="btn pri wide" data-act="newdeck">새 덱 만들기</button>
        <div class="decklist">${rows}</div>
        <p class="hint">원본 빌드의 덱 JSON 파일(<code>deck</code> 폴더)이나 MarvelCDB 덱 JSON을 붙여넣어 가져올 수 있습니다. 아직 지원하지 않는 카드는 게임에서 빠집니다.</p>
      </div>${toastHTML()}${UI.sheet ? sheetHTML(null, null) : ''}`;
  }
  function deckSheetHTML() {
    const sh = UI.sheet;
    if (sh.kind === 'newdeck') {
      const heroes = Object.keys(MC.heroes);
      return `<div class="scrim" data-act="close-bg"><div class="sheet" role="dialog"><h3>새 덱</h3><div class="sub">히어로 전용 카드 15장은 자동으로 들어갑니다. 성향을 고르면 그 성향과 기본 카드로 나머지를 채웁니다.</div>
        ${heroes.length > 1 ? `<div class="chiprow wrap">${heroes.map(k => `<button class="fchip${(sh.hero || heroes[0]) === k ? ' on' : ''}" data-act="nd-hero" data-id="${k}">${esc(MC.heroes[k].name)}</button>`).join('')}</div>` : ''}
        <div class="opts">${Deck.ASPECT_KEYS.map(a => `<button class="btn opt" data-act="nd-aspect" data-id="${a}">${aspChip(a)}<span>${MC.ASPECTS[a].ko} 성향으로 시작 <small>(빈 덱)</small></span></button>`).join('')}
          <button class="btn opt" data-act="nd-starter"><span>스타터 덱을 복사해서 시작</span></button>
          <button class="btn" data-act="close">취소</button></div></div></div>`;
    }
    if (sh.kind === 'moredeck') {
      const d = Store.get(sh.id);
      return `<div class="scrim" data-act="close-bg"><div class="sheet" role="dialog"><h3>${esc(d.name)}</h3><div class="opts">
        <button class="btn opt" data-act="dupdeck" data-id="${esc(d.id)}">복제</button>
        <button class="btn opt" data-act="exportdeck" data-id="${esc(d.id)}">JSON으로 내보내기</button>
        ${d.starter ? '' : `<button class="btn opt red" data-act="deldeck" data-id="${esc(d.id)}">삭제</button>`}
        <button class="btn" data-act="close">닫기</button></div></div></div>`;
    }
    if (sh.kind === 'confirmdel') {
      const d = Store.get(sh.id);
      return `<div class="scrim" data-act="close-bg"><div class="sheet" role="dialog"><h3>「${esc(d.name)}」 덱을 삭제할까요?</h3><div class="sub">삭제한 덱은 되돌릴 수 없습니다.</div>
        <div class="btnrow"><button class="btn" data-act="close">취소</button><button class="btn red" data-act="deldeck2" data-id="${esc(d.id)}">삭제</button></div></div></div>`;
    }
    if (sh.kind === 'export') {
      const d = Store.get(sh.id) || (UI.edit && UI.edit.deck);
      return `<div class="scrim" data-act="close-bg"><div class="sheet" role="dialog"><h3>덱 JSON</h3><div class="sub">원본 빌드의 덱 편집기에서 그대로 불러올 수 있는 형식입니다.</div>
        <textarea id="exporttext" class="jsonbox" readonly>${esc(Deck.exportJSON(d))}</textarea>
        <div class="btnrow"><button class="btn" data-act="close">닫기</button><button class="btn pri" data-act="copyjson">복사</button></div></div></div>`;
    }
    if (sh.kind === 'import') {
      return `<div class="scrim" data-act="close-bg"><div class="sheet" role="dialog"><h3>덱 가져오기</h3><div class="sub">덱 JSON을 붙여넣거나 파일을 고르세요. 원본 빌드의 덱 파일과 MarvelCDB 덱 JSON을 읽을 수 있습니다.</div>
        <textarea id="importtext" class="jsonbox" placeholder='{"hero": ["01001a,01001b"], "player_deck": [...]}'>${esc(sh.text || '')}</textarea>
        <label class="filebtn">JSON 파일 고르기<input type="file" id="importfile" accept=".json,application/json"></label>
        ${sh.err ? `<div class="errline">${esc(sh.err)}</div>` : ''}
        <div class="btnrow"><button class="btn" data-act="close">취소</button><button class="btn pri" data-act="doimport">가져오기</button></div></div></div>`;
    }
    if (sh.kind === 'leave') {
      return `<div class="scrim" data-act="close-bg"><div class="sheet" role="dialog"><h3>변경 사항을 저장할까요?</h3><div class="sub">저장하지 않으면 이번 편집 내용이 사라집니다.</div>
        <div class="opts"><button class="btn pri" data-act="edsave-leave">저장하고 나가기</button><button class="btn red" data-act="edleave">저장하지 않고 나가기</button><button class="btn" data-act="close">계속 편집</button></div></div></div>`;
    }
    return '';
  }

  // ---------------------------------------------------------------- deck editor
  const FTYPES = [['all', '전체'], ['ally', '동료'], ['event', '이벤트'], ['support', '지원'], ['upgrade', '업그레이드'], ['resource', '자원']];
  let rowNoLoad = false; // the "all packs" card list shows text cards instead of downloading every pack's scans
  function cardRow(id, n, o) {
    const c = MC.cards[id];
    const lim = Deck.limit(id);
    const meta = [c.cost != null ? `비용 ${c.cost}` : '', TYPE_KO[c.type]].filter(Boolean).join(' · ');
    const over = n > lim;
    return `<div class="crow${n ? ' has' : ''}">
      <div class="card mini" data-zoomid="${id}" role="button" tabindex="0" aria-label="${esc(c.name)} 확대"><img src="${img(id, 't', { noLoad: rowNoLoad })}" alt="" loading="lazy" decoding="async"></div>
      <div class="cmeta"><div class="cn">${esc(c.name)}</div><div class="cs">${meta} ${resHTML(c.res)} ${c.cls !== 'Hero' ? aspChip(c.cls) : ''}${o.off ? '<span class="chip warnc">성향 외</span>' : ''}</div></div>
      ${o.fixed ? `<span class="fixedn">×${n}</span>` : `<div class="step"><button data-act="dec" data-id="${id}" aria-label="빼기"${n ? '' : ' disabled'}>−</button><span class="${over ? 'over' : ''}">${n}</span><button data-act="inc" data-id="${id}" aria-label="넣기"${n >= lim ? ' disabled' : ''}>+</button></div>`}
    </div>`;
  }
  function renderEditor() {
    if (!need(MC.allPacks())) return renderLoading();
    const E = UI.edit, d = E.deck, v = Deck.validate(d), asp = Deck.aspectKey(d), asps = Deck.aspects(d);
    const cnt = Deck.counts(d.player_deck);
    const sizeOk = v.total >= 40 && v.total <= 50;
    let body = '';
    if (E.tab === 'deck') {
      const st = Deck.stats(d);
      const maxc = Math.max(1, ...st.curve);
      const ids = Object.keys(cnt).filter(id => MC.cards[id]).sort((a, b) => {
        const A = MC.cards[a], B = MC.cards[b];
        return (({ ally: 0, event: 1, support: 2, upgrade: 3, resource: 4 })[A.type] - ({ ally: 0, event: 1, support: 2, upgrade: 3, resource: 4 })[B.type]) || (A.cost || 0) - (B.cost || 0) || a.localeCompare(b);
      });
      const unknown = Object.keys(cnt).filter(id => !MC.cards[id]);
      body += v.warn.length ? `<div class="warnbox">${v.warn.map(w => `<div>${esc(w)}</div>`).join('')}${v.warn.some(w => w.includes('성향이 아닌')) ? '<button class="btn sm" data-act="dropoff">성향 외 카드 빼기</button>' : ''}</div>` : '<div class="okbox">덱 구성 규칙을 모두 만족합니다</div>';
      body += `<div class="stats"><div class="curve" aria-label="비용 곡선">${st.curve.map((n, i) => `<div class="bar"><span style="height:${Math.round(n / maxc * 100)}%"></span><b>${n}</b><i>${i === 4 ? '4+' : i}</i></div>`).join('')}</div>
        <div class="tally">${['ally', 'event', 'support', 'upgrade', 'resource'].map(t => `<span>${TYPE_KO[t]} <b>${st.types[t] || 0}</b></span>`).join('')}<span class="resline">${['R', 'B', 'Y', 'G'].map(l => `${resHTML(l)}<b>${st.res[l]}</b>`).join(' ')}</span></div></div>`;
      body += `<h4 class="sect">선택 카드 <span>${v.playerN}장</span></h4>`;
      body += ids.length ? ids.map(id => cardRow(id, cnt[id], { off: MC.cards[id].cls !== 'Basic' && !asps.includes(MC.cards[id].cls) })).join('') : '<div class="hint">아직 고른 카드가 없습니다. 「카드 추가」 탭에서 넣으세요.</div>';
      if (unknown.length) body += `<div class="hint">지원하지 않는 카드 ID: ${unknown.map(esc).join(', ')}</div>`;
      const hc = Deck.counts(d.hero_deck);
      body += `<h4 class="sect">히어로 전용 카드 <span>${v.heroN}장 · 고정</span></h4>` + Object.keys(hc).map(id => MC.cards[id] ? cardRow(id, hc[id], { fixed: true }) : '').join('');
    } else {
      const packs = MC.allPacks(), pk = E.pack || 'all';
      const pool = Deck.pool(asps, Deck.heroKeyOf(d)).filter(c => (E.type === 'all' || c.type === E.type) && (pk === 'all' || MC.packOf(c.id) === pk));
      body += `<div class="chiprow">${FTYPES.map(([k, l]) => `<button class="fchip${E.type === k ? ' on' : ''}" data-act="ftype" data-id="${k}">${l}</button>`).join('')}</div>`;
      if (packs.length > 1) body += `<div class="chiprow packrow">${[['all', '모든 팩']].concat(packs.map(p => [p, MC.catalog.packs[p].name])).map(([k, l]) => `<button class="fchip${pk === k ? ' on' : ''}" data-act="fpack" data-id="${esc(k)}">${esc(l)}</button>`).join('')}</div>`;
      let lastCls = '';
      rowNoLoad = pk === 'all' && packs.length > 2;
      for (const c of pool) {
        if (c.cls !== lastCls) { body += `<h4 class="sect">${aspChip(c.cls)} ${MC.ASPECTS[c.cls].ko} 카드</h4>`; lastCls = c.cls; }
        body += cardRow(c.id, cnt[c.id] || 0, {});
      }
      rowNoLoad = false;
      if (pk === 'all' && packs.length > 2) body = `<div class="hint">팩을 고르면 카드 그림이 보입니다 (전체 보기는 데이터 절약을 위해 글자 카드로 표시)</div>` + body;
    }
    $app.innerHTML = `<header class="top edtop"><button class="iconbtn" data-act="edback" aria-label="뒤로">‹</button><input id="deckname" class="namein" value="${esc(d.name)}" aria-label="덱 이름" maxlength="40"><button class="btn pri sm" data-act="edsave">${E.dirty ? '저장' : '저장됨'}</button></header>
      <div class="edsum"><div class="cntline"><span class="bigcnt ${sizeOk ? 'ok' : 'bad'}">${v.total}</span><span>/ 40–50장 · 히어로 ${v.heroN} + 선택 ${v.playerN}</span></div>
        <div class="chiprow">${Deck.ASPECT_KEYS.map(a => `<button class="fchip asp-${MC.ASPECTS[a].css}${asps.includes(a) ? ' on' : ''}" data-act="setasp" data-id="${a}">${MC.ASPECTS[a].ko}</button>`).join('')}${asps.length > 1 ? '<span class="hint">이중 첩자: 성향 2개</span>' : ''}</div></div>
      <div class="tabs"><button class="${E.tab === 'deck' ? 'on' : ''}" data-act="edtab" data-id="deck">덱 (${v.playerN})</button><button class="${E.tab === 'add' ? 'on' : ''}" data-act="edtab" data-id="add">카드 추가</button></div>
      <div class="scroll" id="edscroll">${body}</div>${toastHTML()}${UI.sheet ? sheetHTML(null, null) : ''}`;
    const sc = document.getElementById('edscroll'); if (sc && E.scroll && E.scroll[E.tab]) sc.scrollTop = E.scroll[E.tab];
  }
  function toastHTML() { return UI.toast ? `<div class="toast" role="status">${esc(UI.toast)}</div>` : ''; }
  function toast(m) {
    UI.toast = m; render(); clearTimeout(UI.toastT);
    UI.toastT = setTimeout(() => { UI.toast = ''; const t = document.querySelector('.toast'); if (t) t.remove(); }, 2200);
  }
  function openEditor(deck) {
    const d = deck.starter ? Deck.copy(deck, deck.name.replace(/ ?\(.*\)$/, '') + ' 사본') : JSON.parse(JSON.stringify(deck));
    UI.edit = { deck: d, dirty: !!deck.starter, tab: d.player_deck.length ? 'deck' : 'add', type: 'all', scroll: {} };
    UI.screen = 'edit'; UI.sheet = null; render();
  }
  function rememberScroll() { const sc = document.getElementById('edscroll'); if (sc && UI.edit) UI.edit.scroll[UI.edit.tab] = sc.scrollTop; }
  async function saveEdit() {
    const d = UI.edit.deck;
    d.name = (d.name || '').trim() || '이름 없는 덱';
    await Store.save(JSON.parse(JSON.stringify(d)));
    selectDeck(d.id);
    UI.edit.dirty = false;
    if (Online && Online.code && UI.returnScreen === 'lobby') syncLobbySelection(true);
  }

  // ---------------------------------------------------------------- input
  function tapCard(uid) {
    const q = UI.pending && UI.pending.q;
    if (q && q.type === 'target' && !(UI.pending && UI.pending.remote) && q.cands.includes(uid)) return resolve(uid);
    if (!UI.g || !UI.g.c(uid)) return;
    UI.sheet = { kind: 'card', uid, zoomOnly: !(q && q.type === 'main' && !(UI.pending && UI.pending.remote)) };
    render();
  }
  $app.addEventListener('click', ev => {
    if (UI.suppressClick) { UI.suppressClick = false; return; }
    const t = ev.target.closest('[data-act],[data-uid],[data-zoomid]');
    if (!t) return;
    const act = t.dataset.act;
    if (!act && t.dataset.zoomid) { UI.sheet = { kind: 'cardId', id: t.dataset.zoomid }; return render(); }
    if (!act) return tapCard(t.dataset.uid);
    if (deckAct(act, t)) return;
    const q = UI.pending && UI.pending.q;
    switch (act) {
      case 'act': return resolve(q.actions[+t.dataset.i]);
      case 'end': {
        if (!q || q.type !== 'main') return;
        const lines = endTodo(q);
        if (lines.length) { UI.sheet = { kind: 'endconfirm', lines }; return render(); }
        return resolve(q.actions.find(a => a.kind === 'end'));
      }
      case 'end2': if (q && q.type === 'main') { UI.sheet = null; resolve(q.actions.find(a => a.kind === 'end')); } return;
      case 'undo': UI.sheet = null; if (canUndo()) undo(); else render(); return;
      case 'kw': UI.sheet = { kind: 'kw', id: t.dataset.id }; return render();
      case 'glossary': UI.sheet = { kind: 'glossary' }; return render();
      case 'toggleauto': UI.auto = !UI.auto; try { localStorage.setItem('mc-auto', UI.auto ? '1' : '0'); } catch (e) { /* ignore */ } return render();
      case 'noop': return;
      case 'cancel': return resolve(null);
      case 'opt': return resolve(t.dataset.id);
      case 'pass': return resolve(null);
      case 'tog': { const k = t.dataset.key; if (UI.sel.has(k)) UI.sel.delete(k); else UI.sel.add(k); return render(); }
      case 'payok': return resolve([...UI.sel]);
      case 'paycancel': return resolve(null);
      case 'selok': return resolve([...UI.sel]);
      case 'cleanok': {
        if (!q || q.type !== 'cleanup') return;
        const map = {};
        for (const pl of q.players) map[pl.pi] = pl.cards.filter(u => UI.sel.has(u));
        return resolve(map);
      }
      case 'focusp': UI.viewP = +t.dataset.id; return render();
      case 'togglelock': UI.lockView = !UI.lockView; return render();
      case 'togglesplit': UI.splitView = !UI.splitView; return render();
      case 'reqopen': {
        if (!q || q.type !== 'main') return;
        const r = q.actions.find(a => a.kind === 'request' && a.targetPlayer === +t.dataset.id);
        if (r) return resolve(r);
        return;
      }
      case 'close': UI.sheet = null; return render();
      case 'close-bg': if (ev.target === t) { UI.sheet = null; render(); } return;
      case 'log': UI.sheet = { kind: 'log' }; return render();
      case 'menu': UI.sheet = { kind: 'menu' }; return render();
      case 'discards': UI.sheet = { kind: 'pile', title: '내 버림 더미', list: UI.g.p.discard.slice().reverse() }; return render();
      case 'discards-p': { const pi = +t.dataset.id; UI.sheet = { kind: 'pile', title: `${UI.g.playerName(pi)} 버림 더미`, list: UI.g.s.ps[pi].discard.slice().reverse() }; return render(); }
      case 'ediscards': UI.sheet = { kind: 'pile', title: '조우 버림 더미', list: UI.g.e.discard.slice().reverse() }; return render();
      case 'quit': case 'newgame': {
        const o = UI.overlay; UI.overlay = null;
        if (UI.online.active) {
          const isHost = UI.online.role === 'host';
          const code = UI.online.code;
          UI.online.runGen++;
          if (Online) { Online.cancelWaiter(); Online.leaveRoom({ closeIfHost: isHost }); }
          try { if (code) localStorage.removeItem(onlineCkptKey(code)); } catch (e) { /* ignore */ }
          UI.online = resetOnlineState();
        } else {
          try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
        }
        UI.screen = 'home'; UI.returnScreen = 'home';
        UI.g = null; UI.pending = null; UI.sheet = null; UI.error = null; UI.lastSnap = null;
        if (o) o.res();
        return render();
      }
      case 'online-copy': copyText((Online && Online.code) || UI.online.code || '', '방 코드를 복사했습니다'); return;
      case 'cont': return contOverlay();
      case 'start': return startGame(null);
      case 'resume': { const s = loadSave(); if (s) startGame(s); return; }
    }
  });
  // things the player can still do; asked before ending the turn so a stray tap doesn't skip the hero's action
  function endTodo(q) {
    const g = UI.g, out = [], kinds = new Set(q.actions.map(a => a.kind));
    const basic = ['attack', 'thwart', 'recover'].filter(k => kinds.has(k)).map(k => ({ attack: '공격', thwart: '저지', recover: '회복' }[k]));
    if (basic.length) out.push(`${g.nm(g.idt())}의 기본 행동 (${basic.join('·')})`);
    const allies = new Set(q.actions.filter(a => a.kind === 'allyAttack' || a.kind === 'allyThwart').map(a => a.uid));
    if (allies.size) out.push(`준비된 동료 ${allies.size}명`);
    if (!out.length) return out;
    const plays = new Set(q.actions.filter(a => a.kind === 'play').map(a => a.uid));
    if (plays.size) out.push(`낼 수 있는 카드 ${plays.size}장`);
    return out;
  }
  function deckAct(act, t) {
    const id = t.dataset.id, E = UI.edit;
    const go = scr => { UI.screen = scr; UI.sheet = null; render(); };
    switch (act) {
      case 'home': {
        const dest = UI.returnScreen === 'lobby' && Online && Online.code ? 'lobby' : 'home';
        UI.returnScreen = 'home';
        if (dest === 'lobby') syncLobbySelection(false);
        go(dest);
        return true;
      }
      case 'mode1p': UI.mode = '1p'; saveMode(); render(); return true;
      case 'mode2p': UI.mode = '2p'; saveMode(); render(); return true;
      case 'modeonline': UI.mode = 'online'; UI.onlineErr = ''; saveMode(); if (Online) Online.init(); render(); return true;
      case 'online-create': {
        if (UI.onlineBusy || !Online) return true;
        UI.onlineBusy = true; UI.onlineErr = ''; render();
        Online.createRoom(buildHostLobbyData()).then(() => {
          UI.onlineBusy = false; UI.screen = 'lobby'; UI.returnScreen = 'home'; render();
        }, err => {
          UI.onlineBusy = false; UI.onlineErr = err.message || String(err); render();
        });
        return true;
      }
      case 'online-join': {
        if (UI.onlineBusy || !Online) return true;
        const code = Online.normCode(UI.joinCode);
        if (code.length !== 4) { UI.onlineErr = '4자리 방 코드를 입력해 주세요'; render(); return true; }
        UI.onlineBusy = true; UI.onlineErr = ''; render();
        Online.joinRoom(code, buildGuestLobbyPatch()).then(() => {
          UI.onlineBusy = false; UI.screen = 'lobby'; UI.returnScreen = 'home'; render();
        }, err => {
          UI.onlineBusy = false; UI.onlineErr = err.message || String(err); render();
        });
        return true;
      }
      case 'online-rejoin': {
        if (UI.onlineBusy || !Online) return true;
        const sess = Online.savedSession();
        if (!sess) { render(); return true; }
        UI.onlineBusy = true; UI.onlineErr = ''; render();
        Online.rejoinRoom(sess.code, sess.role, buildGuestLobbyPatch()).then(res => {
          UI.onlineBusy = false;
          if (sess.role === 'host') {
            if (res.hostDoc && res.hostDoc.status === 'playing') {
              let st = res.hostDoc.state;
              if (!st) { try { st = JSON.parse(localStorage.getItem(onlineCkptKey(sess.code)) || 'null'); } catch (e) { st = null; } }
              if (st) return startOnlineHostGame(st, false);
            }
            UI.screen = 'lobby'; render();
          } else {
            if (res.hostDoc && (res.hostDoc.status === 'playing' || res.hostDoc.status === 'over')) applyGuestHostDoc(res.hostDoc);
            else { UI.screen = 'lobby'; render(); }
          }
        }, err => {
          UI.onlineBusy = false; UI.onlineErr = err.message || String(err); Online.clearSession(); render();
        });
        return true;
      }
      case 'online-leave': {
        const isHost = Online && Online.role === 'host';
        if (Online) Online.leaveRoom({ closeIfHost: isHost });
        UI.returnScreen = 'home'; UI.screen = 'home'; render();
        return true;
      }
      case 'online-mydeck': UI.deckSlot = 0; UI.returnScreen = 'lobby'; go('decks'); return true;
      case 'online-villains': UI.returnScreen = 'lobby'; go('villains'); return true;
      case 'online-first': UI.firstPick = id === 'rnd' ? 'rnd' : +id; saveMode(); syncLobbySelection(false); render(); return true;
      case 'online-ready': {
        if (!Online || !Online.code) return true;
        const gd = Online.guestDoc;
        Online.updateGuestLobby(buildGuestLobbyPatch({ ready: !(gd && gd.ready) }));
        return true;
      }
      case 'online-start': {
        if (!Online || Online.role !== 'host') return true;
        const gd = Online.guestDoc;
        if (!gd || !gd.joined || !gd.ready) return true;
        startOnlineHostGame(null, false);
        return true;
      }
      case 'pickfirst': UI.firstPick = id === 'rnd' ? 'rnd' : +id; saveMode(); render(); return true;
      case 'decks': UI.deckSlot = 0; UI.returnScreen = 'home'; go('decks'); return true;
      case 'decks-slot': UI.deckSlot = +id; UI.returnScreen = 'home'; go('decks'); return true;
      case 'villains': UI.returnScreen = 'home'; go('villains'); return true;
      case 'pickscen': if (UI.scen !== id) { UI.scen = id; UI.modular = MC.scenarios[id].defaultModular; if (MC.scenarios[id].hard) UI.expert = true; saveScen(); if (UI.returnScreen === 'lobby') syncLobbySelection(false); } render(); return true;
      case 'pickdiff': UI.expert = id === 'exp'; saveScen(); if (UI.returnScreen === 'lobby') syncLobbySelection(false); render(); return true;
      case 'pickul': UI.underling = id; saveScen(); if (UI.returnScreen === 'lobby') syncLobbySelection(false); render(); return true;
      case 'pickscheme': { const S = MC.scenarios[UI.scen]; UI.schemes = UI.schemes || {};
        if (id === 'default') delete UI.schemes[UI.scen]; else if (id === 'random') UI.schemes[UI.scen] = 'random';
        else { const [i, sid] = id.split(':'); const c = Array.isArray(UI.schemes[UI.scen]) ? UI.schemes[UI.scen].slice() : S.mainOptions.map(st => st[0][0]); c[+i] = sid; UI.schemes[UI.scen] = c; }
        saveScen(); if (UI.returnScreen === 'lobby') syncLobbySelection(false); render(); return true; }
      case 'pickcamp': UI.campaign = id || ''; saveScen(); if (UI.returnScreen === 'lobby') syncLobbySelection(false); render(); return true;
      case 'ctog': { const cid = campaignFor(UI.scen); const L = loadCLogs()[cid] || {}; const k = t.dataset.key; const cur = L[k] ? L[k].split(';') : []; const nx = cur.includes(id) ? cur.filter(x => x !== id) : cur.concat([id]); if (nx.length) L[k] = nx.join(';'); else delete L[k]; saveCLog(cid, L); if (UI.returnScreen === 'lobby') syncLobbySelection(false); render(); return true; }
      case 'crand': { const cid = campaignFor(UI.scen); const L = loadCLogs()[cid] || {}; L[t.dataset.key] = String(Math.floor(Math.random() * 1e9)); saveCLog(cid, L); if (UI.returnScreen === 'lobby') syncLobbySelection(false); render(); return true; }
      case 'cpick': { const cid = campaignFor(UI.scen); UI.cpick = UI.cpick || {}; UI.cpick[id] = campaignRandomPick(cid, id); render(); return true; }
      case 'cclear': { const cid = campaignFor(UI.scen); if (confirm(`${MC.CAMPAIGN_DEFS[cid].name} 캠페인 기록을 모두 지울까요?`)) { saveCLog(cid, null); if (UI.returnScreen === 'lobby') syncLobbySelection(false); render(); } return true; }
      case 'csave': { const g = UI.g; if (g && g.s.campaign) { const all = loadCLogs(); const L = Object.assign({}, all[g.s.campaign.id] || {}, g.s.campaign.log); if (g.s.over === 'win') { g.s.ps.forEach((p, i) => { if (!p.eliminated && p.identity) L[`Player ${i + 1} Remaining hit points`] = String(Math.max(1, g.hpLeft(p.identity))); }); } saveCLog(g.s.campaign.id, L); UI.csaved = true; render(); } return true; }
      case 'pickstd': UI.std2 = id === '3' ? 3 : id === '2'; saveScen(); if (UI.returnScreen === 'lobby') syncLobbySelection(false); render(); return true;
      case 'pickexp': UI.exp2 = id === '2'; saveScen(); if (UI.returnScreen === 'lobby') syncLobbySelection(false); render(); return true;
      case 'pickmod': {
        const max = MC.scenarios[UI.scen].modCount || 1; let cur = MC.modsOf(UI.modular);
        if (max === 1) cur = [id];
        else if (cur.includes(id)) { if (cur.length > 1) cur = cur.filter(k => k !== id); }
        else { cur.push(id); if (cur.length > max) cur.shift(); }
        UI.modular = cur.join('+'); saveScen(); if (UI.returnScreen === 'lobby') syncLobbySelection(false); render(); return true;
      }
      case 'vpack': UI.vpack = id; render(); return true;
      case 'import': UI.sheet = { kind: 'import' }; render(); return true;
      case 'newdeck': UI.sheet = { kind: 'newdeck', hero: Object.keys(MC.heroes)[0] }; render(); return true;
      case 'nd-hero': UI.sheet.hero = id; render(); return true;
      case 'nd-aspect': { const d = Deck.blank(UI.sheet.hero || Object.keys(MC.heroes)[0], id); openEditor(d); UI.edit.dirty = true; render(); return true; }
      case 'nd-starter': openEditor(Deck.starter(UI.sheet.hero || Object.keys(MC.heroes)[0])); return true;
      case 'pickdeck': selectDeck(id); if (UI.returnScreen === 'lobby') syncLobbySelection(true); toast(`「${Store.get(id).name}」 덱을 골랐습니다`); return true;
      case 'editdeck': openEditor(Store.get(id)); return true;
      case 'moredeck': UI.sheet = { kind: 'moredeck', id }; render(); return true;
      case 'dupdeck': { const d = Store.get(id); const c = Deck.copy(d, d.name.replace(/ ?\(.*\)$/, '') + ' 사본'); UI.sheet = null; Store.save(c); toast('덱을 복제했습니다'); return true; }
      case 'exportdeck': UI.sheet = { kind: 'export', id }; render(); return true;
      case 'copyjson': {
        const ta = document.getElementById('exporttext'); const text = ta ? ta.value : '';
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => toast('클립보드에 복사했습니다'), () => { if (ta) { ta.focus(); ta.select(); } toast('자동 복사가 막혀 있습니다. 상자를 길게 눌러 복사하세요'); });
        else { if (ta) { ta.focus(); ta.select(); } toast('상자를 길게 눌러 복사하세요'); }
        return true;
      }
      case 'deldeck': UI.sheet = { kind: 'confirmdel', id }; render(); return true;
      case 'deldeck2': { const name = Store.get(id).name; UI.sheet = null; Store.remove(id); const hs = Object.keys(MC.heroes); if (UI.deckId === id) selectDeck('starter-' + hs[0], 0); if (UI.deckId2 === id) selectDeck('starter-' + (hs[1] || hs[0]), 1); toast(`「${name}」 덱을 삭제했습니다`); return true; }
      case 'doimport': {
        const ta = document.getElementById('importtext'), text = ta ? ta.value.trim() : '';
        MC.loadPacks(MC.allPacks()).then(() => {
          const d = Deck.normalize(text);
          UI.sheet = null; Store.save(d); selectDeck(d.id); toast(`「${d.name}」 덱을 가져왔습니다`);
        }).catch(e => { UI.sheet = { kind: 'import', err: '가져오지 못했습니다: ' + e.message, text }; render(); });
        return true;
      }
      case 'retryload': UI.loadErr = null; if (UI.screen === 'loading') UI.screen = 'home'; render(); return true;
      case 'setasp': {
        const k = id.toLowerCase();
        if (Deck.isDual(E.deck)) { if (k !== E.deck.aspect && k !== E.deck.aspect2) { E.deck.aspect2 = E.deck.aspect; E.deck.aspect = k; } }
        else E.deck.aspect = k;
        E.dirty = true; render(); return true;
      }
      case 'edtab': rememberScroll(); E.tab = id; render(); return true;
      case 'ftype': E.type = id; E.scroll.add = 0; render(); return true;
      case 'fpack': E.pack = id; E.scroll.add = 0; render(); return true;
      case 'inc': rememberScroll(); E.deck.player_deck.push(id); E.dirty = true; render(); return true;
      case 'dec': { rememberScroll(); const i = E.deck.player_deck.lastIndexOf(id); if (i >= 0) E.deck.player_deck.splice(i, 1); E.dirty = true; render(); return true; }
      case 'dropoff': { const al = Deck.aspects(E.deck); E.deck.player_deck = E.deck.player_deck.filter(x => !MC.cards[x] || MC.cards[x].cls === 'Basic' || al.includes(MC.cards[x].cls)); E.dirty = true; render(); return true; }
      case 'edsave': if (E.dirty) saveEdit().then(() => toast('저장했습니다')); return true;
      case 'edback': if (E.dirty) { UI.sheet = { kind: 'leave' }; render(); } else { UI.edit = null; go('decks'); } return true;
      case 'edsave-leave': saveEdit().then(() => { UI.edit = null; go('decks'); toast('저장했습니다'); }); return true;
      case 'edleave': UI.edit = null; go('decks'); return true;
    }
    return false;
  }
  $app.addEventListener('input', ev => {
    if (ev.target.id === 'online-nick' && Online) Online.setNickname(ev.target.value);
    if (ev.target.id === 'join-code') {
      const clean = Online ? Online.normCode(ev.target.value) : ev.target.value.toUpperCase().slice(0, 4);
      UI.joinCode = clean;
      if (ev.target.value !== clean) ev.target.value = clean;
    }
    if (ev.target.id === 'importtext' && UI.sheet && UI.sheet.kind === 'import') UI.sheet.text = ev.target.value;
    if (ev.target.id === 'deckname' && UI.edit) {
      UI.edit.deck.name = ev.target.value;
      if (!UI.edit.dirty) { UI.edit.dirty = true; const b = document.querySelector('[data-act=edsave]'); if (b) b.textContent = '저장'; }
    }
  });
  $app.addEventListener('change', async ev => {
    if (ev.target.id === 'cameo-sel') { UI.cameo = ev.target.value; saveScen(); render(); return; } // Cameo
    if (ev.target.dataset && ev.target.dataset.ckey) { const cid = campaignFor(UI.scen); if (cid) { const L = loadCLogs()[cid] || {}; const v = String(ev.target.value || '').trim(); if (v) L[ev.target.dataset.ckey] = v; else delete L[ev.target.dataset.ckey]; saveCLog(cid, L); } return; }
    if (ev.target.id === 'importfile' && ev.target.files && ev.target.files[0]) {
      const text = await ev.target.files[0].text();
      const ta = document.getElementById('importtext'); if (ta) ta.value = text;
      if (UI.sheet && UI.sheet.kind === 'import') UI.sheet.text = text;
    }
  });
  // long press → zoom (or peek hand on collapsed hero strip)
  let lp = null, sx = 0, sy = 0;
  $app.addEventListener('pointerdown', ev => {
    if (UI.overlay && ev.target.closest('.reveal') && !ev.target.closest('.btn')) { holdOverlay(); return; }
    const strip = ev.target.closest('[data-peekp]');
    if (strip && UI.g) {
      const pi = +strip.dataset.peekp;
      sx = ev.clientX; sy = ev.clientY;
      clearTimeout(lp);
      lp = setTimeout(() => { UI.suppressClick = true; UI.sheet = { kind: 'peekhand', pi }; render(); setTimeout(() => { UI.suppressClick = false; }, 600); }, 450);
      return;
    }
    const t = ev.target.closest('[data-uid],[data-zoom],[data-zoomid]');
    if (!t) return;
    const zid = t.dataset.zoomid;
    if (!zid && !UI.g) return;
    const zuid = t.dataset.uid || t.dataset.zoom;
    sx = ev.clientX; sy = ev.clientY;
    clearTimeout(lp);
    lp = setTimeout(() => { UI.suppressClick = true; UI.sheet = zid ? { kind: 'cardId', id: zid } : { kind: 'card', uid: zuid, zoomOnly: true }; render(); setTimeout(() => { UI.suppressClick = false; }, 600); }, 450);
  });
  window.addEventListener('resize', () => { if (UI.g && UI.g.players > 1) schedule(); });
  $app.addEventListener('pointermove', ev => { if (lp && (Math.abs(ev.clientX - sx) > 8 || Math.abs(ev.clientY - sy) > 8)) { clearTimeout(lp); lp = null; } });
  ['pointerup', 'pointercancel'].forEach(n => $app.addEventListener(n, () => { clearTimeout(lp); lp = null; }));
  ['pointerup', 'pointercancel', 'touchend', 'touchcancel', 'blur'].forEach(n => window.addEventListener(n, releaseOverlay));
  document.addEventListener('visibilitychange', () => { if (document.hidden) releaseOverlay(); });
  $app.addEventListener('contextmenu', ev => ev.preventDefault());
  $app.addEventListener('keydown', ev => { if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.dataset && ev.target.dataset.uid) { ev.preventDefault(); tapCard(ev.target.dataset.uid); } });

  // keep the game across a republish of the page, then boot
  if (window.claude && window.claude.hot && window.claude.hot.snapshot) window.claude.hot.snapshot(() => ({ save: UI.lastSnap || null }));
  // don't re-render under someone typing (it would drop focus); catch up when they leave the field
  Store.onChange(() => {
    if (UI.g) return;
    const a = document.activeElement;
    if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA')) { UI.needRender = true; return; }
    render();
  });
  $app.addEventListener('focusout', () => { if (UI.needRender) { UI.needRender = false; setTimeout(render, 0); } });
  Store.init();
  if (Online) {
    let lastShownOnlineErr = '';
    Online.onChange(() => {
      if (Online.error && Online.error !== lastShownOnlineErr) {
        lastShownOnlineErr = Online.error;
        if (UI.g) toast(Online.error);
      } else if (!Online.error) {
        lastShownOnlineErr = '';
      }
      if (Online.role === 'guest' && Online.hostDoc && (UI.screen === 'lobby' || UI.screen === 'game' || UI.screen === 'loading')) {
        const hd = Online.hostDoc;
        const skey = `${hd.seq}:${hd.status}:${hd.gameId}:${hd.pendingAsk && hd.pendingAsk.id}:${hd.showEv && hd.showEv.id}`;
        if (skey !== UI.online.lastHostSyncKey) {
          UI.online.lastHostSyncKey = skey;
          applyGuestHostDoc(hd);
          return;
        }
      }
      if (!UI.g && (UI.screen === 'lobby' || (UI.screen === 'home' && UI.mode === 'online'))) {
        const a = document.activeElement;
        if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA')) { UI.needRender = true; return; }
        render();
      }
    });
    Online.init();
  }
  function boot(data) {
    if (data && data.save) startGame(data.save);
    else render();
  }
  if (window.claude && window.claude.hot && window.claude.hot.ready) window.claude.hot.ready(boot);
  else boot((window.claude && window.claude.hot && window.claude.hot.data) || {});
  window.__MCUI = UI;
})();
