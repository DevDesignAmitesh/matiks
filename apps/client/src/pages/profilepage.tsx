import Image from "next/image";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaArrowLeft } from "react-icons/fa";

export const ProfilePage = () => {
  return (
    <div className="w-full h-full">
      <div className="w-full max-w-5xl mx-auto h-full p-4 grid gap-10 grid-cols-6">
        <div className="w-full h-full col-span-4 rounded-xl bg-neutral-800">
          <div className="w-full h-40 relative rounded-t-xl overflow-hidden">
            <Image src="/profile-bg.png" alt="My Profile" fill unoptimized />
            <p
              className="text-4xl font-bebas font-bold tracking-wide absolute top-1/2 left-1/2 
              -translate-x-1/2 -translate-y-1/2"
            >
              ROOKIE
            </p>

            <div className="w-full flex justify-between items-center p-2 absolute">
              {/* buttons */}
              <div
                // onClick={() => router.back()}
                className="relative inline-block w-auto"
              >
                <button
                  className="relative z-10 w-full
                  flex items-center justify-between gap-3
                  p-3
                  rounded-xl cursor-pointer
                  bg-neutral-900 border border-neutral-500
                  text-neutral-50 font-bold font-nuni
                  text-xs
                  transition-all active:translate-y-0.5"
                >
                  {/* Left Icon */}
                  <span className="flex items-center">
                    <FaArrowLeft />
                  </span>
                </button>

                {/* Band */}
                <div
                  className="absolute left-0 right-0
                  -bottom-1
                  h-4 sm:h-5
                  bg-neutral-500
                  rounded-full"
                />
              </div>

              <div
                // onClick={() => router.back()}
                className="relative inline-block w-auto"
              >
                <button
                  className="relative z-10 w-full
                  flex items-center justify-between gap-3
                  p-3
                  rounded-xl cursor-pointer
                  bg-neutral-900 border border-neutral-500
                  text-neutral-50 font-bold font-nuni
                  text-xs
                  transition-all active:translate-y-0.5"
                >
                  {/* Left Icon */}
                  <span className="flex items-center">
                    <BsThreeDotsVertical />
                  </span>
                </button>

                {/* Band */}
                <div
                  className="absolute left-0 right-0
                  -bottom-1
                  h-4 sm:h-5
                  bg-neutral-500
                  rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="w-full h-full col-span-2"></div>
      </div>
    </div>
  );
};



// Amitesh@6969
// idk6969@2005
// Amitesh@2005
// Amitesh_2005