import React, { useState, useEffect, useRef } from "react";
import { RefreshCw, X, Check } from "lucide-react";
import logo from "../../assets/logo.png";
import sprite from "../../assets/sprite.png";
import background from "../../assets/tiledbackground2.png";

const TILED_BG_URL = "/tiledbackground2.png";

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const CaptchaComponent = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [verified, setVerified] = useState(false);
  const [failed, setFailed] = useState(false);
  const [piecePosition, setPiecePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [slotPosition, setSlotPosition] = useState({ x: 0, y: 0 });
  const [showSuccess, setShowSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [bgNatural, setBgNatural] = useState({ w: 0, h: 0 });
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const puzzleRef = useRef(null);
  const pieceRef = useRef(null);

  // Generate slot position in center-right area
  const generateSlotPosition = () => {
    const el = puzzleRef.current;
    const pieceW = 40;
    const pieceH = 100;
    const slotW = 20;
    const slotH = 100;
    if (el) {
      const rect = el.getBoundingClientRect();
      const BASE_W = 400;
      const BASE_H = 250;
      const scaleX = (px) => (px / BASE_W) * rect.width;
      const scaleY = (px) => (px / BASE_H) * rect.height;
      const isMobile =
        typeof window !== "undefined" ? window.innerWidth <= 480 : false;
      const mobileShiftY = isMobile ? scaleY(40) : 0;

      // Slot region (from previous fixed pixel ranges) scaled responsively
      const slotXScaled = scaleX(randomIntFromInterval(245, 355));
      const slotYScaled = scaleY(randomIntFromInterval(25, 55));
      const slotX = Math.max(0, Math.min(slotXScaled, rect.width - slotW));
      const slotYBase = Math.max(0, Math.min(slotYScaled, rect.height - slotH));
      const slotY = Math.max(0, slotYBase - mobileShiftY);
      setSlotPosition({ x: slotX, y: slotY });

      // Piece initial region scaled responsively
      const pieceXScaled = scaleX(randomIntFromInterval(10, 125));
      const pieceYScaled = scaleY(randomIntFromInterval(95, 135));
      const pieceX = Math.max(0, Math.min(pieceXScaled, rect.width - pieceW));
      const pieceYBase = Math.max(
        0,
        Math.min(pieceYScaled, rect.height - pieceH)
      );
      const pieceY = Math.max(0, pieceYBase - mobileShiftY);
      setPiecePosition({ x: pieceX, y: pieceY });
    } else {
      // Fallback defaults
      setSlotPosition({ x: 260, y: 90 });
      setPiecePosition({
        x: randomIntFromInterval(10, 125),
        y: randomIntFromInterval(35, 65),
      });
    }
  };

  useEffect(() => {
    if (showModal) {
      // Load background image to get its natural aspect ratio
      const img = new Image();
      img.onload = () => {
        setBgNatural({ w: img.naturalWidth, h: img.naturalHeight });
        // After aspect is known and element is rendered, generate positions
        // Using a timeout to ensure layout is settled
        setTimeout(() => {
          // measure container
          if (puzzleRef.current) {
            const rect = puzzleRef.current.getBoundingClientRect();
            setContainerSize({ w: rect.width, h: rect.height });
          }
          generateSlotPosition();
        }, 0);
      };
      img.src = background;
    }
  }, [showModal]);

  const handleCheckboxClick = () => {
    if (verified) return;

    setFailed(false);
    setAttemptsLeft(3);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowModal(true);
    }, 800);
  };

  const handleMouseDown = (e) => {
    if (verified) return;
    setIsDragging(true);

    const rect = pieceRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleTouchStart = (e) => {
    if (verified) return;
    setIsDragging(true);

    const touch = e.touches[0];
    const rect = pieceRef.current.getBoundingClientRect();
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !puzzleRef.current) return;

    const rect = puzzleRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    setPiecePosition({
      x: Math.max(0, Math.min(x, rect.width - 40)),
      y: Math.max(0, Math.min(y, rect.height - 100)),
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !puzzleRef.current) return;

    const touch = e.touches[0];
    const rect = puzzleRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left - dragOffset.x;
    const y = touch.clientY - rect.top - dragOffset.y;

    setPiecePosition({
      x: Math.max(0, Math.min(x, rect.width - 40)),
      y: Math.max(0, Math.min(y, rect.height - 120)),
    });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    checkPlacement();
  };

  const checkPlacement = () => {
    const tolerance = 15;
    const dx = Math.abs(piecePosition.x - slotPosition.x);
    const dy = Math.abs(piecePosition.y - slotPosition.y);
    const isSuccess = dx < tolerance && dy < tolerance;

    setIsEvaluating(true);
    setTimeout(() => {
      if (isSuccess) {
        setPiecePosition(slotPosition);
        setShowSuccess(true);
        setVerified(true);
        setIsChecked(true);
        setFailed(false);
        setIsEvaluating(false);
        setTimeout(() => {
          setShowModal(false);
          setShowSuccess(false);
        }, 1000);
      } else {
        const remaining = attemptsLeft - 1;
        setAttemptsLeft(remaining);
        if (remaining > 0) {
          setIsEvaluating(false);
          setShake(true);
          setTimeout(() => setShake(false), 300);
          generateSlotPosition();
        } else {
          // Out of attempts
          setIsEvaluating(false);
          setShowModal(false);
          setVerified(false);
          setIsChecked(false);
          setFailed(true);
        }
      }
    }, 400);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleMouseUp);
      };
    }
  }, [isDragging, piecePosition]);

  const handleRefresh = () => {
    // Reset state for a fresh puzzle, including after failed case
    setIsDragging(false);
    setIsEvaluating(false);
    setShowSuccess(false);
    setVerified(false);
    setFailed(false);
    setAttemptsLeft(3);
    generateSlotPosition();
    // If modal was closed due to failure, reopen it
    if (!showModal) {
      setShowModal(true);
    }
  };

  return (
    <div className="w-full max-w-md mt-10">
      {/* Checkbox Stage */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-6 pb-4 text-white border border-white/30">
        <div
          className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
            verified
              ? "border-green-500"
              : failed
              ? "border-red-400 "
              : "border-white/30 hover:border-gray-400"
          }`}
          onClick={handleCheckboxClick}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-6 h-6 border-2 rounded flex items-center justify-center transition-all ${
                verified
                  ? "bg-green-500 border-green-500 backdrop-blur-md"
                  : failed
                  ? "bg-red-500 border-red-500 backdrop-blur-md"
                  : "border-gray-400"
              }`}
            >
              {isLoading && (
                <div className="w-4 h-4 border border-white/30 border-t-transparent rounded-full animate-spin" />
              )}
              {verified && <Check className="w-4 h-4 text-white" />}
              {!verified && !isLoading && failed && (
                <X className="w-4 h-4 text-white" />
              )}
            </div>
            <span className="text-white font-medium">I'm not a robot</span>
          </div>
          <img
            src={logo}
            alt="Service logo"
            width={60}
            height={60}
            className="opacity-60 object-contain"
            style={{ display: "block" }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-gray-300">Privacy • Terms</div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRefresh();
              setShowModal(false);
            }}
            className="flex items-center gap-1 px-3 py-1 text-xs text-white hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Restart
          </button>
        </div>
      </div>

      {/* Puzzle Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-cyan-700 backdrop-blur-lg text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Verify You're Human</h3>
                <p className="text-sm opacity-90">
                  Drag the candle to the highlighted area
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Puzzle Area */}
            <div className="p-5 pb-3">
              <div
                ref={puzzleRef}
                className="relative w-full rounded-lg overflow-hidden border border-white/30 shadow-inner"
                style={{
                  touchAction: "none",
                  backgroundImage: `url(${background})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  // Fit the div to the image aspect ratio; use 400x250 fallback if not loaded yet
                  aspectRatio:
                    bgNatural.w && bgNatural.h
                      ? `${bgNatural.w} / ${bgNatural.h}`
                      : "400 / 250",
                }}
              >
                {/* Evaluating Spinner Overlay */}
                {isEvaluating && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-20">
                    <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                {/* Slot (where piece should go) */}
                <div
                  className="absolute transition-all duration-300"
                  style={{
                    left: `${slotPosition.x}px`,
                    top: `${slotPosition.y}px`,
                    width: "20px",
                    height: "100px",
                  }}
                >
                  <div
                    className="w-full h-full border-2 border-dashed border-amber-500 bg-white bg-opacity-20 rounded-md"
                    style={{
                      filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))",
                    }}
                  />
                </div>

                {/* Draggable Piece */}
                <div
                  ref={pieceRef}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                  className={`absolute cursor-move transition-all ${
                    isEvaluating ? "pointer-events-none opacity-80" : ""
                  } ${isDragging ? "scale-110 z-20" : "scale-100 z-10"} ${
                    shake ? "animate-shake" : ""
                  }`}
                  style={{
                    left: `${piecePosition.x}px`,
                    top: `${piecePosition.y}px`,
                    width: "40px",
                    height: "100px",
                    transition: isDragging ? "none" : "all 0.3s ease",
                    userSelect: "none",
                  }}
                >
                  <img
                    src={sprite}
                    alt="Candle"
                    className="w-full h-full object-contain"
                    style={{
                      filter: isDragging
                        ? "drop-shadow(0 8px 16px rgba(0,0,0,0.3))"
                        : "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
                      pointerEvents: "none",
                    }}
                    draggable={false}
                  />
                </div>

                {/* Success Overlay */}
                {showSuccess && (
                  <div className="absolute inset-0 bg-green-400 bg-opacity-80 flex items-center justify-center animate-in fade-in zoom-in duration-300 z-20">
                    <div className="text-center text-white">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                        <Check className="w-12 h-12 text-green-400" />
                      </div>
                      <h4 className="text-2xl font-bold mb-2">Verified!</h4>
                      <p className="text-sm opacity-90">You are human</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={verified}
                >
                  <RefreshCw className="w-4 h-4" />
                  New Candle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaptchaComponent;
