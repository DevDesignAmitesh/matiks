export const TotalUsers = () => {
  return (
    <div className="h-auto w-full py-40 bg-neutral-950 flex flex-col justify-center items-center gap-10">
      <h1 className="text-[#B1FA63] text-[120px] leading-[0.9] tracking-tight font-bebas opacity-20">
        TOTAL USERS
      </h1>

      <div className="flex justify-center items-center gap-3">
        {[9, 0, 4, 0, 8, 2].map((val) => (
          <div
            key={val}
            className="bg-[#3A3A3A] text-[#B1FA63] text-[100px] leading-[0.7] font-bold tracking-tight font-bebas p-8 rounded-2xl"
          >
            {/* {val} */}
            {/* TODO: there will the data from the backend server */}
            0
          </div>
        ))}
      </div>
    </div>
  );
};
