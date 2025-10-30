import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, DollarSign, PieChart } from "lucide-react";
import {
  fetchDashboardOverview,
  formatCurrencyVND,
  formatPercent,
} from "@/lib/dashboardApi";

export default function ReportsDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Awaited<
    ReturnType<typeof fetchDashboardOverview>
  > | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetchDashboardOverview()
      .then((res) => mounted && setData(res))
      .catch((e) => mounted && setError(e?.message || "Lỗi tải dữ liệu"))
      .finally(() => mounted && setLoading(false));
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
        color: "bg-success",
        value: b?.paid || 0,
      },
      {
        key: "pending",
        label: "Chờ thanh toán",
        color: "bg-warning",
        value: b?.pending || 0,
      },
      {
        key: "cancelled",
        label: "Đã hủy",
        color: "bg-destructive",
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
        color: "bg-success",
        value: b?.completed || 0,
      },
      {
        key: "in_progress",
        label: "Đang thực hiện",
        color: "bg-electric",
        value: b?.in_progress || 0,
      },
      {
        key: "assigned",
        label: "Đã phân công",
        color: "bg-primary",
        value: b?.assigned || 0,
      },
      {
        key: "accepted",
        label: "Đã xác nhận",
        color: "bg-muted",
        value: b?.accepted || 0,
      },
      {
        key: "pending",
        label: "Chờ xử lý",
        color: "bg-warning",
        value: b?.pending || 0,
      },
      {
        key: "deposited",
        label: "Đã đặt cọc",
        color: "bg-pending",
        value: b?.deposited || 0,
      },
      {
        key: "paid",
        label: "Đã thanh toán",
        color: "bg-success/70",
        value: b?.paid || 0,
      },
      {
        key: "canceled",
        label: "Đã hủy",
        color: "bg-destructive",
        value: b?.canceled || 0,
      },
    ];
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Đang tải dữ liệu...
      </div>
    );
  }
  if (error) return <div className="text-destructive">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Báo cáo & Thống kê</h2>
        <p className="text-muted-foreground">
          Tổng hợp doanh thu, thanh toán và lịch hẹn
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-success/10">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
              <Badge className="text-xs">Doanh thu</Badge>
            </div>
            <p className="text-2xl font-bold">
              {formatCurrencyVND(data!.data.revenue)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <PieChart className="h-5 w-5 text-primary" />
              </div>
              <Badge className="text-xs">Tỉ lệ thanh toán</Badge>
            </div>
            <p className="text-2xl font-bold">
              {formatPercent(data!.data.payment.rate)}
            </p>
            <p className="text-xs text-muted-foreground">
              Tổng: {data!.data.payment.total}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-electric/10">
                <Calendar className="h-5 w-5 text-electric" />
              </div>
              <Badge className="text-xs">Tổng lịch hẹn</Badge>
            </div>
            <p className="text-2xl font-bold">{data!.data.appointment.total}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" /> Trạng thái thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentItems.map((it) => (
                <div key={it.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-2 h-2 rounded ${it.color}`}
                    ></span>
                    <span className="text-sm">{it.label}</span>
                  </div>
                  <span className="text-sm font-medium">{it.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" /> Trạng thái lịch hẹn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {appointmentItems.map((it) => (
                <div key={it.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-2 h-2 rounded ${it.color}`}
                    ></span>
                    <span className="text-sm">{it.label}</span>
                  </div>
                  <span className="text-sm font-medium">{it.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
