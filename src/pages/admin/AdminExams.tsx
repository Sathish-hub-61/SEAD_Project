import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Exam {
  id: string; exam_name: string; course_code: string; department: string;
  semester: number; exam_date: string; exam_time: string | null;
  venue: string | null; fee: number; registration_deadline: string;
  description: string | null; is_active: boolean;
}

const emptyExam = {
  exam_name: "", course_code: "", department: "", semester: 1,
  exam_date: "", exam_time: "", venue: "", fee: 0,
  registration_deadline: "", description: "",
};

export default function AdminExams() {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Partial<Exam> | null>(null);
  const [form, setForm] = useState(emptyExam);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchExams(); }, []);

  const fetchExams = async () => {
    const { data } = await supabase.from("exams").select("*").order("exam_date", { ascending: true });
    if (data) setExams(data);
    setLoading(false);
  };

  const openCreate = () => { setEditingExam(null); setForm(emptyExam); setDialogOpen(true); };
  const openEdit = (exam: Exam) => {
    setEditingExam(exam);
    setForm({
      exam_name: exam.exam_name, course_code: exam.course_code, department: exam.department,
      semester: exam.semester, exam_date: exam.exam_date, exam_time: exam.exam_time || "",
      venue: exam.venue || "", fee: exam.fee, registration_deadline: exam.registration_deadline,
      description: exam.description || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.exam_name || !form.course_code || !form.department || !form.exam_date || !form.registration_deadline) {
      toast.error("Please fill all required fields"); return;
    }
    setSaving(true);
    const payload = {
      exam_name: form.exam_name, course_code: form.course_code, department: form.department,
      semester: form.semester, exam_date: form.exam_date, exam_time: form.exam_time || null,
      venue: form.venue || null, fee: form.fee, registration_deadline: form.registration_deadline,
      description: form.description || null,
    };
    if (editingExam?.id) {
      const { error } = await supabase.from("exams").update(payload).eq("id", editingExam.id);
      if (error) toast.error(error.message); else toast.success("Exam updated");
    } else {
      const { error } = await supabase.from("exams").insert(payload);
      if (error) toast.error(error.message); else toast.success("Exam created");
    }
    setSaving(false); setDialogOpen(false); fetchExams();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this exam?")) return;
    const { error } = await supabase.from("exams").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Exam deleted"); fetchExams(); }
  };

  const handleToggleActive = async (exam: Exam) => {
    await supabase.from("exams").update({ is_active: !exam.is_active }).eq("id", exam.id);
    fetchExams();
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">Manage Exams</h1>
        <Button variant="hero" onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> Add Exam</Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border/50 bg-card/50 p-5 flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      ) : exams.length === 0 ? (
        <div className="rounded-2xl border border-border/50 bg-card/50 p-8 text-center text-muted-foreground">No exams yet.</div>
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => (
            <div key={exam.id} className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/20 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-semibold text-foreground">{exam.exam_name}</h3>
                  <Badge variant={exam.is_active ? "default" : "secondary"}>{exam.is_active ? "Active" : "Inactive"}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {exam.course_code} • {exam.department} • Sem {exam.semester} • {new Date(exam.exam_date).toLocaleDateString()} • ₹{exam.fee}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleToggleActive(exam)}>
                  {exam.is_active ? "Deactivate" : "Activate"}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(exam)}><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(exam.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingExam ? "Edit Exam" : "Create Exam"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Exam Name *</Label><Input value={form.exam_name} onChange={(e) => setForm({ ...form, exam_name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Course Code *</Label><Input value={form.course_code} onChange={(e) => setForm({ ...form, course_code: e.target.value })} /></div>
              <div className="space-y-2"><Label>Department *</Label><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Semester</Label><Input type="number" min={1} max={8} value={form.semester} onChange={(e) => setForm({ ...form, semester: parseInt(e.target.value) || 1 })} /></div>
              <div className="space-y-2"><Label>Fee (₹)</Label><Input type="number" min={0} value={form.fee} onChange={(e) => setForm({ ...form, fee: parseFloat(e.target.value) || 0 })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Exam Date *</Label><Input type="date" value={form.exam_date} onChange={(e) => setForm({ ...form, exam_date: e.target.value })} /></div>
              <div className="space-y-2"><Label>Exam Time</Label><Input type="time" value={form.exam_time} onChange={(e) => setForm({ ...form, exam_time: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Registration Deadline *</Label><Input type="date" value={form.registration_deadline} onChange={(e) => setForm({ ...form, registration_deadline: e.target.value })} /></div>
              <div className="space-y-2"><Label>Venue</Label><Input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <Button variant="hero" className="w-full" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingExam ? "Update Exam" : "Create Exam"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
