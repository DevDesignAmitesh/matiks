import Image from "next/image";
import { GrayButton, GrayIconButton, GreenButton, GreenIconButton } from "./buttons";
import { MdCall } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";

interface PopupScreenProps {
  type: popupType;
  onClick: () => void;
  handleAuthState: (val: popupType) => void;
}

export const PopupScreen = ({
  type,
  onClick,
  handleAuthState,
}: PopupScreenProps) => {
  return (
    <div
      onClick={onClick}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center px-4"
    >
      {type === "play" && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md sm:max-w-lg
          rounded-3xl bg-neutral-800
          px-6 sm:px-10 py-8 sm:py-10"
        >
          <h1
            className="text-neutral-50 
            text-3xl sm:text-4xl md:text-5xl
            font-bebas font-bold uppercase text-center"
          >
            matiks on browser
          </h1>

          <p
            className="text-neutral-300 font-semibold 
            mt-4 text-xs sm:text-sm text-center font-nuni"
          >
            OUR BEST EXPERIENCE IS ON MOBILE
          </p>

          <div className="flex flex-col justify-center items-center gap-4 mt-8">
            <GreenButton
              label="GET STARTED"
              onClick={() => handleAuthState("signup")}
            />
            <GrayButton
              label="ALREADY HAVE AN ACCOUNT"
              onClick={() => handleAuthState("login")}
            />
          </div>
        </div>
      )}

      {type === "download" && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md sm:max-w-lg
          rounded-3xl bg-neutral-800
          px-6 sm:px-10 py-8 sm:py-10
          flex flex-col items-center gap-6"
        >
          <h1
            className="text-neutral-50 
            text-3xl sm:text-4xl md:text-5xl
            font-bebas font-bold uppercase text-center"
          >
            matiks on browser
          </h1>

          <Image
            src="/surprise-qr.png"
            alt="qr"
            width={200}
            height={200}
            className="w-40 sm:w-48 md:w-52 h-auto"
          />

          <p
            className="text-neutral-300 font-semibold 
            text-xs sm:text-sm text-center font-nuni uppercase"
          >
            Scan QR code with your phone camera
          </p>
        </div>
      )}

      {(type === "login" || type === "signup") && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md sm:max-w-lg
          rounded-3xl bg-neutral-800
          px-6 sm:px-10 py-8 sm:py-10
          flex flex-col items-center gap-6"
        >
          <h1
            className="text-neutral-50 
            text-3xl sm:text-4xl md:text-5xl
            font-bebas font-bold uppercase text-center"
          >
            {type === "signup" ? "SIGN UP" : "LOGIN"} TO MATIKS
          </h1>

          <div className="flex flex-col justify-center items-center gap-6 mt-8">
            <GreenIconButton
              label="CONTINUE WITH PHONE NUMBER"
              onClick={() => {}}
              icon={<MdCall fill="#B1FA63" size={20} />}
            />
            <GrayIconButton
              label="CONTINUE WITH GOOGLE"
              onClick={() => {}}
              icon={<FcGoogle size={20} />}
            />{" "}
          </div>
        </div>
      )}
    </div>
  );
};
