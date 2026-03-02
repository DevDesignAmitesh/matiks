import {
  FaHome,
  FaMedal,
  FaUser,
  FaCommentDots,
  FaShareAlt,
} from "react-icons/fa";
import { LivePlayers, RatingCompProps, SideBarProps } from "./types";
import { IoMdSettings } from "react-icons/io";

export const sidebarData: Array<SideBarProps> = [
  {
    label: "Home",
    href: "/home",
    icon: FaHome,
  },
  {
    label: "Leaderboard",
    href: "/leaderboard",
    icon: FaMedal,
  },
  {
    label: "My Profile",
    href: "/profile",
    icon: FaUser,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: IoMdSettings,
  },
  {
    label: "Feedback",
    href: "/feedback",
    icon: FaCommentDots,
  },
  {
    label: "Social",
    href: "/social",
    icon: FaShareAlt,
  },
];

export const ratingsData: Array<RatingCompProps> = [
  {
    label: "math",
    src: "/math.png",
    val: "896",
  },
  {
    label: "classical",
    src: "/classic.png",
    val: "1000",
  },
  {
    label: "puzzle",
    src: "/puzzle.png",
    val: "1000",
  },
  {
    label: "memory",
    src: "/memory.png",
    val: "1000",
  },
];

export const livePlayers: Array<LivePlayers> = [
  {
    id: "1",
    name: "You",
  },
  {
    id: "2",
    name: "Sarah",
  },
  {
    id: "3",
    name: "Mike",
  },
  {
    id: "4",
    name: "Emma",
  },
  {
    id: "5",
    name: "John",
  },
  {
    id: "6",
    name: "Lisa",
  },
  {
    id: "7",
    name: "David",
  },
  {
    id: "8",
    name: "Anna",
  },
  {
    id: "9",
    name: "Chris",
  },
  {
    id: "10",
    name: "Maya",
  },
];
