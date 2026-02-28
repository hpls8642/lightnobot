import Snowfall from "react-snowfall";
import CaptchaComponent from "./components/Captcha/CaptchaDemo.jsx";
import Prism from "./components/Prism/Prism.jsx";
import chipsina from "./assets/chipsina.png";
import chipsina2 from "./assets/chipsina2.png";
import chipsina3 from "./assets/chipsina3.png";
import { useEffect, useState } from "react";
import supabase from "./supabase.js";

const snowflake1 = document.createElement("img");
snowflake1.src = chipsina;

const snowflake2 = document.createElement("img");
snowflake2.src = chipsina2;

const snowflake3 = document.createElement("img");
snowflake3.src = chipsina3;

const images = [snowflake1, snowflake2, snowflake3];

export default function App() {
  const [totalHumans, setTotalHumans] = useState(0);

  useEffect(() => {
    const getUserStars = async () => {
      const { data, error } = await supabase.from("counter").select("total");

      if (error) {
        console.error("Failed to load amount", error);
        return;
      }
      console.log(data);
      setTotalHumans(data[0].total);
    };

    getUserStars();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "counter" },
        (payload) => {
          setTotalHumans(payload.new.total);
          console.log("Change received!", payload);
        },
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  return (
    <>
      <div className="w-full h-screen relative bg-black flex justify-center items-center flex-col">
        <Snowfall
          radius={[40, 60]}
          speed={[0.5, 1]}
          snowflakeCount={40}
          images={images}
        />
        <Prism
          animationType="rotate"
          timeScale={0.5}
          height={3.5}
          baseWidth={5.5}
          scale={3.6}
          hueShift={0}
          colorFrequency={1}
          noise={0}
          glow={1}
        />
        <div className="absolute flex flex-col justify-center items-center p-4">
          <h1 className="text-white xl:text-7xl text-5xl tracking-tight font-heading mb-2">
            Light<span className="text-custom-gold">No</span>Bot
          </h1>
          <p className="mt-3 text-slate-200 text-center sm:text-xl max-w-2xl mx-auto font-sans">
            Where divine precision meets human touch. Light the candle, and the
            doors will open.
          </p>
          <p className="mt-3 text-slate-200 text-center sm:text-xl max-w-2xl mx-auto font-sans">
            <span className="text-white">{totalHumans}</span> Humans Verified
          </p>
          <CaptchaComponent />
        </div>
        <footer className="absolute bottom-2">
          <p className="text-slate-500 sm:text-sm text-xs">
            © 2026 • <span className="text-slate-400">BearSpark Solutions</span>{" "}
            • All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
}
