import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar, ArrowRight, Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface Exam {
  id: string; exam_name: string; course_code: string; department: string;
  semester: number; exam_date: string; exam_time: string | null;
  venue: string | null; fee: number; registration_deadline: string;
  description: string | null;
}

const PAGE_SIZE = 9;

export default function ExamsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => { fetchExams(); }, []);

  const fetchExams = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("exams").select("*").eq("is_active", true).order("exam_date", { ascending: true });
    if (data) setExams(data);
    if (error) toast.error("Failed to load exams");
    setLoading(false);
  };

  const filteredExams = exams.filter((exam) => {
    const matchesSearch = exam.exam_name.toLowerCase().includes(search.toLowerCase()) || exam.course_code.toLowerCase().includes(search.toLowerCase());
    const matchesSemester = semesterFilter === "all" || exam.semester === parseInt(semesterFilter);
    const matchesDept = deptFilter === "all" || exam.department === deptFilter;
    return matchesSearch && matchesSemester && matchesDept;
  });

  const totalPages = Math.max(1, Math.ceil(filteredExams.length / PAGE_SIZE));
  const paginatedExams = filteredExams.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, semesterFilter, deptFilter]);

  const departments = [...new Set(exams.map(e => e.department))];
  const isDeadlinePassed = (deadline: string) => new Date(deadline) < new Date();

  return (
    <div className="p-5 md:p-8 space-y-5 max-w-6xl mx-auto">
      <div className="animate-fade-in">
        <h1 className="text-xl font-display font-bold text-foreground">Browse Exams</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{filteredExams.length} exam{filteredExams.length !== 1 ? "s" : ""} available</p>
      </div>

      <div className="flex flex-col md:flex-row gap-2 animate-fade-in" style={{ animationDelay: "0.05s" }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search exams..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={semesterFilter} onValueChange={setSemesterFilter}>
          <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Semester" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Semesters</SelectItem>
            {[1,2,3,4,5,6,7,8].map(s => <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">No exams found matching your criteria.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {paginatedExams.map((exam, i) => (
              <div key={exam.id} className="rounded-xl border border-border bg-card p-5 space-y-3 card-elevated transition-all duration-150 hover:translate-y-[-1px] animate-fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-display font-semibold text-foreground text-sm truncate">{exam.exam_name}</h3>
                    <p className="text-xs text-muted-foreground">{exam.course_code}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">{exam.department}</Badge>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" /><span>{new Date(exam.exam_date).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
                  </div>
                  {exam.exam_time && <div className="flex items-center gap-2 text-muted-foreground"><Clock className="w-3.5 h-3.5" /><span>{exam.exam_time}</span></div>}
                  {exam.venue && <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-3.5 h-3.5" /><span>{exam.venue}</span></div>}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Fee</p>
                    <p className="font-display font-bold text-foreground text-sm">₹{exam.fee}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Deadline</p>
                    <p className={`text-xs font-medium ${isDeadlinePassed(exam.registration_deadline) ? "text-destructive" : "text-foreground"}`}>{new Date(exam.registration_deadline).toLocaleDateString('en-US', { dateStyle: 'medium' })}</p>
                  </div>
                </div>
                <Button variant="hero" className="w-full" size="sm" disabled={isDeadlinePassed(exam.registration_deadline)} onClick={() => navigate(`/register-exam/${exam.id}`)}>
                  {isDeadlinePassed(exam.registration_deadline) ? "Deadline Passed" : "Register Now"}
                  {!isDeadlinePassed(exam.registration_deadline) && <ArrowRight className="w-3.5 h-3.5 ml-1" />}
                </Button>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Previous
              </Button>
              <span className="text-xs text-muted-foreground px-2">
                Page {page} of {totalPages}
              </span>
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
