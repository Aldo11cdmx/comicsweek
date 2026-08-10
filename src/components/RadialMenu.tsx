import { motion, AnimatePresence } from 'motion/react'
import type { LucideIcon } from 'lucide-react'

type Position = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'

interface RadialMenuItem {
  icon: LucideIcon
  label: string
  action: () => void
  color?: string
}

interface RadialMenuProps {
  items: RadialMenuItem[]
  position?: Position
  size?: number
  isOpen: boolean
  onClose: () => void
}

export function RadialMenu({ items, position = 'bottom-right', size = 56, isOpen, onClose }: RadialMenuProps) {
  const radius = size * 2.2
  const startAngle = position.includes('bottom') ? -90 : 90
  const direction = position.includes('right') ? 1 : -1

  const positions = items.map((_, i) => {
    const angle = startAngle + direction * (i * (180 / (items.length - 1 || 1)))
    const rad = (angle * Math.PI) / 180
    return {
      x: Math.cos(rad) * radius,
      y: Math.sin(rad) * radius,
    }
  })

  const handleItemClick = (action: () => void) => {
    action()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50"
          onClick={onClose}
        >
          <div
            className="absolute"
            style={{
              right: position.includes('right') ? 24 : 'auto',
              left: position.includes('left') ? 24 : 'auto',
              bottom: position.includes('bottom') ? 100 : 'auto',
              top: position.includes('top') ? 100 : 'auto',
            }}
          >
            {items.map((item, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: positions[i].x,
                  y: positions[i].y,
                }}
                exit={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 25,
                  delay: i * 0.03,
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleItemClick(item.action)}
                className="absolute flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[#2D2D2D] shadow-lg backdrop-blur-md border border-[rgba(0,0,0,0.06)]"
                title={item.label}
                aria-label={item.label}
              >
                <item.icon className="h-5 w-5" style={{ color: item.color || '#8E8E93' }} />
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
