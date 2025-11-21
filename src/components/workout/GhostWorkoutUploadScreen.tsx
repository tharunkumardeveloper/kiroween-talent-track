import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Upload, Ghost } from 'lucide-react';

interface GhostWorkoutUploadScreenProps {
  activityName: string;
  ghostGif: string;
  onBack: () => void;
  onVideoSelected: (file: File) => void;
}

const GhostWorkoutUploadScreen = ({ 
  activityName, 
  ghostGif, 
  onBack, 
  onVideoSelected 
}: GhostWorkoutUploadScreenProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-trigger file selection on mount
    const timer = setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      onVideoSelected(file);
    } else if (!file) {
      // User cancelled, go back
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-gray-900 to-black">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-purple-950/90 backdrop-blur-xl border-b border-purple-500/30">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="text-purple-300 hover:text-purple-100 hover:bg-purple-900/50"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <Ghost className="w-5 h-5 text-purple-400 animate-pulse" />
              <h1 className="text-lg font-semibold text-purple-100">{activityName}</h1>
            </div>
            <div className="w-10" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-8 max-w-md mx-auto">
        <Card className="bg-purple-900/30 border-purple-500/30">
          <CardContent className="p-6 text-center">
            <div className="mb-6">
              <img 
                src={ghostGif} 
                alt="Ghost guide" 
                className="w-32 h-auto mx-auto opacity-60 rounded-lg"
                style={{ filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.6))' }}
              />
            </div>
            
            <h2 className="text-xl font-bold text-purple-100 mb-2">Upload Your Workout</h2>
            <p className="text-purple-300 text-sm mb-6">
              Select a video to analyze with ghost mode
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
              size="lg"
            >
              <Upload className="w-5 h-5 mr-2" />
              Choose Video
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GhostWorkoutUploadScreen;
