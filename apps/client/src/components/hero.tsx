import Image from "next/image";
import { GreenButton } from "./buttons";

export const Hero = () => {
  return (
    <section className="relative w-full h-fit flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/hero-bg.webp"
          alt="Background"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Content */}
      <div className="max-w-7xl z-10 mx-auto w-full flex items-center justify-between gap-16">
        {/* Left - Phone */}
        <div className="flex-1 flex justify-start">
          <Image
            src="/hero-ph.webp"
            alt="Phone mockup"
            width={600}
            height={900}
            priority
            className="w-96 h-auto object-contain"
          />
        </div>

        {/* Right - Text */}
        <div className="flex-1">
          <h1 className="font-bebas font-extrabold leading-[0.9] tracking-tight text-white">
            <span className="block text-[130px]">TURN SCREEN</span>
            <span className="block text-[130px]">TIME INTO</span>
            <span className="block text-[130px] text-[#B1FA63]">
              SMART TIME
            </span>
          </h1>

          <p className="mt-6 mb-14 text-md text-neutral-400 max-w-md">
            Fast mental duels against real players.
          </p>

          <GreenButton />
        </div>
      </div>
    </section>
  );
};
