import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

const TooltipProvider = TooltipPrimitive.Provider
const Tooltip = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef(
  ({ sideOffset = 4, style, ...props }, ref) => (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        style={{
          zIndex: 50,
          backgroundColor: "rgba(0,0,0,0.85)", // light black background
          color: "#fff", // white text
          padding: "8px 8px",
          fontSize: "12px",
          borderRadius: "6px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center", // center vertically
          justifyContent: "center", // center horizontally
          maxHeight: "40px", // ensures vertical centering looks good
          ...style,
        }}
        {...props}
      />
    </TooltipPrimitive.Portal>
  )
)
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
