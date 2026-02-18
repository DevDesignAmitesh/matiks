export const GreenButton = () => {
  return (
    <div className="relative inline-block w-55 sm:w-60 md:w-65">
      <button
        className="relative z-10 w-full
        py-3 sm:py-4
        rounded-xl cursor-pointer
        bg-neutral-900 border border-[#B1FA63]
        text-neutral-50 font-bold font-nuni
        text-sm sm:text-base
        transition-all active:translate-y-0.5"
      >
        DOWNLOAD NOW
      </button>

      {/* Band */}
      <div
        className="absolute left-0 right-0
        -bottom-2
        h-4 sm:h-5
        bg-[#B1FA63]
        rounded-full"
      />
    </div>
  );
};
