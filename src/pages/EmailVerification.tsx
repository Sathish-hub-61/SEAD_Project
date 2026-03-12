import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mail, ArrowRight } from "lucide-react";
import { GraduationCap } from "lucide-react";
import { ThemeToggleButton } from "@/components/ThemeToggle";

export default function EmailVerificationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-accent/5 blur-[120px]" />
      </div>
      <ThemeToggleButton className="absolute top-4 right-4 z-50" />

      <div className="w-full max-w-md animate-fade-in relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4 shadow-lg shadow-primary/20">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">Check Your Email</h1>
          <p className="text-muted-foreground">
            We've sent a verification link to your email address. Please click the link to verify your account before signing in.
          </p>
          <p className="text-sm text-muted-foreground">
            Didn't receive the email? Check your spam folder or try registering again.
          </p>
          <Link to="/login">
            <Button variant="hero" className="w-full">
              Go to Login <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
