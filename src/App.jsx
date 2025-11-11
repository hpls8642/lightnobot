import CaptchaComponent from "./components/Captcha/CaptchaDemo.jsx";
import Prism from "./components/Prism/Prism.jsx";

export default function App() {
  return (
    <>
      <div className="w-full h-screen relative bg-black flex justify-center items-center">
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
            LightNoBot
          </h1>
          <p className="mt-3 text-slate-200 text-center sm:text-xl max-w-2xl mx-auto font-sans">
            Where divine precision meets human touch. Light the candle, and the
            doors will open.
          </p>
          <CaptchaComponent />
        </div>
      </div>
    </>
  );
}
