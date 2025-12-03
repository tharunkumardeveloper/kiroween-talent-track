# Implementation Plan

- [x] 1. Add landmark collection to mediapipeProcessor service


  - Add `capturedLandmarks: PoseLandmark[][]` as private property to MediaPipeProcessor class
  - Export `PoseLandmark` interface with x, y, z, visibility properties
  - Update `ProcessingResult` interface to include `poseLandmarks: PoseLandmark[][]` property
  - Initialize `capturedLandmarks` as empty array at start of `processVideo` method
  - Add console log when landmark capture is initialized
  - _Requirements: 3.1, 3.2, 3.3, 3.5_



- [ ] 2. Capture landmarks in onResults handler
  - Modify existing `onResults` handler in `processVideo` to capture landmarks
  - Map `results.poseLandmarks` to `PoseLandmark[]` format with x, y, z, visibility
  - Push mapped landmarks to `capturedLandmarks` array when pose is detected
  - Push empty array to `capturedLandmarks` when no pose detected in frame
  - Add console warning when no pose is detected in a frame


  - Log landmark capture progress every 30 frames
  - _Requirements: 3.2, 3.3, 4.1, 4.2, 4.3, 5.5, 8.4_

- [ ] 3. Return landmarks in ProcessingResult
  - Update `calculateStats` method signature to accept `poseLandmarks: PoseLandmark[][]` parameter
  - Pass `this.capturedLandmarks` to `calculateStats` when processing completes
  - Include `poseLandmarks` in the returned `ProcessingResult` object


  - Add console logs showing total frames processed and landmarks captured
  - Log number of frames with valid pose detection
  - Calculate and log pose detection rate percentage
  - _Requirements: 3.4, 4.4, 4.5, 8.5_

- [x] 4. Remove callback wrapping from GhostVideoProcessor


  - Delete the code that stores `originalOnResults` reference
  - Delete the code that creates `wrappedOnResults` function
  - Delete the code that assigns wrapped handler to `mediapipeProcessor.pose.onResults`
  - Delete the code that restores original handler after processing
  - Remove `capturedLandmarks` useRef from component


  - _Requirements: 1.1, 1.5_

- [ ] 5. Receive landmarks from processing result
  - Get `poseLandmarks` directly from `processingResult.poseLandmarks`
  - Add fallback to empty array if `poseLandmarks` is undefined
  - Add console log showing number of landmark frames received
  - Add console log showing number of frames with valid pose data
  - _Requirements: 1.2, 1.3, 1.4, 7.1, 7.5_


- [ ] 6. Add landmark validation and error handling
  - Check if `poseLandmarks.length === 0` after processing
  - Display error toast "Failed to extract pose data. Please try again." if no landmarks
  - Call `onBack()` to return to previous screen if no landmarks


  - Add console error log when no landmarks are captured
  - Wrap processing code in try-catch block
  - Display error toast with specific error message in catch block
  - Call `onBack()` in catch block to return to previous screen
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 7.2, 7.3_

- [ ] 7. Update processedData to use landmarks from result
  - Pass `poseLandmarks` from processing result to `setProcessedData`


  - Verify `poseLandmarks` is passed to DualVideoDisplay component
  - Remove any references to `capturedLandmarks.current`
  - _Requirements: 1.3, 1.4, 7.1, 7.4_

- [x] 8. Add comprehensive error handling to mediapipeProcessor

  - Wrap MediaPipe initialization in try-catch with specific error message
  - Wrap video processing in try-catch block
  - Add error handling for wake lock release failures
  - Throw descriptive errors for MediaPipe initialization failure
  - Throw descriptive errors for video loading failure
  - Add validation for empty landmarks array before returning result
  - Log warning if pose detection rate is below 50%
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_


- [ ] 9. Enhance progress reporting
  - Update progress message logic to show different messages at different stages
  - Pass `landmarksCaptured` count in metrics object to onProgress callback
  - Pass `framesProcessed` count in metrics object to onProgress callback
  - Update progress calculation to ensure it reaches 99% before completion
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 10. Add logging throughout processing pipeline
  - Log when MediaPipe initialization begins and completes
  - Log when video processing starts with duration and frame count

  - Log every 30 frames with progress, reps, and landmarks captured
  - Log when landmark capture begins
  - Log summary when processing completes (frames, landmarks, time)
  - Log pose detection rate percentage
  - Add warning logs for low pose detection rate
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 11. Test with various video files


  - Test with 10-second workout video
  - Test with 30-second workout video
  - Test with 60-second workout video
  - Test with video where person is partially visible
  - Test with video in low lighting
  - Test with video in bright lighting
  - Verify landmarks are captured for all test cases
  - Verify ghost skeleton displays correctly for all test cases
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 12. Test error scenarios
  - Test with corrupted video file (verify error message)
  - Test with video where no person is visible (verify error handling)
  - Test with unsupported video format (verify error message)
  - Test MediaPipe initialization failure scenario
  - Verify user can navigate back after each error
  - Verify error messages are clear and actionable
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 7.2, 7.3_

- [ ] 13. Verify landmark synchronization
  - Verify landmarks array length matches processed frame count
  - Verify each landmark frame has 33 landmarks (or empty array)
  - Verify landmark values are within valid ranges (x, y: 0-1)
  - Verify ghost skeleton moves in sync with user video
  - Verify no lag or drift during playback
  - Test frame synchronization with different video lengths
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 7.4, 7.5_
