import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageDelivery } from "@/lib/roles";
import { Denied } from "@/components/ui";
import { SmartForm } from "@/components/SmartForm";
import { deleteVehicle, deleteZone, saveDelivery, saveVehicle, saveZone } from "@/lib/actions/admin";
import { RowActions } from "@/components/admin/RowActions";
import { PreviewSheet } from "@/components/admin/PreviewSheet";
import { ConfirmAction } from "@/components/admin/ConfirmAction";

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
        <h1 className="display text-4xl text-ink">Delivery rate card</h1>
        <p className="mt-2 max-w-2xl text-sm text-stone">
          Cost = (base + kilometres × rate, or the minimum if higher) + vehicle charge, multiplied by the number of trips, plus extras, then fuel. Saving rates asks for confirmation.
        </p>
      </div>
      <SmartForm
        action={saveDelivery}
        submit="Save rates"
        className="panel grid gap-4 p-5 md:grid-cols-3"
        confirm={{
          title: "Save delivery rates?",
          message: "Quote and checkout delivery totals will use these figures immediately.",
          confirmLabel: "Save rates",
          cancelLabel: "Keep editing",
        }}
      >
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
          <SmartForm
            action={saveZone}
            submit={currentZone ? "Update zone" : "Save zone"}
            className="mt-3 grid gap-3"
            confirm={
              currentZone
                ? {
                    title: `Save zone “${currentZone.name}”?`,
                    message: "Distance and pin updates affect quote delivery maths.",
                    confirmLabel: "Save zone",
                    cancelLabel: "Keep editing",
                  }
                : undefined
            }
          >
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
              <ConfirmAction
                action={deleteZone}
                fields={{ id: currentZone.id }}
                label="Delete zone"
                confirm={{
                  title: `Delete zone “${currentZone.name}”?`,
                  message: "Quotes that relied on this pin will need another zone next time.",
                  confirmLabel: "Delete zone",
                  cancelLabel: "Keep zone",
                  tone: "danger",
                }}
              />
              <Link href="/admin/delivery">Clear</Link>
            </div>
          ) : null}
          <ul className="mt-4 text-sm">
            {zones.map((zone) => (
              <li key={zone.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-2">
                <span>{zone.name} · {zone.distanceKm} km · {zone.area}</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <PreviewSheet
                    title={zone.name}
                    editHref={`/admin/delivery?zone=${zone.id}`}
                    previewHref="/delivery"
                    lines={[
                      { label: "Area", value: zone.area || "—" },
                      { label: "Distance", value: `${zone.distanceKm} km` },
                      { label: "Coords", value: `${zone.lat}, ${zone.lng}` },
                      { label: "Active", value: zone.active ? "Yes" : "No" },
                    ]}
                  />
                  <RowActions
                    editHref={`/admin/delivery?zone=${zone.id}`}
                    deleteAction={deleteZone}
                    deleteFields={{ id: zone.id }}
                    deleteConfirm={{
                      title: `Delete zone “${zone.name}”?`,
                      message: "Quotes that relied on this pin will need another zone next time.",
                      confirmLabel: "Delete zone",
                      cancelLabel: "Keep zone",
                      tone: "danger",
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="display text-2xl">{currentVehicle ? "Edit vehicle" : "Add a vehicle"}</h2>
          <SmartForm
            action={saveVehicle}
            submit={currentVehicle ? "Update vehicle" : "Save vehicle"}
            className="mt-3 grid gap-3"
            confirm={
              currentVehicle
                ? {
                    title: `Save vehicle “${currentVehicle.name}”?`,
                    message: "Capacity and surcharge changes affect delivery quotes.",
                    confirmLabel: "Save vehicle",
                    cancelLabel: "Keep editing",
                  }
                : undefined
            }
          >
            <input type="hidden" name="id" value={currentVehicle?.id ?? ""} />
            <label><span className="label">Name</span><input className="field" name="name" defaultValue={currentVehicle?.name} required /></label>
            <label><span className="label">Capacity kg</span><input className="field" name="capacityKg" defaultValue={currentVehicle?.capacityKg} required /></label>
            <label><span className="label">Surcharge</span><input className="field" name="surcharge" defaultValue={currentVehicle?.surcharge ?? 0} /></label>
            <label><span className="label">Sort</span><input className="field" name="sortOrder" defaultValue={currentVehicle?.sortOrder ?? 0} /></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" value="yes" defaultChecked={currentVehicle?.active ?? true} /> Active</label>
          </SmartForm>
          {currentVehicle ? (
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <ConfirmAction
                action={deleteVehicle}
                fields={{ id: currentVehicle.id }}
                label="Delete vehicle"
                confirm={{
                  title: `Delete vehicle “${currentVehicle.name}”?`,
                  message: "It will no longer be offered on quotes.",
                  confirmLabel: "Delete vehicle",
                  cancelLabel: "Keep vehicle",
                  tone: "danger",
                }}
              />
              <Link href="/admin/delivery">Clear</Link>
            </div>
          ) : null}
          <ul className="mt-4 text-sm">
            {vehicles.map((vehicle) => (
              <li key={vehicle.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-2">
                <span>{vehicle.name} · {vehicle.capacityKg} kg · +{vehicle.surcharge}</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <PreviewSheet
                    title={vehicle.name}
                    editHref={`/admin/delivery?vehicle=${vehicle.id}`}
                    lines={[
                      { label: "Capacity", value: `${vehicle.capacityKg} kg` },
                      { label: "Surcharge", value: String(vehicle.surcharge) },
                      { label: "Active", value: vehicle.active ? "Yes" : "No" },
                    ]}
                  />
                  <RowActions
                    editHref={`/admin/delivery?vehicle=${vehicle.id}`}
                    deleteAction={deleteVehicle}
                    deleteFields={{ id: vehicle.id }}
                    deleteConfirm={{
                      title: `Delete vehicle “${vehicle.name}”?`,
                      message: "It will no longer be offered on quotes.",
                      confirmLabel: "Delete vehicle",
                      cancelLabel: "Keep vehicle",
                      tone: "danger",
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
