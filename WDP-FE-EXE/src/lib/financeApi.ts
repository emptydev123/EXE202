import { apiRequest } from "@/api/api";

export type RevenueResponse = {
  success: boolean;
  message: string;
  data: { revenue: number; count: number };
};

export type PaymentRateResponse = {
  success: boolean;
  message: string;
  data: {
    total: number;
    rate: number; // 0..1
    breakdown: { pending: number; paid: number; cancelled: number };
  };
};

export type FinanceQuery = { from?: string; to?: string };

export async function fetchRevenue(query?: FinanceQuery) {
  const p = new URLSearchParams();
  if (query?.from) p.set("from", query.from);
  if (query?.to) p.set("to", query.to);
  const url = `/api/dashboard/revenue${p.size ? `?${p.toString()}` : ""}`;
  return apiRequest(url) as Promise<RevenueResponse>;
}

export async function fetchPaymentRate(query?: FinanceQuery) {
  const p = new URLSearchParams();
  if (query?.from) p.set("from", query.from);
  if (query?.to) p.set("to", query.to);
  const url = `/api/dashboard/payment-rate${p.size ? `?${p.toString()}` : ""}`;
  return apiRequest(url) as Promise<PaymentRateResponse>;
}

export function formatCurrencyVND(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function toPercent(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}
