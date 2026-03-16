'use strict';

const axios = require('axios');
const cheerio = require('cheerio');

const RFEF_PAGE = 'https://rfef.es/es/noticias/arbitros';
const PDF_BASE = 'https://rfef.es/sites/default/files';

// Spanish day names without accents (as used in RFEF filenames)
const DAYS_ES = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

const HTTP_OPTS = {
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
  }
};

async function findPdfUrl(targetDateStr) {
  const d = new Date(`${targetDateStr}T12:00:00Z`);
  const dayES = DAYS_ES[d.getUTCDay()];
  const season = getSeason(d);

  // Strategy 1: scrape the RFEF page and look for a link that matches the exact day
  try {
    const url = await scrapeRfefPage(dayES);
    if (url) {
      console.log(`PDF URL found via page scraping (day: ${dayES}).`);
      return url;
    }
  } catch (err) {
    console.log(`Page scraping failed (${err.message}), falling back to brute-force.`);
  }

  // Strategy 2: try possible jornada numbers via HEAD requests
  console.log(`Trying brute-force for day="${dayES}", season="${season}"...`);
  return await bruteForceJornada(d, dayES, season);
}

async function scrapeRfefPage(dayES) {
  const { data } = await axios.get(RFEF_PAGE, HTTP_OPTS);
  const $ = cheerio.load(data);

  let found = null;
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (
      href.includes('designaciones_1a_division_masculina') &&
      href.includes(`_${dayES}`) &&          // must match the target day
      href.endsWith('.pdf')
    ) {
      found = href.startsWith('http') ? href : `https://rfef.es${href}`;
      return false; // stop iterating
    }
  });
  return found;
}

async function bruteForceJornada(date, dayES, season) {
  // Estimate jornada from weeks elapsed since season start (~Aug 17)
  const seasonStartDate = new Date(`${season.split('-')[0]}-08-17T00:00:00Z`);
  const weeksElapsed = Math.floor((date - seasonStartDate) / (7 * 24 * 60 * 60 * 1000));
  const estimated = Math.min(Math.max(weeksElapsed + 1, 1), 38);

  // Build search order: estimated first, then expand outward ±10
  const order = [estimated];
  for (let i = 1; i <= 10; i++) {
    if (estimated + i <= 38) order.push(estimated + i);
    if (estimated - i >= 1) order.push(estimated - i);
  }

  console.log(`Estimated jornada: ${estimated}. Trying: ${order.join(', ')}`);

  for (const j of order) {
    const url = `${PDF_BASE}/designaciones_1a_division_masculina_-_temp_${season}_-_jornada_${j}_${dayES}.pdf`;
    try {
      const { status } = await axios.head(url, { ...HTTP_OPTS, timeout: 5000 });
      if (status === 200) {
        console.log(`Found PDF at jornada ${j}: ${url}`);
        return url;
      }
    } catch {
      // 404 or timeout → try next
    }
  }

  return null;
}

// Returns "YYYY-YY" season string (e.g. "2025-26") for a given Date
function getSeason(date) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const startYear = month >= 8 ? year : year - 1;
  return `${startYear}-${String(startYear + 1).slice(-2)}`;
}

module.exports = { findPdfUrl };
