const SKIN = "#e8b48a", HAIR = "#3a2a1e", SHIRT_BASE = "#5c5678", PANTS = "#2c2a3a";
const BASE_BODY = [
  [0,0,1,1,1,1,1,1,0,0], [0,1,2,2,2,2,2,2,1,0], [0,1,2,3,2,2,3,2,1,0], [0,0,1,2,2,2,2,1,0,0],
  [0,0,0,4,4,4,4,0,0,0], [0,0,4,5,5,5,5,4,0,0], [0,0,4,5,5,5,5,4,0,0], [0,0,4,5,5,5,5,4,0,0],
  [0,0,0,5,5,5,5,0,0,0], [0,0,0,6,6,6,6,0,0,0], [0,0,0,6,0,0,6,0,0,0], [0,0,0,6,0,0,6,0,0,0],
  [0,0,0,6,0,0,6,0,0,0], [0,0,6,6,0,0,6,6,0,0],
];
const PALETTE = { 1: HAIR, 2: SKIN, 3: "#1d1a26", 4: HAIR, 5: SHIRT_BASE, 6: PANTS };
const WEAPON_OVERLAYS = {
  Warrior: { color: "#c8ccd6", cells: [[3,8],[4,9],[5,9],[6,8],[7,7]] },
  Mage: { color: "#8b6f47", cells: [[2,1],[3,1],[4,1],[5,1],[6,1],[7,1]] },
  Rogue: { color: "#8a8f9c", cells: [[5,8],[6,9]] },
  Healer: { color: "#e0e0e0", cells: [[2,1],[3,1],[4,1],[5,1],[3,0],[3,2]] },
};
const PET_BODY = [[0,1,1,0],[1,1,1,1],[1,2,2,1],[0,1,1,0]];

function PixelGrid({ data, palette, cell = 6, overlay }) {
  const cols = data[0].length;
  const rows = data.length;
  return (
    <svg width={cols * cell} height={rows * cell} viewBox={`0 0 ${cols * cell} ${rows * cell}`}>
      {data.flatMap((row, r) => row.map((v, cIdx) => (
        v ? <rect key={`${r}-${cIdx}`} x={cIdx * cell} y={r * cell} width={cell} height={cell} fill={palette[v]} /> : null
      )))}
      {overlay?.cells.map(([r, cIdx], i) => (
        <rect key={`o-${i}`} x={cIdx * cell} y={r * cell} width={cell} height={cell} fill={overlay.color} />
      ))}
    </svg>
  );
}

export function CharacterSprite({ cls, equipWeapon, equipPet, frameSize = 96 }) {
  const bodyRows = 14;
  const cell = Math.floor((frameSize * 0.68) / bodyRows);
  const weapon = equipWeapon ? WEAPON_OVERLAYS[cls] : null;
  const petCell = Math.max(3, Math.floor(cell * 0.85));
  return (
    <div style={{ position: "relative", width: frameSize, height: frameSize }}>
      <div style={{ position: "absolute", left: "50%", top: "44%", transform: "translate(-50%, -50%)" }}>
        <PixelGrid data={BASE_BODY} palette={PALETTE} cell={cell} overlay={weapon} />
        {equipPet && (
          <div style={{ position: "absolute", bottom: -cell * 1.5, left: -cell * 2.2 }}>
            <PixelGrid data={PET_BODY} palette={{ 1: "#b0885a", 2: "#1d1a26" }} cell={petCell * 0.94} />
          </div>
        )}
      </div>
    </div>
  );
}
