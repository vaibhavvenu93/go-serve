import Link from "next/link";
import { Brand } from "@/components/shared/brand";
import { Arrival } from "@/components/shared/arrival";

const entrances = [
  { number: "01", action: "Order dinner", product: "Customer", href: "/customer" },
  { number: "02", action: "Run the kitchen", product: "Kitchen OS", href: "/kitchen" },
  { number: "03", action: "Make a delivery", product: "Rider", href: "/rider" },
  { number: "04", action: "Run the company", product: "Food OS", href: "/hq" },
];
export default function Entry() {
  return <div className="entry">
    <header className="entry-header"><Brand /><div className="entry-location metadata">VIJAY NAGAR, INDORE <span className="separator">/</span> <span>20:14 IST</span></div><span className="demo-label">DEMO</span></header>
    <main id="main" className="entry-main">
      <Arrival><div className="entry-composition">
        <section className="entry-intro" aria-labelledby="entry-title">
          <p className="eyebrow">ONE NEIGHBOURHOOD. IN SYNC.</p>
          <h1 id="entry-title" className="display-xl">Quiet<br /><span>speed.</span></h1>
          <div className="intro-bottom"><span className="small-rule" /><p className="body-lg">Good food. Minutes away.<br /><span className="muted">Everything else, in harmony.</span></p></div>
        </section>
        <nav className="entrances" aria-label="Product entrances">
          <p className="eyebrow entrances-label">ENTER THE EXPERIENCE</p>
          {entrances.map(item => <Link className="entrance" href={item.href} key={item.href}><span className="entrance-number metadata">{item.number}</span><span className="entrance-copy"><span className="entrance-title">{item.action}</span><span className="entrance-product">{item.product}</span></span><span className="entrance-arrow" aria-hidden="true">↗</span></Link>)}
          <div className="journey-teaser"><div><Link href="/intelligence" className="teaser-button">Run one order <span aria-hidden="true">↗</span></Link><p className="metadata muted">The end-to-end experience</p></div><span className="metadata muted">USE PROTOTYPE</span></div>
        </nav>
      </div></Arrival>
    </main>
    <footer className="entry-footer metadata"><span>FOUR PERSPECTIVES. ONE GO SERVE.</span><span>FRIDAY <span className="separator">/</span> DINNER RUSH</span></footer>
  </div>;
}
