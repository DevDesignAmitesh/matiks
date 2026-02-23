import { Logo } from "./logo";

export const HomeHeader = () => {
  return (
    <header className="w-full bg-red-300 p-3 flex justify-between shrink-0">
      <Logo type="header" />
      <div>profile section</div>
    </header>
  );
};
