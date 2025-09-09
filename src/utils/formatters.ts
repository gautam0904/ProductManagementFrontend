export const formatCurrency = (amount: number, currency = "₹") =>
    `${currency} ${amount.toFixed(2)}`;
  