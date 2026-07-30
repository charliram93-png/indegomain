/** Formatea un monto en MXN: 1200 -> "$1,200 MXN" */
export const formatMXN = (amount: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(amount) + " MXN";
