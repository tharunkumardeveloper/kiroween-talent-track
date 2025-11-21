import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Ghost, Upload, Video, Skull, Flame, Zap, Target, Clock, Users, X } from 'lucide-react';

interface GhostWorkoutDetailProps {
  activity: any;
  onBack: () => void;
  onStartWorkout: (mode: 'upload' | 'live', ghostGif?: string) => void;
}

// Activity content database (same as ActivityDetail)
const activityContent: { [key: string]: any } = {
  'Push-ups': {
    description: 'Standard chest-dominant pressing exercise used to assess upper-body strength and endurance.',
    muscles: ['Pectoralis Major', 'Triceps', 'Anterior Deltoid'],
    category: 'Strength Training',
    steps: [
      'Start in high plank with hands under shoulders.',
      'Lower chest to 2–3 inches above ground keeping a straight body line.',
      'Press up through palms until elbows lock.',
      'Control descent and keep core braced.'
    ],
    mistakes: [
      'Flaring elbows',
      'Sagging hips',
      'Partial range of motion'
    ]
  },
  'Pull-ups': {
    description: 'Vertical pulling assessment for upper back and biceps strength.',
    muscles: ['Latissimus Dorsi', 'Biceps Brachii', 'Rhomboids'],
    category: 'Strength Training',
    steps: [
      'Start dead-hang with shoulder-width grip.',
      'Pull until chin clears bar with chest slightly up.',
      'Lower under control to full hang.'
    ],
    mistakes: [
      'Kipping (if testing strict)',
      'Partial pull',
      'Swinging body'
    ]
  },
  'Sit-ups': {
    description: 'Core endurance and trunk flexion assessment.',
    muscles: ['Rectus Abdominis', 'Hip Flexors', 'External Obliques'],
    category: 'Core Training',
    steps: [
      'Start supine knees bent, arms across chest.',
      'Curl torso to touch knees or reach knees.',
      'Lower with control to start position.'
    ],
    mistakes: [
      'Using momentum',
      'Neck strain',
      'Incomplete reps'
    ]
  },
  'Vertical Jump': {
    description: 'Measures explosive lower-body power by evaluating maximal vertical displacement.',
    muscles: ['Quadriceps', 'Glutes', 'Calves'],
    category: 'Power Assessment',
    steps: [
      'Stand with feet hip-width, perform counter-movement, swing arms.',
      'Explode upward as high as possible.',
      'Land softly, knees slightly bent.'
    ],
    mistakes: [
      'Stiff knees on landing',
      'Reduced arm swing',
      'Shallow countermovement'
    ]
  },
  'Shuttle Run': {
    description: 'Short shuttle run to test acceleration, deceleration and change-of-direction agility.',
    muscles: ['Hamstrings', 'Glutes', 'Calves'],
    category: 'Agility Test',
    steps: [
      'Start at start line; sprint to cone 10 m away and back (four times).',
      'Turn explosively at each cone and maintain low posture.'
    ],
    mistakes: [
      'Inefficient turns',
      'Upright posture',
      'Slow acceleration out of turn'
    ]
  },
  'Sit Reach': {
    description: 'Classic flexibility test measuring hamstring and lower back flexibility.',
    muscles: ['Hamstrings', 'Lower Back', 'Erector Spinae'],
    category: 'Flexibility',
    steps: [
      'Sit on floor with legs straight and feet against a box or wall.',
      'Place hands together and reach forward slowly.',
      'Hold the maximum reach position for 2 seconds.',
      'Measure the distance reached past your toes.'
    ],
    mistakes: [
      'Bending knees during reach',
      'Bouncing or jerking movements',
      'Not keeping back straight'
    ]
  }
};

// GIF mapping for preview
const previewGifs: { [key: string]: string } = {
  'Push-ups': '/pushup.gif',
  'Pull-ups': '/pullup.gif',
  'Sit-ups': '/situp.gif',
  'Vertical Jump': '/verticaljump.gif',
  'Shuttle Run': '/shuttlerun.gif',
  'Sit Reach': '/sit&reach.gif'
};

// Ghost GIF mapping for overlay during workout
const ghostGifs: { [key: string]: string } = {
  'Push-ups': '/ghost/pushup.gif',
  'Pull-ups': '/ghost/pullup.gif',
  'Sit-ups': '/ghost/situp.gif',
  'Vertical Jump': '/ghost/verticaljump.gif',
  'Shuttle Run': '/ghost/shuttlerun.gif',
  'Sit Reach': '/ghost/sit&reach.gif',
  'Knee Push-ups': '/ghost/kneepushup.gif'
};

const GhostWorkoutDetail = ({ activity, onBack, onStartWorkout }: GhostWorkoutDetailProps) => {
  const content = activityContent[activity.name] || activityContent['Push-ups'];
  const previewGif = previewGifs[activity.name];
  const ghostGif = ghostGifs[activity.name];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-gray-900 to-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-1/4 right-10 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-10 w-96 h-96 bg-purple-800/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-50 bg-purple-950/90 backdrop-blur-xl border-b border-purple-500/30">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="text-purple-300 hover:text-purple-100 hover:bg-purple-900/50 transition-all duration-300 hover:scale-110 active:scale-95 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Button>
            <div className="flex items-center space-x-2">
              <Skull className="w-5 h-5 text-purple-400 animate-pulse" />
              <h1 className="text-lg font-semibold text-purple-100">{activity.name}</h1>
            </div>
            <div className="w-10" />
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <div className="aspect-video bg-gradient-to-br from-purple-900/50 to-gray-900/50 relative">
        {activity.image ? (
          <img 
            src={activity.image} 
            alt={activity.name}
            className="w-full h-full object-cover"
            loading="eager"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Ghost className="w-16 h-16 text-purple-400 animate-pulse" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Workout Mode Selection */}
      <div className="px-4 py-4 max-w-md mx-auto relative z-10">
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => onStartWorkout('upload', ghostGif)}
            className="h-16 text-base font-semibold flex flex-col items-center justify-center bg-purple-900/50 hover:bg-purple-900/70 text-purple-100 border-2 border-purple-500/50 hover:border-purple-400 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 active:scale-95 group relative overflow-hidden"
            variant="outline"
            size="lg"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <Upload className="w-6 h-6 mb-1 group-hover:animate-bounce group-hover:scale-110 transition-transform relative z-10" />
            <span className="relative z-10">Upload Video</span>
            <Ghost className="absolute top-1 right-1 w-4 h-4 text-purple-400/30 group-hover:text-purple-300 group-hover:animate-pulse group-hover:scale-125 transition-all" />
          </Button>
          <Button 
            onClick={() => onStartWorkout('live', ghostGif)}
            className="h-16 text-base font-semibold flex flex-col items-center justify-center bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/70 active:scale-95 group relative overflow-hidden animate-pulse-slow"
            size="lg"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <Video className="w-6 h-6 mb-1 group-hover:animate-pulse group-hover:scale-110 transition-transform relative z-10" />
            <span className="relative z-10">Live Workout</span>
            <Flame className="absolute top-1 right-1 w-4 h-4 text-orange-400/50 group-hover:text-orange-300 group-hover:animate-bounce group-hover:scale-125 transition-all" />
          </Button>
        </div>
        <p className="text-xs text-center text-purple-300 mt-3 flex items-center justify-center space-x-1">
          <Ghost className="w-3 h-3 animate-pulse" />
          <span>Choose your training method</span>
          <Ghost className="w-3 h-3 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </p>
      </div>

      {/* Content */}
      <div className="px-4 pb-20 max-w-md mx-auto relative z-10">
        {/* Title and Category */}
        <div className="py-6 border-b border-purple-500/30">
          <h1 className="text-2xl font-bold mb-2 text-purple-100">{activity.name}</h1>
          <Badge className="mb-4 bg-purple-800/50 text-purple-200 border-purple-600/30">{content.category}</Badge>
          <p className="text-purple-200">{content.description}</p>
        </div>

        {/* Preview GIF */}
        {previewGif && (
          <div className="py-6 border-b border-purple-500/30">
            <div className="flex items-center space-x-2 mb-3">
              <Ghost className="w-5 h-5 text-purple-400 animate-pulse" />
              <h3 className="font-semibold text-purple-100">How It Looks</h3>
            </div>
            <div className="aspect-video bg-purple-900/30 rounded-lg overflow-hidden flex items-center justify-center border border-purple-500/30">
              <img 
                src={previewGif}
                alt={`${activity.name} demonstration`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        )}

        {/* Muscles */}
        <div className="py-6 border-b border-purple-500/30">
          <div className="flex items-center space-x-2 mb-3">
            <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
            <h3 className="font-semibold text-purple-100">Primary Muscles</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {content.muscles.map((muscle: string) => (
              <Button
                key={muscle}
                variant="outline"
                size="sm"
                className="rounded-full bg-purple-800/30 border-purple-600/50 text-purple-200 hover:bg-purple-700/50 transition-all duration-300 hover:scale-105 hover:shadow-md hover:shadow-purple-500/30 active:scale-95"
              >
                {muscle}
              </Button>
            ))}
          </div>
        </div>

        {/* How to do */}
        <div className="py-6 border-b border-purple-500/30">
          <div className="flex items-center space-x-2 mb-3">
            <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
            <h3 className="font-semibold text-purple-100">How to do</h3>
          </div>
          <div className="space-y-3">
            {content.steps.map((step: string, index: number) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <p className="text-sm text-purple-200">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Common Mistakes */}
        <div className="py-6 border-b border-purple-500/30">
          <div className="flex items-center space-x-2 mb-3">
            <Skull className="w-5 h-5 text-red-400 animate-pulse" />
            <h3 className="font-semibold text-purple-100">Common Mistakes</h3>
          </div>
          <div className="space-y-2">
            {content.mistakes.map((mistake: string, index: number) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-purple-300">{mistake}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="py-6">
          <div className="flex items-center space-x-2 mb-3">
            <Target className="w-5 h-5 text-purple-400 animate-pulse" />
            <h3 className="font-semibold text-purple-100">Exercise Stats</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-purple-900/30 border border-purple-500/30">
              <Target className="w-5 h-5 mx-auto mb-1 text-purple-400" />
              <div className="text-sm font-medium text-purple-100">Difficulty</div>
              <div className="text-xs text-purple-300">Intermediate</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-purple-900/30 border border-purple-500/30">
              <Clock className="w-5 h-5 mx-auto mb-1 text-green-400" />
              <div className="text-sm font-medium text-purple-100">Duration</div>
              <div className="text-xs text-purple-300">5-10 min</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-purple-900/30 border border-purple-500/30">
              <Users className="w-5 h-5 mx-auto mb-1 text-blue-400" />
              <div className="text-sm font-medium text-purple-100">Popularity</div>
              <div className="text-xs text-purple-300">High</div>
            </div>
          </div>
        </div>

        {/* Ghost Mode Info */}
        <div className="py-4">
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 text-center">
            <Ghost className="w-8 h-8 text-purple-400 mx-auto mb-2 animate-bounce" />
            <p className="text-sm text-purple-200 mb-1">
              👻 Ghost Mode Training
            </p>
            <p className="text-xs text-purple-400">
              Same AI-powered tracking, darker vibes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GhostWorkoutDetail;
