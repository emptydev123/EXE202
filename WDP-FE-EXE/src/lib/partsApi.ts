import { apiRequest } from "@/api/api";

export interface PartItem {
  _id: string;
  part_number?: string;
  part_name: string;
  description?: string;
  cost_price: number;
  unit_price: number;
  supplier?: string;
  warranty_month?: number;
  createdAt?: string;
}

export interface Paginated<T> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    pagination: {
      current_page: number;
      limit: number;
      total_items: number;
      total_pages: number;
      has_next_page: boolean;
      has_prev_page: boolean;
    };
  };
}

export async function listParts(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const p = new URLSearchParams();
  if (params?.page) p.set("page", String(params.page));
  if (params?.limit) p.set("limit", String(params.limit));
  if (params?.search) p.set("search", params.search);
  return apiRequest(`/api/parts${p.size ? `?${p.toString()}` : ""}`) as Promise<
    Paginated<PartItem>
  >;
}

export async function createPart(payload: Omit<PartItem, "_id" | "createdAt">) {
  return apiRequest(`/api/parts`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updatePart(
  partId: string,
  payload: Partial<Omit<PartItem, "_id" | "createdAt">>
) {
  return apiRequest(`/api/parts/${partId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deletePart(partId: string) {
  return apiRequest(`/api/parts/${partId}`, { method: "DELETE" });
}
