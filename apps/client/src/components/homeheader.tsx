import { Logo } from "./logo";
import { ProfilePopup } from "./profilepopup";

export const HomeHeader = () => {
  return (
    <header className="w-full p-2 flex justify-between shrink-0 border-b border-neutral-700">
      <Logo type="header" />
      <ProfilePopup />
    </header>
  );
};
