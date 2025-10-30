import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listParts, deletePart, PartItem } from "@/lib/partsApi";
import { Loader2, Plus, Trash2 } from "lucide-react";

export default function PartsManagement() {
  const [items, setItems] = useState<PartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await listParts({
        page: 1,
        limit: 10,
        search: search || undefined,
      });
      setItems(res.data.items);
    } catch (e: any) {
      setError(e?.message || "Lỗi tải danh sách phụ tùng");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quản lý phụ tùng</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Tìm theo tên, số part..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button onClick={load}>Tìm kiếm</Button>
          <Button variant="default">
            <Plus className="h-4 w-4 mr-1" /> Thêm mới
          </Button>
        </div>
      </div>

      <Card className="bg-gradient-card border-0 shadow-soft">
        <CardHeader className="pb-4">
          <CardTitle>Danh sách phụ tùng</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Đang tải...
            </div>
          ) : error ? (
            <div className="text-destructive">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Giá nhập</TableHead>
                  <TableHead>Giá bán</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell className="font-mono text-xs">
                      {p.part_number || "-"}
                    </TableCell>
                    <TableCell>{p.part_name}</TableCell>
                    <TableCell>
                      {p.cost_price?.toLocaleString("vi-VN")}
                    </TableCell>
                    <TableCell>
                      {p.unit_price?.toLocaleString("vi-VN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={async () => {
                          await deletePart(p._id);
                          await load();
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
