export const GreenButton = () => {
  return (
    <div className="relative inline-block w-xs">
      <button
        className="relative z-10 py-4 rounded-xl cursor-pointer
              bg-neutral-900 border border-[#B1FA63] 
              text-neutral-50 font-bold font-nuni text-sm w-full"
      >
        DOWNLOAD NOW
      </button>

      {/* Band */}
      <div
        className="absolute left-0 right-0 -bottom-1 h-6 
              bg-[#B1FA63] rounded-full"
      />
    </div>
  );
};
