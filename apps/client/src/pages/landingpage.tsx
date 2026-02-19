"use client";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Showcase } from "@/components/showcase";
import { TotalUsers } from "@/components/totalusers";

export const LandingPage = () => {
  return (
    <div className="w-full min-h-screen bg-neutral-900">
      <Header />
      <Hero />

      <Showcase
        direction="row"
        img="/trophy.webp"
        title="Thinking is a sport"
        content="You face real opponents, react in real time, and get better every time you play."
      />
      <Showcase
        direction="reverse"
        img="/fire.webp"
        title="streaks reflect momentum"
        content="They track consistency in play - not reminders to come back."
      />
      <Showcase
        direction="row"
        img="/key.webp"
        title="features That show progress"
        content="You face real opponents, react in real time, and get better every time you play."
      />
      <Showcase
        direction="reverse"
        img="/box.webp"
        title="Game Modes that define your play-style"
        content="Each mode targets a different skill set- Math, Memory, Puzzle and Classical."
      />

      <TotalUsers />

      <Footer />
    </div>
  );
};
