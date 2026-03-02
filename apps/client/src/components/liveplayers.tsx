// TODO: Add view all players thing or hide the scroll bar

import { livePlayers } from "@/lib/data";

export const LivePlayers = () => {
  return (
    <div className="w-full py-3">
      {/* Container with horizontal scroll */}
      <div className="custom-scrollbar overflow-x-auto h-full w-full">
        <div className="flex justify-start items-center gap-6 min-w-max">
          {livePlayers.map((player) => (
            <div
              key={player.id}
              className="flex flex-col justify-center items-center gap-1.5 relative shrink-0"
            >
              {/* Avatar with conditional border for current user */}
              <div className={`p-1 rounded-full border-2 border-neutral-600`}>
                <div
                  className={`h-12 w-12 rounded-full bg-purple-700 text-neutral-50 flex 
                  justify-center items-center shadow-lg`}
                >
                  <p className="text-xl font-semibold font-nuni">
                    {player.name.split("")[0]}
                  </p>
                </div>
              </div>

              {/* Player name */}
              <p className="text-neutral-400 text-[10px] font-nuni font-bold uppercase whitespace-nowrap">
                {player.name}
              </p>

              {/* Online indicator dot */}
              <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
