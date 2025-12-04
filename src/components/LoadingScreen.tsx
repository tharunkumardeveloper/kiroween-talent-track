import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [phase, setPhase] = useState(1);
  const [currentText, setCurrentText] = useState("Awakening the spirits...");

  useEffect(() => {
    // Phase 1: 1.5 seconds
    const phase1Timer = setTimeout(() => {
      setPhase(2);
      setCurrentText("Summoning your training demons...");
    }, 1500);

    // Phase 2: 1.5 seconds
    const phase2Timer = setTimeout(() => {
      setPhase(3);
      setCurrentText("Preparing the haunted gym...");
    }, 3000);

    // Phase 3: Complete
    const phase3Timer = setTimeout(() => {
      onComplete();
    }, 4500);

    return () => {
      clearTimeout(phase1Timer);
      clearTimeout(phase2Timer);
      clearTimeout(phase3Timer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black via-purple-950 to-purple-900 flex flex-col items-center justify-center text-white safe-top safe-bottom overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Ghosts */}
        <div className="absolute top-20 left-10 text-6xl animate-float opacity-30">👻</div>
        <div className="absolute top-40 right-20 text-5xl animate-float-delayed opacity-20" style={{ animationDelay: '1s' }}>👻</div>
        <div className="absolute bottom-32 left-1/4 text-4xl animate-float opacity-25" style={{ animationDelay: '2s' }}>👻</div>
        
        {/* Pumpkins */}
        <div className="absolute top-1/4 right-10 text-5xl animate-bounce-slow opacity-40">🎃</div>
        <div className="absolute bottom-20 right-1/3 text-6xl animate-bounce-slow opacity-30" style={{ animationDelay: '1.5s' }}>🎃</div>
        
        {/* Bats */}
        <div className="absolute top-10 left-1/3 text-3xl animate-fly opacity-40">🦇</div>
        <div className="absolute top-1/3 right-1/4 text-3xl animate-fly opacity-30" style={{ animationDelay: '0.8s' }}>🦇</div>
        
        {/* Spooky Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Spooky Logo with Glowing Effect */}
        <div className="mb-8 animate-scale-in relative">
          <div className="absolute inset-0 blur-2xl bg-orange-500/30 animate-pulse" />
          <div className="relative">
            <div className="text-7xl mb-4 animate-bounce-slow">🎃</div>
            <h1 className="text-6xl sm:text-7xl font-bold text-shadow-glow tracking-tight text-center text-white mb-2">
              Talent Track
            </h1>
            <h2 className="text-2xl sm:text-3xl font-bold text-shadow-glow tracking-tight text-center bg-gradient-to-r from-orange-400 via-red-500 to-purple-500 bg-clip-text text-transparent">
              KIROWEEN - RESURRECTION
            </h2>
            <p className="text-center mt-4 text-orange-300/90 text-lg font-medium animate-pulse">
              Enter if you dare... 💀
            </p>
          </div>
        </div>

        {/* Spooky Loading Animation */}
        <div className="flex flex-col items-center space-y-6 animate-fade-in mt-8">
          {/* Animated Cauldron/Potion Effect */}
          <div className="relative">
            <div className="flex space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full animate-bubble" />
              <div className="w-4 h-4 bg-purple-500 rounded-full animate-bubble" style={{ animationDelay: '0.3s' }} />
              <div className="w-4 h-4 bg-orange-500 rounded-full animate-bubble" style={{ animationDelay: '0.6s' }} />
            </div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-4xl">
              🧪
            </div>
          </div>
          
          <p className="text-orange-200 text-lg font-medium transition-all duration-500 text-center px-4 animate-flicker">
            {currentText}
          </p>
          
          {/* Progress Indicator */}
          <div className="w-64 h-2 bg-black/50 rounded-full overflow-hidden border border-orange-500/30">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 via-red-500 to-purple-500 transition-all duration-1500 ease-out"
              style={{ width: `${(phase / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Spooky Text */}
      <div className="absolute bottom-8 text-center text-orange-400/60 text-sm animate-fade-in">
        <p className="flex items-center justify-center gap-2">
          <span className="animate-pulse">🕷️</span>
          <span>Powered by Dark Magic</span>
          <span className="animate-pulse">🕸️</span>
        </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-30px) translateX(-15px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes fly {
          0% { transform: translateX(0px) translateY(0px) rotate(0deg); }
          25% { transform: translateX(20px) translateY(-10px) rotate(5deg); }
          50% { transform: translateX(0px) translateY(-20px) rotate(0deg); }
          75% { transform: translateX(-20px) translateY(-10px) rotate(-5deg); }
          100% { transform: translateX(0px) translateY(0px) rotate(0deg); }
        }
        @keyframes bubble {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 1; }
          50% { transform: translateY(-30px) scale(1.2); opacity: 0.5; }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 3s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        .animate-fly { animation: fly 4s ease-in-out infinite; }
        .animate-bubble { animation: bubble 2s ease-in-out infinite; }
        .animate-flicker { animation: flicker 2s ease-in-out infinite; }
        .text-shadow-glow {
          text-shadow: 0 0 20px rgba(251, 146, 60, 0.8), 0 0 40px rgba(251, 146, 60, 0.4);
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;