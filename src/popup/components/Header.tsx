interface HeaderProps {
  onToggleHelp: () => void
}

function Header({ onToggleHelp }: HeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 text-lc-orange">
          <svg viewBox="0 0 24 24" className="h-full w-full" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3C12 3 3 12.5 3 17C3 21 7 24 12 24C17 24 21 21 21 17C21 12.5 12 3 12 3Z" />
          </svg>
        </div>
        <h1 className="text-lg font-bold">DripCode</h1>
      </div>
      <button
        onClick={onToggleHelp}
        className="flex h-5 w-5 items-center justify-center rounded-full border border-[var(--muted)] text-xs text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-colors cursor-pointer"
      >
        ?
      </button>
    </div>
  )
}

export default Header
