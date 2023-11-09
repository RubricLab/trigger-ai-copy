"use client";

import * as React from "react";
import * as RadixSlider from "@radix-ui/react-slider";
import { cn } from "@/utils";

const SliderPrimitive = React.forwardRef<
  React.ElementRef<typeof RadixSlider.Root>,
  React.ComponentPropsWithoutRef<typeof RadixSlider.Root> & {
    leftLabel?: string;
    rightLabel?: string;
  }
>(({ className, ...props }, ref) => {
  const { leftLabel, rightLabel, ...rootProps } = props;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {props.leftLabel ? (
        <span className={cn({ "text-midnight-500": props.disabled })}>
          {props.leftLabel}
        </span>
      ) : null}
      <RadixSlider.Root
        ref={ref}
        className="relative flex w-full touch-none select-none items-center"
        {...rootProps}
      >
        <RadixSlider.Track
          className={cn(
            "relative h-2 w-full grow overflow-hidden rounded-full",
            props.disabled ? "bg-midnight-650" : "bg-midnight-500"
          )}
        >
          <RadixSlider.Range className="absolute h-full" />
        </RadixSlider.Track>
        <RadixSlider.Thumb
          className={cn(
            "block h-5 w-5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50",
            props.disabled ? "bg-midnight-600" : "bg-midnight-400"
          )}
        />
      </RadixSlider.Root>
      {props.rightLabel ? (
        <span className={cn({ "text-midnight-500": props.disabled })}>
          {props.rightLabel}
        </span>
      ) : null}
    </div>
  );
});

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
