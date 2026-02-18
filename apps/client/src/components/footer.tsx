import Image from "next/image";
import { Logo } from "./logo";
import { TbArrowUpRight } from "react-icons/tb";
import { GreenButton } from "./buttons";
import { FaDiscord, FaTwitter, FaYoutube, FaInstagram } from "react-icons/fa";

export const Footer = () => {
  return (
    <footer className="w-full bg-neutral-900 px-6 pt-20 pb-4 space-y-6">
      {/* ===== CTA SECTION ===== */}
      <section className="max-w-6xl mx-auto overflow-hidden flex items-center justify-center gap-4">
        {/* Left Decorative Block */}
        <div className="md:w-1/3 rounded-3xl grid grid-cols-2 h-full gap-2">
          <div className="aspect-square bg-white rounded-2xl flex items-center justify-center h-full">
            <FaDiscord className="text-black text-5xl" />
          </div>

          <div className="aspect-square bg-white rounded-2xl flex items-center justify-center h-full">
            <FaTwitter className="text-black text-5xl" />
          </div>

          <div className="aspect-square bg-white rounded-2xl flex items-center justify-center h-full">
            <FaYoutube className="text-black text-5xl" />
          </div>

          <div className="aspect-square bg-white rounded-2xl flex items-center justify-center h-full">
            <FaInstagram className="text-black text-5xl" />
          </div>
        </div>

        {/* Right CTA */}
        <div className="flex-1 bg-[#B1FA63] rounded-3xl px-12 py-20 flex flex-col gap-10 h-full">
          <div className="flex justify-between items-center gap-10">
            <h2 className="text-6xl font-bebas font-bold text-neutral-900 leading-tight max-w-xl">
              LET'S SEE WHAT YOUR BRAIN CAN DO
            </h2>

            <Image
              src="/gussa.webp"
              alt="Character"
              width={200}
              height={200}
              className="w-40 h-auto object-contain"
            />
          </div>

          <div className="flex gap-4">
            <GreenButton />
            <GreenButton />
          </div>
        </div>
      </section>

      {/* ===== FOOTER NAV SECTION ===== */}
      <section className="max-w-6xl mx-auto bg-[#B8A7F5] rounded-3xl px-12 py-16">
        <div className="flex flex-col md:flex-row justify-between gap-10 text-neutral-900">
          <Logo type="footer" />

          <div className="flex flex-col items-start md:items-end gap-6">
            {["Back to top", "Terms & Condition", "Privacy Policy"].map(
              (item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 group cursor-pointer"
                >
                  <p className="uppercase text-lg font-nuni font-extrabold tracking-wide">
                    {item}
                  </p>
                  <TbArrowUpRight
                    size={22}
                    className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                </div>
              ),
            )}
          </div>
        </div>
      </section>
    </footer>
  );
};
