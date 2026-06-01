interface FlipNumberProps {
  value: number
}

function FlipNumber({ value }: FlipNumberProps) {
  const digits = String(value).split("")

  return (
    <div className="flex items-center gap-0.5">
      {digits.map((digit, i) => (
        <span
          key={`${i}-${digit}`}
          className="flip-digit inline-flex h-8 w-7 items-center justify-center rounded border border-[var(--border)] bg-[var(--surface)] text-sm font-bold text-[var(--foreground)]"
          style={{ animationDelay: `${(digits.length - 1 - i) * 80}ms` }}
        >
          {digit}
        </span>
      ))}
    </div>
  )
}

export default FlipNumber
