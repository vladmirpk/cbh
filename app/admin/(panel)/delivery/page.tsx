import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageDelivery } from "@/lib/roles";
import { Denied } from "@/components/ui";
import { SmartForm } from "@/components/SmartForm";
import { deleteVehicle, deleteZone, saveDelivery, saveVehicle, saveZone } from "@/lib/actions/admin";

export default async function DeliveryAdminPage({ searchParams }: { searchParams: Promise<{ zone?: string; vehicle?: string }> }) {
  const user = await requireUser();
  if (!canManageDelivery(user.role)) return <Denied />;
  const { zone: zoneId, vehicle: vehicleId } = await searchParams;
  const [settings, zones, vehicles, currentZone, currentVehicle] = await Promise.all([
    prisma.deliverySettings.findUnique({ where: { id: "default" } }),
    prisma.zone.findMany({ orderBy: { area: "asc" } }),
    prisma.vehicle.findMany({ orderBy: { sortOrder: "asc" } }),
    zoneId ? prisma.zone.findUnique({ where: { id: zoneId } }) : null,
    vehicleId ? prisma.vehicle.findUnique({ where: { id: vehicleId } }) : null,
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
          <h2 className="display text-2xl">{currentZone ? "Edit zone" : "Add a zone"}</h2>
          <SmartForm action={saveZone} submit={currentZone ? "Update zone" : "Save zone"} className="mt-3 grid gap-3">
            <input type="hidden" name="id" value={currentZone?.id ?? ""} />
            <label><span className="label">Name</span><input className="field" name="name" defaultValue={currentZone?.name} required /></label>
            <label><span className="label">Area</span><input className="field" name="area" defaultValue={currentZone?.area ?? ""} placeholder="North" /></label>
            <label><span className="label">Distance km</span><input className="field" name="distanceKm" defaultValue={currentZone?.distanceKm} required /></label>
            <label><span className="label">Latitude</span><input className="field" name="lat" defaultValue={currentZone?.lat} required /></label>
            <label><span className="label">Longitude</span><input className="field" name="lng" defaultValue={currentZone?.lng} required /></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" value="yes" defaultChecked={currentZone?.active ?? true} /> Active</label>
          </SmartForm>
          {currentZone ? (
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <form action={deleteZone}>
                <input type="hidden" name="id" value={currentZone.id} />
                <button className="btn btn-ghost text-[#b42318]" type="submit">Delete zone</button>
              </form>
              <Link href="/admin/delivery">Clear</Link>
            </div>
          ) : null}
          <ul className="mt-4 text-sm">
            {zones.map((zone) => (
              <li key={zone.id} className="flex items-center justify-between gap-3 border-b border-line py-2">
                <span>{zone.name} · {zone.distanceKm} km · {zone.area}</span>
                <Link href={`/admin/delivery?zone=${zone.id}`}>Edit</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="display text-2xl">{currentVehicle ? "Edit vehicle" : "Add a vehicle"}</h2>
          <SmartForm action={saveVehicle} submit={currentVehicle ? "Update vehicle" : "Save vehicle"} className="mt-3 grid gap-3">
            <input type="hidden" name="id" value={currentVehicle?.id ?? ""} />
            <label><span className="label">Name</span><input className="field" name="name" defaultValue={currentVehicle?.name} required /></label>
            <label><span className="label">Capacity kg</span><input className="field" name="capacityKg" defaultValue={currentVehicle?.capacityKg} required /></label>
            <label><span className="label">Surcharge</span><input className="field" name="surcharge" defaultValue={currentVehicle?.surcharge ?? 0} /></label>
            <label><span className="label">Sort</span><input className="field" name="sortOrder" defaultValue={currentVehicle?.sortOrder ?? 0} /></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" value="yes" defaultChecked={currentVehicle?.active ?? true} /> Active</label>
          </SmartForm>
          {currentVehicle ? (
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <form action={deleteVehicle}>
                <input type="hidden" name="id" value={currentVehicle.id} />
                <button className="btn btn-ghost text-[#b42318]" type="submit">Delete vehicle</button>
              </form>
              <Link href="/admin/delivery">Clear</Link>
            </div>
          ) : null}
          <ul className="mt-4 text-sm">
            {vehicles.map((vehicle) => (
              <li key={vehicle.id} className="flex items-center justify-between gap-3 border-b border-line py-2">
                <span>{vehicle.name} · {vehicle.capacityKg} kg · +{vehicle.surcharge}</span>
                <Link href={`/admin/delivery?vehicle=${vehicle.id}`}>Edit</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
