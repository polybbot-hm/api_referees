'use strict';

const { findPdfUrl } = require('../src/rfef');
const { parsePdf } = require('../src/parser');
const { normalizeReferee, normalizeTeam } = require('../src/config');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const today = getTodayMadrid();

    const pdfUrl = await findPdfUrl(today);
    if (!pdfUrl) {
      return res.status(200).json({
        date: today,
        matches: [],
        message: 'No LaLiga Primera División matches today or designations not yet published.'
      });
    }

    const raw = await parsePdf(pdfUrl, today);

    const matches = raw.map(m => ({
      jornada:   m.jornada,
      season:    m.season,
      date:      m.match_date,
      time:      m.match_time,
      home_team: normalizeTeam(m.home_team),
      away_team: normalizeTeam(m.away_team),
      referee:   normalizeReferee(m.referee_name)
    }));

    return res.status(200).json({ date: today, matches });
  } catch (err) {
    console.error('[/api/matches error]', err.message);
    return res.status(500).json({ error: err.message });
  }
};

// Returns today's date as "YYYY-MM-DD" in Madrid timezone
function getTodayMadrid() {
  const now = new Date();
  const madrid = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
  const y = madrid.getFullYear();
  const m = String(madrid.getMonth() + 1).padStart(2, '0');
  const d = String(madrid.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
