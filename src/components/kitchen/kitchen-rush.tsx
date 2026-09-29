"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useDemo } from "@/context/demo-provider";
import { coordinationInventory } from "@/lib/coordination";
import { intelligenceScenarios } from "@/types/intelligence";
import { demoMenu } from "@/data/demo-menu";
import { HERO_RIDER_RELEASE_SECONDS, HERO_RIDER_TRAVEL_SECONDS, KITCHEN_EPOCH } from "@/data/demo-kitchen";
import { ACTION_LABELS, clockDuration, getKitchenJobs, jobRisk, kitchenCounts, kitchenTime, remainingTime } from "@/lib/kitchen-rush";
import { formatDuration, formatMoney, formatPercentage } from "@/lib/format";
import type { KitchenJob } from "@/types/kitchen";
import styles from "./kitchen-rush.module.css";

const dishName = (job: KitchenJob) => demoMenu.find(item => item.id === job.menuItemId)?.name ?? "Kitchen order";
const stageName = (job: KitchenJob) => job.stage.toLowerCase().replaceAll("_", " ");
function Arrow({ diagonal = false }: { diagonal?: boolean }) { return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{diagonal ? <path d="M6 18 18 6M6 6h12v12" /> : <path d="M4 12h16m-6-6 6 6-6 6" />}</svg>; }
function CloseIcon() { return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="m6 6 12 12M6 18 18 6" /></svg>; }
function Progress({ value, label, risk = "healthy" }: { value: number; label: string; risk?: string }) { return <div className={`${styles.track} ${risk === "attention" ? styles.attentionTrack : risk === "late" ? styles.lateTrack : ""}`} role="progressbar" aria-label={label} aria-valuenow={Math.round(Math.min(100, Math.max(0, value)))} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>; }

export function KitchenRush() {
  const demo = useDemo();
  const { kitchenState, advanceKitchenJob, networkMetrics } = demo;
  const rush = kitchenState.rush;
  const [workTab, setWorkTab] = useState<"PREPARING" | "FINISHING">("PREPARING");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [lockAction, setLockAction] = useState(false);
  const [alertAcknowledged, setAlertAcknowledged] = useState(false);
  const details = useRef<HTMLDialogElement>(null);
  const stockDialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const actionLock = useRef(false);
  const nextActionButton = useRef<HTMLButtonElement>(null);
  const detailActionButton = useRef<HTMLButtonElement>(null);
  const detailCloseButton = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<"next" | "detail" | null>(null);
  const unlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { if (!rush) { setSelectedId(null); setWorkTab("PREPARING"); setAlertAcknowledged(false); setAnnouncement(""); details.current?.close(); stockDialog.current?.close(); } }, [rush]);
  useEffect(() => () => { if (unlockTimer.current) clearTimeout(unlockTimer.current); }, []);

  // Route entry is observational; only explicit controls start a canonical order.
  const jobs = getKitchenJobs(demo);
  const elapsed = rush?.elapsedSeconds ?? 0;
  const counts = kitchenCounts(jobs);
  const queued = jobs.filter(job => job.stage === "QUEUED");
  const next = queued[0];
  const working = jobs.filter(job => workTab === "PREPARING" ? job.stage === "PREPARING" : ["ASSEMBLING", "PACKING"].includes(job.stage));
  const ready = jobs.filter(job => job.stage === "READY");
  const selected = jobs.find(job => job.id === selectedId);
  const hero = jobs.find(job => job.id === "GS-2847");
  const mint = coordinationInventory(demo).find(item => item.id === "mint");
  const lateCount = jobs.filter(job => jobRisk(job, elapsed) === "late").length;
  const hotLoad = Math.min(98, 72 + (counts.preparing - 6) * 8);
  const loads = [{ name: "HOT", value: hotLoad }, { name: "ASSEMBLY", value: Math.min(98, 24 * jobs.filter(job => job.stage === "ASSEMBLING").length) }, { name: "PACK", value: Math.min(98, Math.round(30.5 * jobs.filter(job => job.stage === "PACKING").length)) }, { name: "HANDOFF", value: Math.min(98, counts.ready * 11) }];
  const showDetails = (job: KitchenJob) => { returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; setSelectedId(job.id); details.current?.showModal(); };
  const act = (job: KitchenJob) => {
    if (actionLock.current || !ACTION_LABELS[job.stage]) return;
    actionLock.current = true; setLockAction(true);
    pendingFocus.current = details.current?.open ? "detail" : "next";
    advanceKitchenJob(job.id, job.stage);
    const label = job.stage === "QUEUED" ? "preparing" : job.stage === "PREPARING" ? "assembling" : job.stage === "ASSEMBLING" ? "packing" : "ready for handoff";
    setAnnouncement(`${job.id} is ${label}.`);
    if (job.stage === "QUEUED") setWorkTab("PREPARING");
    if (job.stage === "PREPARING" || job.stage === "ASSEMBLING") setWorkTab("FINISHING");
    unlockTimer.current = setTimeout(() => { actionLock.current = false; setLockAction(false); }, 350);
  };
  const nextFinish = next ? elapsed + next.prepSeconds : elapsed;
  const waitSeconds = next ? Math.max(0, nextFinish - next.riderArrivalAtSecond) : 0;
  const closeDetails = () => { details.current?.close(); };
  const restoreSurfaceFocus = () => { if (returnFocus.current?.isConnected) returnFocus.current.focus({ preventScroll: true }); else nextActionButton.current?.focus({ preventScroll: true }); };
  useEffect(() => { if (selectedId && details.current?.open) detailCloseButton.current?.focus({ preventScroll: true }); }, [selectedId]);
  useEffect(() => {
    if (lockAction || !pendingFocus.current) return;
    if (pendingFocus.current === "detail") (detailActionButton.current ?? detailCloseButton.current)?.focus({ preventScroll: true });
    else nextActionButton.current?.focus({ preventScroll: true });
    pendingFocus.current = null;
  }, [lockAction, next?.id, selected?.stage]);

  return <div className={styles.kitchen}>
    <header className={styles.header}>
      <Link className={styles.brand} href="/" aria-label="GO SERVE entry"><span className={styles.brandMark}>g<span>.</span></span><span>GO SERVE<span className={styles.productName}>KITCHEN OS</span></span></Link>
      <div className={styles.location}><span>VIJAY NAGAR</span><span>Indore · Friday</span></div>
      <div className={styles.clock}><time dateTime={kitchenTime(elapsed, true)}>{kitchenTime(elapsed)}<span>:{String((3 + elapsed) % 60).padStart(2, "0")}</span></time><span className={styles.clockCaption}>DINNER RUSH</span></div>
      <div className={styles.networkStatus}><span className={lateCount ? styles.riskText : styles.healthy}><i />{lateCount ? `${lateCount} past promise` : "Healthy"}</span><span><strong>{counts.active}</strong> active</span><span><strong>{formatPercentage(networkMetrics.sla)}</strong> SLA</span></div><span className={styles.demoLabel}>SIMULATED</span>
    </header>

    <div className={styles.navBar}><nav aria-label="Kitchen navigation"><button aria-current="page">Rush</button><button disabled>Orders</button><button disabled>Inventory</button><button disabled>Menu</button><button disabled>Team</button></nav><div className={styles.flow} aria-label="Kitchen workflow"><span><b>{counts.queued}</b> queued</span><span aria-hidden="true">—</span><span><b>{counts.preparing}</b> preparing</span><span aria-hidden="true">—</span><span><b>{counts.finishing}</b> finishing</span><span aria-hidden="true">—</span><span><b>{counts.ready}</b> ready</span></div></div>

    <main id="main" className={styles.main}>
      <div className={styles.workspace}>
        <section className={styles.nextSection} aria-labelledby="next-label"><div className={styles.sectionHeading}><h1 id="next-label">NEXT</h1><span>{next ? "Ideal start window" : "Queue clear"}</span></div>
          {next ? <div className={styles.nextContent} key={next.id}>
            <button className={styles.heroOrder} onClick={() => showDetails(next)} aria-label={`Open ${next.id} details`}><span>{next.id}</span><Arrow diagonal /></button>
            <h2 className={styles.heroDish}>{dishName(next)} <span>×{next.quantity}</span></h2><p className={styles.modifiers}>{next.note}</p>
            <div className={styles.prepRider}><div><span className={styles.overline}>PREP TARGET</span><strong>{clockDuration(next.prepSeconds)}<small>min</small></strong></div><div className={styles.riderBlock}><span className={styles.overline}>EXPECTED RIDER</span><strong>{next.riderName}</strong><span>{next.id === "GS-2847" ? "4:12 travel · staged for pickup" : `${clockDuration(Math.max(0, next.riderArrivalAtSecond - elapsed))} to kitchen`}</span></div></div>
            <button ref={nextActionButton} className={styles.startButton} onClick={() => act(next)} disabled={lockAction} aria-label={`Start now ${next.id}`}><span>START NOW</span><Arrow /></button>
            <p className={styles.nextReason}>{next.id === "GS-2847" ? "Ravi’s pickup window aligns with this cook." : "Start the next cook. Keep the line moving."}</p>
            <div className={styles.sync}><div className={styles.syncHeading}><span>HANDOFF TARGET <b>{kitchenTime(Math.max(nextFinish, next.riderArrivalAtSecond))}</b></span><span>{waitSeconds ? `${waitSeconds}s rider wait` : next.riderArrivalAtSecond > nextFinish ? `${next.riderArrivalAtSecond - nextFinish}s food hold` : "In sync"}</span></div><div className={styles.syncLine}><span>Food</span><div><i style={{ width: "100%" }} /></div><time>{kitchenTime(nextFinish, true)}</time></div><div className={styles.syncLine}><span>Rider</span><div><i style={{ width: `${Math.min(100, Math.max(2, (next.riderArrivalAtSecond - elapsed) / next.prepSeconds * 100))}%` }} /></div><time>{kitchenTime(next.riderArrivalAtSecond, true)}</time></div></div>
          </div> : <div className={styles.queueClear}><span>All started.</span><p>Keep the active work moving toward handoff.</p></div>}
        </section>

        <section className={styles.handoffSection} aria-labelledby="handoff-heading"><div className={styles.sectionHeading}><h2 id="handoff-heading">HANDOFF</h2></div><div className={styles.readyCount}><strong>{String(counts.ready).padStart(2, "0")}</strong><span>ready<br />for pickup</span></div><div className={styles.readyList}>{ready.map(job => <button className={styles.readyRow} key={job.id} onClick={() => showDetails(job)} aria-label={`Open ready order ${job.id}`}><span className={styles.readyOrder}>{job.id}<Arrow diagonal /></span><span className={styles.readyRider}>{job.riderName}</span><span className={job.riderArrivalAtSecond <= elapsed ? styles.healthy : styles.muted}>{job.riderArrivalAtSecond <= elapsed ? "Rider outside" : `Arriving · ${clockDuration(job.riderArrivalAtSecond - elapsed)}`}{job.bay && <span> · Bay {job.bay}</span>}</span></button>)}</div><p className={styles.handoffNote}>Check the order number<br />before handing over.</p></section>

        <section className={styles.workSection} aria-labelledby="active-heading"><div className={styles.sectionHeading}><h2 id="active-heading">ACTIVE WORK</h2><span>{counts.preparing + counts.finishing} in progress</span></div><div className={styles.workTabs} role="group" aria-label="Active work stage"><button aria-pressed={workTab === "PREPARING"} onClick={() => setWorkTab("PREPARING")}>Preparing <span>{counts.preparing}</span></button><button aria-pressed={workTab === "FINISHING"} onClick={() => setWorkTab("FINISHING")}>Assembly & pack <span>{counts.finishing}</span></button></div>
          <div className={styles.workColumns} aria-hidden="true"><span>ORDER / DISH</span><span>REMAINING</span><span>STATION</span></div>
          <div className={styles.workList}>{working.map(job => { const remaining = remainingTime(job, elapsed); const risk = jobRisk(job, elapsed); return <button className={`${styles.workRow} ${job.id === "GS-2847" ? styles.heroRow : ""} ${risk === "late" ? styles.lateRow : ""}`} key={job.id} onClick={() => showDetails(job)} aria-label={`Open ${job.id}, ${dishName(job)}, ${stageName(job)}, ${risk === "late" ? "past promise" : remaining ? `${clockDuration(remaining)} remaining` : "finish now"}`}><span className={styles.workIdentity}><strong>{job.id}{job.id === "GS-2847" && <i aria-label="Featured demo order" />}</strong><span>{dishName(job)} {job.quantity > 1 ? `×${job.quantity}` : ""}</span></span><span className={styles.workTime}><strong className={risk === "attention" ? styles.attentionText : risk === "late" ? styles.riskText : ""}>{remaining ? clockDuration(remaining) : "Finish now"}</strong><Progress value={(1 - remaining / job.prepSeconds) * 100} label={`${job.id} preparation progress`} risk={risk} /><small>{risk === "late" ? "Past promise" : job.riderArrivalAtSecond <= elapsed ? "Rider arrived" : risk === "attention" ? "Rider close" : `Rider ${Math.ceil((job.riderArrivalAtSecond - elapsed) / 60)}m`}</small></span><span className={styles.station}>{job.station}<Arrow diagonal /></span></button>; })}{working.length === 0 && <p className={styles.emptyWork}>No work at this stage.</p>}</div>
        </section>


      </div>

      <div className={styles.context}>
        <section className={styles.incoming} aria-labelledby="incoming-heading"><div className={styles.sectionHeading}><h2 id="incoming-heading">NEXT 10 MIN</h2><span>{counts.queued} queued · 2 expected in 3m</span></div><div className={styles.queuePreview}>{queued.filter(job => job.id !== next?.id).slice(0, 3).map(job => <button key={job.id} onClick={() => showDetails(job)}><strong>{job.id}</strong><span>{dishName(job)}{job.quantity > 1 ? ` ×${job.quantity}` : ""}</span></button>)}{queued.length <= 1 && <p className={styles.muted}>Nothing else waiting.</p>}</div></section>
        <section className={styles.capacity} aria-labelledby="capacity-heading"><div className={styles.sectionHeading}><h2 id="capacity-heading">STATION LOAD</h2><span>Current capacity</span></div><div className={styles.loads}>{loads.map(load => <div key={load.name}><span>{load.name}</span><Progress value={load.value} label={`${load.name} station load`} risk={load.value >= 85 ? "attention" : "healthy"} /><strong className={load.value >= 85 ? styles.attentionText : ""}>{load.value}%</strong></div>)}</div></section>
      </div>

      <footer className={styles.footer}><div className={styles.signal}><span className={styles.signalMark} aria-hidden="true">↳</span><div><span className={styles.overline}>SIGNAL</span><p>{demo.intelligenceScenario && <>{intelligenceScenarios.find(item => item.value === demo.intelligenceScenario)?.label}. </>}{!hero ? "GS-2847 has not entered the kitchen queue." : hero?.stage === "QUEUED" ? "Start GS-2847 now · rider and cook align at the handoff window." : hero?.stage === "PREPARING" ? "GS-2847 is cooking. Keep the mint chutney with the bowl." : hero?.stage === "ASSEMBLING" ? "GS-2847 is at assembly. Add the extra mint chutney." : hero?.stage === "PACKING" ? "GS-2847 is packing. Seal, label, then mark ready." : hero?.stage === "READY" ? "GS-2847 is ready at Bay 4. Match the order with Ravi Sharma." : "GS-2847 has left the kitchen. Keep the next cook moving."}</p></div></div><button className={styles.stockAlert} aria-haspopup="dialog" onClick={() => { returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; stockDialog.current?.showModal(); }}><span className={styles.alertMark} aria-hidden="true">!</span><span><strong>Mint chutney</strong><span>{mint?.hoursRemaining.toFixed(1)}h stock cover{alertAcknowledged ? " · Seen" : " · Low"}</span></span><Arrow diagonal /></button><div className={styles.networkContext}><span>{networkMetrics.activeRiders} riders in network</span><span>{formatDuration(networkMetrics.averageDeliverySeconds)} avg delivery</span></div></footer>
    </main>
    <p className={styles.srOnly} role="status" aria-live="polite">{announcement}</p>

    <dialog ref={details} className={styles.drawer} aria-labelledby="order-detail-heading" onClose={restoreSurfaceFocus} onClick={event => { if (event.target === event.currentTarget) closeDetails(); }}><div className={styles.drawerInner}>{selected && <><div className={styles.drawerTop}><span className={styles.overline}>ORDER DETAIL · {stageName(selected)}</span><button ref={detailCloseButton} className={styles.closeButton} aria-label="Close order details" onClick={closeDetails}><CloseIcon /></button></div><h2 id="order-detail-heading" className={styles.drawerOrder}>{selected.id}</h2><h3 className={styles.drawerDish}>{dishName(selected)} <span>×{selected.quantity}</span></h3><p className={styles.drawerModifiers}>{selected.note}</p><ol className={styles.stageSteps} aria-label="Kitchen order stages">{["QUEUED", "PREPARING", "ASSEMBLING", "PACKING", "READY"].map(stage => <li key={stage} aria-current={selected.stage === stage ? "step" : undefined}>{stage.toLowerCase()}</li>)}</ol><dl className={styles.detailFacts}>{selected.id === "GS-2847" && <><div><dt>Ordered</dt><dd>{kitchenTime(Math.round((Date.parse(demo.currentOrder.createdAt) - Date.parse(KITCHEN_EPOCH)) / 1000), true)}</dd></div><div><dt>Promised</dt><dd>{kitchenTime(Math.round((Date.parse(demo.currentOrder.createdAt) - Date.parse(KITCHEN_EPOCH)) / 1000) + demo.currentOrder.promisedSeconds)}</dd></div><div><dt>Customer</dt><dd>Aarav</dd></div><div><dt>Base dish</dt><dd>{formatMoney(demo.currentOrder.items[0].basePrice)}</dd></div></>}<div><dt>Prep target</dt><dd>{formatDuration(selected.prepSeconds)}</dd></div><div><dt>Station</dt><dd>{selected.station}</dd></div><div><dt>Rider</dt><dd>{selected.riderName}</dd></div><div><dt>{selected.id === "GS-2847" ? "Rider travel" : "Rider ETA"}</dt><dd>{clockDuration(selected.id === "GS-2847" ? HERO_RIDER_TRAVEL_SECONDS : Math.max(0, selected.riderArrivalAtSecond - elapsed))}</dd></div><div><dt>Handoff target</dt><dd>{kitchenTime(Math.max(elapsed + remainingTime(selected, elapsed), selected.riderArrivalAtSecond))}</dd></div>{selected.id === "GS-2847" && <div><dt>Release after start</dt><dd>{clockDuration(HERO_RIDER_RELEASE_SECONDS)}</dd></div>}</dl>{selected.stage === "READY" && <div className={styles.detailNote}><strong>{selected.riderArrivalAtSecond <= elapsed ? `${selected.riderName} · Outside` : `${selected.riderName} · Arriving ${clockDuration(selected.riderArrivalAtSecond - elapsed)}`}</strong><span>{selected.bay ? `Bay ${selected.bay} · ` : ""}Match order number for handoff.</span></div>}{ACTION_LABELS[selected.stage] ? <button ref={detailActionButton} className={styles.drawerAction} disabled={lockAction} onClick={() => act(selected)}>{ACTION_LABELS[selected.stage]?.toUpperCase()}<Arrow /></button> : <div className={styles.readyConfirmation}>{selected.stage === "READY" ? "READY FOR HANDOFF" : "✓ Handed off"}</div>}</>}</div></dialog>

    <dialog ref={stockDialog} className={styles.stockDialog} aria-labelledby="stock-heading" onClose={restoreSurfaceFocus} onClick={event => { if (event.target === event.currentTarget) stockDialog.current?.close(); }}><div className={styles.stockInner}><div className={styles.drawerTop}><span className={styles.overline}>STOCK ATTENTION</span><button className={styles.closeButton} aria-label="Close stock alert" onClick={() => stockDialog.current?.close()}><CloseIcon /></button></div><h2 id="stock-heading">Mint chutney</h2><p className={styles.stockCover}>{mint?.hoursRemaining.toFixed(1)}<span>hours remaining</span></p><p className={styles.muted}>{mint?.onHand} litres on hand · {mint?.burnRate} litres / hour</p><div className={styles.detailNote}><strong>Prepare the next batch.</strong><span>Keep extra-chutney portions with their orders. This stock level does not stop the current queue.</span></div><button className={styles.drawerAction} onClick={() => { setAlertAcknowledged(true); stockDialog.current?.close(); setAnnouncement("Mint chutney alert acknowledged. Stock levels have not changed."); }}>Acknowledge<Arrow /></button></div></dialog>
  </div>;
}
