# Design Document

## Overview

This design enhances the Ghost Mode feature to provide accurate real-time metrics and proper visual synchronization between the user's performance video and the competitive ghost skeleton. The solution addresses three core problems:

1. **Metrics Accuracy**: Current metrics show placeholder values instead of actual workout data
2. **Visual Synchronization**: Ghost skeleton and user video are not properly frame-synchronized
3. **Competitive Balance**: Ghost metrics need algorithmic adjustment to create fair 50/50 win/lose scenarios

The design maintains the existing dual-panel layout while improving data flow from video processing through to visual rendering and metrics display.

## Architecture

### Component Hierarchy

```
GhostVideoProcessor (Container)
├── Video Processing Pipeline
│   ├── MediaPipe Pose Detection
│   ├── Metrics Extraction
│   └── Landmark Sequence Storage
├── DualVideoDisplay (Presentation)
│   ├── User Performance Panel
│   │   ├── Video Element
│   │   ├── SkeletonRendererNew (Overlay)
│   │   └── MetricsOverlay (User)
│   └── Ghost Performance Panel
│       ├── GhostSkeletonRenderer (Canvas)
│       └── MetricsOverlay (Ghost)
└── Beat Result Calculator
```

### Data Flow

```
1. Video Upload/Recording
   ↓
2. Live Results Processing (MediaPipe)
   ↓
3. Metrics Extraction
   - Extract reps from multiple sources
   - Parse duration (string/number)
   - Calculate form score (correct/total)
   ↓
4. Pose Landmark Extraction
   - Process video at 30 FPS
   - Store landmark sequence
   - Track timestamps
   ↓
5. Ghost Metrics Calculation
   - Apply competitive algorithm
   - Ensure 50/50 win probability
   ↓
6. Synchronized Playback
   - Video plays
   - Frame index calculated from currentTime
   - Both skeletons render same frame
   - Metrics update in real-time
   ↓
7. Beat Result Display
   - Compare final metrics
   - Highlight winner
   - Show badge if user wins
```

## Components and Interfaces

### 1. GhostVideoProcessor (Enhanced)

**Purpose**: Orchestrates video processing, metrics extraction, and ghost competition setup.

**Key Changes**:
- Improve metrics extraction logic to handle all data source variations
- Calculate competitive ghost metrics based on user performance
- Ensure pose landmark sequence is properly stored with timestamps
- Synchronize frame updates using requestAnimationFrame

**Interface**:
```typescript
interface GhostVideoProcessorProps {
  videoFile: File | null;
  activityName: string;
  onBack: () => void;
  onComplete: (results: any) => void;
  liveResults?: {
    setsCompleted?: number;
    stats?: {
      totalReps?: number;
      correctReps?: number;
      totalTime?: number;
      csvData?: any[];
    };
    totalReps?: number;
    correctReps?: number;
    reps?: any[];
    duration?: string | number;
    posture?: string;
    videoBlob?: Blob;
    videoUrl?: string;
  };
}

interface WorkoutMetrics {
  reps: number;
  time: number;
  formScore: number;
  currentPhase: string;
}
```

**State Management**:
```typescript
const [userMetrics, setUserMetrics] = useState<WorkoutMetrics>({
  reps: 0,
  time: 0,
  formScore: 0,
  currentPhase: 'start'
});

const [ghostMetrics, setGhostMetrics] = useState<WorkoutMetrics>({
  reps: 0,
  time: 0,
  formScore: 0,
  currentPhase: 'complete'
});

const [poseLandmarksSequence, setPoseLandmarksSequence] = useState<PoseLandmark[][]>([]);
const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
const [videoDuration, setVideoDuration] = useState(0);
```

### 2. Metrics Extraction Logic

**Purpose**: Extract accurate workout metrics from live results object.

**Algorithm**:
```typescript
// Rep Count Extraction (Priority Order)
const extractReps = (liveResults: any): number => {
  return liveResults.setsCompleted
    || liveResults.stats?.totalReps
    || liveResults.stats?.correctReps
    || liveResults.totalReps
    || liveResults.correctReps
    || (Array.isArray(liveResults.reps) ? liveResults.reps.length : 0)
    || (liveResults.stats?.csvData ? liveResults.stats.csvData.length : 0)
    || 0;
};

// Duration Parsing
const extractDuration = (liveResults: any): number => {
  if (typeof liveResults.duration === 'string') {
    const [mins, secs] = liveResults.duration.split(':').map(Number);
    return (mins || 0) * 60 + (secs || 0);
  }
  if (typeof liveResults.duration === 'number') {
    return liveResults.duration;
  }
  if (liveResults.stats?.totalTime) {
    return Math.floor(liveResults.stats.totalTime);
  }
  return 0;
};

// Form Score Calculation
const calculateFormScore = (liveResults: any, userReps: number): number => {
  const totalReps = liveResults.stats?.totalReps || userReps;
  const correctReps = liveResults.stats?.correctReps || liveResults.correctReps || userReps;
  
  if (totalReps > 0 && correctReps >= 0) {
    return Math.round((correctReps / totalReps) * 100);
  }
  
  // Fallback based on posture
  if (liveResults.posture === 'Good') return 90;
  if (liveResults.posture) return 70;
  
  return 85; // Default
};
```

### 3. Competitive Ghost Metrics Algorithm

**Purpose**: Generate ghost metrics that create a 50/50 win/lose probability.

**Algorithm**:
```typescript
const calculateGhostMetrics = (
  userMetrics: WorkoutMetrics,
  ghostTarget: GhostTarget
): WorkoutMetrics => {
  // Ghost should be slightly better than user (15% more reps, 5% better form)
  // This creates a challenging but beatable target
  
  const ghostReps = userMetrics.reps > 0
    ? Math.max(
        userMetrics.reps + Math.floor(userMetrics.reps * 0.15),
        userMetrics.reps + 3
      )
    : ghostTarget.targetReps;
  
  const ghostTime = userMetrics.time > 0
    ? Math.max(
        userMetrics.time + 10,
        Math.floor(userMetrics.time * 1.1)
      )
    : ghostTarget.targetTime;
  
  const ghostForm = Math.min(
    95,
    Math.max(userMetrics.formScore + 5, 85)
  );
  
  return {
    reps: ghostReps,
    time: ghostTime,
    formScore: ghostForm,
    currentPhase: 'complete'
  };
};
```

**Rationale**:
- 15% more reps ensures ghost is ahead but not impossibly so
- Minimum +3 reps prevents trivial differences
- +10 seconds or 10% more time creates time pressure
- +5% form score rewards good technique
- Caps at 95% form to keep it realistic
- Falls back to target values if user data is missing

### 4. Frame Synchronization System

**Purpose**: Keep user video, user skeleton, and ghost skeleton perfectly synchronized.

**Implementation**:
```typescript
// In DualVideoDisplay component
useEffect(() => {
  const video = userVideoRef.current;
  if (!video || !poseLandmarks || poseLandmarks.length === 0) return;

  let animationFrameId: number;

  const updateFrame = () => {
    if (!video.paused && !video.ended) {
      // Calculate actual FPS from video duration and frame count
      const actualDuration = videoDuration || video.duration;
      const actualFPS = poseLandmarks.length / actualDuration;
      
      // Calculate frame index from current video time
      const frameIndex = Math.floor(video.currentTime * actualFPS);
      const clampedIndex = Math.max(0, Math.min(frameIndex, poseLandmarks.length - 1));
      
      setCurrentFrameIndex(clampedIndex);
      setCurrentTime(Math.floor(video.currentTime));
    }

    animationFrameId = requestAnimationFrame(updateFrame);
  };

  updateFrame();

  return () => {
    cancelAnimationFrame(animationFrameId);
  };
}, [videoUrl, poseLandmarks, videoDuration]);
```

**Key Points**:
- Uses `requestAnimationFrame` for smooth 60fps updates
- Calculates FPS dynamically based on actual frame count and duration
- Clamps frame index to prevent array bounds errors
- Updates both frame index and current time for metrics display

### 5. SkeletonRendererNew (User Skeleton)

**Purpose**: Render MediaPipe skeleton overlay on user video with standard cyan/white styling.

**Rendering Approach**:
```typescript
const drawSkeleton = (
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark3D[],
  canvasWidth: number,
  canvasHeight: number
) => {
  // Draw connections (bones)
  ctx.strokeStyle = '#00FFFF'; // Cyan
  ctx.lineWidth = 1.5;
  
  POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
    const start = landmarks[startIdx];
    const end = landmarks[endIdx];
    
    if (start && end && start.visibility > 0.5 && end.visibility > 0.5) {
      ctx.beginPath();
      ctx.moveTo(start.x * canvasWidth, start.y * canvasHeight);
      ctx.lineTo(end.x * canvasWidth, end.y * canvasHeight);
      ctx.stroke();
    }
  });
  
  // Draw joints
  landmarks.forEach((landmark) => {
    if (landmark && landmark.visibility > 0.5) {
      const x = landmark.x * canvasWidth;
      const y = landmark.y * canvasHeight;
      
      // Filled circle with cyan fill
      ctx.fillStyle = '#00FFFF';
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
      
      // White outline
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
};
```

**Props**:
```typescript
interface SkeletonRendererProps {
  exerciseType: string;
  isPlaying: boolean;
  speed?: number;
  poseLandmarks?: Landmark3D[]; // Single frame
  onRepComplete?: () => void;
  className?: string;
  transparent?: boolean; // True for overlay mode
}
```

### 6. GhostSkeletonRenderer (Ghost Skeleton)

**Purpose**: Render spooky ghost skeleton with purple/cyan glow effects and custom skull.

**Visual Effects**:
- Purple (#A855F7) glowing bones with shadow blur
- Cyan (#00FFFF) glowing joints with radial gradients
- Custom skull rendering at head position with:
  - Pulsing size effect
  - Glowing cyan eyes with flicker
  - Ghostly aura
  - Skeletal teeth
- Black background (#000000)
- Continuous animation loop for pulsing/glowing

**Rendering Approach**:
```typescript
const drawHauntingSkeleton = (
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark3D[],
  canvasWidth: number,
  canvasHeight: number,
  timestamp: number
) => {
  const glowIntensity = Math.sin(timestamp * 0.002) * 0.3 + 0.7;
  
  // Draw bones with purple glow
  ctx.strokeStyle = '#A855F7';
  ctx.lineWidth = 3;
  ctx.shadowBlur = 25 * glowIntensity;
  ctx.shadowColor = '#A855F7';
  
  POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
    // Draw connection...
  });
  
  // Draw joints with cyan glow
  landmarks.forEach((landmark, index) => {
    if (index === 0) return; // Skip head, draw skull instead
    
    // Radial gradient for glow effect
    const jointGlow = ctx.createRadialGradient(x, y, 0, x, y, 8);
    jointGlow.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
    jointGlow.addColorStop(1, 'rgba(0, 255, 255, 0)');
    // Draw joint...
  });
  
  // Draw spooky skull at head
  if (landmarks[0]) {
    drawSpookySkull(ctx, landmarks[0], canvasWidth, canvasHeight, timestamp);
  }
};
```

### 7. MetricsOverlay (Enhanced)

**Purpose**: Display real-time metrics with proper formatting and color coding.

**Display Format**:
```
Reps: X/Y
Time: M:SS
Form: Z%
```

**Color Coding**:
- Reps: Green if beat target (user only), white/purple otherwise
- Time: Cyan for both
- Form: Green (≥85%), Orange (70-84%), Red (<70%)

**Props**:
```typescript
interface MetricsOverlayProps {
  reps: number;
  targetReps: number;
  time: number; // Current elapsed time in seconds
  formScore: number;
  isGhost: boolean;
  beatTarget?: boolean;
}
```

**Time Formatting**:
```typescript
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
```

### 8. Beat Result Visualization

**Purpose**: Clearly indicate whether user won or lost against the ghost.

**Implementation**:
```typescript
// In DualVideoDisplay
const [beatTarget, setBeatTarget] = useState(false);

useEffect(() => {
  const didBeat = 
    userMetrics.reps >= ghostMetrics.reps && 
    userMetrics.formScore >= 85;
  setBeatTarget(didBeat);
}, [userMetrics.reps, userMetrics.formScore, ghostMetrics.reps]);

// Visual indicators
{beatTarget ? (
  <div className="border-2 border-green-500 animate-pulse">
    {/* User Performance Panel */}
  </div>
) : (
  <div className="border-2 border-purple-500 animate-pulse">
    {/* Ghost Performance Panel */}
  </div>
)}
```

**Victory Badge**:
- Display "Ghost Slayer" badge on user panel if they win
- Show trophy icon in metrics overlay
- Apply pulsing green glow effect to winning panel

## Data Models

### PoseLandmark
```typescript
interface PoseLandmark {
  x: number;        // Normalized 0-1
  y: number;        // Normalized 0-1
  z: number;        // Depth
  visibility: number; // 0-1 confidence
}
```

### WorkoutMetrics
```typescript
interface WorkoutMetrics {
  reps: number;
  time: number;      // Seconds
  formScore: number; // Percentage 0-100
  currentPhase: string;
}
```

### LiveResults (Input)
```typescript
interface LiveResults {
  setsCompleted?: number;
  stats?: {
    totalReps?: number;
    correctReps?: number;
    totalTime?: number;
    csvData?: any[];
  };
  totalReps?: number;
  correctReps?: number;
  reps?: any[];
  duration?: string | number;
  posture?: string;
  videoBlob?: Blob;
  videoUrl?: string;
}
```

## Error Handling

### Video Processing Errors
- **No video source**: Display error message, allow user to go back
- **MediaPipe initialization failure**: Log error, continue with video-only display
- **Pose detection failure**: Skip frames without landmarks, continue processing
- **Video loading error**: Show error state with retry option

### Metrics Extraction Errors
- **Missing rep data**: Default to 0, log warning
- **Invalid duration format**: Default to 0, log warning
- **Missing form data**: Default to 85%, log warning
- **All metrics missing**: Use ghost target values as fallback

### Synchronization Errors
- **Frame index out of bounds**: Clamp to valid range [0, length-1]
- **Video duration mismatch**: Recalculate FPS dynamically
- **Playback stutter**: Use requestAnimationFrame for smooth updates

### Canvas Rendering Errors
- **Canvas context unavailable**: Display error message
- **Invalid landmark data**: Skip rendering for that frame
- **Resize issues**: Recalculate canvas dimensions on window resize

## Testing Strategy

### Unit Tests
1. **Metrics Extraction**
   - Test all rep count data sources
   - Test duration parsing (string and number formats)
   - Test form score calculation with various inputs
   - Test fallback values when data is missing

2. **Ghost Metrics Algorithm**
   - Test 15% rep increase calculation
   - Test minimum +3 reps enforcement
   - Test time calculation (10s or 10% increase)
   - Test form score capping (85% min, 95% max)
   - Test fallback to target values

3. **Frame Synchronization**
   - Test FPS calculation from duration and frame count
   - Test frame index calculation from video time
   - Test frame index clamping
   - Test time formatting (MM:SS)

### Integration Tests
1. **Video Processing Pipeline**
   - Upload video → Extract metrics → Display results
   - Record video → Process landmarks → Synchronize playback
   - Test with various video durations (10s, 30s, 60s)

2. **Dual Display Synchronization**
   - Verify user and ghost skeletons show same frame
   - Verify metrics update in sync with video
   - Verify beat result calculation

3. **Beat Result Flow**
   - User wins: Check green highlight, badge display
   - User loses: Check purple highlight on ghost
   - Edge case: Exact tie (user wins if form ≥85%)

### Visual Regression Tests
1. **Skeleton Rendering**
   - User skeleton: Cyan/white standard appearance
   - Ghost skeleton: Purple/cyan spooky appearance with skull
   - Verify glow effects and animations

2. **Metrics Display**
   - Verify color coding (green/orange/red for form)
   - Verify time formatting
   - Verify beat target highlighting

### Performance Tests
1. **Video Processing Speed**
   - Measure time to process 30s video
   - Target: <60s processing time
   - Monitor memory usage during processing

2. **Playback Performance**
   - Measure frame rate during playback
   - Target: Smooth 30fps video + 60fps skeleton rendering
   - Test on mobile and desktop devices

3. **Wake Lock Effectiveness**
   - Test background processing with tab hidden
   - Verify processing continues without interruption

## Implementation Notes

### Phase 1: Metrics Extraction (Priority: High)
- Enhance `extractReps`, `extractDuration`, `calculateFormScore` functions
- Add comprehensive logging for debugging
- Test with various live results formats

### Phase 2: Ghost Metrics Algorithm (Priority: High)
- Implement `calculateGhostMetrics` function
- Test competitive balance (50/50 win rate)
- Adjust algorithm parameters if needed

### Phase 3: Frame Synchronization (Priority: High)
- Implement requestAnimationFrame loop
- Calculate FPS dynamically
- Update both skeleton renderers with same frame index
- Update metrics overlay with current time

### Phase 4: Visual Enhancements (Priority: Medium)
- Ensure SkeletonRendererNew uses standard cyan/white styling
- Verify GhostSkeletonRenderer spooky effects
- Test beat result highlighting

### Phase 5: Error Handling (Priority: Medium)
- Add try-catch blocks around critical sections
- Implement fallback values for missing data
- Add user-friendly error messages

### Phase 6: Testing & Optimization (Priority: Low)
- Write unit tests for metrics extraction
- Test with various video formats and durations
- Optimize canvas rendering performance
- Test on multiple devices and browsers

## Dependencies

- **MediaPipe Pose**: Pose landmark detection
- **React**: Component framework
- **Canvas API**: Skeleton rendering
- **Wake Lock API**: Background processing
- **requestAnimationFrame**: Smooth animations

## Browser Compatibility

- **Chrome/Edge**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Partial support (Wake Lock may not work)
- **Mobile browsers**: Full support on modern devices

## Performance Considerations

1. **Video Processing**: Process at 30 FPS to balance accuracy and speed
2. **Canvas Rendering**: Use requestAnimationFrame for 60fps smooth rendering
3. **Memory Management**: Clean up video URLs and MediaPipe resources
4. **Background Processing**: Use Wake Lock API to prevent tab throttling
5. **Frame Caching**: Store landmark sequence in memory for instant playback
