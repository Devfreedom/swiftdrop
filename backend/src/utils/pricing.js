// Single source of truth for delivery pricing.
// Fee = BASE_FEE + PER_KG_FEE × weight. Weight is optional and defaults to
// DEFAULT_WEIGHT_KG. The client never sets the fee — createDelivery computes it.
const BASE_FEE = 1000;
const PER_KG_FEE = 200;
const DEFAULT_WEIGHT_KG = 1;

function resolveWeightKg(value) {
  if (value === undefined || value === null || value === "") return DEFAULT_WEIGHT_KG;
  const n = Number(value);
  if (Number.isNaN(n) || n < 0) return DEFAULT_WEIGHT_KG;
  return n;
}

function calculateDeliveryFee(weightKg) {
  return BASE_FEE + PER_KG_FEE * resolveWeightKg(weightKg);
}

module.exports = { BASE_FEE, PER_KG_FEE, DEFAULT_WEIGHT_KG, resolveWeightKg, calculateDeliveryFee };
