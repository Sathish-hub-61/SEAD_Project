import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const registrationId = searchParams.get("registration_id");
  const [status, setStatus] = useState<"loading" | "confirmed" | "pending">("loading");

  useEffect(() => {
    if (!registrationId) { setStatus("confirmed"); return; }
    let attempts = 0;
    const poll = setInterval(async () => {
      attempts++;
      const { data } = await supabase
        .from("registrations")
        .select("payment_status")
        .eq("id", registrationId)
        .single();
      if (data?.payment_status === "paid") {
        setStatus("confirmed");
        clearInterval(poll);
      } else if (attempts >= 10) {
        setStatus("pending");
        clearInterval(poll);
      }
    }, 2000);
    return () => clearInterval(poll);
  }, [registrationId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="rounded-xl border border-border bg-card p-8 text-center space-y-5 max-w-sm card-elevated animate-fade-in">
        {status === "loading" ? (
          <>
            <Loader2 className="w-10 h-10 text-accent mx-auto animate-spin" />
            <h1 className="text-xl font-display font-bold text-foreground">Confirming Payment...</h1>
            <p className="text-sm text-muted-foreground">Please wait while we verify your payment.</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 text-success" />
            </div>
            <h1 className="text-xl font-display font-bold text-foreground">
              {status === "confirmed" ? "Payment Successful!" : "Payment Processing"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {status === "confirmed"
                ? "Your exam registration has been confirmed."
                : "Your payment is being processed. You'll receive a notification once confirmed."}
            </p>
          </>
        )}
        <div className="flex gap-2 justify-center">
          <Button variant="hero" size="sm" onClick={() => navigate("/dashboard")}>Dashboard</Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/my-registrations")}>Registrations</Button>
        </div>
      </div>
    </div>
  );
}
