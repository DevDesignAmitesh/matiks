import { IoReload } from "react-icons/io5";
import { CardLayout } from "./cardlayout";

export const RightSideBar = () => {
  return (
    <div className="w-80 shrink-0 overflow-auto grid p-4 gap-4 place-content-start">
      <CardLayout
        label="RATINGS"
        icon={<IoReload className="text-neutral-300" />}
        type="rating"
      />
      <CardLayout label="DAILY CHALLENGES" type="challenge" />
      <CardLayout label="DOWNLOAD MOBILE APP" type="download" />
    </div>
  );
};
