import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageDelivery } from "@/lib/roles";
import { Denied } from "@/components/ui";
import { SmartForm } from "@/components/SmartForm";
import { saveDelivery, saveVehicle, saveZone } from "@/lib/actions/admin";

export default async function DeliveryAdminPage() {
  const user = await requireUser();
  if (!canManageDelivery(user.role)) return <Denied />;
  const [settings, zones, vehicles] = await Promise.all([
    prisma.deliverySettings.findUnique({ where: { id: "default" } }),
    prisma.zone.findMany({ orderBy: { area: "asc" } }),
    prisma.vehicle.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  if (!settings) return <p>Delivery settings are missing. Run the database setup.</p>;
  return (
    <div className="grid gap-8">
      <div>
        <h1 className="display text-4xl">Delivery rate card</h1>
        <p className="mt-2 max-w-2xl text-sm text-stone">Cost = (base + kilometres × rate, or the minimum if higher) + vehicle charge, multiplied by the number of trips, plus extras, then fuel.</p>
      </div>
      <SmartForm action={saveDelivery} submit="Save rates" className="panel grid gap-4 p-5 md:grid-cols-3">
        <label><span className="label">Depot name</span><input className="field" name="depotName" defaultValue={settings.depotName} /></label>
        <label className="md:col-span-2"><span className="label">Depot address</span><input className="field" name="depotAddress" defaultValue={settings.depotAddress} /></label>
        <label><span className="label">Latitude</span><input className="field" name="depotLat" defaultValue={settings.depotLat} /></label>
        <label><span className="label">Longitude</span><input className="field" name="depotLng" defaultValue={settings.depotLng} /></label>
        <label><span className="label">Base charge</span><input className="field" name="baseCharge" defaultValue={settings.baseCharge} /></label>
        <label><span className="label">Per km</span><input className="field" name="perKm" defaultValue={settings.perKm} /></label>
        <label><span className="label">Minimum</span><input className="field" name="minCharge" defaultValue={settings.minCharge} /></label>
        <label><span className="label">Fuel %</span><input className="field" name="fuelSurchargePct" defaultValue={settings.fuelSurchargePct} /></label>
        <label><span className="label">Road factor for pins</span><input className="field" name="roadFactor" defaultValue={settings.roadFactor} /></label>
        <label><span className="label">Extra per trip</span><input className="field" name="extraCharge" defaultValue={settings.extraCharge} /></label>
      </SmartForm>
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="display text-2xl">Add a zone</h2>
          <SmartForm action={saveZone} submit="Save zone" className="mt-3 grid gap-3">
            <label><span className="label">Name</span><input className="field" name="name" required /></label>
            <label><span className="label">Area</span><input className="field" name="area" placeholder="North" /></label>
            <label><span className="label">Distance km</span><input className="field" name="distanceKm" required /></label>
            <label><span className="label">Latitude</span><input className="field" name="lat" required /></label>
            <label><span className="label">Longitude</span><input className="field" name="lng" required /></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" value="yes" defaultChecked /> Active</label>
          </SmartForm>
          <ul className="mt-4 text-sm">{zones.map((zone) => <li key={zone.id} className="border-b border-line py-2">{zone.name} · {zone.distanceKm} km · {zone.area}</li>)}</ul>
        </div>
        <div>
          <h2 className="display text-2xl">Add a vehicle</h2>
          <SmartForm action={saveVehicle} submit="Save vehicle" className="mt-3 grid gap-3">
            <label><span className="label">Name</span><input className="field" name="name" required /></label>
            <label><span className="label">Capacity kg</span><input className="field" name="capacityKg" required /></label>
            <label><span className="label">Surcharge</span><input className="field" name="surcharge" defaultValue={0} /></label>
            <label><span className="label">Sort</span><input className="field" name="sortOrder" defaultValue={0} /></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" value="yes" defaultChecked /> Active</label>
          </SmartForm>
          <ul className="mt-4 text-sm">{vehicles.map((vehicle) => <li key={vehicle.id} className="border-b border-line py-2">{vehicle.name} · {vehicle.capacityKg} kg · +{vehicle.surcharge}</li>)}</ul>
        </div>
      </div>
    </div>
  );
}
