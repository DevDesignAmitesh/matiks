import Image from "next/image";

export const Logo = ({ type }: { type: "footer" | "header" }) => {
  if (type === "footer") {
    return (
      <Image
        unoptimized
        src={"/logo.svg"}
        alt="logo"
        width={100}
        height={100}
        className="w-60"
      />
    );
  } else if (type === "header") {
    return <div>Logo</div>;
  }
};
