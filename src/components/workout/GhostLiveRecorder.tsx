import LiveRecorderNew from './LiveRecorderNew';

interface GhostLiveRecorderProps {
  activityName: string;
  ghostGif: string;
  onBack: () => void;
  onComplete: (results: any) => void;
}

const GhostLiveRecorder = ({ activityName, ghostGif, onBack, onComplete }: GhostLiveRecorderProps) => {
  return (
    <div className="ghost-mode-page relative w-full h-full min-h-screen">
      {/* Original Live Recorder - No ghost overlay during recording */}
      <LiveRecorderNew
        activityName={activityName}
        onBack={onBack}
        onComplete={onComplete}
      />
    </div>
  );
};

export default GhostLiveRecorder;
