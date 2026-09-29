import type { RiderMissionStage } from "@/types/rider";
import styles from "./rider-os.module.css";

export function RiderMap({ stage, idle = false }: { stage: RiderMissionStage; idle?: boolean }) {
  const delivery = ["picked_up", "to_customer", "arrived_customer", "handoff", "delivered"].includes(stage);
  const arrived = ["arrived_customer", "handoff", "delivered"].includes(stage);
  const atKitchen = stage === "at_kitchen" || stage === "picked_up";
  const x = arrived ? 320 : atKitchen ? 130 : stage === "to_customer" ? 215 : stage === "to_kitchen" ? 130 : 78;
  const y = arrived ? 116 : atKitchen ? 192 : stage === "to_customer" ? 192 : stage === "to_kitchen" ? 272 : 334;
  return <svg className={styles.map} viewBox="0 0 390 410" preserveAspectRatio="xMidYMid meet" role="img" aria-label={idle ? "Illustrative Vijay Nagar neighbourhood showing Ravi’s location" : delivery ? "Illustrative route from Go Serve Vijay Nagar to Aarav at Narmada Residency" : "Illustrative Vijay Nagar route showing Ravi approaching the Go Serve kitchen"}>
    <rect width="390" height="410" fill="#e9e8dc" />
    <g fill="#dedfd2" stroke="#d5d8ca" strokeWidth="1">
      <path d="M-10 40H96V126H-10ZM155 38H264V126H155ZM310 40H402V72H310ZM-10 161H88V242H-10ZM168 225H260V300H168ZM-10 278H45V384H-10ZM109 330H260V420H109ZM303 231H400V374H303" />
      <path d="M170 153H255V171H170ZM316 147H400V188H316" />
    </g>
    <path d="M285 -20V450M-20 192H420M130 -20V305L76 350V450M-20 142H390M-20 315H390M-20 14H420" stroke="#faf9f2" strokeWidth="24" fill="none" />
    <path d="M285 -20V450M-20 192H420" stroke="#d5d3c6" strokeWidth="1" fill="none" />
    <path d="M177 48H246V112H177Z" fill="#cad7bc" />
    <g fill="#526353" fontFamily="inherit" fontSize="9" letterSpacing="1"><text x="181" y="80">NEHRU</text><text x="188" y="93">GARDEN</text><text x="14" y="184">5TH MAIN</text><text x="297" y="295" transform="rotate(-90 297 295)">SCHEME 54 ROAD</text></g>
    {!idle && stage !== "delivered" && <path d={delivery ? "M130 192H285V116H320" : "M78 334L130 290V192"} stroke="#f9faf2" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />}
    <path d={delivery ? "M130 192H285V116H320" : "M78 334L130 290V192"} stroke="#24563e" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <g transform="translate(130 192)"><rect x="-18" y="-18" width="36" height="36" rx="10" fill="#153e2d" stroke="#faf9f2" strokeWidth="3" /><text y="7" textAnchor="middle" fill="#fcfbf6" fontFamily="inherit" fontSize="24" fontWeight="700">g.</text></g>
    <g fill="#193b2b" fontFamily="inherit" fontSize="11" fontWeight="650"><text x="153" y="214">GO SERVE</text></g>
    {delivery && <g transform="translate(320 116)"><circle r="17" fill="#faf9f2" stroke="#24563e" strokeWidth="2" /><path d="m-8 0 8-7 8 7M-6-1v9H6V-1M-2 8V2h4v6" fill="none" stroke="#24563e" strokeWidth="1.8" /><text x="-7" y="-27" textAnchor="middle" fill="#193b2b" fontFamily="inherit" fontSize="11" fontWeight="600">AARAV</text></g>}
    <g className={styles.riderMarker} style={{ transform: `translate(${x}px, ${y}px)` }}><circle r="22" fill="#24563e" opacity=".1" /><circle r="13" fill="#faf9f2" stroke="#24563e" strokeWidth="2" /><path d="m0-8 6 14-6-3-6 3z" fill="#24563e" /></g>
    <text x="22" y="388" fill="#626d5f" fontFamily="inherit" fontSize="9" letterSpacing="1">ILLUSTRATIVE ROUTE · DEMO</text>
    <g transform="translate(350 355)" fill="#536450" fontFamily="inherit" fontSize="10"><path d="M0 12V-5m-4 5 4-5 4 5" stroke="currentColor" fill="none" /><text x="-4" y="-12">N</text></g>
  </svg>;
}
