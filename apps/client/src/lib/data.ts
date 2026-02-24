import {
  FaHome,
  FaPuzzlePiece,
  FaCalendarDay,
  FaTrophy,
  FaFlag,
  FaNetworkWired,
  FaMedal,
  FaUsers,
  FaUser,
  FaCommentDots,
  FaCode,
  FaShareAlt,
} from "react-icons/fa";
import { RatingCompProps, SideBarProps } from "./types";

export const sidebarData: Array<SideBarProps> = [
  {
    label: "Arena",
    href: "/arena",
    icon: FaHome,
    isActive: true,
  },
  {
    label: "Puzzles",
    href: "/puzzles",
    icon: FaPuzzlePiece,
    isActive: false,
  },
  // {
  //   label: "Daily Challenge",
  //   href: "/daily-challenge",
  //   icon: FaCalendarDay,
  //   isActive: false,
  // },
  {
    label: "Compete",
    href: "/compete",
    icon: FaTrophy,
    isActive: false,
  },
  {
    label: "Quests",
    href: "/quests",
    icon: FaFlag,
    isActive: false,
  },
  {
    label: "Nets",
    href: "/nets",
    icon: FaNetworkWired,
    isActive: false,
  },
  {
    label: "Leaderboard",
    href: "/leaderboard",
    icon: FaMedal,
    isActive: false,
  },
  {
    label: "Group Play",
    href: "/group-play",
    icon: FaUsers,
    isActive: false,
  },
  {
    label: "My Profile",
    href: "/profile",
    icon: FaUser,
    isActive: false,
  },
  {
    label: "Feedback",
    href: "/feedback",
    icon: FaCommentDots,
    isActive: false,
  },
  // {
  //   label: "Creators Programme",
  //   href: "/creators",
  //   icon: FaCode,
  //   isActive: false,
  // },
  {
    label: "Social",
    href: "/social",
    icon: FaShareAlt,
    isActive: false,
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
