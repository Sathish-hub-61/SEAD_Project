import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Download, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface RegistrationWithExam {
  id: string; status: string; payment_status: string; payment_amount: number | null;
  registered_at: string;
  exams: { exam_name: string; course_code: string; exam_date: string; exam_time: string | null; venue: string | null; department: string; };
  hall_tickets: { id: string; ticket_number: string }[] | null;
}

const PAGE_SIZE = 5;

export default function MyRegistrationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<RegistrationWithExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileName, setProfileName] = useState("Student");
  const [profileRoll, setProfileRoll] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => { if (!user) return; fetchData(); }, [user]);

  const fetchData = async () => {
    const [regRes, profileRes] = await Promise.all([
      supabase.from("registrations").select("*, exams(exam_name, course_code, exam_date, exam_time, venue, department), hall_tickets(id, ticket_number)").eq("student_id", user!.id).order("registered_at", { ascending: false }),
      supabase.from("profiles").select("full_name, roll_number").eq("user_id", user!.id).single(),
    ]);
    if (regRes.data) setRegistrations(regRes.data as unknown as RegistrationWithExam[]);
    if (profileRes.data) { setProfileName(profileRes.data.full_name || "Student"); setProfileRoll(profileRes.data.roll_number || ""); }
    setLoading(false);
  };

  const handleCancel = async (regId: string) => {
    const { error } = await supabase.from("registrations").update({ status: "cancelled" }).eq("id", regId);
    if (error) toast.error("Failed to cancel registration");
    else { toast.success("Registration cancelled"); fetchData(); }
  };

  const downloadHallTicket = (reg: RegistrationWithExam) => {
    const doc = new jsPDF();
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    
    // Header Section
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, pw, 45, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("HALL TICKET", pw / 2, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("University Examination Portal", pw / 2, 32, { align: "center" });
    doc.text("Academic Session 2025-26", pw / 2, 38, { align: "center" });

    // Ticket Number
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    const ticketNum = reg.hall_tickets?.[0]?.ticket_number || `HT-${reg.id.slice(0, 8).toUpperCase()}`;
    doc.text(`TICKET NO: ${ticketNum}`, pw / 2, 60, { align: "center" });

    // Table Container
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);
    doc.rect(20, 70, pw - 40, 100);

    // Grid details
    let y = 80;
    const drawRow = (label: string, value: string) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(label, 25, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(value), 85, y);
      doc.line(20, y + 4, pw - 20, y + 4);
      y += 12;
    };

    drawRow("Student Name", profileName);
    drawRow("Registration ID", `REG-${reg.id.slice(0, 6).toUpperCase()}`);
    drawRow("Course / Exam", reg.exams?.exam_name || "N/A");
    drawRow("Subject Code", reg.exams?.course_code || "N/A");
    drawRow("Department", reg.exams?.department || "N/A");
    drawRow("Exam Date", new Date(reg.exams?.exam_date).toLocaleDateString("en-US", { dateStyle: "long" }));
    drawRow("Exam Time", reg.exams?.exam_time || "09:00 AM - 12:00 PM");
    drawRow("Examination Venue", reg.exams?.venue || "Main Campus Hall A");

    // Important Instructions
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("IMPORTANT INSTRUCTIONS", 20, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const instructions = [
      "1. Candidates must carry this Hall Ticket and a valid ID card.",
      "2. Please reach the venue 30 minutes before the scheduled time.",
      "3. Possession of mobile phones or electronic gadgets is strictly prohibited.",
      "4. This is a computer-generated document and does not require a physical signature."
    ];
    instructions.forEach(line => {
      doc.text(line, 20, y);
      y += 6;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated on ${new Date().toLocaleString()}`, pw / 2, ph - 15, { align: "center" });

    doc.save(`HallTicket_${ticketNum}.pdf`);
  };

  const statusColor = (s: string) => {
    if (s === "confirmed" || s === "approved") return "default";
    if (s === "cancelled" || s === "rejected") return "destructive";
    return "secondary";
  };
  const canCancel = (reg: RegistrationWithExam) => reg.status !== "cancelled" && reg.payment_status !== "paid";
  const totalPages = Math.max(1, Math.ceil(registrations.length / PAGE_SIZE));
  const paginated = registrations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="p-5 md:p-8 max-w-3xl mx-auto space-y-4">
      <div className="animate-fade-in">
        <h1 className="text-xl font-display font-bold text-foreground">My Registrations</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{registrations.length} registration{registrations.length !== 1 ? "s" : ""}</p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-36" />
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
        <>
          <div className="space-y-2">
            {paginated.map((reg, i) => (
              <div key={reg.id} className="rounded-xl border border-border bg-card p-5 space-y-3 card-elevated animate-fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-display font-semibold text-foreground text-sm">{reg.exams?.exam_name}</h3>
                    <p className="text-xs text-muted-foreground">{reg.exams?.course_code} · {reg.exams?.department}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Badge variant={statusColor(reg.status) as any} className="text-xs">
                      {reg.status}
                    </Badge>
                    <Badge variant={reg.payment_status === "paid" ? "default" : "destructive"} className="text-xs">
                      {reg.payment_status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Exam: {new Date(reg.exams?.exam_date).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
                  <span>Registered: {new Date(reg.registered_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {reg.payment_status === "paid" && (
                    <Button variant="hero" size="sm" onClick={() => downloadHallTicket(reg)}>
                      <Download className="w-3.5 h-3.5 mr-1" /> Hall Ticket
                    </Button>
                  )}
                  {canCancel(reg) && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive border-destructive/20 hover:bg-destructive/5">
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Registration?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cancel your registration for <strong>{reg.exams?.exam_name}</strong>? This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleCancel(reg.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Yes, Cancel
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Previous
              </Button>
              <span className="text-xs text-muted-foreground px-2">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
