import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Denied } from "@/components/ui";
import { SmartForm } from "@/components/SmartForm";
import { saveSettings } from "@/lib/actions/admin";

export default async function SettingsPage() {
  const user = await requireUser();
  if (!["super_admin", "management"].includes(user.role)) return <Denied />;
  const site = await prisma.siteSetting.findUnique({ where: { id: "default" } });
  if (!site) return null;
  const placeholder = site.whatsapp.includes("000000");
  return (
    <div className="max-w-2xl">
      <h1 className="display text-4xl text-ink">Company settings</h1>
      <p className="mt-2 text-sm text-stone">Saving asks for confirmation — these details show across the public site and quotes.</p>
      {placeholder ? <p className="mt-3 rounded-2xl bg-[#f3e2c4] px-4 py-3 text-sm text-copper">The WhatsApp number is still a placeholder. Update it before sharing the site.</p> : null}
      <div className="mt-6">
        <SmartForm
          action={saveSettings}
          submit="Save settings"
          confirm={{
            title: "Save company settings?",
            message: "Phone, WhatsApp, address, disclaimer, and payment details update site-wide.",
            confirmLabel: "Save settings",
            cancelLabel: "Keep editing",
          }}
        >
          <label><span className="label">Phone</span><input className="field" name="phone" defaultValue={site.phone} /></label>
          <label><span className="label">WhatsApp</span><input className="field" name="whatsapp" defaultValue={site.whatsapp} /></label>
          <label><span className="label">Email</span><input className="field" name="email" defaultValue={site.email} /></label>
          <label><span className="label">Address</span><input className="field" name="address" defaultValue={site.address} /></label>
          <label><span className="label">Hours</span><input className="field" name="hours" defaultValue={site.hours} /></label>
          <label><span className="label">About</span><textarea className="field min-h-36" name="about" defaultValue={site.about} /></label>
          <label><span className="label">Quote validity (days)</span><input className="field" name="validityDays" defaultValue={site.validityDays} /></label>
          <label><span className="label">Disclaimer</span><textarea className="field min-h-28" name="disclaimer" defaultValue={site.disclaimer} /></label>
          <label><span className="label">Bank payment details</span><textarea className="field min-h-24" name="bankDetails" defaultValue={site.bankDetails ?? ""} placeholder="Bank, account name, account number" /></label>
          <label><span className="label">Paynow / gateway merchant ID</span><input className="field" name="paynowId" defaultValue={site.paynowId ?? ""} placeholder="Optional" /></label>
        </SmartForm>
      </div>
    </div>
  );
}
