-- Grant write permissions to the anonymous role (needed for API calls without Service Role)
GRANT INSERT, UPDATE, DELETE ON public.incassi TO anon;

-- Update policies to include anon role
-- First drop the old restrictive policies if they exist
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.incassi;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON public.incassi;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON public.incassi;

-- Create new policies that allow access to everyone (anon + authenticated)
CREATE POLICY "Allow insert for all users" ON public.incassi
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for all users" ON public.incassi
    FOR UPDATE USING (true);

CREATE POLICY "Allow delete for all users" ON public.incassi
    FOR DELETE USING (true);
