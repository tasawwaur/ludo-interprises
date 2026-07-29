export interface ButtonProps { children?: React.ReactNode; onClick?: () => void; className?: string; variant?: string; size?: string; }
export type ButtonVariant = "primary" | "secondary" | "danger" | "success" | "warning" | "gradient" | "neon" | "glass";
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";
