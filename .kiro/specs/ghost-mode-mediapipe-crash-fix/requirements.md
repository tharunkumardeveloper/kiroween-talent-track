# Requirements Document

## Introduction

This feature fixes a critical bug in Ghost Mode where MediaPipe processing closes automatically when users upload a video. The system currently experiences crashes or premature termination during video processing, preventing users from completing their ghost mode workouts. The root cause is improper handling of MediaPipe's asynchronous processing pipeline and inadequate error handling during landmark capture.

## Glossary

- **Ghost Mode**: A competitive workout mode where users race against a reference skeleton performance
- **MediaPipe**: Google's pose detection library that analyzes video frames to extract body landmark positions
- **Pose Landmarks**: The 33 3D coordinate points detected by MediaPipe representing body joint positions
- **GhostVideoProcessor**: The React component responsible for processing uploaded videos in ghost mode
- **mediapipeProcessor**: The service class that handles MediaPipe initialization and video processing
- **Landmark Capture**: The process of collecting pose landmarks from each video frame during processing
- **onResults Callback**: MediaPipe's callback function that fires when pose detection completes for a frame
- **Processing Pipeline**: The sequence of operations from video upload to landmark extraction to display

## Requirements

### Requirement 1

**User Story:** As a user uploading a video for Ghost Mode, I want the MediaPipe processing to complete successfully without crashes, so that I can view my ghost mode comparison.

#### Acceptance Criteria

1. WHEN the user uploads a video file, THE GhostVideoProcessor SHALL initialize MediaPipe without modifying its internal callback handlers.

2. THE mediapipeProcessor service SHALL return pose landmarks as part of the ProcessingResult interface.

3. THE GhostVideoProcessor SHALL receive pose landmarks directly from the processing result instead of capturing them via callback wrapping.

4. WHEN MediaPipe processing completes, THE System SHALL have collected all pose landmarks for every processed frame.

5. THE System SHALL not wrap or modify MediaPipe's onResults callback during ghost mode processing.

### Requirement 2

**User Story:** As a user experiencing processing failures, I want detailed error messages and logging, so that I can understand what went wrong and retry successfully.

#### Acceptance Criteria

1. WHEN MediaPipe fails to initialize, THE System SHALL display an error message "MediaPipe initialization failed. Please refresh and try again."

2. WHEN video processing fails, THE System SHALL log the specific error details to the console.

3. WHEN pose landmarks are not captured, THE System SHALL log a warning indicating how many frames were processed and how many landmarks were captured.

4. THE System SHALL wrap all MediaPipe operations in try-catch blocks to prevent unhandled exceptions.

5. WHEN an error occurs, THE System SHALL call the onBack callback to return the user to the previous screen instead of leaving them stuck.

### Requirement 3

**User Story:** As a developer maintaining the ghost mode feature, I want the mediapipeProcessor to expose pose landmarks in its result, so that components don't need to hack around the API.

#### Acceptance Criteria

1. THE ProcessingResult interface SHALL include a poseLandmarks property of type PoseLandmark[][].

2. THE mediapipeProcessor.processVideo method SHALL collect pose landmarks for each frame during processing.

3. THE mediapipeProcessor SHALL store landmarks in a dedicated array that persists throughout the processing lifecycle.

4. WHEN processVideo completes, THE ProcessingResult SHALL contain all captured pose landmarks.

5. THE mediapipeProcessor SHALL clear the landmarks array at the start of each new processing session.

### Requirement 4

**User Story:** As a user watching ghost mode playback, I want the pose landmarks to be synchronized with the video frames, so that the ghost skeleton moves correctly.

#### Acceptance Criteria

1. THE mediapipeProcessor SHALL capture pose landmarks in the same order as video frames are processed.

2. THE System SHALL ensure the landmarks array index corresponds to the frame index in the video.

3. WHEN a frame has no detected pose, THE System SHALL store an empty array or null for that frame index.

4. THE poseLandmarks array length SHALL match the number of frames processed from the video.

5. THE System SHALL log the total number of landmarks captured compared to frames processed for verification.

### Requirement 5

**User Story:** As a user with a slow device, I want video processing to be robust and not crash due to timing issues, so that I can use ghost mode on any device.

#### Acceptance Criteria

1. THE mediapipeProcessor SHALL wait for each frame's pose detection to complete before processing the next frame.

2. THE System SHALL use proper async/await patterns when calling MediaPipe's send() method.

3. WHEN MediaPipe takes longer than expected, THE System SHALL not timeout prematurely (minimum 500ms per frame).

4. THE System SHALL handle cases where MediaPipe's onResults callback is not called for a frame.

5. THE System SHALL continue processing subsequent frames even if one frame fails to detect a pose.

### Requirement 6

**User Story:** As a user uploading a video, I want to see accurate progress updates during processing, so that I know the system is working and not frozen.

#### Acceptance Criteria

1. THE GhostVideoProcessor SHALL display progress percentage based on frames processed.

2. THE System SHALL update progress at least every 5 frames to provide smooth visual feedback.

3. THE progress indicator SHALL show different status messages at different stages (analyzing, extracting, creating ghost).

4. WHEN processing is complete, THE progress SHALL reach 100% before transitioning to playback.

5. THE System SHALL display the ghost emoji animation throughout the processing phase.

### Requirement 7

**User Story:** As a user who has completed processing, I want the ghost skeleton to be visible immediately when playback starts, so that I can see the comparison right away.

#### Acceptance Criteria

1. WHEN processing completes, THE GhostVideoProcessor SHALL pass poseLandmarks to the DualVideoDisplay component.

2. THE DualVideoDisplay SHALL verify that poseLandmarks is not empty before starting playback.

3. WHEN poseLandmarks is empty or undefined, THE System SHALL display an error message "Failed to extract pose data. Please try again."

4. THE GhostSkeletonRenderer SHALL receive valid pose landmarks from the first frame when playback begins.

5. THE System SHALL log the number of landmark frames passed to DualVideoDisplay for debugging.

### Requirement 8

**User Story:** As a developer debugging ghost mode issues, I want comprehensive logging throughout the processing pipeline, so that I can quickly identify where failures occur.

#### Acceptance Criteria

1. THE System SHALL log when MediaPipe initialization begins and completes.

2. THE System SHALL log when video processing starts, including video duration and target frame count.

3. THE System SHALL log every 30 frames showing current progress, reps detected, and landmarks captured.

4. THE System SHALL log when landmark capture begins and how many landmarks are collected.

5. WHEN processing completes, THE System SHALL log a summary including total frames, total landmarks, and processing time.
