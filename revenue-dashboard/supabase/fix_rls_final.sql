-- Fix RLS Policies for Incassi Table
-- This script removes restrictive "admin only" policies and allows any authenticated user to manage data.

-- 1. Enable RLS (just in case)
ALTER TABLE public.incassi ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing restrictive policies (including the ones seen in your screenshot)
DROP POLICY IF EXISTS "Allow insert for admin" ON public.incassi;
DROP POLICY IF EXISTS "Allow update for admin" ON public.incassi;
DROP POLICY IF EXISTS "Allow delete for admin" ON public.incassi;
DROP POLICY IF EXISTS "Allow read access" ON public.incassi;
-- Also drop any other potential policies to be clean
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.incassi;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON public.incassi;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON public.incassi;
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.incassi;

-- 3. Create new permissive policies for Authenticated Users
-- READ: Allow authenticated users to read all data
CREATE POLICY "Allow read access for authenticated users" ON public.incassi
    FOR SELECT TO authenticated USING (true);

-- INSERT: Allow authenticated users to insert data
CREATE POLICY "Allow insert for authenticated users" ON public.incassi
    FOR INSERT TO authenticated WITH CHECK (true);

-- UPDATE: Allow authenticated users to update data
CREATE POLICY "Allow update for authenticated users" ON public.incassi
    FOR UPDATE TO authenticated USING (true);

-- DELETE: Allow authenticated users to delete data
CREATE POLICY "Allow delete for authenticated users" ON public.incassi
    FOR DELETE TO authenticated USING (true);

-- 4. Grant necessary permissions
GRANT ALL ON public.incassi TO authenticated;
