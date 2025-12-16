-- Secure the incassi table
-- Revoke permissions from anon (public) for modification
REVOKE INSERT, UPDATE, DELETE ON public.incassi FROM anon;

-- Ensure RLS is enabled
ALTER TABLE public.incassi ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow read access for all users" ON public.incassi;
DROP POLICY IF EXISTS "Allow insert for all users" ON public.incassi;
DROP POLICY IF EXISTS "Allow update for all users" ON public.incassi;
DROP POLICY IF EXISTS "Allow delete for all users" ON public.incassi;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.incassi;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON public.incassi;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON public.incassi;

-- Create secure policies (Authenticated users only)
CREATE POLICY "Allow read access for authenticated users" ON public.incassi
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow insert for authenticated users" ON public.incassi
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users" ON public.incassi
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow delete for authenticated users" ON public.incassi
    FOR DELETE TO authenticated USING (true);

-- Allow anon read access (optional, if you want public dashboard but private admin)
-- For now, let's keep it private as per "security is crucial"
-- If you want public read, uncomment the next line:
-- CREATE POLICY "Allow read access for anon users" ON public.incassi FOR SELECT TO anon USING (true);
