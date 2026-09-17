/** « Les notes de la gamme de C# majeur ». */
export function ScalePrompt({ card }) {
  return (
    <p className="text-prompt">
      Les notes de la gamme de <strong>{card.name}</strong>
    </p>
  )
}
