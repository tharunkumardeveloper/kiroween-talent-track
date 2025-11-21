import LiveRecorderNew from './LiveRecorderNew';
import { Ghost } from 'lucide-react';

interface GhostLiveRecorderProps {
  activityName: string;
  ghostGif: string;
  onBack: () => void;
  onComplete: (results: any) => void;
}

const GhostLiveRecorder = ({ activityName, ghostGif, onBack, onComplete }: GhostLiveRecorderProps) => {
  return (
    <div className="relative w-full h-full">
      {/* Original Live Recorder - Full functionality preserved */}
      <LiveRecorderNew
        activityName={activityName}
        onBack={onBack}
        onComplete={onComplete}
      />
      
      {/* Ghost Overlay - Bottom right corner */}
      <div className="fixed bottom-24 right-4 z-40 pointer-events-none">
        <div className="relative">
          {/* Ghost label */}
          <div className="absolute -top-6 left-0 right-0 flex items-center justify-center">
            <div className="bg-purple-900/90 text-purple-100 px-2 py-0.5 rounded-full text-xs flex items-center space-x-1 border border-purple-500/50">
              <Ghost className="w-3 h-3" />
              <span>Perfect Form</span>
            </div>
          </div>
          
          {/* Ghost GIF */}
          <div className="bg-purple-950/80 backdrop-blur-sm rounded-lg p-2 border-2 border-purple-500/50 shadow-lg shadow-purple-500/50">
            <img
              src={ghostGif}
              alt="Ghost guide"
              className="w-32 h-auto rounded opacity-90"
              style={{
                filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.8))',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GhostLiveRecorder;
