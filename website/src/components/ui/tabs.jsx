import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../../lib/utils.js";

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex flex-wrap items-center justify-start gap-1 rounded-lg bg-inkbody/5 p-1",
        className
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3.5 py-1.5 text-sm font-semibold text-forest transition-colors cursor-pointer",
        "hover:text-inkbody focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun",
        "data-[state=active]:bg-sun data-[state=active]:text-tea data-[state=active]:shadow-sm",
        className
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }) {
  return (
    <TabsPrimitive.Content
      className={cn("mt-4 focus-visible:outline-none", className)}
      {...props}
    />
  );
}
