const EMOJIS = [
  '🌸','🌺','🌻','🌹','🌷','🍀','🌿','🌱','🌳','🌴',
  '💪','🧘','🏃','🚴','🏊','🤸','⭐','✨','💫','🔥',
  '💧','🥤','🍎','🥗','🫐','🍋','🧃','☕','🍵','💊',
  '📚','✍️','🎯','🎨','🎵','🧠','💡','📝','💼','🏆',
]

export default function EmojiPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-8 gap-2">
      {EMOJIS.map(emoji => (
        <button
          key={emoji}
          type="button"
          onClick={() => onChange(emoji)}
          className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl transition-all duration-150
            ${value === emoji
              ? 'bg-bloom-200 shadow-bloom-sm scale-110'
              : 'bg-bloom-50 active:scale-95'
            }`}
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}
