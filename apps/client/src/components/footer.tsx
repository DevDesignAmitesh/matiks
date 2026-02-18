import Image from "next/image";
import { Logo } from "./logo";
import { TbArrowUpRight } from "react-icons/tb";
import { GreenButton } from "./buttons";
import { FaDiscord, FaTwitter, FaYoutube, FaInstagram } from "react-icons/fa";

export const Footer = () => {
  return (
    <footer className="w-full bg-neutral-900 px-6 pt-20 pb-8 space-y-10">
      {/* ===== CTA SECTION ===== */}
      <section className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
        {/* Social Grid */}
        <div className="w-full md:w-1/3 grid grid-cols-2 gap-3">
          {[FaDiscord, FaTwitter, FaYoutube, FaInstagram].map((Icon, index) => (
            <div
              key={index}
              className="aspect-square bg-white rounded-2xl 
                flex items-center justify-center
                transition hover:-translate-y-1 hover:shadow-lg cursor-pointer"
            >
              <Icon className="text-black text-3xl sm:text-4xl md:text-5xl" />
            </div>
          ))}
        </div>

        {/* CTA Block */}
        <div className="flex-1 bg-[#B1FA63] rounded-3xl px-6 sm:px-10 md:px-12 py-12 md:py-20 flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <h2
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl 
              font-bebas font-bold text-neutral-900 leading-tight text-center sm:text-left"
            >
              LET'S SEE WHAT YOUR BRAIN CAN DO
            </h2>

            <Image
              src="/gussa.webp"
              alt="Character"
              width={200}
              height={200}
              className="w-28 sm:w-32 md:w-40 h-auto object-contain"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
            <GreenButton />
            <GreenButton />
          </div>
        </div>
      </section>

      {/* ===== FOOTER NAV SECTION ===== */}
      <section className="max-w-6xl mx-auto bg-[#B8A7F5] rounded-3xl px-6 sm:px-10 md:px-12 py-12 md:py-16">
        <div className="flex flex-col md:flex-row justify-between gap-8 text-neutral-900">
          <Logo type="footer" />

          <div className="flex flex-col items-start md:items-end gap-5">
            {["Back to top", "Terms & Condition", "Privacy Policy"].map(
              (item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 group cursor-pointer"
                >
                  <p className="uppercase text-sm sm:text-base font-nuni font-extrabold tracking-wide">
                    {item}
                  </p>
                  <TbArrowUpRight
                    size={20}
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
