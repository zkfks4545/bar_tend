import { useState, type FormEvent } from 'react'

export default function ChatInput({ onSend, disabled }: { onSend: (text: string) => void; disabled: boolean }) {
  const [val, setVal] = useState('')
  const placeholder = disabled ? '대답을 기다리는 중...' : '바텐더에게 말을 걸어보세요...'

  return (
    <form
      onSubmit={(e: FormEvent) => { e.preventDefault(); if (val.trim()) { onSend(val.trim()); setVal('') } }}
      className="p-4 bg-black/40 border-t border-white/5"
    >
      <input
        type="text"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3 text-white placeholder:text-white/20 focus:outline-none transition-all"
        onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(180, 136, 208, 0.5)'}
        onBlur={(e) => e.currentTarget.style.borderColor = ''}
      />
    </form>
  )
}
