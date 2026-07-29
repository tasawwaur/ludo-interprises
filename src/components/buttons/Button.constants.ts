import { ButtonVariant, ButtonSize } from "./Button.types";

export const DEFAULT_VARIANT: ButtonVariant = "primary";
export const DEFAULT_SIZE: ButtonSize = "md";

export const BUTTON_ANIMATION_DURATION = 150; // ms

export const BUTTON_SIZE_CLASSES: Record<ButtonSize, string> = {
  xs: "px-2.5 py-1 text-xs rounded-lg gap-1",
  sm: "px-3.5 py-1.5 text-sm rounded-xl gap-1.5",
  md: "px-5 py-2.5 text-base rounded-2xl gap-2",
  lg: "px-6 py-3.5 text-lg rounded-2xl gap-2.5 font-bold",
  xl: "px-8 py-4 text-xl rounded-3xl gap-3 font-extrabold",
};
