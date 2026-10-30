// ₹ with Indian digit grouping and exactly 2 decimals: 1234567.5 → "₹12,34,567.50"
export function formatRupees(value) {
  return '₹' + Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}