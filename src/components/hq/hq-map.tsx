import { hqLandmarks, hqRiderPositions } from "@/data/demo-hq";
import type { selectHQ } from "@/lib/hq-selectors";
import styles from "./hq-operations.module.css";

export function HQMap({ data, onOrder, onKitchen, onRider }: { data: ReturnType<typeof selectHQ>; onOrder: () => void; onKitchen: () => void; onRider: (id: string) => void }) {
  const stage = data.hero.stage;
  const delivered = stage === "Delivered";
  const customerLeg = ["Picked up", "Delivering", "At customer", "Delivered"].includes(stage);
  const ravi = data.riders.find(rider => rider.id === "ravi");
  const raviPosition = delivered || stage === "At customer" ? [565, 153] : customerLeg ? [423, 170] : ravi?.displayState === "Waiting at kitchen" ? [300, 222] : [215, 270];
  return <div className={styles.mapCanvas}>
    <svg viewBox="0 0 660 350" role="img" aria-label="Illustrative Vijay Nagar operating area: kitchen, rider sample, customer destinations and GS-2847 route" preserveAspectRatio="none">
      <rect width="660" height="350" fill="#141c17" />
      <g fill="#1b2820"><path d="M40 28h130v87H40ZM218 34h113v95H218ZM377 24h120v102H377ZM552 38h98v90H552ZM36 171h135v109H36ZM359 226h112v96H359ZM548 219h95v102H548Z" /></g>
      <g fill="none" stroke="#2b3a2e" strokeWidth="14"><path d="M0 151H660M0 310H660M193 0V350M343 0V350M515 0V350M0 205H343M277 0V151" /></g>
      <path d="M43 35Q297-38 575 44Q684 191 603 309Q278 398 37 292Q-12 157 43 35Z" fill="none" stroke="#4c6452" strokeDasharray="4 7" />
      <path d="M395 41h79v65h-79Z" fill="#293f2c" />
      <g fill="#a0afa0" fontFamily="inherit" fontSize="9" letterSpacing="1.1">{hqLandmarks.map(landmark => <text x={landmark.x} y={landmark.y} key={landmark.label}>{landmark.label}</text>)}<text x="361" y="146">5TH MAIN</text><text x="25" y="335">ILLUSTRATIVE GEOGRAPHY</text></g>
      {data.hero.active && <path d={customerLeg ? "M280 205H343V151H515V110H535" : "M215 270V205H280"} fill="none" stroke="#b4d5be" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />}
      <g fill="#718775"><circle cx="130" cy="84" r="3" /><circle cx="415" cy="260" r="3" /><circle cx="586" cy="260" r="3" /></g>
    </svg>
    <button className={styles.kitchenPin} style={{ left: `${280 / 660 * 100}%`, top: `${205 / 350 * 100}%` }} onClick={onKitchen} aria-label="Map: GO SERVE Vijay Nagar"><span>g.</span><small>GO SERVE</small></button>
    <button className={styles.customerPin} style={{ left: `${535 / 660 * 100}%`, top: `${110 / 350 * 100}%` }} onClick={onOrder} aria-label="Map: Aarav, GS-2847"><span>⌂</span><small>AARAV</small></button>
    {data.riders.map(rider => { const position = rider.id === "ravi" ? raviPosition : hqRiderPositions[rider.id]; return <button key={rider.id} className={`${styles.riderPin} ${rider.id === "ravi" ? styles.raviPin : ""}`} style={{ left: `${position[0] / 660 * 100}%`, top: `${position[1] / 350 * 100}%` }} onClick={() => onRider(rider.id)} aria-label={`Map rider: ${rider.name}, ${rider.displayState}`}><i />{rider.id === "ravi" && <small>RAVI</small>}</button>; })}
    <button className={styles.mapOrder} onClick={onOrder}><span>GS-2847</span><span>{data.hero.stage} ↗</span></button>
  </div>;
}
