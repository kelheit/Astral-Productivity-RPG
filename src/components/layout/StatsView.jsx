import { Sword, Sparkles, Zap, Heart, Trophy, ChevronRight } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { Panel } from "../ui/Panel";
import { Bar } from "../ui/Bar";
import { SectionHead } from "../ui/SectionHead";
import { ActivityRing } from "../ui/ActivityRing";
import { CharacterSprite } from "../ui/CharacterSprite";
import { STAT_META, STAT_COLOR, CLASSES, STAT_CAP } from "../../constants/gameData";

const CLASS_ICONS = { Warrior: Sword, Mage: Sparkles, Rogue: Zap, Healer: Heart };

export function StatsView({ user, setUser, dailies, todos, equipWeapon, setEquipWeapon, equipPet, setEquipPet }) {
  const { theme: c } = useTheme();
  const cls = CLASSES[user.class];

  const allocate = (stat) => {
    setUser(prev => {
      const amt = prev.pending[stat];
      if (!amt) return prev;
      return { ...prev, stats: { ...prev.stats, [stat]: Math.min(STAT_CAP, prev.stats[stat] + amt) }, pending: { ...prev.pending, [stat]: 0 } };
    });
  };

  const rebirth = (stat) => {
    setUser(prev => ({ ...prev, stats: { ...prev.stats, [stat]: 0 }, gold: prev.gold + 500, gems: prev.gems + 5 }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionHead title="Stats" sub="Allocate pending points. Prestige a stat at 10,000." />

      <Panel style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{ width: 200, height: 200, background: c.raise, border: `2px solid ${c.border}`, position: "relative" }}>
          <CharacterSprite cls={user.class} equipWeapon={equipWeapon} equipPet={equipPet} frameSize={200} />
          <div style={{ position: "absolute", bottom: 4, right: 4, fontSize: 8, color: c.textFaint, fontFamily: "'JetBrains Mono', monospace" }}>PORTRAIT</div>
        </div>
        <div style={{ fontSize: 11, color: c.textFaint, textAlign: "center", maxWidth: 320 }}>Custom photo upload coming later — this frame is sized to swap in a real portrait.</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setEquipWeapon(v => !v)}
            aria-label={equipWeapon ? "Unequip weapon" : "Equip weapon"}
            style={{ background: equipWeapon ? cls.color + "22" : "transparent", border: `1px solid ${equipWeapon ? cls.color : c.border}`, color: equipWeapon ? cls.color : c.textMuted, fontSize: 11, padding: "6px 10px", cursor: "pointer", borderRadius: 4 }}
          >
            {equipWeapon ? "Unequip weapon" : "Equip weapon"}
          </button>
          <button
            onClick={() => setEquipPet(v => !v)}
            aria-label={equipPet ? "Unequip pet" : "Equip pet"}
            style={{ background: equipPet ? c.teal + "22" : "transparent", border: `1px solid ${equipPet ? c.teal : c.border}`, color: equipPet ? c.teal : c.textMuted, fontSize: 11, padding: "6px 10px", cursor: "pointer", borderRadius: 4 }}
          >
            {equipPet ? "Unequip pet" : "Equip pet"}
          </button>
        </div>
      </Panel>

      <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
        {Object.entries(CLASSES).map(([name, meta]) => {
          const Icon = CLASS_ICONS[name];
          const active = user.class === name;
          return (
            <button
              key={name}
              onClick={() => setUser(prev => ({ ...prev, class: name }))}
              aria-pressed={active}
              style={{ flex: "0 0 auto", display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: active ? meta.color + "22" : "transparent", border: `1px solid ${active ? meta.color : c.border}`, color: active ? meta.color : c.textMuted, fontSize: 12, cursor: "pointer", borderRadius: 4 }}
            >
              <Icon size={13} /> {name}
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
        {Object.keys(STAT_META).map(stat => {
          const meta = STAT_META[stat];
          const Icon = CLASS_ICONS[stat] || Heart;
          const val = user.stats[stat];
          const pend = user.pending[stat];
          const canRebirth = val >= STAT_CAP;
          return (
            <Panel key={stat} style={{ padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon size={16} color={STAT_COLOR[stat]} />
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{meta.name}</span>
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: c.textMuted }}>{val.toLocaleString()} / {STAT_CAP.toLocaleString()}</span>
              </div>
              <Bar value={val} max={STAT_CAP} color={STAT_COLOR[stat]} height={8} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                <span style={{ fontSize: 11, color: c.textMuted }}>{pend > 0 ? `+${pend} pending` : "No pending points"}</span>
                {canRebirth ? (
                  <button
                    onClick={() => rebirth(stat)}
                    aria-label={`Rebirth ${stat}`}
                    style={{ background: c.gold + "22", border: `1px solid ${c.gold}`, color: c.gold, fontSize: 11, padding: "5px 10px", display: "flex", alignItems: "center", gap: 4, cursor: "pointer", borderRadius: 4 }}
                  >
                    <Trophy size={12} /> Rebirth
                  </button>
                ) : (
                  <button
                    disabled={!pend}
                    onClick={() => allocate(stat)}
                    aria-label={`Allocate ${pend} pending ${stat} points`}
                    style={{ background: pend ? c.raise : "transparent", border: `1px solid ${pend ? c.border : c.borderSoft}`, color: pend ? c.text : c.textFaint, fontSize: 11, padding: "5px 10px", display: "flex", alignItems: "center", gap: 4, opacity: pend ? 1 : 0.5, cursor: pend ? "pointer" : "not-allowed", borderRadius: 4 }}
                  >
                    <ChevronRight size={12} /> Allocate
                  </button>
                )}
              </div>
            </Panel>
          );
        })}
      </div>

      <SectionHead title="Ecosystem" sub="Today's completion, at a glance." />
      <Panel style={{ padding: 20, display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 16 }}>
        <ActivityRing pct={dailies.filter(d => d.done).length / dailies.length} color={c.success} size={92} stroke={9}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700 }}>{dailies.filter(d => d.done).length}/{dailies.length}</span>
          <span style={{ fontSize: 9, color: c.textMuted }}>DAILIES</span>
        </ActivityRing>
        <ActivityRing pct={todos.filter(t => t.done).length / todos.length} color={c.teal} size={92} stroke={9}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700 }}>{todos.filter(t => t.done).length}/{todos.length}</span>
          <span style={{ fontSize: 9, color: c.textMuted }}>TO-DO'S</span>
        </ActivityRing>
        <ActivityRing pct={Math.min(1, user.streak / 30)} color={c.gold} size={92} stroke={9}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700 }}>{user.streak}</span>
          <span style={{ fontSize: 9, color: c.textMuted }}>STREAK</span>
        </ActivityRing>
      </Panel>

      <Panel style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Life goal — Learn Spanish</span>
          <span style={{ fontSize: 11, color: c.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>62%</span>
        </div>
        <Bar value={62} max={100} color={c.teal} height={8} />
      </Panel>
    </div>
  );
}
