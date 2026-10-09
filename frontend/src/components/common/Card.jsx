import { cn } from '@/utils/classNames'

/**
 * Modern dark card — unified across the entire application.
 */
export default function Card({ className, children, ...props }) {
  return (
    <div
      className={cn('rounded-2xl transition-all duration-200', className)}
      style={{
        background: 'rgba(17, 17, 19, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
      {...props}
    >
      {children}
    </div>
  )
}
