import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Check, X, ShieldAlert, Filter, ArrowRight, Search, CreditCard, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RegWithDetails {
  id: string; student_id: string; status: string; payment_status: string;
  payment_amount: number | null; registered_at: string;
  exams: { id: string; exam_name: string; course_code: string; department: string };
  profiles: { full_name: string; roll_number: string | null } | null;
}

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState<RegWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => { fetchRegistrations(); }, []);

  const fetchRegistrations = async () => {
    const { data: regs } = await supabase.from("registrations").select("*, exams(id, exam_name, course_code, department)").order("registered_at", { ascending: false });
    if (!regs) { setLoading(false); return; }
    
    interface RawProfile { user_id: string; full_name: string; roll_number: string | null }
    const studentIds = [...new Set(regs.map(r => r.student_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, roll_number").in("user_id", studentIds);
    
    const profileMap = new Map<string, RawProfile>((profiles as RawProfile[] || []).map(p => [p.user_id, p]));
    const enriched = regs.map(r => ({ ...r, profiles: profileMap.get(r.student_id) || null }));
    
    setRegistrations(enriched as RegWithDetails[]);
    setLoading(false);
  };

  const updateStatus = async (regId: string, status: string, studentId: string, examName: string) => {
    const { error } = await supabase.from("registrations").update({ status }).eq("id", regId);
    if (error) {
      toast.error("Failed to update status");
      return;
    }

    // Create a notification for the student
    await supabase.from("notifications").insert({
      user_id: studentId,
      title: `Registration ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your registration for ${examName} has been ${status}.`,
      type: status === "confirmed" ? "success" : "warning",
    });

    toast.success(`Registration ${status}`);
    fetchRegistrations();
  };

  const filtered = registrations.filter((r) => {
    const matchesSearch = r.exams?.exam_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.profiles?.roll_number?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-display font-bold text-foreground">Registration Monitoring</h1>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, roll number, or exam..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border/50 bg-card/50 p-5 flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-64" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border/50 bg-card/50 p-8 text-center text-muted-foreground">No registrations found.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((reg) => (
            <div key={reg.id} className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/20 transition-all card-elevated">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-display font-semibold text-foreground">{reg.profiles?.full_name || "Unknown Student"}</p>
                  <Badge variant={reg.status === "confirmed" ? "default" : reg.status === "cancelled" ? "destructive" : "secondary"} className="text-[10px] h-4">
                    {reg.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <span className="font-mono text-xs bg-muted px-1 rounded">{reg.profiles?.roll_number || "NO-ROLL"}</span>
                  <span>•</span>
                  <span>{reg.exams?.exam_name}</span>
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><ArrowRight className="w-3 h-3" /> Registered: {new Date(reg.registered_at).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> {reg.payment_status} {reg.payment_amount ? `(₹${reg.payment_amount})` : ""}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0">
                {reg.status === "pending" && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => updateStatus(reg.id, "confirmed", reg.student_id, reg.exams.exam_name)}
                      className="h-8 text-xs border-success/30 hover:bg-success/10 hover:text-success text-success"
                    >
                      <Check className="w-3 h-3 mr-1" /> Approve
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => updateStatus(reg.id, "cancelled", reg.student_id, reg.exams.exam_name)}
                      className="h-8 text-xs border-destructive/30 hover:bg-destructive/10 hover:text-destructive text-destructive"
                    >
                      <X className="w-3 h-3 mr-1" /> Reject
                    </Button>
                  </>
                )}
                {reg.status === "confirmed" && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    disabled 
                    className="h-8 text-xs text-muted-foreground bg-muted/30"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
                  </Button>
                )}
                <Badge variant={reg.payment_status === "paid" ? "default" : "outline"} className="h-8 px-3">
                  {reg.payment_status === "paid" ? "PAID" : "UNPAID"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
