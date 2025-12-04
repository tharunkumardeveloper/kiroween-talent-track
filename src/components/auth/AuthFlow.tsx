import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Ghost, Skull, ChevronRight } from 'lucide-react';

interface AuthFlowProps {
  onLogin: (role: 'athlete' | 'coach' | 'admin') => void;
}

const AuthFlow = ({ onLogin }: AuthFlowProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'athlete' | 'coach' | 'admin' | null>(null);

  const roles = [
    { 
      role: 'athlete' as const, 
      label: 'Enter the Haunted Gym',
      icon: Ghost,
      description: 'Train with the spirits... if you dare 💀',
      gradient: 'from-orange-600 to-red-700'
    }
  ];

  const handleRoleSelect = (role: 'athlete' | 'coach' | 'admin') => {
    setSelectedRole(role);
    setIsLoading(true);
    setTimeout(() => {
      onLogin(role);
    }, 1000);
  };

  return (
    <>
      {/* Desktop View - Halloween Theme */}
      <div className="hidden sm:flex h-screen bg-gradient-to-br from-black via-orange-950 to-purple-950 items-center justify-center p-6 safe-top safe-bottom overflow-hidden relative">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating Ghosts */}
          <div className="absolute top-20 left-10 text-6xl animate-float opacity-20">👻</div>
          <div className="absolute top-40 right-20 text-5xl animate-float-delayed opacity-15" style={{ animationDelay: '1s' }}>👻</div>
          <div className="absolute bottom-32 left-1/4 text-4xl animate-float opacity-20" style={{ animationDelay: '2s' }}>👻</div>
          
          {/* Pumpkins */}
          <div className="absolute top-1/4 right-10 text-5xl animate-bounce-slow opacity-30">🎃</div>
          <div className="absolute bottom-20 right-1/3 text-6xl animate-bounce-slow opacity-25" style={{ animationDelay: '1.5s' }}>🎃</div>
          <div className="absolute top-1/2 left-10 text-5xl animate-bounce-slow opacity-20" style={{ animationDelay: '0.5s' }}>🎃</div>
          
          {/* Bats */}
          <div className="absolute top-10 left-1/3 text-3xl animate-fly opacity-30">🦇</div>
          <div className="absolute top-1/3 right-1/4 text-3xl animate-fly opacity-25" style={{ animationDelay: '0.8s' }}>🦇</div>
          <div className="absolute bottom-1/3 left-1/2 text-3xl animate-fly opacity-20" style={{ animationDelay: '1.5s' }}>🦇</div>
          
          {/* Spooky Glow Effects */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="w-full max-w-3xl lg:max-w-5xl relative z-10">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-block mb-6 relative">
              <div className="absolute inset-0 blur-2xl bg-orange-500/30 animate-pulse" />
              <div className="relative text-8xl animate-bounce-slow">🎃</div>
            </div>
            <h1 className="text-6xl lg:text-7xl font-bold mb-3 text-shadow-glow text-white">
              Talent Track
            </h1>
            <h2 className="text-3xl lg:text-4xl font-bold text-shadow-glow bg-gradient-to-r from-orange-400 via-red-500 to-purple-500 bg-clip-text text-transparent mb-4">
              KIROWEEN - RESURRECTION
            </h2>
            <p className="text-orange-300 text-xl lg:text-2xl mb-2 animate-flicker">
              The Haunted Fitness Experience
            </p>
            <p className="text-orange-400/70 text-base flex items-center justify-center gap-2">
              <Skull className="w-5 h-5 animate-pulse" />
              <span>Dare to enter the darkness...</span>
              <Skull className="w-5 h-5 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid grid-cols-1 gap-6 animate-slide-up max-w-md mx-auto">
            {roles.map((roleData, index) => {
              const Icon = roleData.icon;
              const isSelected = selectedRole === roleData.role;
              const isDisabled = isLoading && !isSelected;
              
              return (
                <Card
                  key={roleData.role}
                  className={`relative backdrop-blur-sm bg-gradient-to-br from-orange-900/40 to-red-900/40 border-2 transition-all duration-300 cursor-pointer group overflow-hidden ${
                    isSelected 
                      ? 'border-orange-500/70 bg-orange-900/60 scale-105 shadow-2xl shadow-orange-500/50' 
                      : 'border-orange-500/30 hover:border-orange-500/50 hover:bg-orange-900/50'
                  } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => !isLoading && handleRoleSelect(roleData.role)}
                >
                  {/* Animated Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent animate-shimmer" />
                  
                  <CardContent className="p-8 text-center relative z-10">
                    <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-orange-500/20 backdrop-blur-sm flex items-center justify-center transition-transform duration-300 border-2 border-orange-500/30 ${
                      isSelected ? 'scale-110 border-orange-500/60' : 'group-hover:scale-105'
                    }`}>
                      <Icon className="w-12 h-12 text-orange-300 animate-float" />
                    </div>
                    
                    <h3 className="text-3xl font-bold text-orange-100 mb-3">
                      {roleData.label}
                    </h3>
                    
                    <p className="text-orange-200/90 text-base mb-6">
                      {roleData.description}
                    </p>
                    
                    <Button
                      className={`w-full h-14 font-bold transition-all duration-300 text-lg relative overflow-hidden ${
                        isSelected 
                          ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 shadow-lg shadow-orange-500/50' 
                          : 'bg-gradient-to-r from-orange-600/80 to-red-700/80 text-white hover:from-orange-500 hover:to-red-600 border-2 border-orange-500/50'
                      }`}
                      disabled={isLoading}
                    >
                      {isSelected && isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Entering...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Ghost className="w-5 h-5" />
                          Enter Now
                          <Ghost className="w-5 h-5" />
                        </span>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Footer */}
          <div className="text-center mt-10 text-orange-400/60 text-sm animate-fade-in flex items-center justify-center gap-2" style={{ animationDelay: '300ms' }}>
            <span className="animate-pulse">🕷️</span>
            <p>Powered by Dark Magic • Haunted by Excellence</p>
            <span className="animate-pulse">🕸️</span>
          </div>
        </div>
      </div>

      {/* Mobile View - Halloween Theme */}
      <div className="sm:hidden h-screen bg-gradient-to-b from-black via-orange-950 to-purple-950 flex flex-col safe-top safe-bottom overflow-hidden relative">
        {/* Animated Background Elements - Mobile */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-5 text-4xl animate-float opacity-20">👻</div>
          <div className="absolute top-40 right-5 text-3xl animate-float-delayed opacity-15" style={{ animationDelay: '1s' }}>👻</div>
          <div className="absolute top-1/4 right-10 text-4xl animate-bounce-slow opacity-25">🎃</div>
          <div className="absolute bottom-32 left-10 text-4xl animate-bounce-slow opacity-20" style={{ animationDelay: '1.5s' }}>🎃</div>
          <div className="absolute top-10 right-1/3 text-2xl animate-fly opacity-25">🦇</div>
          <div className="absolute inset-0 bg-orange-500/5 rounded-full blur-3xl animate-pulse" />
        </div>

        {/* Top Section with Logo and Title */}
        <div className="flex-shrink-0 pt-12 pb-6 px-6 text-center animate-fade-in relative z-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-orange-500/10 backdrop-blur-sm mb-4 shadow-lg border-2 border-orange-500/30 relative">
            <div className="absolute inset-0 blur-xl bg-orange-500/20 animate-pulse" />
            <div className="relative text-5xl animate-bounce-slow">🎃</div>
          </div>
          <h1 className="text-4xl font-bold mb-2 tracking-tight text-shadow-glow text-white">
            Talent Track
          </h1>
          <h2 className="text-xl font-bold text-shadow-glow bg-gradient-to-r from-orange-400 via-red-500 to-purple-500 bg-clip-text text-transparent mb-3">
            KIROWEEN - RESURRECTION
          </h2>
          <p className="text-orange-300/90 text-sm font-medium animate-flicker">
            The Haunted Fitness Experience 💀
          </p>
        </div>

        {/* Role Selection Cards - Scrollable */}
        <div className="flex-1 px-5 pb-6 overflow-y-auto relative z-10">
          <p className="text-orange-400/70 text-xs font-medium mb-4 text-center uppercase tracking-wider flex items-center justify-center gap-2">
            <Skull className="w-3 h-3 animate-pulse" />
            <span>Dare to Enter</span>
            <Skull className="w-3 h-3 animate-pulse" />
          </p>
          
          <div className="space-y-3 animate-slide-up">
            {roles.map((roleData, index) => {
              const Icon = roleData.icon;
              const isSelected = selectedRole === roleData.role;
              const isDisabled = isLoading && !isSelected;
              
              return (
                <div
                  key={roleData.role}
                  className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
                    isSelected ? 'scale-[1.02]' : 'active:scale-[0.98]'
                  } ${isDisabled ? 'opacity-50' : ''}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => !isLoading && handleRoleSelect(roleData.role)}
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${roleData.gradient} opacity-90`} />
                  
                  {/* Glass Effect Overlay */}
                  <div className="absolute inset-0 backdrop-blur-sm bg-black/20" />
                  
                  {/* Animated Shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-400/20 to-transparent animate-shimmer" />
                  
                  {/* Content */}
                  <div className="relative p-5 flex items-center gap-4 z-10">
                    {/* Icon Circle */}
                    <div className={`flex-shrink-0 w-16 h-16 rounded-full bg-orange-500/20 backdrop-blur-sm flex items-center justify-center transition-transform duration-300 border-2 border-orange-400/30 ${
                      isSelected ? 'scale-110 bg-orange-500/30 border-orange-400/60' : ''
                    }`}>
                      <Icon className="w-8 h-8 text-orange-200 animate-float" />
                    </div>
                    
                    {/* Text Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white mb-1">
                        {roleData.label}
                      </h3>
                      <p className="text-orange-100/90 text-xs leading-relaxed">
                        {roleData.description}
                      </p>
                    </div>
                    
                    {/* Arrow or Loading */}
                    <div className="flex-shrink-0">
                      {isSelected && isLoading ? (
                        <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <ChevronRight className={`w-6 h-6 text-white transition-transform duration-300 ${
                          isSelected ? 'translate-x-1' : ''
                        }`} />
                      )}
                    </div>
                  </div>
                  
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-300 animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="flex-shrink-0 pb-6 px-6 text-center animate-fade-in relative z-10" style={{ animationDelay: '300ms' }}>
          <div className="inline-flex items-center gap-2 text-orange-400/60 text-xs">
            <span className="animate-pulse">🕷️</span>
            <span>Powered by Dark Magic</span>
            <span className="animate-pulse">🕸️</span>
          </div>
        </div>
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
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 3s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        .animate-fly { animation: fly 4s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 3s ease-in-out infinite; }
        .animate-flicker { animation: flicker 2s ease-in-out infinite; }
        .text-shadow-glow {
          text-shadow: 0 0 20px rgba(251, 146, 60, 0.8), 0 0 40px rgba(251, 146, 60, 0.4);
        }
      `}</style>
    </>
  );
};

export default AuthFlow;
