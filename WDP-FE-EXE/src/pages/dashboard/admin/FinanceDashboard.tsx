import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign, PieChart as PieIcon } from "lucide-react";
import {
  fetchRevenue,
  fetchPaymentRate,
  formatCurrencyVND,
  toPercent,
} from "@/lib/financeApi";

// recharts
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// Tailwind-friendly color palette (hex for recharts, class for UI)
const C = {
  primary: "#2563eb",
  success: "#16a34a",
  warning: "#ca8a04",
  destructive: "#dc2626",
  muted: "#6b7280",
};

// Reusable stat card
const Stat = ({
  icon,
  label,
  value,
  badge,
  subLabel,
  tone = "primary",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  badge?: string;
  subLabel?: string;
  tone?: keyof typeof C;
}) => (
  <Card className="relative border-0 shadow-soft bg-gradient-to-br from-background to-muted/30 hover:shadow-lg transition-shadow">
    <CardContent className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div
          className="p-2 rounded-xl"
          style={{ backgroundColor: `${C[tone]}20` }}
        >
          {icon}
        </div>
        {badge && <Badge className="text-xs">{badge}</Badge>}
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
      {subLabel && (
        <p className="text-xs text-muted-foreground mt-1">{subLabel}</p>
      )}
    </CardContent>
  </Card>
);

export default function FinanceDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenue, setRevenue] = useState<Awaited<
    ReturnType<typeof fetchRevenue>
  > | null>(null);
  const [paymentRate, setPaymentRate] = useState<Awaited<
    ReturnType<typeof fetchPaymentRate>
  > | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([fetchRevenue(), fetchPaymentRate()])
      .then(([rev, rate]) => {
        if (!mounted) return;
        setRevenue(rev);
        setPaymentRate(rate);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.message || "Lỗi tải dữ liệu");
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const breakdown =
    paymentRate?.data.breakdown ??
    ({ paid: 0, pending: 0, cancelled: 0 } as Record<string, number>);

  const pieData = useMemo(
    () =>
      Object.entries(breakdown)
        .filter(([, v]) => (v || 0) > 0)
        .map(([k, v]) => ({
          name:
            k === "paid"
              ? "Đã thanh toán"
              : k === "pending"
              ? "Chờ thanh toán"
              : k === "cancelled"
              ? "Đã hủy"
              : k,
          key: k,
          value: v as number,
          color:
            k === "paid"
              ? C.success
              : k === "pending"
              ? C.warning
              : C.destructive,
        })),
    [breakdown]
  );

  // Time series if your API ever returns it, expected: revenue.data.series = [{ date: '2025-10-01', amount: 12345 }, ...]
  const series = (revenue as any)?.data?.series as
    | Array<{ date: string; amount: number }>
    | undefined;
  const hasSeries = Array.isArray(series) && series.length > 0;

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Đang tải dữ liệu...
      </div>
    );
  }
  if (error) return <div className="text-destructive">{error}</div>;

  const totalRevenue = revenue?.data.revenue || 0;
  const orderCount = revenue?.data.count || 0;
  const rate = paymentRate?.data.rate || 0;
  const totalTx = paymentRate?.data.total || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight mb-2">
          Dashboard Thanh toán & Check-in
        </h2>
        <p className="text-muted-foreground">Theo dõi hiệu suất thanh toán</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Stat
          icon={<DollarSign className="h-5 w-5" style={{ color: C.success }} />}
          label="Doanh thu"
          value={formatCurrencyVND(totalRevenue)}
          subLabel={`Số đơn đã thanh toán: ${orderCount.toLocaleString()}`}
          badge="Doanh thu"
          tone="success"
        />
        <Stat
          icon={<PieIcon className="h-5 w-5" style={{ color: C.primary }} />}
          label="Tỉ lệ thanh toán thành công"
          value={toPercent(rate)}
          subLabel={`Tổng giao dịch: ${totalTx.toLocaleString()}`}
          badge="Tỉ lệ thành công"
          tone="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment breakdown with donut chart */}
        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <PieIcon className="h-5 w-5" /> Phân bố trạng thái thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="h-64">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      dataKey="value"
                      data={pieData}
                      innerRadius={60}
                      outerRadius={96}
                      paddingAngle={3}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => v.toLocaleString()} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  Không có dữ liệu biểu đồ
                </div>
              )}
            </div>

            <div className="space-y-3">
              {Object.entries(breakdown).map(([k, v]) => {
                const color =
                  k === "paid"
                    ? C.success
                    : k === "pending"
                    ? C.warning
                    : C.destructive;
                const label =
                  k === "paid"
                    ? "Đã thanh toán"
                    : k === "pending"
                    ? "Chờ thanh toán"
                    : k === "cancelled"
                    ? "Đã hủy"
                    : k;
                return (
                  <div key={k} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block w-2 h-2 rounded"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm">{label}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {(v as number) || 0}
                    </span>
                  </div>
                );
              })}

              {/* success rate progress bar */}
              <div className="mt-5">
                <p className="text-xs text-muted-foreground mb-1">
                  Tỉ lệ thanh toán thành công: {toPercent(rate)}
                </p>
                <div className="w-full h-2 rounded-full bg-muted/40 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, Math.max(0, rate * 100))}%`,
                      backgroundColor: C.success,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue over time (if series exists) */}
        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle>Doanh thu theo thời gian</CardTitle>
          </CardHeader>
          <CardContent>
            {hasSeries ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={series}
                    margin={{ left: 8, right: 8, top: 10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor={C.primary}
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="100%"
                          stopColor={C.primary}
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis
                      tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip formatter={(v: number) => formatCurrencyVND(v)} />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke={C.primary}
                      fill="url(#revFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                Chưa có API cung cấp chuỗi thời gian. Thêm{" "}
                <code>
                  revenue.data.series = [
                  {`{ date: 'YYYY-MM-DD', amount: number }`}]
                </code>{" "}
                để hiển thị biểu đồ.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
