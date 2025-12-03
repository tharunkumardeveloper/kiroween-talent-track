# Design Document

## Overview

This design fixes the critical bug where MediaPipe processing crashes or closes automatically when users upload videos in Ghost Mode. The root cause is that the `GhostVideoProcessor` component attempts to intercept MediaPipe's `onResults` callback by wrapping it, which creates race conditions and can cause MediaPipe to malfunction.

The solution is to modify the `mediapipeProcessor` service to natively collect and return pose landmarks as part of its `ProcessingResult`, eliminating the need for callback wrapping. This provides a clean, predictable API and ensures MediaPipe operates normally.

## Architecture

### Current Architecture (Broken)

```
User uploads video
  ↓
GhostVideoProcessor.processVideo()
  ↓
Wraps mediapipeProcessor.pose.onResults (❌ PROBLEMATIC)
  ↓
Calls mediapipeProcessor.processVideo()
  ↓
MediaPipe processes frames
  ↓
onResults fires → wrapped handler captures landmarks
  ↓
Original handler processes frame
  ↓
Race conditions / callback conflicts
  ↓
MediaPipe crashes or stops responding
```

**Problems:**
1. Wrapping `onResults` interferes with MediaPipe's internal state
2. The wrapped callback may not be called in the expected order
3. Restoring the original handler can fail if processing is interrupted
4. No guarantee that landmarks are captured for every frame
5. Error handling is difficult when callbacks are wrapped

### Fixed Architecture

```
User uploads video
  ↓
GhostVideoProcessor.processVideo()
  ↓
Calls mediapipeProcessor.processVideo()
  ↓
mediapipeProcessor initializes landmarks array
  ↓
MediaPipe processes frames
  ↓
onResults fires → mediapipeProcessor captures landmarks internally
  ↓
Processing completes
  ↓
mediapipeProcessor returns ProcessingResult with poseLandmarks
  ↓
GhostVideoProcessor receives landmarks directly
  ↓
Passes to DualVideoDisplay for playback
```

**Benefits:**
1. No callback wrapping - MediaPipe operates normally
2. Clean separation of concerns
3. Predictable data flow
4. Easy error handling
5. Landmarks guaranteed to be in sync with frames

## Components and Interfaces

### 1. mediapipeProcessor Service - Add Landmark Collection

**Purpose**: Modify the service to collect and return pose landmarks as part of the processing result.

**Interface Changes**:

```typescript
// Add to ProcessingResult interface
export interface ProcessingResult {
  reps: RepData[];
  correctReps: number;
  incorrectReps: number;
  totalTime: number;
  posture: 'Good' | 'Bad';
  videoBlob?: Blob;
  stats: any;
  csvData: RepData[];
  poseLandmarks: PoseLandmark[][];  // ✅ NEW: Array of frames, each containing 33 landmarks
}

// Define PoseLandmark type
export interface PoseLandmark {
  x: number;        // Normalized 0-1
  y: number;        // Normalized 0-1
  z: number;        // Depth
  visibility: number; // 0-1 confidence
}
```

**Implementation Changes**:

```typescript
class MediaPipeProcessor {
  public pose: any = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private videoTrack: any = null;
  private processedFrames: ImageData[] = [];
  private cancelProcessing = false;
  private capturedLandmarks: PoseLandmark[][] = [];  // ✅ NEW: Store landmarks

  async processVideo(
    videoFile: File,
    activityName: string,
    onProgress: (progress: number, frame: string, reps?: number, metrics?: any) => void
  ): Promise<ProcessingResult> {
    if (!this.pose) {
      await this.initialize();
    }

    // Reset state for new processing session
    this.cancelProcessing = false;
    this.capturedLandmarks = [];  // ✅ Clear landmarks array
    console.log('🎬 Starting video processing with landmark capture...');

    // ... existing wake lock code ...

    return new Promise((resolve, reject) => {
      // ... existing video setup code ...

      // Modify onResults to capture landmarks
      this.pose!.onResults((results: any) => {
        poseResultsReceived++;

        // ✅ Capture landmarks for this frame
        if (results.poseLandmarks) {
          const frameLandmarks: PoseLandmark[] = results.poseLandmarks.map((lm: any) => ({
            x: lm.x,
            y: lm.y,
            z: lm.z || 0,
            visibility: lm.visibility || 1
          }));
          this.capturedLandmarks.push(frameLandmarks);
        } else {
          // No pose detected in this frame - store empty array
          this.capturedLandmarks.push([]);
          console.warn(`Frame ${poseResultsReceived}: No pose detected`);
        }

        // Log landmark capture progress
        if (poseResultsReceived % 30 === 0) {
          console.log(`📊 Landmarks captured: ${this.capturedLandmarks.length} frames`);
        }

        // ... existing processing code (detector, drawing, etc.) ...
      });

      // ... existing frame processing code ...

      // When processing completes, include landmarks in result
      const finalizeProcessing = (videoBlob: Blob) => {
        console.log('✅ Processing complete');
        console.log(`📊 Total frames processed: ${frameCount}`);
        console.log(`📊 Total landmarks captured: ${this.capturedLandmarks.length}`);
        console.log(`📊 Frames with pose detected: ${this.capturedLandmarks.filter(f => f.length > 0).length}`);

        if (wakeLock) wakeLock.release();

        const result = this.calculateStats(
          finalReps,
          activityName,
          actualDuration,
          videoBlob,
          this.capturedLandmarks  // ✅ Pass landmarks to stats
        );

        resolve(result);
      };

      // ... rest of processing code ...
    });
  }

  private calculateStats(
    reps: any[],
    activityName: string,
    duration: number,
    videoBlob: Blob,
    poseLandmarks: PoseLandmark[][]  // ✅ NEW parameter
  ): ProcessingResult {
    const correctReps = reps.filter(r => r.correct === 'True' || r.correct === true).length;
    const incorrectReps = reps.length - correctReps;
    const posture: 'Good' | 'Bad' = correctReps >= reps.length * 0.7 ? 'Good' : 'Bad';

    // ... existing stats calculation ...

    return {
      reps,
      correctReps,
      incorrectReps,
      totalTime: duration,
      posture,
      videoBlob,
      stats,
      csvData: reps,
      poseLandmarks  // ✅ Include landmarks in result
    };
  }
}
```

**Key Changes:**
1. Add `capturedLandmarks: PoseLandmark[][]` as a private property
2. Clear landmarks array at the start of each processing session
3. Capture landmarks in the existing `onResults` handler (no wrapping needed)
4. Store empty array when no pose is detected
5. Log landmark capture progress
6. Pass landmarks to `calculateStats`
7. Include landmarks in `ProcessingResult`

### 2. GhostVideoProcessor - Simplify Landmark Handling

**Purpose**: Remove callback wrapping and receive landmarks directly from the processing result.

**Current Code (Broken)**:
```typescript
// ❌ REMOVE THIS ENTIRE SECTION
const originalOnResults = mediapipeProcessor.pose?.onResults;
if (mediapipeProcessor.pose) {
  const wrappedOnResults = (results: any) => {
    if (results.poseLandmarks) {
      capturedLandmarks.current.push(results.poseLandmarks.map((lm: any) => ({
        x: lm.x,
        y: lm.y,
        z: lm.z || 0,
        visibility: lm.visibility || 1
      })));
    }
    if (originalOnResults) {
      originalOnResults(results);
    }
  };
  mediapipeProcessor.pose.onResults = wrappedOnResults;
}

// ... processing ...

// ❌ REMOVE THIS TOO
if (mediapipeProcessor.pose && originalOnResults) {
  mediapipeProcessor.pose.onResults = originalOnResults;
}
```

**Fixed Code**:
```typescript
const processVideo = async () => {
  try {
    const file = videoFile || (liveResults?.videoBlob ? new File([liveResults.videoBlob], 'workout.webm') : null);
    if (!file) {
      toast.error('No video found');
      onBack();
      return;
    }

    console.log('🎬 Starting Ghost Mode processing...');
    
    // ✅ SIMPLIFIED: Just call processVideo, no callback wrapping
    const processingResult = await mediapipeProcessor.processVideo(
      file,
      activityName,
      (prog) => {
        setProgress(Math.floor(prog));
      }
    );

    // ✅ Get landmarks directly from result
    const poseLandmarks = processingResult.poseLandmarks || [];
    
    console.log('✅ Processing complete');
    console.log('📊 Received', poseLandmarks.length, 'landmark frames');
    console.log('📊 Frames with pose:', poseLandmarks.filter(f => f.length > 0).length);

    // Verify we have landmarks
    if (poseLandmarks.length === 0) {
      console.error('❌ No pose landmarks captured');
      toast.error('Failed to extract pose data. Please try again.');
      onBack();
      return;
    }

    // Extract metrics
    const reps = processingResult.reps?.length || 0;
    const time = processingResult.totalTime || 0;
    const correctReps = processingResult.correctReps || reps;
    const totalReps = processingResult.reps?.length || reps;
    const formScore = totalReps > 0 ? Math.round((correctReps / totalReps) * 100) : 85;

    // Calculate ghost metrics
    const ghostReps = reps > 0 ? Math.max(reps + Math.floor(reps * 0.15), reps + 3) : ghostTarget.targetReps;
    const ghostTime = time > 0 ? Math.max(time + 10, Math.floor(time * 1.1)) : ghostTarget.targetTime;
    const ghostForm = Math.min(95, Math.max(formScore + 5, 85));

    setProcessedData({
      videoBlob: processingResult.videoBlob || file,
      userMetrics: { reps, time, formScore, currentPhase: 'complete' },
      ghostMetrics: { reps: ghostReps, time: ghostTime, formScore: ghostForm, currentPhase: 'complete' },
      poseLandmarks,  // ✅ Use landmarks from result
      videoDuration: time,
      beatResult: calculateBeatGhost({ reps, time, formScore }, ghostTarget)
    });

    setIsProcessing(false);
  } catch (error) {
    console.error('❌ Processing error:', error);
    toast.error('Processing failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    onBack();
  }
};
```

**Key Changes:**
1. Remove all callback wrapping code
2. Receive landmarks directly from `processingResult.poseLandmarks`
3. Add validation to check if landmarks array is empty
4. Show error and return to previous screen if no landmarks
5. Improved error handling with specific error messages
6. Cleaner, more maintainable code

### 3. Error Handling Strategy

**MediaPipe Initialization Failure**:
```typescript
async initialize() {
  try {
    // ... existing initialization code ...
    
    if (!this.pose) {
      throw new Error('MediaPipe Pose failed to initialize');
    }
    
    console.log('✅ MediaPipe initialized successfully');
    return this.pose;
  } catch (error) {
    console.error('❌ MediaPipe initialization failed:', error);
    throw new Error('MediaPipe initialization failed. Please refresh and try again.');
  }
}
```

**Processing Failure**:
```typescript
async processVideo(...) {
  try {
    if (!this.pose) {
      await this.initialize();
    }
    
    // ... processing code ...
    
  } catch (error) {
    console.error('❌ Video processing failed:', error);
    
    // Clean up
    if (wakeLock) {
      try {
        await wakeLock.release();
      } catch (e) {
        console.error('Failed to release wake lock:', e);
      }
    }
    
    // Provide helpful error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Video processing failed: ${errorMessage}`);
  }
}
```

**Landmark Capture Validation**:
```typescript
// After processing completes
if (this.capturedLandmarks.length === 0) {
  console.error('❌ No landmarks were captured during processing');
  throw new Error('Failed to extract pose data from video');
}

const framesWithPose = this.capturedLandmarks.filter(f => f.length > 0).length;
const poseDetectionRate = (framesWithPose / this.capturedLandmarks.length) * 100;

console.log(`📊 Pose detection rate: ${poseDetectionRate.toFixed(1)}%`);

if (poseDetectionRate < 50) {
  console.warn('⚠️ Low pose detection rate - video quality may be poor');
}
```

### 4. Progress Reporting Enhancement

**Detailed Progress Messages**:
```typescript
const getProgressMessage = (progress: number): string => {
  if (progress < 30) return "Analyzing your form...";
  if (progress < 60) return "Extracting pose data...";
  if (progress < 90) return "Creating ghost competitor...";
  return "Almost ready...";
};

// In GhostVideoProcessor
<p className="text-purple-400 text-sm">
  {getProgressMessage(progress)}
</p>
```

**Progress Calculation**:
```typescript
// In mediapipeProcessor
const progress = Math.min((frameCount / totalFramesToProcess) * 100, 99);

if (frameCount % 5 === 0) {
  onProgress(
    progress,
    lastCapturedFrame,
    currentReps.length,
    {
      ...metrics,
      landmarksCaptured: this.capturedLandmarks.length,
      framesProcessed: frameCount
    }
  );
}
```

## Data Models

### PoseLandmark
```typescript
export interface PoseLandmark {
  x: number;        // Normalized 0-1 (0 = left, 1 = right)
  y: number;        // Normalized 0-1 (0 = top, 1 = bottom)
  z: number;        // Depth (relative to hips, negative = closer to camera)
  visibility: number; // 0-1 confidence score
}
```

### ProcessingResult (Updated)
```typescript
export interface ProcessingResult {
  reps: RepData[];
  correctReps: number;
  incorrectReps: number;
  totalTime: number;
  posture: 'Good' | 'Bad';
  videoBlob?: Blob;
  stats: any;
  csvData: RepData[];
  poseLandmarks: PoseLandmark[][];  // NEW: Array of frames
}
```

### Landmark Array Structure
```typescript
// Example structure:
poseLandmarks = [
  [ // Frame 0
    { x: 0.5, y: 0.3, z: 0, visibility: 0.99 },  // Landmark 0 (nose)
    { x: 0.51, y: 0.29, z: -0.1, visibility: 0.98 },  // Landmark 1 (left eye inner)
    // ... 31 more landmarks (33 total per frame)
  ],
  [ // Frame 1
    { x: 0.5, y: 0.31, z: 0, visibility: 0.99 },
    // ... 32 more landmarks
  ],
  // ... more frames
];

// Access pattern:
const frame10Landmarks = poseLandmarks[10];  // Get all landmarks for frame 10
const frame10Nose = poseLandmarks[10][0];    // Get nose landmark from frame 10
```

## Error Handling

### 1. MediaPipe Not Available
```typescript
if (!window.Pose && !require('@mediapipe/pose')) {
  throw new Error('MediaPipe library not loaded. Please refresh the page.');
}
```

### 2. Video Loading Failure
```typescript
video.onerror = (e) => {
  console.error('Video loading failed:', e);
  reject(new Error('Video file is corrupted or unsupported format'));
};
```

### 3. No Pose Detected
```typescript
if (this.capturedLandmarks.length === 0) {
  throw new Error('No pose detected in video. Please ensure you are visible in the frame.');
}
```

### 4. Insufficient Pose Detection
```typescript
const framesWithPose = this.capturedLandmarks.filter(f => f.length > 0).length;
if (framesWithPose < totalFrames * 0.3) {
  throw new Error('Pose detection quality too low. Please record in better lighting.');
}
```

### 5. Processing Timeout
```typescript
const maxProcessingTime = Math.max((video.duration || 60) * 5000, 300000);
setTimeout(() => {
  if (!processingComplete) {
    reject(new Error('Processing timeout. Video may be too long or complex.'));
  }
}, maxProcessingTime);
```

## Testing Strategy

### Unit Tests

1. **mediapipeProcessor Landmark Capture**
   - Test landmarks are captured for each frame
   - Test empty array is stored when no pose detected
   - Test landmarks array is cleared between processing sessions
   - Test landmarks are included in ProcessingResult

2. **GhostVideoProcessor Error Handling**
   - Test error display when no landmarks captured
   - Test navigation back to previous screen on error
   - Test toast notifications for different error types
   - Test cleanup on component unmount

3. **Data Validation**
   - Test landmark array length matches frame count
   - Test each landmark has required properties (x, y, z, visibility)
   - Test landmark values are within valid ranges (0-1 for x, y)

### Integration Tests

1. **End-to-End Processing**
   - Upload video → Process → Verify landmarks captured → Display ghost
   - Test with various video lengths (10s, 30s, 60s)
   - Test with different video qualities
   - Test with videos where pose is partially visible

2. **Error Scenarios**
   - Test with corrupted video file
   - Test with video where no person is visible
   - Test with very dark/bright videos
   - Test with unsupported video formats

3. **Performance Tests**
   - Measure processing time with landmark capture
   - Verify no memory leaks during processing
   - Test on low-end devices
   - Verify wake lock prevents background throttling

### Visual Regression Tests

1. **Ghost Skeleton Display**
   - Verify ghost skeleton appears immediately on playback
   - Verify skeleton moves in sync with video
   - Verify no black screen issues
   - Verify spooky effects render correctly

2. **Error Messages**
   - Verify error toasts display correctly
   - Verify error messages are user-friendly
   - Verify user can navigate back after error

## Implementation Notes

### Phase 1: Modify mediapipeProcessor (Priority: Critical)
1. Add `capturedLandmarks` property to class
2. Add `PoseLandmark` interface export
3. Modify `onResults` to capture landmarks
4. Update `ProcessingResult` interface
5. Modify `calculateStats` to accept and return landmarks
6. Add logging for landmark capture progress

### Phase 2: Simplify GhostVideoProcessor (Priority: Critical)
1. Remove callback wrapping code
2. Receive landmarks from processing result
3. Add validation for empty landmarks
4. Improve error handling and messages
5. Add logging for received landmarks

### Phase 3: Error Handling (Priority: High)
1. Add try-catch blocks around MediaPipe operations
2. Implement specific error messages for different failure modes
3. Ensure proper cleanup on errors
4. Test error scenarios

### Phase 4: Testing (Priority: High)
1. Test with various video files
2. Test error scenarios
3. Verify landmark synchronization
4. Performance testing

### Phase 5: Logging and Monitoring (Priority: Medium)
1. Add comprehensive logging throughout pipeline
2. Log landmark capture statistics
3. Log processing performance metrics
4. Add debug mode for detailed logging

## Dependencies

- **MediaPipe Pose**: Already integrated, no changes needed
- **React**: Already integrated
- **TypeScript**: Already integrated

## Browser Compatibility

All modern browsers that support MediaPipe:
- Chrome/Edge 84+
- Firefox 78+
- Safari 14+
- Mobile Chrome/Safari

## Performance Targets

1. **Processing Speed**: Same as before (2s per second of video)
2. **Landmark Capture**: 100% of processed frames
3. **Memory Usage**: < 250MB for 30-second video (slight increase due to landmark storage)
4. **Pose Detection Rate**: > 80% of frames should have valid pose
5. **Error Recovery**: < 2 seconds to display error and return to previous screen

## Success Metrics

1. **Crash Rate**: 0% (down from current unknown rate)
2. **Landmark Capture Success**: > 95% of processing sessions
3. **Pose Detection Rate**: > 80% of frames per video
4. **User Completion Rate**: > 90% of users complete ghost mode processing
5. **Error Message Clarity**: User feedback indicates errors are understandable
