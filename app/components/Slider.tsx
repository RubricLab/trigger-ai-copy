"use client";

import * as React from "react";
import * as RadixSlider from "@radix-ui/react-slider";
import { cn } from "@/utils";

const SliderPrimitive = React.forwardRef<
  React.ElementRef<typeof RadixSlider.Root>,
  React.ComponentPropsWithoutRef<typeof RadixSlider.Root> & {
    labelBefore?: string;
    labelAfter?: string;
  }
>(({ className, ...props }, ref) => (
  <div className="flex items-center gap-2">
    {props.labelBefore ? (
      <span className={cn({ "text-dimmed": props.disabled })}>
        {props.labelBefore}
      </span>
    ) : null}
    <RadixSlider.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <RadixSlider.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-midnight-600">
        <RadixSlider.Range className="absolute h-full" />
      </RadixSlider.Track>
      <RadixSlider.Thumb
        className={cn(
          "block h-5 w-5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50",
          props.disabled ? "bg-midnight-500" : "bg-midnight-400"
        )}
      />
    </RadixSlider.Root>
    {props.labelAfter ? (
      <span className={cn({ "text-dimmed": props.disabled })}>
        {props.labelAfter}
      </span>
    ) : null}
  </div>
));

SliderPrimitive.displayName = RadixSlider.Root.displayName;

export { SliderPrimitive };

type SliderProps = React.ComponentProps<typeof SliderPrimitive>;

export function Slider({ className, ...props }: SliderProps) {
  return (
    <SliderPrimitive
      defaultValue={[0]}
      max={1}
      step={0.01}
      className={className}
      {...props}
    />
  );
}
