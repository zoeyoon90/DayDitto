import { cva, type VariantProps } from "class-variance-authority";
import { cn } from '@/lib/utils'


const inputVariants = cva(
  [
    'w-full rounded-base border-2 border-border bg-bw px-3 py-2',
    'text-sm text-text shadow-shadow placeholder:text-text/50',
    'transition-all focus:outline-none',
    'focus:translate-x-boxShadowX focus:translate-y-boxShadowY focus:shadow-none',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        default: '',
        error: 'border-red-500 shadow-[4px_4px_0px_0px_#ef4444]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)
  interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement>,
      VariantProps<typeof inputVariants> {
    label?: string
    error?: string
  }

  export default function Input({ label, error, variant, className, ...props }: InputProps) {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-base text-text">{label}</label>
        )}
        <input
          className={cn(inputVariants({ variant: error ? 'error' : variant }), className)}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }