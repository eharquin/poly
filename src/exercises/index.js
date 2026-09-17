// Registre des exercices, par catégorie. Chaque exercice : une banque de
// cartes (id + ce que son énoncé affiche), la section de data.json qui porte
// ses stats Leitner, un énoncé (diagramme ou texte), un type de réponse
// (sélecteur, sélection vide, complétude, format) et sa règle de comparaison.
// Un nouvel exercice s'ajoute dans sa catégorie, et sa section dans
// STAT_SECTIONS (lib/ops.js).

import { GUITAR } from './guitar/index.js'
import { PIANO } from './piano/index.js'
import { THEORY } from './theory/index.js'

export const CATEGORIES = [GUITAR, PIANO, THEORY]
export const EXERCISES = CATEGORIES.flatMap((c) => c.exercises)

export function getExercise(id) {
  return EXERCISES.find((e) => e.id === id) ?? null
}
