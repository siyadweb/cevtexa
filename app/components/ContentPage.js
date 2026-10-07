import Link from "next/link";
import SiteChrome from "./SiteChrome";

export default function ContentPage({ active, eyebrow, title, intro, children, cta = true }) {
  return <SiteChrome active={active}>
    <section className="inner-hero">
      <div className="inner-glow" />
      <div className="section-kicker"><span /> {eyebrow}</div>
      <h1>{title}</h1>
      <p>{intro}</p>
    </section>
    {children}
    {cta && <section className="section page-cta"><div className="page-cta-inner"><div><div className="section-kicker"><span /> Next move</div><h2>Have something <em>worth building?</em></h2><p>Bring the idea, problem or growth target. We’ll shape the next step with you.</p></div><Link className="btn-main" href="/contact">Start a project <span>↗</span></Link></div></section>}
  </SiteChrome>;
}

export function FeatureGrid({ items }) { return <div className="feature-grid">{items.map((item, i) => <article className="feature-card" key={item.title}><span className="feature-index">0{i+1}</span><div className="feature-icon">{item.icon || "◈"}</div><h3>{item.title}</h3><p>{item.text}</p>{item.items && <ul>{item.items.map(x => <li key={x}>{x}</li>)}</ul>}</article>)}</div>; }
export function StatStrip({ items }) { return <div className="stat-strip">{items.map(x => <div key={x.label}><strong>{x.value}</strong><span>{x.label}</span></div>)}</div>; }
export function SectionIntro({ eyebrow, title, text }) { return <div className="page-section-intro"><div className="section-kicker"><span /> {eyebrow}</div><h2>{title}</h2>{text && <p>{text}</p>}</div>; }
