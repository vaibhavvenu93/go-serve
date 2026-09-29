"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useDemo } from "@/context/demo-provider";
import { selectCustomerOrder } from "@/lib/customer-order";
import { CustomerOrder } from "./customer-order";
import { demoMenu } from "@/data/demo-menu";
import { formatMoney } from "@/lib/format";
import { changeQuantity, filterFood, FOOD_INTENTS, selectionSummary, TONIGHT_IDS, type FoodIntent, type HomeQuantities } from "@/lib/customer-home";
import type { MenuItem } from "@/types";
import { CustomerIcon as Icon } from "./customer-icons";
import { FoodPhoto } from "./food-photo";
import styles from "./customer-home.module.css";

const hero = demoMenu[0];
const tonight = demoMenu.filter(item => TONIGHT_IDS.includes(item.id));
const locations = [{ id: "home", name: "Vijay Nagar", label: "Home", detail: "Narmada Residency, Indore" }, { id: "work", name: "Scheme No. 54", label: "Work", detail: "Brilliant Avenue, Indore" }];

function DietaryLabel({ vegetarian }: { vegetarian: boolean }) {
  return <span className={styles.dietary}><span className={vegetarian ? styles.vegMark : styles.nonVegMark} aria-hidden="true">{vegetarian ? "●" : "▲"}</span>{vegetarian ? "Veg" : "Non-veg"}</span>;
}

function QuantityControl({ item, quantity, onChange, featured = false }: { item: MenuItem; quantity: number; onChange: (id: string, delta: -1 | 1) => void; featured?: boolean }) {
  const actionButton = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);
  useEffect(() => { if (restoreFocus.current) { actionButton.current?.focus({ preventScroll: true }); restoreFocus.current = false; } }, [quantity]);
  const change = (delta: -1 | 1) => { restoreFocus.current = quantity === 0 || (quantity === 1 && delta === -1); onChange(item.id, delta); };
  return <div className={`${styles.quantityControl} ${featured ? styles.featuredControl : ""}`}>
    {quantity === 0 ? <button ref={actionButton} className={styles.addButton} aria-label={`Add ${item.name}, ${formatMoney(item.price)}`} onClick={() => change(1)}><Icon name="plus" width="17" height="17" /><span>Add</span>{featured && <span className={styles.addPrice}>· {formatMoney(item.price)}</span>}</button> : <div className={styles.stepper} role="group" aria-label={`Quantity of ${item.name}`}><button aria-label={`Remove one ${item.name}`} onClick={() => change(-1)}><Icon name="minus" width="17" height="17" /></button><span className={styles.quantityValue} key={quantity}>{quantity}</span><button ref={actionButton} aria-label={`Add one ${item.name}`} disabled={quantity >= 9} onClick={() => change(1)}><Icon name="plus" width="17" height="17" /></button></div>}
  </div>;
}

export function CustomerHome() {
  const demo = useDemo();
  const { customer, cart } = demo;
  const order = selectCustomerOrder(demo);
  const [orderOpen, setOrderOpen] = useState(false);
  const [quantities, setQuantities] = useState<HomeQuantities>({});
  const [intent, setIntent] = useState<FoodIntent>("All");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState(locations[0]);
  const [notice, setNotice] = useState<{ message: string; id: number } | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);
  const searchTrigger = useRef<HTMLButtonElement>(null);
  const locationTrigger = useRef<HTMLButtonElement>(null);
  const locationDialog = useRef<HTMLDialogElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const previousCart = useRef(cart);

  // Observe the existing reset by fixture identity; no provider or journey mutation.
  useEffect(() => { if (previousCart.current !== cart) { previousCart.current = cart; setQuantities({}); setIntent("All"); setQuery(""); setSearchOpen(false); setLocation(locations[0]); setNotice(null); setAnnouncement(""); locationDialog.current?.close(); } }, [cart]);
  useEffect(() => { if (searchOpen) searchInput.current?.focus(); }, [searchOpen]);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(null), 3200); return () => clearTimeout(timer); }, [notice]);

  const summary = selectionSummary(quantities, demoMenu);
  const visibleItems = filterFood(searchOpen ? demoMenu : tonight, intent, query);
  const notify = (message: string) => setNotice({ message, id: Date.now() });
  const updateQuantity = (id: string, delta: -1 | 1) => {
    const next = changeQuantity(quantities, id, delta);
    setQuantities(next);
    const item = demoMenu.find(candidate => candidate.id === id);
    const count = selectionSummary(next, demoMenu).count;
    setAnnouncement(`${item?.name}: ${next[id]}. ${count} ${count === 1 ? "item" : "items"} in your bag.`);
  };
  const openSearch = () => { setSearchOpen(true); scroller.current?.scrollTo({ top: 0 }); };
  const closeSearch = () => { setSearchOpen(false); setQuery(""); searchTrigger.current?.focus(); };
  const selectIntent = (value: FoodIntent) => { setIntent(value); rail.current?.scrollTo({ left: 0 }); };

  return <div className={styles.stage}><div className={styles.app}>
    <header className={styles.header}>
      <Link href="/" className={styles.logo} aria-label="GO SERVE entry"><span className="brand-mark" aria-hidden="true">g<span>.</span></span></Link>
      <button ref={locationTrigger} className={styles.locationButton} aria-haspopup="dialog" onClick={() => locationDialog.current?.showModal()}><span className={styles.deliverLabel}>Deliver to {location.label}</span><span className={styles.locationName}>{location.name}<Icon name="chevron" width="16" height="16" /></span></button>
      <button ref={searchTrigger} className={styles.iconButton} aria-label="Search food" aria-expanded={searchOpen} onClick={openSearch}><Icon name="search" /></button>
    </header>

    <div ref={scroller} className={styles.scrollArea}>
      <main id="main" className={styles.main}>
        {searchOpen ? <section className={styles.searchSection} aria-label="Search tonight’s menu"><div className={styles.searchTitle}><h1 className="title">What sounds good?</h1><button className={styles.iconButton} aria-label="Close search" onClick={closeSearch}><Icon name="close" /></button></div><div className={styles.searchField}><Icon name="search" width="20" height="20" /><input ref={searchInput} type="search" aria-label="Search dishes" placeholder="Try rice, paneer, something good…" value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === "Escape") closeSearch(); }} /></div><p className={styles.searchHint}>Fresh from our nearby kitchen.</p></section> : <>
          <section className={styles.promise} aria-labelledby="dinner-title"><p className={styles.greeting}>Good evening, {customer.name.split(" ")[0]}.</p><h1 id="dinner-title" className={`headline ${styles.promiseTitle}`}>{order.completed ? "Delivered." : order.placed ? order.stage === "On the way" ? "On the way." : "Dinner is" : "Dinner in"}<br /><span>{order.completed ? "Enjoy dinner." : order.placed ? order.stage === "Cooking your dinner" ? "cooking." : order.stage === "On the way" ? "Almost there." : order.stage === "Ravi is here" ? "here." : "coming together." : "12 minutes."}</span></h1><div className={styles.kitchenSignal}><span className={styles.liveDot} aria-hidden="true" />{order.placed ? `${order.stage} · ${order.completed ? "received" : order.estimate ? `estimated ${order.estimate}` : "coordinating pickup"}` : "Kitchen nearby · cooking now"}<span className={styles.demo}>DEMO</span></div></section>
          <section className={styles.heroDish} aria-labelledby="hero-dish-title"><div className={styles.heroVisual}><div className={styles.again}><span>Again?</span><span>Your usual, freshly made.</span></div><FoodPhoto id={hero.id} name="Charred paneer tikka over basmati rice, with mint chutney and pickled onion" hero /></div><div className={styles.heroDetails}><div className={styles.dishMeta}><DietaryLabel vegetarian={hero.vegetarian} /><span>12 min</span></div><h2 id="hero-dish-title" className="title">Paneer Tikka<br />Rice Bowl</h2><div className={styles.heroAction}><p>{hero.description}</p><QuantityControl item={hero} quantity={quantities[hero.id] ?? 0} onChange={updateQuantity} featured /></div></div></section>
        </>}

        <section className={styles.discovery} aria-labelledby="tonight-title"><div className={styles.discoveryHeading}><h2 id="tonight-title" className="title">{searchOpen ? "On the menu" : "A little more tonight"}</h2>{!searchOpen && <span className="metadata">Made close. Served fast.</span>}</div><div className={styles.filters} role="group" aria-label="Food preferences">{FOOD_INTENTS.map(value => <button key={value} aria-pressed={intent === value} className={intent === value ? styles.activeFilter : ""} onClick={() => selectIntent(value)}>{value}</button>)}</div>
          {visibleItems.length === 0 ? <div className={styles.empty}><h3>Nothing by that name tonight.</h3><p>Try “rice” or “paneer”, or choose All.</p><button onClick={() => { setQuery(""); setIntent("All"); searchInput.current?.focus(); }}>Show tonight’s menu <Icon name="arrow" width="18" height="18" /></button></div> : searchOpen ? <div className={styles.searchResults} aria-label="Matching dishes">{visibleItems.map(item => <article className={styles.searchResult} key={item.id}><div><h3>{item.name}</h3><div className={styles.resultMeta}><DietaryLabel vegetarian={item.vegetarian} /><span>{item.deliveryMinutes} min</span><span>{formatMoney(item.price)}</span></div></div><QuantityControl item={item} quantity={quantities[item.id] ?? 0} onChange={updateQuantity} /></article>)}</div> : <div ref={rail} className={styles.foodRail} tabIndex={0} aria-label="Tonight’s dishes. Scroll horizontally for more.">{visibleItems.map(item => <article className={styles.foodItem} key={item.id}><div className={styles.discoveryPhoto}><FoodPhoto id={item.id} name={item.name} /></div><div className={styles.dishMeta}><DietaryLabel vegetarian={item.vegetarian} /><span>{item.deliveryMinutes} min</span></div><h3>{item.name}</h3><div className={styles.itemAction}><span className={styles.price}>{formatMoney(item.price)}</span><QuantityControl item={item} quantity={quantities[item.id] ?? 0} onChange={updateQuantity} /></div></article>)}</div>}
          <p className={styles.menuEnd}>{searchOpen ? `${visibleItems.length} ${visibleItems.length === 1 ? "dish" : "dishes"} tonight` : "Good food, a short ride away."}</p>
        </section>
      </main>
    </div>

    <div className={styles.bottomArea}>
      <div className={styles.notice} role="status" aria-live="polite">{notice && <span key={notice.id}>{notice.message}</span>}</div>
      {summary.count > 0 && <button className={styles.bagBar} aria-label={`${summary.count} ${summary.count === 1 ? "item" : "items"}, ${formatMoney(summary.total)}. View order`} onClick={() => { if (!order.placed && (summary.count !== 1 || quantities[hero.id] !== 1)) { notify("Choose one Paneer Tikka Rice Bowl to try this demo order."); return; } setOrderOpen(true); }}><span className={styles.bagCount}>{summary.count}</span><span className={styles.bagCopy}><strong>{formatMoney(summary.total)}</strong><span>About {summary.minutes} min</span></span><span className={styles.viewOrder}>View order <Icon name="arrow" width="18" height="18" /></span></button>}
      <nav className={styles.bottomNav} aria-label="Customer navigation"><button aria-current={!searchOpen ? "page" : undefined} onClick={() => { setSearchOpen(false); setQuery(""); scroller.current?.scrollTo({ top: 0 }); }}><Icon name="home" /><span>Home</span></button><button aria-current={searchOpen ? "page" : undefined} onClick={openSearch}><Icon name="search" /><span>Search</span></button><button onClick={() => setOrderOpen(true)}><Icon name="orders" /><span>Orders</span></button><button onClick={() => notify(`${customer.name} · Your saved delivery address is in Vijay Nagar.`)}><Icon name="user" /><span>You</span></button></nav>
    </div>
    <div className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{announcement}</div>

    <CustomerOrder open={orderOpen} onClose={() => setOrderOpen(false)} />
    <dialog ref={locationDialog} className={styles.locationDialog} aria-labelledby="location-title" onClose={() => locationTrigger.current?.focus()} onClick={event => { if (event.target === event.currentTarget) locationDialog.current?.close(); }}><div className={styles.locationSheet}><div className={styles.sheetHeading}><div><p className="eyebrow">GOOD FOOD, CLOSE BY</p><h2 id="location-title" className="title">Where’s dinner going?</h2></div><button className={styles.iconButton} aria-label="Close saved locations" onClick={() => locationDialog.current?.close()}><Icon name="close" /></button></div><p className={styles.sheetIntro}>Your saved places in Indore.</p>{locations.map(place => <button className={styles.savedLocation} key={place.id} aria-pressed={location.id === place.id} onClick={() => { setLocation(place); locationDialog.current?.close(); notify(`Delivering to ${place.label} · ${place.name}`); }}><Icon name={place.id === "home" ? "home" : "pin"} /><span><strong>{place.label} <span>· {place.name}</span></strong><small>{place.detail}</small></span>{location.id === place.id && <Icon name="check" width="18" height="18" />}</button>)}<p className={styles.sheetFoot}>Both places are in our neighbourhood.</p></div></dialog>
  </div></div>;
}
