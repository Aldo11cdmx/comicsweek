import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="border-t border-[rgba(0,0,0,0.06)] py-12 text-center">
      <div className="mb-4 flex justify-center">
        <Logo variant="icon" size={32} animated={false} />
      </div>
      <p className="text-sm text-[#8E8E93]">Hecho con ❤️ por lectores de cómics</p>
      <p className="mt-2 text-xs text-[#8E8E93]">ComicsWeek · 2024</p>
    </footer>
  )
}
