"use client";
import { useState } from "react";
import { getSupabaseClient } from "../lib/supabase";

export default function ContactForm() {
  const [form, setForm] = useState({ full_name:"", email:"", phone:"", company:"", service_required:"", budget_range:"", project_description:"" });
  const [state, setState] = useState({ loading:false, ok:false, error:"" });
  const change = e => setForm({ ...form, [e.target.name]: e.target.value });
  async function submit(e) {
    e.preventDefault(); setState({ loading:true, ok:false, error:"" });
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from("leads").insert({ ...form, lead_source:"website", status:"new", priority:"normal" });
      if (error) throw error;
      setForm({ full_name:"", email:"", phone:"", company:"", service_required:"", budget_range:"", project_description:"" });
      setState({ loading:false, ok:true, error:"" });
    } catch (err) { setState({ loading:false, ok:false, error:err?.message || "We could not send your enquiry. Please email hello@cevtexa.studio." }); }
  }
  return <form className="lead-form" onSubmit={submit}>
    <div className="form-grid"><label>Name<input name="full_name" value={form.full_name} onChange={change} required placeholder="Your name"/></label><label>Email<input type="email" name="email" value={form.email} onChange={change} required placeholder="you@company.com"/></label><label>Phone / WhatsApp<input name="phone" value={form.phone} onChange={change} placeholder="+91 ..."/></label><label>Company<input name="company" value={form.company} onChange={change} placeholder="Company name"/></label><label>Service<select name="service_required" value={form.service_required} onChange={change}><option value="">Select a service</option><option>Web & App Development</option><option>AI & Automation</option><option>Digital Marketing</option><option>Business Development</option><option>Custom Digital System</option></select></label><label>Budget<select name="budget_range" value={form.budget_range} onChange={change}><option value="">Choose range</option><option>Under $1,000</option><option>$1,000–$5,000</option><option>$5,000–$15,000</option><option>$15,000+</option><option>Not sure yet</option></select></label></div>
    <label>What are you building?<textarea name="project_description" value={form.project_description} onChange={change} required rows="6" placeholder="Tell us about the business, problem, audience and what you want to achieve."/></label>
    <button className="btn-main" disabled={state.loading}>{state.loading ? "Sending…" : "Send project enquiry ↗"}</button>
    {state.ok && <div className="form-success">Thanks — your enquiry is in the CEVTEXA pipeline. We’ll follow up shortly.</div>}
    {state.error && <div className="form-error">{state.error}</div>}
  </form>;
}
