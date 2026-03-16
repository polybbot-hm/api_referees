'use strict';

/**
 * Referee name mapping: PDF format (first name + first surname) → Supabase exact format.
 * Supabase uses "Apellido1 Apellido2" format.
 * Source: referees table in Supabase.
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
 * Team name mapping: RFEF official full name → Supabase exact format.
 * Supabase uses short names.
 * Source: matches table in Supabase.
 */
const TEAM_MAP = {
  'Athletic Club':                  'Ath Bilbao',
  'Club Atlético de Madrid':        'Ath Madrid',
  'Atlético de Madrid':             'Ath Madrid',
  'FC Barcelona':                   'Barcelona',
  'Real Madrid CF':                 'Real Madrid',
  'RC Celta de Vigo':               'Celta',
  'Celta de Vigo':                  'Celta',
  'Deportivo Alavés':               'Alaves',
  'RCD Espanyol de Barcelona':      'Espanol',
  'Espanyol de Barcelona':          'Espanol',
  'Getafe CF':                      'Getafe',
  'Girona FC':                      'Girona',
  'CD Leganés':                     'Leganes',
  'RCD Mallorca':                   'Mallorca',
  'Club Atlético Osasuna':          'Osasuna',
  'CA Osasuna':                     'Osasuna',
  'Rayo Vallecano':                 'Vallecano',
  'Real Betis Balompié':            'Betis',
  'Real Sociedad de Fútbol':        'Sociedad',
  'Real Sociedad':                  'Sociedad',
  'Sevilla FC':                     'Sevilla',
  'Valencia CF':                    'Valencia',
  'Real Valladolid CF':             'Valladolid',
  'Villarreal CF':                  'Villarreal',
  'Real Oviedo':                    'Oviedo',
  'UD Las Palmas':                  'Las Palmas',
  'Granada CF':                     'Granada',
  'UD Almería':                     'Almeria',
  'Almería':                        'Almeria',
  'Elche CF':                       'Elche',
  'Cádiz CF':                       'Cadiz',
  'Levante UD':                     'Levante',
};

function normalizeReferee(pdfName) {
  return REFEREE_MAP[pdfName] || pdfName;
}

function normalizeTeam(pdfTeam) {
  return TEAM_MAP[pdfTeam] || pdfTeam;
}

module.exports = { normalizeReferee, normalizeTeam };
