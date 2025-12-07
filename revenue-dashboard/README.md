# Revenue Dashboard

Una dashboard professionale per la gestione e l'analisi degli incassi giornalieri di 5 attività:

- Biliardi
- Bowling Time
- Bowling Game
- Bar
- Calcetto

## 🚀 Tecnologie Utilizzate

- **Next.js 16** con App Router e Server Components
- **TypeScript** per la type safety
- **TailwindCSS** per lo styling
- **Supabase** per database, autenticazione e API
- **Recharts** per i grafici interattivi
- **Shadcn/UI** per i componenti UI

## 📊 Funzionalità

### 1. Inserimento Dati Giornalieri

- Form con date picker per selezionare la data
- Campi input numerici per ciascuna attività
- Validazioni front-end e back-end
- Salvataggio su Supabase con controllo duplicati
- Modifica dei valori se la data è già presente

### 2. Dashboard Principale

- **KPI Cards**: Totale giornaliero, mensile, annuale e media settimanale
- **Grafici Interattivi**:
  - Line chart per il trend nel tempo
  - Bar chart per i totali per attività
  - Stacked bar per la panoramica mensile
  - Pie chart per la ripartizione per categoria

### 3. Filtri Avanzati

- **Filtri Globali**:
  - Selezione data singola
  - Range date (da/a)
  - Preimpostazioni: Oggi, Ultimi 7/30 giorni, Questo mese, etc.
- **Filtri per Categoria**: Checkbox multi-select per ogni attività
- Aggiornamento automatico dei grafici

### 4. Confronto Avanzato tra Periodi

- Selezione arbitraria di due periodi
- Calcolo di differenze assolute e percentuali
- Visualizzazioni multiple:
  - Grafici comparativi A/B
  - Tabelle dinamiche di confronto
  - KPI comparativi con indicatori colorati

## 🛠️ Setup e Installazione

### 1. Clona il repository

```bash
git clone <repository-url>
cd revenue-dashboard
```

### 2. Installa le dipendenze

```bash
npm install
```

### 3. Configura Supabase

1. Crea un progetto su [Supabase](https://supabase.com)
2. Esegui lo schema SQL in `supabase/schema.sql`
3. Ottieni le chiavi API dal progetto Supabase
4. Crea un file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Avvia il server di sviluppo

```bash
npm run dev
```

### 5. Apri il browser

Vai su [http://localhost:3000](http://localhost:3000)

## 📁 Struttura del Progetto

```
revenue-dashboard/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── analytics/         # Pagina analisi dettagliata
│   ├── comparazione/      # Pagina confronto periodi
│   └── layout.tsx         # Layout principale
├── components/            # Componenti React
│   ├── ui/               # Componenti UI (Shadcn)
│   ├── revenue-form.tsx  # Form inserimento dati
│   ├── kpi-cards.tsx     # Card KPI
│   ├── revenue-charts.tsx # Grafici
│   ├── filters.tsx       # Filtri avanzati
│   └── comparison-charts.tsx # Grafici confronto
├── lib/                   # Utility e configurazioni
│   ├── supabase.ts       # Client Supabase
│   └── utils.ts          # Utility functions
├── supabase/             # Database
│   └── schema.sql        # Schema database
└── public/               # Assets statici
```

## 🔧 API Endpoints

### GET /api/incassi

Ritorna i dati filtrati per date e categorie.

Parametri:

- `dateFrom`: Data inizio (YYYY-MM-DD)
- `dateTo`: Data fine (YYYY-MM-DD)
- `categories`: Lista categorie separate da virgola

### POST /api/incassi

Inserisce o aggiorna i dati per una data specifica.

Body:

```json
{
  "data": "2025-12-07",
  "biliardi": 250.0,
  "bowling_time": 180.0,
  "bowling_game": 120.0,
  "bar": 320.0,
  "calcetto": 200.0
}
```

## 🚀 Deployment

### Vercel (Raccomandato)

1. Pusha il codice su GitHub
2. Connetti il repository a Vercel
3. Configura le variabili d'ambiente
4. Deploy automatico

### Supabase

- Il database è già configurato per il deployment
- Le politiche RLS sono abilitate per la sicurezza

## 📈 Performance

- **Server Components**: Rendering lato server per performance ottimali
- **Caching**: Implementato per ridurre le chiamate API
- **Lazy Loading**: Componenti caricati solo quando necessario
- **Responsive Design**: Ottimizzato per tutti i dispositivi

## 🔒 Sicurezza

- Row Level Security (RLS) abilitato su Supabase
- Validazione input lato client e server
- Protezione contro SQL injection
- Gestione sicura delle chiavi API

## 📞 Supporto

Per domande o supporto, apri una issue su GitHub o contatta il team di sviluppo.

## 📝 Licenza

MIT License - vedi il file LICENSE per i dettagli.
