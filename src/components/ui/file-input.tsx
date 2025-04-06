import * as React from "react"
import { cn } from "@/lib/utils"

interface FileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onFileSelect?: (file: File | null) => void
}

export function FileInput({ className, onFileSelect, ...props }: FileInputProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    if (onFileSelect) {
      onFileSelect(file)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <input
        type="file"
        className={cn(
          "file:text-foreground file:bg-transparent file:border file:border-input file:rounded-md file:px-3 file:py-1 file:mr-4",
          "file:hover:bg-accent file:hover:text-accent-foreground file:cursor-pointer",
          "text-sm text-muted-foreground",
          className
        )}
        onChange={handleChange}
        {...props}
      />
    </div>
  )
}