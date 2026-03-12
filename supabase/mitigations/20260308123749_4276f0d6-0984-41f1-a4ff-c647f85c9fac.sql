-- Trigger to create notification on new registration
CREATE OR REPLACE FUNCTION public.notify_on_registration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    NEW.student_id,
    'Exam Registration Created',
    'You have registered for an exam. Please complete payment to confirm your registration.',
    'info'
  );
  RETURN NEW;
END;
$function$;

CREATE TRIGGER on_registration_created
  AFTER INSERT ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_registration();

-- Trigger to create notification on payment confirmation
CREATE OR REPLACE FUNCTION public.notify_on_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.payment_status != 'paid' AND NEW.payment_status = 'paid' THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.student_id,
      'Payment Confirmed',
      'Your exam payment has been confirmed. Your registration is now complete!',
      'success'
    );
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER on_payment_confirmed
  AFTER UPDATE ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_payment();

-- Trigger to generate hall ticket on payment confirmation
CREATE OR REPLACE FUNCTION public.generate_hall_ticket()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  ticket_num TEXT;
BEGIN
  IF OLD.payment_status != 'paid' AND NEW.payment_status = 'paid' THEN
    ticket_num := 'HT-' || EXTRACT(YEAR FROM now()) || '-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
    INSERT INTO public.hall_tickets (registration_id, student_id, exam_id, ticket_number)
    VALUES (NEW.id, NEW.student_id, NEW.exam_id, ticket_num);
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER on_payment_generate_ticket
  AFTER UPDATE ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_hall_ticket();