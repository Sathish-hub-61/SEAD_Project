import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Save, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface ProfileData {
  full_name: string; roll_number: string | null; course: string | null;
  department: string | null; semester: number | null; phone: string | null;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "", roll_number: null, course: null, department: null, semester: null, phone: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (user) fetchProfile(); }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase.from("profiles").select("full_name, roll_number, course, department, semester, phone").eq("user_id", user!.id).single();
    if (data) setProfile(data);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: profile.full_name, roll_number: profile.roll_number, course: profile.course,
      department: profile.department, semester: profile.semester, phone: profile.phone,
    }).eq("user_id", user!.id);
    setSaving(false);
    if (error) toast.error("Failed to update profile");
    else toast.success("Profile updated successfully!");
  };

  const isComplete = profile.full_name && profile.roll_number && profile.department && profile.course && profile.semester;

  if (loading) return <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>;

  return (
    <div className="p-5 md:p-8 max-w-lg mx-auto">
      <div className="mb-5 animate-fade-in">
        <h1 className="text-xl font-display font-bold text-foreground">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your academic information</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-5 card-elevated animate-fade-in" style={{ animationDelay: "0.05s" }}>
        {/* Profile header */}
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-display font-semibold text-foreground">{profile.full_name || "Student"}</h2>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          {isComplete && (
            <div className="flex items-center gap-1 text-success">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-medium">Complete</span>
            </div>
          )}
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm">Full Name</Label>
            <Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Roll Number</Label>
              <Input value={profile.roll_number || ""} onChange={(e) => setProfile({ ...profile, roll_number: e.target.value })} placeholder="2024CS001" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Phone</Label>
              <Input value={profile.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+91 98765 43210" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Course</Label>
            <Input value={profile.course || ""} onChange={(e) => setProfile({ ...profile, course: e.target.value })} placeholder="B.Tech Computer Science" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Department</Label>
              <Select value={profile.department || ""} onValueChange={(val) => setProfile({ ...profile, department: val })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {["Computer Science", "Electronics", "Electrical", "Mechanical", "Civil", "Mathematics"].map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Semester</Label>
              <Select value={profile.semester?.toString() || ""} onValueChange={(val) => setProfile({ ...profile, semester: parseInt(val) })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6,7,8].map((s) => <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Button variant="hero" className="w-full" onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-1" /> {saving ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}
