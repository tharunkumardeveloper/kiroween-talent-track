# Implementation Plan

- [x] 1. Enhance metrics extraction logic in GhostVideoProcessor


  - Create robust extraction functions that handle all data source variations from liveResults
  - Implement `extractReps()` function with priority-based source checking (setsCompleted, stats.totalReps, stats.correctReps, etc.)
  - Implement `extractDuration()` function to parse both string (MM:SS) and number formats
  - Implement `calculateFormScore()` function using correct/total reps ratio with fallbacks
  - Add comprehensive console logging for debugging metrics extraction
  - Update userMetrics state with extracted values
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.1, 6.2, 6.3_





- [ ] 2. Implement competitive ghost metrics algorithm
  - Create `calculateGhostMetrics()` function that takes userMetrics and ghostTarget as inputs
  - Implement 15% rep increase calculation with minimum +3 reps enforcement
  - Implement time calculation (10 seconds or 10% increase, whichever is greater)
  - Implement form score calculation (+5% with 85% min, 95% max caps)


  - Add fallback logic to use ghostTarget values when user metrics are zero
  - Update ghostMetrics state with calculated competitive values


  - Add console logging to show ghost metric calculations
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 3. Implement frame synchronization system in DualVideoDisplay
  - Add state for currentFrameIndex and currentTime
  - Create useEffect hook with requestAnimationFrame loop for smooth frame updates


  - Calculate actual FPS from poseLandmarks.length / videoDuration
  - Calculate frame index from video.currentTime * actualFPS
  - Implement frame index clamping to prevent array bounds errors [0, length-1]
  - Update currentTime state for metrics display (Math.floor(video.currentTime))


  - Add console logging every second showing video time, frame index, and FPS
  - Pass currentFrameIndex to both SkeletonRendererNew and GhostSkeletonRenderer
  - Pass currentTime to both MetricsOverlay components
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 4. Update MetricsOverlay to display real-time metrics
  - Modify MetricsOverlay to accept and display actual reps from props


  - Update time display to use currentTime prop instead of static value
  - Ensure formatTime() function correctly formats seconds as MM:SS


  - Verify color coding logic for form score (green ≥85%, orange 70-84%, red <70%)
  - Verify rep counter highlighting when beatTarget is true
  - Test metrics update smoothly during video playback
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 5. Verify SkeletonRendererNew renders standard MediaPipe skeleton




  - Confirm drawSkeleton() uses cyan (#00FFFF) for connections
  - Confirm joints are rendered with cyan fill and white outline
  - Verify lineWidth is 1.5 for connections
  - Verify joint radius is 2 pixels
  - Ensure no glow effects or shadows (shadowBlur = 0)
  - Test skeleton renders correctly when transparent prop is true (overlay mode)
  - Verify skeleton updates smoothly when poseLandmarks prop changes


  - _Requirements: 2.1, 2.2, 2.3, 2.4_



- [ ] 6. Verify GhostSkeletonRenderer renders spooky skeleton
  - Confirm drawHauntingSkeleton() uses purple (#A855F7) for bones with glow
  - Confirm joints use cyan (#00FFFF) with radial gradient glow
  - Verify drawSpookySkull() renders custom skull at head position (landmark[0])


  - Verify pulsing glow effect using timestamp-based sine wave
  - Verify skull features: cranium, jaw, eye sockets, glowing eyes, nose cavity, teeth


  - Ensure black background (#000000) is rendered
  - Test animation loop continues for pulsing effects even when paused
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_




- [ ] 7. Implement beat result visualization
  - Calculate beatTarget in DualVideoDisplay based on userMetrics vs ghostMetrics
  - Apply conditional border styling: green for user win, purple for ghost win
  - Pass beatTarget prop to user MetricsOverlay for highlighting


  - Add pulsing animation to winning panel border
  - Display trophy icon in MetricsOverlay when user beats target
  - Test visual indicators appear correctly for both win and lose scenarios
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 8. Add error handling and fallback logic
  - Wrap metrics extraction in try-catch blocks with fallback values



  - Add error handling for missing video source
  - Add error handling for MediaPipe initialization failure
  - Implement frame index clamping to prevent array access errors
  - Add validation for poseLandmarks array before accessing by index
  - Display user-friendly error messages when video fails to load
  - Add console warnings when falling back to default values
  - _Requirements: 6.4, 8.3, 8.4_

- [ ] 9. Add comprehensive logging for debugging
  - Log extracted metrics with all attempted data sources
  - Log calculated ghost metrics with algorithm parameters
  - Log frame synchronization status (video time, frame index, FPS)
  - Log skeleton rendering status (frame count, landmark availability)
  - Add performance timing logs for video processing
  - Ensure logs don't impact performance (use console.log sparingly)
  - _Requirements: 1.5, 7.5_

- [ ] 10. Optimize performance and test on multiple devices
  - Test video processing speed with 10s, 30s, and 60s videos
  - Verify smooth playback at 30fps video + 60fps skeleton rendering
  - Test on mobile devices (iOS Safari, Android Chrome)
  - Test on desktop browsers (Chrome, Firefox, Edge)
  - Verify Wake Lock API prevents tab throttling during processing
  - Monitor memory usage during video processing and playback
  - Optimize canvas rendering if frame rate drops below 30fps
  - _Requirements: 8.1, 8.2, 8.5_
