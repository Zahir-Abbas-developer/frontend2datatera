import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

const Checkbox = React.forwardRef(({ style, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    {...props}
    style={{
      height: "16px",
      width: "16px",
      borderRadius: "4px",
      border: "1px solid #d1d5db", // light gray border
      backgroundColor: props.checked ? "#16a34a" : "white", // green when checked
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: props.disabled ? "not-allowed" : "pointer",
      transition: "all 0.2s ease-in-out",
      ...style, // allow overrides
    }}
  >
    <CheckboxPrimitive.Indicator>
      <Check
        style={{
          height: "14px",
          width: "14px",
          color: "white",
        }}
      />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))

Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
