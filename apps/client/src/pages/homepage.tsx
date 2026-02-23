import { HomeHeader } from "@/components/homeheader";
import { LeftSideBar } from "@/components/leftsidebar";
import { RightSideBar } from "@/components/rightsidebar";

export const HomePage = () => {
  return (
    <div className="w-full bg-neutral-900">
      <div className="w-full max-w-375 mx-auto h-screen flex flex-col">
        <HomeHeader />
        <div className="flex flex-1 overflow-hidden">
          <LeftSideBar />
          <main className="flex-1 bg-neutral-900 overflow-auto">
            {/* Your main content goes here */}
            <div className="p-4">Main content area</div>
          </main>
          <RightSideBar />
        </div>
      </div>
    </div>
  );
};
