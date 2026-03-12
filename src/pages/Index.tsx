import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggleButton } from "@/components/ThemeToggle";
import { motion } from "framer-motion";
import {
  GraduationCap, ArrowRight, BookOpen, CreditCard, Shield, MessageCircle,
  Star, Zap, Download, Check,
} from "lucide-react";

const ease = [0.25, 0.1, 0.25, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1, scale: 1,
    transition: { delay: i * 0.06, duration: 0.4, ease },
  }),
};

const features = [
  { icon: BookOpen, title: "Browse & Register", desc: "View available exams with schedules, fees, and deadlines. Register in a few clicks." },
  { icon: CreditCard, title: "Secure Payments", desc: "Pay exam fees securely via Stripe. Instant confirmation and digital receipt." },
  { icon: Download, title: "Hall Tickets", desc: "Download formatted PDF hall tickets instantly after payment confirmation." },
  { icon: MessageCircle, title: "AI Assistant", desc: "Get instant answers about registration, payments, and schedules." },
  { icon: Shield, title: "Admin Portal", desc: "Manage exams, monitor registrations, and generate comprehensive reports." },
  { icon: Zap, title: "Real-time Updates", desc: "Instant notifications for registrations, payments, and schedule changes." },
];

const testimonials = [
  { name: "Priya Sharma", role: "B.Tech CS, Semester 6", text: "ExamPortal made registering for exams incredibly easy. No more standing in queues!", avatar: "PS" },
  { name: "Rahul Mehta", role: "B.Tech ME, Semester 4", text: "Seamless payment integration. I registered and paid for 5 exams in under 10 minutes.", avatar: "RM" },
  { name: "Dr. Ananya Roy", role: "Exam Coordinator", text: "The admin dashboard gives me a complete overview of all registrations. It's transformed our workflow.", avatar: "AR" },
];

const stats = [
  { value: "10,000+", label: "Students" },
  { value: "500+", label: "Exams" },
  { value: "99.9%", label: "Uptime" },
  { value: "< 2min", label: "Avg. Registration" },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">ExamPortal</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            {["Features", "How It Works", "Testimonials"].map((link) => (
              <button
                key={link}
                onClick={() => document.getElementById(link.toLowerCase().replace(/ /g, "-"))?.scrollIntoView({ behavior: "smooth" })}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggleButton />
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Sign In</Button>
            <Button variant="hero" size="sm" onClick={() => navigate("/register")}>Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-20 pb-20 md:pt-28 md:pb-28 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
          className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3.5 py-1 text-sm text-accent mb-8"
        >
          <Check className="w-3.5 h-3.5" />
          <span className="font-medium">Trusted by 10,000+ students across universities</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease }}
          className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold text-foreground leading-[1.1] tracking-tight text-balance max-w-3xl mx-auto"
        >
          Student Exam Registration{" "}
          <span className="gradient-text">Made Simple</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="text-base md:text-lg text-muted-foreground mt-5 max-w-lg mx-auto leading-relaxed"
        >
          Register for exams, pay fees securely, track registrations, and download hall tickets — all in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mt-8"
        >
          <Button variant="hero" size="lg" onClick={() => navigate("/register")}>
            Create Free Account <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate("/login")}>
            Sign In
          </Button>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={scaleIn}
              className="rounded-xl border border-border bg-card p-4 text-center card-elevated"
            >
              <p className="text-xl md:text-2xl font-display font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20 scroll-mt-16">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp} custom={0} className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground tracking-tight">Everything You Need</h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto">A complete exam registration system designed for students and administrators.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
              className="rounded-xl border border-border bg-card p-5 space-y-3 card-elevated transition-all duration-200 hover:translate-y-[-2px]"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <feat.icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-display font-semibold text-foreground">{feat.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="container mx-auto px-4 py-20 scroll-mt-16">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground tracking-tight">How It Works</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { step: "01", title: "Create Account", desc: "Sign up with your university email in seconds." },
            { step: "02", title: "Register for Exams", desc: "Browse available exams and register with one click." },
            { step: "03", title: "Pay & Download", desc: "Complete payment and download your hall ticket." },
          ].map((item, i) => (
            <motion.div key={item.step} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-foreground font-display font-bold text-lg">{item.step}</span>
              </div>
              <h3 className="font-display font-semibold text-foreground mb-1.5">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="container mx-auto px-4 py-20 scroll-mt-16">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground tracking-tight">What Students Say</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={scaleIn}
              className="rounded-xl border border-border bg-card p-5 space-y-4 card-elevated"
            >
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-warning text-warning" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-3 border-t border-border">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">{t.avatar}</div>
                <div>
                  <p className="font-medium text-foreground text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="rounded-2xl bg-primary p-8 md:p-12 text-center relative overflow-hidden"
        >
          <div className="relative z-10">
            <h2 className="text-2xl md:text-4xl font-display font-bold text-primary-foreground tracking-tight">Ready to Get Started?</h2>
            <p className="text-primary-foreground/70 mt-3 max-w-md mx-auto">Join thousands of students who have simplified their exam registration.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <Button size="lg" onClick={() => navigate("/register")} className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold shadow-md">
                Create Free Account <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/login")} className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                Sign In
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                <GraduationCap className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-foreground text-sm">ExamPortal</span>
            </div>
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} ExamPortal. Student Exam Registration System.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
