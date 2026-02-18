import Image from "next/image";

interface ShowcaseProps {
  direction: "row" | "reverse";
  img: string;
  title: string;
  content: string;
}

export const Showcase = ({ content, direction, img, title }: ShowcaseProps) => {
  return (
    <div className="w-full h-auto py-20">
      <div
        className={`h-full w-full flex ${direction === "row" ? "flex-row" : "flex-row-reverse"} justify-between items-center max-w-6xl mx-auto`}
      >
        <Image
          unoptimized
          src={img}
          alt="Showcase Img"
          width={100}
          height={100}
          className="w-md"
        />

        <div className="flex flex-col">
          <h1 className="font-bebas font-extrabold text-white max-w-md">
            <span className="block text-7xl">{title}</span>
          </h1>
          <p className="mt-6 mb-14 text-md text-neutral-400 max-w-md font-nuni">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
};
