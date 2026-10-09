import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

import { cn } from '@/utils/classNames'
import { getButtonClasses } from '@/components/common/buttonStyles.js'

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled = false, className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled || loading}
      className={cn(getButtonClasses({ variant, size }), className)}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
})

export default Button
