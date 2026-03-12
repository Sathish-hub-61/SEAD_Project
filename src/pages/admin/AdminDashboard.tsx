import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  BookOpen, Users, CreditCard, BarChart3, FileText, CheckCircle2, AlertCircle, ArrowRight, Database, Sparkles
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, Cell, PieChart, Pie
} from "recharts";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ exams: 0, registrations: 0, paid: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<{ date: string; count: number }[]>([]);
  const [pieData, setPieData] = useState<{ name: string; value: number; color: string }[]>([]);

  useEffect(() => { if (user) fetchStats(); }, [user]);

  const fetchStats = async () => {
    const [examsRes, regsRes] = await Promise.all([
      supabase.from("exams").select("id", { count: "exact", head: true }),
      supabase.from("registrations").select("id, payment_status, registered_at"),
    ]);
    const regs = regsRes.data || [];
    
    setStats({
      exams: examsRes.count || 0, registrations: regs.length,
      paid: regs.filter((r) => r.payment_status === "paid").length,
      pending: regs.filter((r) => r.payment_status !== "paid").length,
    });

    // Process Chart Data (Last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const dailyCounts = last7Days.map(date => ({
      date: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
      count: regs.filter(r => r.registered_at.startsWith(date)).length
    }));
    setChartData(dailyCounts);

    setPieData([
      { name: 'Paid', value: regs.filter(r => r.payment_status === 'paid').length, color: '#10b981' },
      { name: 'Pending', value: regs.filter(r => r.payment_status !== 'paid').length, color: '#f59e0b' }
    ]);

    setLoading(false);
  };

  const seedSampleExams = async () => {
    setLoading(true);
    const sampleExams = [
      { exam_name: "End Semester Theory - Mathematics I", course_code: "MATH101", department: "Computer Science", semester: 1, exam_date: "2026-05-15", exam_time: "09:30 AM", venue: "Examination Hall A", fee: 500, registration_deadline: "2026-05-01", description: "Final theory examination for Engineering Mathematics I.", is_active: true },
      { exam_name: "Computer Programming in C", course_code: "CS102", department: "Computer Science", semester: 2, exam_date: "2026-05-18", exam_time: "02:00 PM", venue: "Lab Complex 1", fee: 450, registration_deadline: "2026-05-05", description: "Practical and Theory combined evaluation.", is_active: true },
      { exam_name: "Digital Logic Design", course_code: "ECE201", department: "Electronics", semester: 3, exam_date: "2026-05-20", exam_time: "09:30 AM", venue: "Block B - Room 204", fee: 500, registration_deadline: "2026-05-07", description: "Covers combinational and sequential circuit design.", is_active: true },
    ];

    const { error } = await supabase.from("exams").insert(sampleExams);
    if (error) {
      toast.error("Failed to seed exams: " + error.message);
    } else {
      toast.success("Sample exams added successfully!");
      fetchStats();
    }
    setLoading(false);
  };

  const cards = [
    { label: "Total Exams", value: stats.exams, icon: BookOpen, iconColor: "text-primary" },
    { label: "Total Registrations", value: stats.registrations, icon: Users, iconColor: "text-accent" },
    { label: "Payments Received", value: stats.paid, icon: CreditCard, iconColor: "text-success" },
    { label: "Pending Payments", value: stats.pending, icon: CreditCard, iconColor: "text-warning" },
  ];

  const navItems = [
    { label: "Manage Exams", icon: BookOpen, path: "/admin/exams", desc: "Create, edit and manage exam catalog" },
    { label: "Registrations", icon: FileText, path: "/admin/registrations", desc: "Monitor student registrations" },
    { label: "Reports", icon: BarChart3, path: "/admin/reports", desc: "Analytics and revenue reports" },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-foreground animate-fade-in">
        Admin <span className="gradient-text">Dashboard</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-5 w-5 rounded" />
              </div>
              <Skeleton className="h-9 w-16" />
            </div>
          ))
        ) : (
          cards.map((c, i) => (
            <div key={c.label} className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 space-y-2 animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">{c.label}</span>
                <c.icon className={`w-5 h-5 ${c.iconColor}`} />
              </div>
              <p className="text-3xl font-display font-bold text-foreground">{c.value}</p>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-sm">
          <h3 className="text-lg font-display font-semibold mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> Registration Activity
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <ChartTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} 
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-sm">
          <h3 className="text-lg font-display font-semibold mb-6">Payment Status</h3>
          <div className="h-[240px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-success" /> <span>Paid</span></div>
              <span className="font-semibold">{stats.paid}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-warning" /> <span>Pending</span></div>
              <span className="font-semibold">{stats.pending}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-6 animate-fade-in shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">Demo Utilities</h3>
              <p className="text-sm text-muted-foreground">Populate your portal with sample data for a quick demonstration.</p>
            </div>
          </div>
          <Button variant="hero" onClick={seedSampleExams} disabled={loading}>
            <Database className="w-4 h-4 mr-2" /> Seed Sample Exams
          </Button>
        </div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {navItems.map((item, i) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 text-left hover:border-primary/20 hover:bg-primary/5 transition-all animate-fade-in shadow-sm overflow-hidden"
            style={{ animationDelay: `${(i + 4) * 0.05}s` }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <item.icon className="w-8 h-8 text-primary transition-transform group-hover:scale-110" />
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </div>
              <h3 className="font-display font-semibold text-foreground">{item.label}</h3>
              <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
            </div>
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}
