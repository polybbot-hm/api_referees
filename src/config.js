'use strict';

/**
 * Referee name mapping: PDF format → Supabase exact format.
 */
const REFEREE_MAP = {
  'Javier Alberola':       'Alberola Rojas',
  'Mateo Busquets':        'Busquets Ferrer',
  'Adrián Cordero':        'Cordero Vega',
  'Guillermo Cuadra':      'Cuadra Fernández',
  'Ricardo De Burgos':     'De Burgos Bengoetxea',
  'Isidro Díaz de Mera':   'Díaz de Mera',
  'Iosu Galech':           'Galech Apezteguía',
  'Víctor García':         'García Verdura',
  'Jesús Gil':             'Gil Manzano',
  'José Luis Guzmán':      'Guzmán Mansilla',
  'Alejandro Hernández':   'Hernández Hernández',
  'Francisco Hernández':   'Hernández Maeso',
  'Javier Iglesias':       'Iglesias Villanueva',
  'Juan Martínez':         'Martínez Munuera',
  'Mario Melero':          'Melero López',
  'Alejandro Muñiz':       'Muñiz Ruiz',
  'José Luis Munuera':     'Munuera Montero',
  'Miguel Ángel Ortiz':    'Ortiz Arias',
  'Juan Luis Pulido':      'Pulido Santana',
  'Alejandro Quintero':    'Quintero González',
  'José María Sánchez':    'Sánchez Martínez',
  'Miguel Sesma':          'Sesma Espinosa',
  'César Soto':            'Soto Grado',
  'Pablo González':        'González Fuertes',
};

/**
 * Team name mapping: RFEF full name → Supabase short name.
 */
const TEAM_MAP = {
  'Athletic Club':                    'Ath Bilbao',
  'Club Atlético de Madrid':          'Ath Madrid',
  'Atlético de Madrid':               'Ath Madrid',
  'FC Barcelona':                     'Barcelona',
  'Real Madrid CF':                   'Real Madrid',
  'RC Celta de Vigo':                 'Celta',
  'Celta de Vigo':                    'Celta',
  'Deportivo Alavés':                 'Alaves',
  'RCD Espanyol de Barcelona':        'Espanol',
  'RCD Espanyol':                     'Espanol',
  'Getafe CF':                        'Getafe',
  'Girona FC':                        'Girona',
  'CD Leganés':                       'Leganes',
  'RCD Mallorca':                     'Mallorca',
  'Club Atlético Osasuna':            'Osasuna',
  'CA Osasuna':                       'Osasuna',
  'Rayo Vallecano':                   'Vallecano',
  'Rayo Vallecano de Madrid':         'Vallecano',
  'Real Betis Balompié':              'Betis',
  'Real Betis':                       'Betis',
  'Real Sociedad de Fútbol':          'Sociedad',
  'Real Sociedad':                    'Sociedad',
  'Sevilla FC':                       'Sevilla',
  'Valencia CF':                      'Valencia',
  'Real Valladolid CF':               'Valladolid',
  'Real Valladolid':                  'Valladolid',
  'Villarreal CF':                    'Villarreal',
  'Real Oviedo':                      'Oviedo',
  'UD Las Palmas':                    'Las Palmas',
  'Granada CF':                       'Granada',
  'UD Almería':                       'Almeria',
  'Almería':                          'Almeria',
  'Elche CF':                         'Elche',
  'Cádiz CF':                         'Cadiz',
  'Levante UD':                       'Levante',
  'Levante':                          'Levante',
};

// Words to ignore when comparing (articles, prepositions, common abbreviations)
const STOPWORDS = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'cf', 'fc', 'rcd', 'ud', 'rc', 'ca', 'cd', 'sd', 'ad']);

function normalizeStr(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .toLowerCase()
    .trim();
}

function tokenize(str) {
  return normalizeStr(str)
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOPWORDS.has(t));
}

/**
 * Token-based Jaccard similarity between two strings.
 * Ignores accents, case and stopwords.
 * Returns 0–1 (1 = identical tokens).
 */
function similarity(a, b) {
  const ta = new Set(tokenize(a));
  const tb = new Set(tokenize(b));
  if (!ta.size || !tb.size) return 0;
  const intersection = [...ta].filter(t => tb.has(t)).length;
  const union = new Set([...ta, ...tb]).size;
  return intersection / union;
}

function bestMatch(input, map, threshold = 0.4) {
  // 1. Exact match
  if (map[input]) return map[input];

  // 2. Best similarity match
  let best = null;
  let bestScore = 0;

  for (const [key, value] of Object.entries(map)) {
    const score = similarity(input, key);
    if (score > bestScore) {
      bestScore = score;
      best = value;
    }
  }

  if (bestScore >= threshold) {
    return best;
  }

  console.warn(`[config] No match for "${input}" (best score: ${bestScore.toFixed(2)})`);
  return input;
}

function normalizeTeam(pdfTeam) {
  return bestMatch(pdfTeam, TEAM_MAP, 0.4);
}

function normalizeReferee(pdfName) {
  return bestMatch(pdfName, REFEREE_MAP, 0.4);
}

module.exports = { normalizeReferee, normalizeTeam };
