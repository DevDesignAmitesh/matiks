import Link from "next/link";
import { Logo } from "./logo";

export const Header = () => {
  return (
    <header className="w-full font-nuni py-6 font-semibold">
      <div className="w-full max-w-6xl mx-auto flex justify-between items-center text-neutral-50">
        <Logo type="header" />

        {/* nav items */}
        <div className="flex justify-center items-center gap-20">
          <Link href={"#"} className="hover:underline">Privacy Policy</Link>
          <Link href={"#"} className="hover:underline">Blogs</Link>
          <button className="border border-neutral-500 py-4 px-8 cursor-pointer">
            Play On Desktop
          </button>
        </div>
      </div>
    </header>
  );
};
