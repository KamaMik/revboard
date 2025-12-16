-- Fix Admin Policy Implementation
-- This script ensures the "Allow insert for admin" policy is correctly checking the app_metadata

-- 1. Enable RLS
ALTER TABLE public.incassi ENABLE ROW LEVEL SECURITY;

-- 2. Drop potential existing incorrect policies
DROP POLICY IF EXISTS "Allow insert for admin" ON public.incassi;
DROP POLICY IF EXISTS "Allow update for admin" ON public.incassi;
DROP POLICY IF EXISTS "Allow delete for admin" ON public.incassi;
DROP POLICY IF EXISTS "Allow read access" ON public.incassi;

-- 3. Create Correct Admin Policies
-- These policies specifically check the 'role' field inside app_metadata

-- READ: Admin can read
CREATE POLICY "Allow read access for admin" ON public.incassi
    FOR SELECT TO authenticated
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );

-- INSERT: Admin can insert
CREATE POLICY "Allow insert for admin" ON public.incassi
    FOR INSERT TO authenticated
    WITH CHECK (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );

-- UPDATE: Admin can update
CREATE POLICY "Allow update for admin" ON public.incassi
    FOR UPDATE TO authenticated
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );

-- DELETE: Admin can delete
CREATE POLICY "Allow delete for admin" ON public.incassi
    FOR DELETE TO authenticated
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );

-- 4. Grant permissions
GRANT ALL ON public.incassi TO authenticated;
