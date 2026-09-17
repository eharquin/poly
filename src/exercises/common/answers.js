// Types de réponse partagés entre catégories : le sélecteur, la sélection
// vide, quand elle est complète, comment l'afficher.

import { EMPTY_SELECTION, formatChordName, isComplete } from '../../lib/chordName.js'
import ChordSelector from './ChordSelector.jsx'
import RoleSelector from './RoleSelector.jsx'
import { roleLabel } from './roles.js'

export const CHORD_ANSWER = { Selector: ChordSelector, empty: EMPTY_SELECTION, isComplete, format: formatChordName }
export const ROLE_ANSWER = { Selector: RoleSelector, empty: { role: null }, isComplete: (s) => Boolean(s.role), format: (s) => roleLabel(s.role) }
export const sameRole = (sel, card) => sel.role === card.role
