const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://uwumqgkhhzgqmvdtvwrk.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3dW1xZ2toaHpncW12ZHR2d3JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTA0MjE5NiwiZXhwIjoyMDgwNjE4MTk2fQ.0vyDfB6-WOhWojBzq7QbXnrH1nlJIBaqJrW_WiS2p08';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function checkData() {
  console.log('Checking data for December 2024 (Service Role - Bypass RLS)...');
  
  const from = '2024-12-01';
  const to = '2024-12-31';
  
  const { data, error } = await supabase
    .from('incassi')
    .select('*')
    .gte('data', from)
    .lte('data', to);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${data.length} records.`);
  if (data.length > 0) {
    console.log('Sample record:', data[0]);
    
    // Calculate totals
    const totals = {
      biliardi: 0,
      bowling_time: 0,
      bowling_game: 0,
      bar: 0,
      calcetto: 0,
      video_games: 0
    };
    
    data.forEach(record => {
      Object.keys(totals).forEach(cat => {
        totals[cat] += Number(record[cat] || 0);
      });
    });
    
    console.log('Totals:', totals);
  } else {
      // Check surrounding data
      console.log('Checking all data count...');
      const { count } = await supabase.from('incassi').select('*', { count: 'exact', head: true });
      console.log('Total records in table:', count);
  }
}

checkData();
