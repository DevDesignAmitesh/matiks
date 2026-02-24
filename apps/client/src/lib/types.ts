import { ReactElement } from "react";
import { IconType } from "react-icons";

export type popupType =
  | "play"
  | "download"
  | "login"
  | "signup"
  | "login-action"
  | "verify-otp"
  | "signup-action";

export interface CardLayoutProps {
  label: string;
  icon?: ReactElement;
  type: "rating" | "challenge" | "download";
}

export interface SideBarProps {
  label: string;
  href: string;
  icon: IconType;
  isActive: boolean;
}

export interface RatingCompProps {
  src: string;
  label: string;
  val: string;
}
