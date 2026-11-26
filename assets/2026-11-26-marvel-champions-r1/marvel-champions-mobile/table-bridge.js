/* Table integration only. Card rules, assets, controls and original saves stay intact. */
(function () {
  'use strict';
  let H, storage;
  try { if (parent === window) return; H = parent.GameHistory; storage = parent.localStorage; } catch (_) { return; }
  if (!H || !window.MC?.Game) return;
  const Game = MC.Game, META = 'tableMatchRecord', now = () => new Date().toISOString();
  function metadata(g, fresh) {
    if (g.s[META]?.version === 1) return g.s[META];
    return g.s[META] = { version: 1, id: 'marvelchampions-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10), startedAt: fresh ? now() : null, full: fresh, turns: 0, playerTurns: g.s.ps.map(() => 0), seen: {} };
  }
  function markTurn(g) {
    const m = metadata(g, false), key = g.s.round + ':' + g.s.ctx;
    if (m.seen[key]) return;
    m.seen[key] = true; m.turns++; m.playerTurns[g.s.ctx]++;
  }
  function complete(g) {
    if (!['win', 'lose'].includes(g.s.over)) return;
    try {
      const m = metadata(g, false), endedAt = m.endedAt || (m.endedAt = now()), s = g.s;
      const add = (label, value) => ({ label, value: String(value || '없음') });
      const settings = [add('빌런 시나리오', MC.scenarios[s.scen.key]?.name || s.scen.key), add('난이도', s.scen.expert ? '숙련' : '표준'), add('모듈 조우 세트', MC.modsOf(s.scen.modular).map(k => MC.modulars[k]?.name || k).join(' · ')), add('진행 라운드', s.round)];
      if (s.campaign?.id) settings.push(add('캠페인', MC.CAMPAIGNS?.[s.campaign.id]?.name || s.campaign.id));
      if (s.scen.std2) settings.push(add('표준 조우 세트', s.scen.std2 === 3 ? 'III' : 'II'));
      if (s.scen.exp2) settings.push(add('숙련 조우 세트', 'II'));
      const record = { version: 1, id: m.id, game: 'marvelchampions', gameName: '마블 챔피언스', startedAt: m.startedAt, endedAt, recordedAt: now(), turns: m.full ? m.turns : null, turnUnit: '플레이어 턴', turnsExact: !!m.full, scoreLabel: '협력 게임 · 점수 없음', players: s.ps.map((p, id) => ({ id, name: MC.heroes[p.heroKey]?.name || g.playerName(id), isAI: false, difficulty: null, score: null, winner: s.over === 'win', turns: m.full ? m.playerTurns[id] : null, details: [add('덱', p.deckName), add('히어로 상태', p.eliminated ? '탈락' : '생존')] })), settings, outcome: s.over === 'win' ? '승리' : '패배', reason: String(s.overReason || ''), durationMs: m.startedAt ? Math.max(0, Date.parse(endedAt) - Date.parse(m.startedAt)) : null };
      const doc = JSON.parse(storage.getItem(H.KEY) || 'null');
      if (doc?.deleted?.includes(m.id)) return;
      const records = H.read(storage), at = records.findIndex(r => r.id === m.id);
      if (at >= 0) record.recordedAt = records[at].recordedAt;
      if (at >= 0) records[at] = record; else records.push(record);
      H.write(storage, records);
    } catch (error) { console.warn('Table 완료 기록을 저장하지 못했습니다.', error); }
  }
  function wrap(io) {
    const wrapped = Object.create(io);
    wrapped.gameOver = function (g) { complete(g); return io.gameOver?.call(io, g); };
    return wrapped;
  }
  for (const method of ['create', 'restore']) {
    const original = Game[method];
    Game[method] = function (io, ...args) { const g = original.call(this, wrap(io), ...args); metadata(g, method === 'create'); return g; };
  }
  const playerTurn = Game.prototype.playerTurn;
  Game.prototype.playerTurn = function (...args) { markTurn(this); return playerTurn.apply(this, args); };
})();
