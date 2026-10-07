"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getSupabaseClient } from "../../lib/supabase";
import styles from "../admin.module.css";

const labels = { leads:"Leads / CRM", messages:"Messages", projects:"Projects", "case-studies":"Case Studies", services:"Services", blog:"Blog / Insights", testimonials:"Testimonials", team:"Team", careers:"Careers", media:"Media", pages:"Pages / SEO", settings:"Settings" };

export default function AdminModulePage() {
  const { section } = useParams();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  useEffect(() => { getSupabaseClient().auth.getUser().then(async ({ data }) => { if (!data.user) { router.replace("/admin/login"); return; } const { data: p } = await getSupabaseClient().from("profiles").select("role").eq("id", data.user.id).single(); if (!p || !["owner","admin"].includes(p.role)) { await getSupabaseClient().auth.signOut(); router.replace("/admin/login"); return; } setChecking(false); }); }, [router]);
  const title = labels[section] || "Admin module";
  if (checking) return <main className={styles.loginWrap}><div className={styles.loginCard}>Checking secure session…</div></main>;
  return <div className={styles.shell}><aside className={styles.sidebar}><Link href="/admin" className={styles.brand}><img src="/logo.webp" alt=""/><div><strong>CEVTEXA</strong><small>CONTROL CENTER</small></div></Link><div className={styles.navLabel}>Module</div><nav className={styles.nav}><Link href="/admin"><i className={styles.dot}/>Overview</Link><Link href={`/admin/${section}`} className={styles.active}><i className={styles.dot}/>{title}</Link></nav></aside><main className={styles.main}><section className={styles.sectionPage}><Link href="/admin" className={styles.backDash}>← Back to dashboard</Link><h1 className={styles.sectionTitle}>{title}</h1><p className={styles.sectionText}>This module is connected to the CEVTEXA admin foundation and will be implemented next. Your database and secure admin access are already in place.</p><div className={styles.panel} style={{marginTop:28}}><div className={styles.eyebrow}>NEXT MODULE</div><h2 style={{fontFamily:"var(--display)",fontSize:20,margin:"10px 0"}}>Ready for production data.</h2><p className={styles.sectionText}>Nothing is being faked here. The next implementation will read and write the corresponding Supabase records.</p></div></section></main></div>;
}
