"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/utils";
import { useId } from "react";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => {
  const id = useId();

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <SwitchPrimitives.Root
        id={id}
        className={cn(
          "peer inline-flex bg-midnight-750 h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
          className
        )}
        {...props}
        ref={ref}
      >
        <SwitchPrimitives.Thumb
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full shadow-lg ring-0 transition-all data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
            props.checked ? "bg-green-600" : "bg-midnight-500"
          )}
        />
      </SwitchPrimitives.Root>
      <label className="text-dimmed" htmlFor={id}>
        {props.title}
      </label>
    </div>
  );
});

Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
