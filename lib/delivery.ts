export function round2(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export type RateCard = {
  baseCharge: number;
  perKm: number;
  minCharge: number;
  fuelSurchargePct: number;
  extraCharge: number;
  roadFactor: number;
};

export type VehicleRate = {
  name: string;
  capacityKg: number;
  surcharge: number;
};

export type DeliveryBreakdown = {
  distanceKm: number;
  weightKg: number;
  trips: number;
  vehicle: string;
  baseCharge: number;
  distanceCharge: number;
  minApplied: boolean;
  vehicleSurcharge: number;
  extraCharge: number;
  fuelAmount: number;
  deliveryCost: number;
};

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function roadKm(straightKm: number, roadFactor: number) {
  return round2(Math.max(1, straightKm * roadFactor));
}

export function nearestZone<T extends { lat: number; lng: number }>(
  zones: T[],
  lat: number,
  lng: number,
) {
  return zones.reduce((best, zone) => {
    const distance = haversineKm({ lat, lng }, zone);
    const bestDistance = haversineKm({ lat, lng }, best);
    return distance < bestDistance ? zone : best;
  });
}

export function calculateDelivery(input: {
  quantity?: number;
  weightKgEach?: number;
  weightKg?: number;
  distanceKm: number;
  rates: RateCard;
  vehicles: VehicleRate[];
}): DeliveryBreakdown {
  const quantity = Math.max(0, input.quantity ?? 1);
  const weightKg = round2(
    input.weightKg != null
      ? Math.max(input.weightKg, 0.1)
      : quantity * Math.max(input.weightKgEach ?? 0.1, 0.1),
  );
  const distanceKm = round2(Math.max(input.distanceKm, 0));
  const vehicles = [...input.vehicles].sort((a, b) => a.capacityKg - b.capacityKg);
  let vehicle = vehicles.find((item) => item.capacityKg >= weightKg);
  let trips = 1;
  if (!vehicle) {
    vehicle = vehicles[vehicles.length - 1];
    trips = vehicle ? Math.ceil(weightKg / vehicle.capacityKg) : 1;
  }
  const name = vehicle?.name ?? "Standard delivery";
  const surcharge = vehicle?.surcharge ?? 0;
  const distanceCharge = round2(distanceKm * input.rates.perKm);
  let leg = input.rates.baseCharge + distanceCharge;
  const minApplied = leg < input.rates.minCharge;
  if (minApplied) leg = input.rates.minCharge;
  leg += surcharge;
  const extra = input.rates.extraCharge * trips;
  const beforeFuel = leg * trips + extra;
  const fuelAmount = round2(beforeFuel * (input.rates.fuelSurchargePct / 100));
  const deliveryCost = round2(beforeFuel + fuelAmount);
  return {
    distanceKm,
    weightKg,
    trips,
    vehicle: name,
    baseCharge: input.rates.baseCharge,
    distanceCharge,
    minApplied,
    vehicleSurcharge: surcharge,
    extraCharge: extra,
    fuelAmount,
    deliveryCost,
  };
}
