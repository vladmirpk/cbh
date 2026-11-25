import type { Metadata } from "next";
import { getCommerce } from "@/lib/queries";
import { waLink } from "@/lib/format";
import { SmartForm } from "@/components/SmartForm";
import { sendEnquiry } from "@/lib/actions/public";

export const metadata: Metadata = { title: "Contact", description: "Call, WhatsApp or send an enquiry to Consolidated Bricks & Hardware." };

export default async function ContactPage() {
  const { site } = await getCommerce();
  return (
    <div className="wrap grid gap-10 py-12 lg:grid-cols-2">
      <div>
        <h1 className="display text-5xl">Contact</h1>
        <p className="mt-4 text-stone">{site.address}</p>
        <p className="mt-2">{site.hours}</p>
        <div className="mt-6 grid gap-2 text-lg">
          <a href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a>
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <a className="text-brick" href={waLink(site.whatsapp, "Hello CBH, I need materials.")}>WhatsApp {site.whatsapp}</a>
        </div>
        <div className="panel mt-8 p-5">
          <h2 className="display text-3xl">Contractors</h2>
          <p className="mt-2 text-sm text-stone">Add company details and monthly volume when you send the form.</p>
        </div>
      </div>
      <div className="panel p-5">
        <SmartForm
          action={sendEnquiry}
          submit="Send"
          confirm={{
            title: "Send enquiry?",
            message: "CBH will reply on phone or WhatsApp.",
            confirmLabel: "Send",
            cancelLabel: "Back",
          }}
        >
          <input type="hidden" name="source" value="direct" />
          <label><span className="label">Name</span><input className="field" name="name" required /></label>
          <label><span className="label">Phone</span><input className="field" name="phone" required /></label>
          <label><span className="label">WhatsApp</span><input className="field" name="whatsapp" /></label>
          <label><span className="label">Email</span><input className="field" name="email" type="email" /></label>
          <label><span className="label">Location</span><input className="field" name="location" /></label>
          <label><span className="label">What do you need?</span><input className="field" name="topic" placeholder="Bricks, pavers, solar…" /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="customerType" value="contractor" /> Contractor / business account</label>
          <label><span className="label">Company</span><input className="field" name="company" /></label>
          <label><span className="label">Registration details</span><input className="field" name="registration" /></label>
          <label><span className="label">Typical monthly volume</span><input className="field" name="monthlyVolume" /></label>
          <label><span className="label">Credit requirement</span><input className="field" name="creditRequest" placeholder="Optional" /></label>
          <label><span className="label">Message</span><textarea className="field min-h-28" name="requirements" /></label>
        </SmartForm>
      </div>
    </div>
  );
}
