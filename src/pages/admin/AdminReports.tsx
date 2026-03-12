import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface ExamStat { exam_name: string; count: number; }

export default function AdminReports() {
  const [examStats, setExamStats] = useState<ExamStat[]>([]);
  const [paymentStats, setPaymentStats] = useState({ paid: 0, unpaid: 0 });
  const [deptStats, setDeptStats] = useState<{ name: string; value: number }[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    const { data: regs } = await supabase.from("registrations").select("*, exams(exam_name, department)");
    if (!regs) { setLoading(false); return; }
    const examMap = new Map<string, number>();
    const deptMap = new Map<string, number>();
    let paid = 0, unpaid = 0, revenue = 0;
    regs.forEach((r: any) => {
      const name = r.exams?.exam_name || "Unknown";
      examMap.set(name, (examMap.get(name) || 0) + 1);
      const dept = r.exams?.department || "Unknown";
      deptMap.set(dept, (deptMap.get(dept) || 0) + 1);
      if (r.payment_status === "paid") { paid++; revenue += r.payment_amount || 0; } else unpaid++;
    });
    setExamStats(Array.from(examMap, ([exam_name, count]) => ({ exam_name, count })).sort((a, b) => b.count - a.count));
    setDeptStats(Array.from(deptMap, ([name, value]) => ({ name, value })));
    setPaymentStats({ paid, unpaid });
    setTotalRevenue(revenue);
    setLoading(false);
  };

  const COLORS = [
    "hsl(38, 90%, 58%)", "hsl(190, 70%, 50%)", "hsl(152, 55%, 48%)",
    "hsl(0, 65%, 55%)", "hsl(260, 60%, 58%)", "hsl(200, 70%, 50%)",
  ];

  const exportCSV = () => {
    const rows = [["Exam", "Registrations"], ...examStats.map((e) => [e.exam_name, e.count.toString()])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "exam_report.csv"; a.click();
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">Reports & Analytics</h1>
        <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-1" /> Export CSV</Button>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 animate-fade-in">
            <p className="text-sm text-muted-foreground">Total Revenue Collected</p>
            <p className="text-4xl font-display font-bold gradient-text">₹{totalRevenue.toLocaleString()}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 animate-fade-in">
              <h3 className="font-display font-semibold text-foreground mb-4">Registrations by Exam</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={examStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="exam_name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} angle={-20} textAnchor="end" height={80} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                  <Bar dataKey="count" fill="hsl(38, 90%, 58%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 animate-fade-in">
              <h3 className="font-display font-semibold text-foreground mb-4">Payment Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={[{ name: "Paid", value: paymentStats.paid }, { name: "Unpaid", value: paymentStats.unpaid }]} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                    <Cell fill="hsl(152, 55%, 48%)" />
                    <Cell fill="hsl(0, 65%, 55%)" />
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 animate-fade-in lg:col-span-2">
              <h3 className="font-display font-semibold text-foreground mb-4">Registrations by Department</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={deptStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {deptStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
