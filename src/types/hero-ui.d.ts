declare module "hero-ui/buttons/Button" {
  import React from "react";

  interface ButtonProps {
    kind: string;
    label: string;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
    href?: string;
    icon?: string;
    iconLeft?: boolean;
    iconSpin?: boolean;
    id?: string;
    name?: string;
    value?: string;
    inverse?: boolean;
    borderless?: boolean;
    target?: string;
    thin?: boolean;
    slim?: boolean;
    type?: "submit" | "reset" | "button";
    uppercase?: boolean;
    elementRef?: () => void;
  }

  const Button: React.FC<ButtonProps>;
  export default Button;
}