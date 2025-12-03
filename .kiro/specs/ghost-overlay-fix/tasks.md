# Implementation Plan

- [x] 1. Update GhostLiveRecorder component with centered overlay positioning


  - Modify the ghost overlay container to use fixed positioning with full viewport coverage
  - Replace bottom-right corner positioning with centered flexbox layout
  - Remove the small corner styling (bg-purple-950/80, rounded-lg, p-2, border)
  - Apply pointer-events: none to ghost overlay container to allow UI interaction
  - _Requirements: 1.1, 1.2, 2.3_


- [ ] 2. Implement semi-transparent ghost styling with glow effect
  - Set ghost image opacity to 0.4 (40% transparency)
  - Add CSS filter with purple drop-shadow for ethereal glow effect
  - Remove the "Perfect Form" label and decorative border from ghost overlay
  - Ensure ghost image maintains aspect ratio with object-fit: contain

  - _Requirements: 1.3, 1.4, 1.5, 4.1, 4.2, 4.5_

- [ ] 3. Implement responsive ghost scaling for different screen sizes
  - Set ghost max-width to 60vh for desktop/landscape orientation
  - Set ghost max-height to 80vh to prevent overflow
  - Add responsive scaling for mobile portrait mode (50vh)
  - Add responsive scaling for mobile landscape mode (70vh)

  - Use viewport-relative units (vh) for consistent sizing across devices
  - _Requirements: 1.3, 1.4, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 4. Ensure proper z-index layering for ghost overlay
  - Set ghost overlay container z-index to 20
  - Verify LiveRecorderNew video/canvas elements have z-index 10 or default

  - Verify UI elements (buttons, timer, rep counter) have z-index 30-50
  - Test that all UI controls remain clickable with ghost overlay active
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.3, 4.4_

- [ ] 5. Add ghost loading error handling
  - Implement onLoad handler to track successful ghost GIF loading

  - Implement onError handler to gracefully handle loading failures
  - Hide ghost overlay if loading fails, allow workout to continue
  - Add loading state management for ghost image
  - _Requirements: 1.1_

- [ ] 6. Test ghost overlay across different devices and orientations
  - Test on desktop with webcam (verify centering and scaling)


  - Test on mobile portrait mode (verify ghost scales to 50vh)
  - Test on mobile landscape mode (verify ghost scales to 70vh)
  - Test on tablet devices (verify intermediate sizing)
  - Verify UI elements remain interactive on all devices
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 7. Verify ghost overlay does not interfere with video recording
  - Test that recorded video captures camera feed only (not ghost overlay)
  - Verify MediaPipe pose detection continues to work with ghost overlay
  - Test that rep counting and form analysis remain accurate
  - Verify recording performance is not impacted by ghost overlay
  - _Requirements: 2.5_
