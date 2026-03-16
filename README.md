# api-referees

Vercel serverless endpoint that returns today's LaLiga Primera División matches with their assigned referees.

Data is extracted in real time from the official RFEF PDF designations.

## Endpoint

```
GET /api/matches
```

### Response

```json
{
  "date": "2026-03-15",
  "matches": [
    {
      "jornada": 28,
      "season": "2025-26",
      "date": "2026-03-15",
      "time": "14:00",
      "home_team": "Mallorca",
      "away_team": "Espanol",
      "referee": "De Burgos Bengoetxea"
    }
  ]
}
```

If there are no matches today or the PDF has not been published yet, `matches` will be an empty array.

## How it works

1. Scrapes [rfef.es/es/noticias/arbitros](https://rfef.es/es/noticias/arbitros) to find the PDF for today's matches
2. Falls back to brute-forcing the jornada number if scraping fails
3. Downloads and parses the PDF
4. Normalises referee and team names to match internal database format (`src/config.js`)

> The RFEF publishes each day's designations the day before (before 16:00). The PDF remains accessible on match day.

## Deploy

Connect this repo to [Vercel](https://vercel.com). No environment variables required.

## Local development

```bash
npm install
vercel dev        # serves http://localhost:3000/api/matches
```

## Name mappings

Referee and team names are normalised in `src/config.js` to match the exact format used in the internal database.
