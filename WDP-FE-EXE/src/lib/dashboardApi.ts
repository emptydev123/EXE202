import { apiRequest } from "@/api/api";

export type DashboardOverviewResponse = {
  success: boolean;
  message: string;
  data: {
    revenue: number;
    payment: {
      total: number;
      rate: number; // 0..1
      breakdown: {
        pending: number;
        paid: number;
        cancelled: number;
      };
    };
    appointment: {
      total: number;
      breakdown: {
        pending: number;
        deposited: number;
        accepted: number;
        assigned: number;
        in_progress: number;
        completed: number;
        paid: number;
        canceled: number;
      };
    };
  };
};

export type OverviewQuery = {
  from?: string; // ISO date
  to?: string; // ISO date
  center_id?: string;
};

export async function fetchDashboardOverview(query?: OverviewQuery) {
  const params = new URLSearchParams();
  if (query?.from) params.set("from", query.from);
  if (query?.to) params.set("to", query.to);
  if (query?.center_id) params.set("center_id", query.center_id);
  const qs = params.toString();
  const url = `/api/dashboard/overview${qs ? `?${qs}` : ""}`;
  return apiRequest(url) as Promise<DashboardOverviewResponse>;
}

export function formatCurrencyVND(value: number) {
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value}₫`;
  }
}

export function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}
