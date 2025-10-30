import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Calendar,
  DollarSign,
  PieChart as PieIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  fetchDashboardOverview,
  formatCurrencyVND,
  formatPercent,
} from "@/lib/dashboardApi";
import {
  PieChart as RPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Small helper for nicer cards
const Stat = ({
  icon,
  label,
  value,
  subLabel,
  badge,
  color = "primary",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subLabel?: string;
  badge?: string;
  color?: "primary" | "success" | "electric";
}) => (
  <Card className="relative border-0 shadow-soft bg-gradient-to-br from-background to-muted/30 hover:shadow-lg transition-shadow">
    <CardContent className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-xl bg-${color}/10`}>{icon}</div>
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

const COLORS_HEX: Record<string, string> = {
  primary: "#2563eb", // tailwind blue-600
  success: "#16a34a", // green-600
  success70: "#22c55e",
  warning: "#ca8a04", // yellow-600
  destructive: "#dc2626", // red-600
  muted: "#6b7280", // gray-500
  electric: "#0ea5e9", // sky-500
  pending: "#a855f7", // violet-600
};

const AdminOverview = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Awaited<
    ReturnType<typeof fetchDashboardOverview>
  > | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetchDashboardOverview()
      .then((res) => {
        if (mounted) setData(res);
      })
      .catch((e) => {
        if (mounted) setError(e?.message || "Lỗi tải dữ liệu");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const paymentItems = useMemo(() => {
    const b = data?.data.payment.breakdown;
    return [
      {
        key: "paid",
        label: "Đã thanh toán",
        color: "success",
        value: b?.paid || 0,
      },
      {
        key: "pending",
        label: "Chờ thanh toán",
        color: "warning",
        value: b?.pending || 0,
      },
      {
        key: "cancelled",
        label: "Đã hủy",
        color: "destructive",
        value: b?.cancelled || 0,
      },
    ];
  }, [data]);

  const appointmentItems = useMemo(() => {
    const b = data?.data.appointment.breakdown;
    return [
      {
        key: "completed",
        label: "Hoàn thành",
        color: "success",
        value: b?.completed || 0,
      },
      {
        key: "in_progress",
        label: "Đang thực hiện",
        color: "electric",
        value: b?.in_progress || 0,
      },
      {
        key: "assigned",
        label: "Đã phân công",
        color: "primary",
        value: b?.assigned || 0,
      },
      {
        key: "accepted",
        label: "Đã xác nhận",
        color: "muted",
        value: b?.accepted || 0,
      },
      {
        key: "pending",
        label: "Chờ xử lý",
        color: "warning",
        value: b?.pending || 0,
      },
      {
        key: "deposited",
        label: "Đã đặt cọc",
        color: "pending",
        value: b?.deposited || 0,
      },
      {
        key: "paid",
        label: "Đã thanh toán",
        color: "success70",
        value: b?.paid || 0,
      },
      {
        key: "canceled",
        label: "Đã hủy",
        color: "destructive",
        value: b?.canceled || 0,
      },
    ];
  }, [data]);

  const paymentPieData = paymentItems
    .filter((x) => x.value > 0)
    .map((x) => ({
      name: x.label,
      value: x.value,
      color: COLORS_HEX[x.color],
    }));

  const appointmentPieData = appointmentItems
    .filter((x) => x.value > 0)
    .map((x) => ({
      name: x.label,
      value: x.value,
      color: COLORS_HEX[x.color],
    }));

  const paymentRate = data?.data.payment.rate || 0;

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold tracking-tight mb-2">
          Tổng quan hệ thống
        </h2>
        <p className="text-muted-foreground">
          Theo dõi hoạt động trung tâm dịch vụ EV
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Đang tải dữ liệu...
        </div>
      ) : error ? (
        <div className="text-destructive">{error}</div>
      ) : (
        <>
          {/* Top stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Stat
              icon={<DollarSign className="h-5 w-5 text-success" />}
              label="Doanh thu"
              value={formatCurrencyVND(data!.data.revenue)}
              badge="Tổng doanh thu"
              color="success"
            />
            <Stat
              icon={<PieIcon className="h-5 w-5 text-primary" />}
              label="Thanh toán"
              value={data!.data.payment.total}
              subLabel={`Tỉ lệ thành công: ${formatPercent(paymentRate)}`}
              badge="Tổng đơn thanh toán"
              color="primary"
            />
            <Stat
              icon={<Calendar className="h-5 w-5 text-electric" />}
              label="Lịch hẹn"
              value={data!.data.appointment.total}
              badge="Tổng lịch hẹn"
              color="electric"
            />
          </div>

          {/* Charts + breakdowns */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Appointment status */}
            <Card className="border-0 shadow-soft bg-gradient-to-br from-background to-muted/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <PieIcon className="h-5 w-5" /> Trạng thái lịch hẹn
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RPieChart>
                      <Pie
                        dataKey="value"
                        data={appointmentPieData}
                        outerRadius={100}
                        innerRadius={60}
                        paddingAngle={3}
                      >
                        {appointmentPieData.map((entry, index) => (
                          <Cell key={`cell-a-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => v.toLocaleString()} />
                      <Legend />
                    </RPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {appointmentItems.map((it) => (
                    <div
                      key={it.key}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block w-2 h-2 rounded bg-[${
                            COLORS_HEX[it.color]
                          }]`}
                          style={{ backgroundColor: COLORS_HEX[it.color] }}
                        />
                        <span className="text-sm">{it.label}</span>
                      </div>
                      <span className="text-sm font-medium">{it.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment status */}
            <Card className="border-0 shadow-soft bg-gradient-to-br from-background to-muted/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <PieIcon className="h-5 w-5" /> Trạng thái thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RPieChart>
                      <Pie
                        dataKey="value"
                        data={paymentPieData}
                        outerRadius={100}
                        innerRadius={60}
                        paddingAngle={3}
                      >
                        {paymentPieData.map((entry, index) => (
                          <Cell key={`cell-p-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => v.toLocaleString()} />
                      <Legend />
                    </RPieChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <div className="space-y-3">
                    {paymentItems.map((it) => (
                      <div
                        key={it.key}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block w-2 h-2 rounded"
                            style={{ backgroundColor: COLORS_HEX[it.color] }}
                          />
                          <span className="text-sm">{it.label}</span>
                        </div>
                        <span className="text-sm font-medium">{it.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Success rate bar */}
                  <div className="mt-5">
                    <p className="text-xs text-muted-foreground mb-1">
                      Tỉ lệ thanh toán thành công: {formatPercent(paymentRate)}
                    </p>
                    <div className="w-full h-2 rounded-full bg-muted/40 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-success transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(0, paymentRate * 100)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </>
  );
};

export default AdminOverview;
