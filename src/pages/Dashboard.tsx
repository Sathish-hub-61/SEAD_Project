import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, CreditCard, Calendar, ArrowRight, TrendingUp } from "lucide-react";

interface Profile { full_name: string; }
interface Registration {
  id: string; status: string; payment_status: string; registered_at: string;
  exams: { exam_name: string; course_code: string; exam_date: string; };
}
interface Notification {
  id: string; title: string; message: string; type: string; is_read: boolean; created_at: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    const [profileRes, regRes, notifRes] = await Promise.all([
      supabase.from("profiles").select("full_name").eq("user_id", user!.id).single(),
      supabase.from("registrations").select("*, exams(exam_name, course_code, exam_date)").eq("student_id", user!.id).order("registered_at", { ascending: false }).limit(5),
      supabase.from("notifications").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(5),
    ]);
    if (profileRes.data) setProfile(profileRes.data as unknown as Profile);
    if (regRes.data) setRegistrations(regRes.data as unknown as Registration[]);
    if (notifRes.data) setNotifications(notifRes.data as unknown as Notification[]);
    setLoading(false);
  };

  const confirmedCount = registrations.filter(r => r.status === "confirmed").length;
  const pendingPayments = registrations.filter(r => r.payment_status === "unpaid" || r.payment_status === "pending").length;

  const statCards = [
    { label: "Registered Exams", value: registrations.length, icon: BookOpen, color: "text-accent" },
    { label: "Confirmed", value: confirmedCount, icon: Calendar, color: "text-success" },
    { label: "Pending Payments", value: pendingPayments, icon: CreditCard, color: "text-warning" },
  ];

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="animate-fade-in">
        <p className="text-sm text-muted-foreground mb-1">Welcome back</p>
        <h1 className="text-2xl font-display font-bold text-foreground">
          {profile?.full_name || "Student"}
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-fade-in" style={{ animationDelay: "0.05s" }}>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-12" />
            </div>
          ))
        ) : (
          statCards.map((card) => (
            <div key={card.label} className="rounded-xl border border-border bg-card p-5 card-elevated">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{card.label}</span>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <p className="text-2xl font-display font-bold text-foreground">{card.value}</p>
            </div>
          ))
        )}
      </div>

      {/* Quick Action */}
      <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <Button variant="hero" onClick={() => navigate("/exams")} size="sm">
          Browse Exams <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>

      {/* Recent Registrations */}
      <div className="animate-fade-in" style={{ animationDelay: "0.15s" }}>
        <h2 className="text-base font-display font-semibold text-foreground mb-3">Recent Registrations</h2>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-9 h-9 rounded-lg" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            ))}
          </div>
        ) : registrations.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center card-elevated">
            <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">No registrations yet</p>
            <Button variant="hero" size="sm" onClick={() => navigate("/exams")}>Browse Exams</Button>
          </div>
        ) : (
          <div className="space-y-2">
            {registrations.map((reg) => (
              <div key={reg.id} className="rounded-lg border border-border bg-card p-4 flex items-center justify-between card-elevated transition-all duration-150">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{reg.exams?.exam_name}</p>
                    <p className="text-xs text-muted-foreground">{reg.exams?.course_code} · {new Date(reg.exams?.exam_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={reg.status === "confirmed" ? "default" : "secondary"} className="text-xs">{reg.status}</Badge>
                  <Badge variant={reg.payment_status === "paid" ? "default" : "destructive"} className="text-xs">{reg.payment_status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-base font-display font-semibold text-foreground mb-3">Notifications</h2>
          <div className="space-y-1.5">
            {notifications.map((notif) => (
              <div key={notif.id} className={`rounded-lg border border-border bg-card p-3 ${notif.is_read ? "opacity-50" : ""}`}>
                <div className="flex items-start gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                    notif.type === "success" ? "bg-success" :
                    notif.type === "warning" ? "bg-warning" :
                    notif.type === "error" ? "bg-destructive" : "bg-accent"
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{notif.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
