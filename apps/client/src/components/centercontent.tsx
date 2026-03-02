import { Games } from "./games";
import { LivePlayers } from "./liveplayers";

export const CenterContent = () => {
  return (
    <div className="px-8 py-4 h-full">
      <LivePlayers />
      <Games />
    </div>
  );
};
