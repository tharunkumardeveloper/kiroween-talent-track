# Implementation Plan

- [x] 1. Implement Wake Lock API in GhostVideoProcessor


  - Add WakeLockSentinel type definition for TypeScript
  - Create `requestWakeLock()` function that requests 'screen' wake lock
  - Create `releaseWakeLock()` function that releases the wake lock
  - Add wake lock state management with useState
  - Request wake lock before video processing starts in useEffect
  - Release wake lock after processing completes (success or error)
  - Add wake lock release in cleanup function
  - Handle Wake Lock not supported case with toast notification
  - Add console logging for wake lock acquisition and release
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_



- [ ] 2. Fix frame synchronization in GhostComparisonDisplay
  - Add currentFrameIndex state with useState(0)
  - Create useEffect hook with requestAnimationFrame loop for frame updates
  - Calculate actualFPS from poseLandmarks.length / videoDuration
  - Calculate frameIndex using Math.round(video.currentTime * actualFPS)
  - Implement frame index clamping: Math.max(0, Math.min(frameIndex, poseLandmarks.length - 1))
  - Update currentFrameIndex state with clamped value
  - Add console logging every second showing video time, frame index, and FPS


  - Add cleanup to cancel animation frame on unmount
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 3. Pass synchronized pose landmarks to GhostSkeletonRenderer
  - Extract single frame's landmarks using poseLandmarks[currentFrameIndex]
  - Add null/undefined checks before accessing array
  - Add bounds checking (currentFrameIndex >= 0 && currentFrameIndex < poseLandmarks.length)


  - Pass extracted landmarks to GhostSkeletonRenderer via poseLandmarks prop
  - Pass undefined when landmarks are not available
  - Add console logging when passing landmarks to ghost renderer
  - _Requirements: 3.3, 3.4, 4.1, 4.2, 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 4. Update GhostSkeletonRenderer to handle single frame landmarks
  - Update poseLandmarks prop type to accept Landmark3D[] | undefined (single frame)
  - Add useEffect to log when pose landmarks are received


  - Log warning when poseLandmarks is undefined or empty
  - Update render function to check for valid landmarks (length >= 33)
  - Show "Waiting for pose data..." message when no landmarks available
  - Ensure drawHauntingSkeleton receives single frame's landmarks
  - Add dependency on poseLandmarks in render useEffect
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 5.3_

- [ ] 5. Add comprehensive logging for debugging
  - Log Wake Lock acquisition status (success/failure/not supported)


  - Log when Wake Lock is released (manual or automatic)
  - Log frame synchronization initialization with total frames and FPS
  - Log current frame index and video time every second during playback
  - Log when GhostSkeletonRenderer receives/doesn't receive landmarks
  - Log canvas initialization status (dimensions, context availability)
  - Log rendering FPS every second
  - Add warning logs for frame index clamping
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_




- [ ] 6. Implement error handling and fallback UI
  - Wrap Wake Lock request in try-catch with fallback notification
  - Add error handling for canvas context initialization failure
  - Display "Failed to initialize ghost renderer" message on canvas error
  - Display "Waiting for pose data..." message when landmarks are missing
  - Add try-catch around drawHauntingSkeleton to prevent crashes
  - Log detailed error information for all error cases
  - Ensure video processing continues even if Wake Lock fails
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 7. Optimize ghost skeleton rendering performance
  - Ensure single requestAnimationFrame loop per component
  - Add FPS monitoring and logging
  - Optimize canvas context save/restore usage
  - Clear canvas efficiently with fillRect instead of clearRect
  - Add performance warning log when FPS drops below 30
  - Test rendering performance with various video lengths
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 8. Test Wake Lock functionality across browsers
  - Test Wake Lock on Chrome/Edge (should work)
  - Test Wake Lock on Firefox (should show fallback notification)
  - Test Wake Lock on Safari 16.4+ (should work)
  - Test Wake Lock on mobile Chrome and Safari
  - Verify processing speed consistency with/without Wake Lock
  - Verify fallback notification appears when not supported
  - Test Wake Lock release on tab close and component unmount
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ]* 9. Test ghost skeleton visibility and synchronization
  - Verify ghost skeleton appears (no black screen)
  - Verify skeleton has purple glowing bones
  - Verify skeleton has cyan glowing joints
  - Verify spooky skull appears at head position
  - Verify skeleton moves in sync with user video
  - Test with various video lengths (10s, 30s, 60s)
  - Verify no lag or drift during playback
  - Test frame synchronization accuracy
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 10. Verify smooth video playback without lag
  - Test user video plays at consistent 30fps minimum
  - Verify no stuttering or frame drops during playback
  - Test simultaneous video and ghost skeleton rendering
  - Monitor browser performance metrics during playback
  - Test on low-end devices (if available)
  - Verify requestAnimationFrame doesn't block main thread
  - Test with tab switching during playback
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
