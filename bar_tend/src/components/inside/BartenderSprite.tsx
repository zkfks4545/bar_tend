import characterImg from '../../lib/bartender/character.png'
import type { Expression } from '../../types.js'

export default function BartenderSprite({ expression }: { expression: Expression }) {
  return (
    <div
      className={`bartender-sprite bartender-sprite--${expression}`}
      data-expression={expression}
    >
      <img
        src={characterImg}
        alt="카루아"
        className="bartender-sprite__image float"
      />
    </div>
  )
}
