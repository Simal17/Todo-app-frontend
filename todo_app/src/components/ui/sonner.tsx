import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      toastOptions={{
        classNames: {
          toast: "text-lg px-6 py-4 rounded-xl",
          description: "text-base text-muted-foreground",
          title: "text-xl font-semibold",
          actionButton: "text-sm px-4 py-2",
          cancelButton: "text-xs",
        },
      }}
      style={{
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
      } as React.CSSProperties}
      {...props}
    />

  )
}

export { Toaster }
