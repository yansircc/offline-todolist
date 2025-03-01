"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"

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
            className="peer h-4 w-4 cursor-pointer opacity-0 absolute"
            ref={ref}
            {...props}
          />
          <div
            className={cn(
              "h-4 w-4 rounded border border-gray-300 flex items-center justify-center",
              "peer-checked:bg-blue-500 peer-checked:border-blue-500",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2",
              "transition-colors",
              className
            )}
          >
            <CheckIcon className="h-3 w-3 text-white stroke-[3]" />
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
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
