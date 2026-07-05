import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils.js";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-sun text-tea hover:brightness-110",
        outline: "border border-hillline text-mist hover:border-sun bg-transparent",
        "outline-light": "border border-leafline text-inkbody hover:border-sundeep bg-transparent",
        ghost: "text-mist hover:text-sun bg-transparent",
      },
      size: {
        default: "h-9 px-4 text-sm",
        sm: "h-7 px-3 text-xs",
        lg: "h-11 px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export function Button({ className, variant, size, ...props }) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
