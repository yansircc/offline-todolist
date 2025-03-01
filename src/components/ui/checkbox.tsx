'use client'

import { CheckIcon } from 'lucide-react'
import * as React from 'react'
import { cn } from '@/lib/utils'

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="flex items-center space-x-2">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            className="peer absolute h-4 w-4 cursor-pointer opacity-0"
            ref={ref}
            {...props}
          />
          <div
            className={cn(
              'flex h-4 w-4 items-center justify-center rounded border border-gray-300',
              'peer-checked:border-blue-500 peer-checked:bg-blue-500',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2',
              'transition-colors',
              className,
            )}
          >
            <CheckIcon className="h-3 w-3 stroke-[3] text-white" />
          </div>
        </div>
        {label && (
          <label
            htmlFor={props.id}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
      </div>
    )
  },
)
Checkbox.displayName = 'Checkbox'

export { Checkbox }
