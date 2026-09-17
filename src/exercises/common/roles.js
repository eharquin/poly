// Rôles d'une note dans un accord (fondamentale, tierce, quinte, septième),
// partagés par les exercices « rôle de la note » guitare et piano.

export const ROLES = [
  { id: 'root', label: 'Fondamentale' },
  { id: 'third', label: 'Tierce' },
  { id: 'fifth', label: 'Quinte' },
  { id: 'seventh', label: 'Septième' },
]
export const roleLabel = (id) => ROLES.find((r) => r.id === id)?.label ?? id

// Qualités où chaque intervalle a un rôle de tétrade sans ambiguïté (pas de sus, 6, 9…).
export const ROLE_QUALITIES = ['maj', 'min', 'dim', 'aug', '7', 'maj7', 'm7', 'm7b5', 'dim7']

// Demi-tons depuis la fondamentale -> rôle (valable pour ROLE_QUALITIES).
export const ROLE_OF_INTERVAL = { 0: 'root', 3: 'third', 4: 'third', 6: 'fifth', 7: 'fifth', 8: 'fifth', 9: 'seventh', 10: 'seventh', 11: 'seventh' }
