'use strict';

const axios = require('axios');
const pdfParse = require('pdf-parse');

async function parsePdf(pdfUrl, targetDate) {
  const response = await axios.get(pdfUrl, {
    responseType: 'arraybuffer',
    timeout: 20000,
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });

  const { text } = await pdfParse(Buffer.from(response.data));

  // Extract jornada number: "Jornada - 28" or "Jornada – 28"
  const jornadaMatch = text.match(/jornada\s*[-–]\s*(\d+)/i);
  const jornada = jornadaMatch ? parseInt(jornadaMatch[1]) : null;

  // Extract season from "TEMPORADA 2025-2026"
  const seasonMatch = text.match(/(\d{4})-(\d{4})/);
  const season = seasonMatch
    ? `${seasonMatch[1]}-${String(seasonMatch[2]).slice(-2)}`
    : null;

  const assignments = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  for (let i = 0; i < lines.length; i++) {
    // PDF has no spaces between fields: "14-03-2026Girona FCAthletic Club14:00"
    // Capture: date at start, time at end, everything in between = concatenated team names
    const dateMatch = lines[i].match(/^(\d{2}-\d{2}-\d{4})(.+?)(\d{2}:\d{2})\s*$/);
    if (!dateMatch) continue;

    const [, rawDate, teamsRaw, matchTime] = dateMatch;

    // Convert dd-mm-yyyy → yyyy-mm-dd
    const [day, month, year] = rawDate.split('-');
    const matchDate = `${year}-${month}-${day}`;

    if (matchDate !== targetDate) continue;

    // Split the concatenated team names (e.g. "Girona FCAthletic Club")
    const [homeTeam, awayTeam] = splitTeams(teamsRaw);
    if (!homeTeam || !awayTeam) continue;

    // Look for "Árbitro:" in the next few lines
    // PDF format: "Árbitro:Ricardo De Burgos4º Árbitro:..." (no space after colon)
    let refereeName = null;
    for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
      const refMatch = lines[j].match(/[AÁ]rbitro:\s*(.+?)(?:\s*4[oº°]|$)/i);
      if (refMatch) {
        refereeName = refMatch[1].trim().replace(/\s+/g, ' ');
        break;
      }
    }

    if (refereeName) {
      assignments.push({
        season,
        jornada,
        match_date: matchDate,
        match_time: matchTime,
        home_team: homeTeam.trim(),
        away_team: awayTeam.trim(),
        referee_name: refereeName
      });
    }
  }

  if (!assignments.length) {
    // Show more text to help diagnose
    console.warn('No assignments parsed. Full PDF text:\n', text.slice(0, 1200));
  }

  return assignments;
}

/**
 * Splits a string like "Girona FCAthletic Club" into ["Girona FC", "Athletic Club"].
 * The PDF concatenates team names without a separator.
 * Heuristic: split where an uppercase letter directly follows a lowercase letter,
 * OR where an uppercase letter follows two consecutive uppercase letters (e.g. "FC" + "Athletic").
 */
function splitTeams(str) {
  // Find first position where team names are joined:
  // Case 1: lowercase → uppercase  (e.g. "OviedoValencia" → split at o|V)
  // Case 2: uppercase → uppercase+lowercase  (e.g. "FCAthletic" → split at C|A)
  const match = str.match(/(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])/);
  if (!match || match.index === undefined) {
    console.warn(`Could not split teams from: "${str}"`);
    return [str, ''];
  }
  return [str.slice(0, match.index), str.slice(match.index)];
}

module.exports = { parsePdf };
