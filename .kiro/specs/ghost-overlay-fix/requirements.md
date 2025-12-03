# Requirements Document

## Introduction

This specification addresses the ghost mode overlay positioning issue in the sports assessment app. Currently, the ghost GIF displays in a small corner of the screen, which prevents users from effectively comparing their form to the reference. The ghost overlay must be repositioned to appear as a semi-transparent, full-screen overlay centered on the camera view, similar to racing game ghost mechanics where the ghost car overlays the player's position.

## Glossary

- **Ghost Mode**: A workout mode where users can see a reference GIF of perfect form overlaid on their camera view
- **Ghost GIF**: An animated GIF showing the correct form for an exercise
- **Camera View**: The live video feed from the user's camera showing their exercise performance
- **Overlay**: A visual layer positioned on top of another element
- **Semi-transparent**: Partially see-through visual effect (opacity between 0.3-0.5)
- **Exercise Zone**: The area of the screen where the user performs the exercise
- **MediaPipe**: The AI-powered pose detection system used for form analysis

## Requirements

### Requirement 1

**User Story:** As a user performing an exercise in ghost mode, I want to see the ghost GIF overlaid on my camera view, so that I can directly compare my form to the reference position

#### Acceptance Criteria

1. WHEN ghost mode is active, THE Ghost GIF SHALL be positioned in the center of the camera view
2. WHEN ghost mode is active, THE Ghost GIF SHALL be rendered with opacity between 0.3 and 0.5
3. WHEN ghost mode is active, THE Ghost GIF SHALL be scaled to match typical human body size on camera
4. WHEN ghost mode is active, THE Ghost GIF SHALL maintain its aspect ratio during scaling
5. WHEN the user views the camera feed, THE Ghost GIF SHALL not obstruct the user's view of themselves

### Requirement 2

**User Story:** As a user, I want the UI elements to remain visible and accessible above the ghost overlay, so that I can interact with controls and see my workout stats

#### Acceptance Criteria

1. THE UI elements (timer, rep counter, buttons) SHALL be rendered above the ghost overlay
2. THE Camera feed SHALL be rendered as the bottom layer
3. THE Ghost GIF overlay SHALL be rendered between the camera feed and UI elements
4. THE UI elements SHALL remain fully opaque and interactive
5. WHEN the user clicks on UI controls, THE controls SHALL respond without interference from the ghost overlay

### Requirement 3

**User Story:** As a user on different devices, I want the ghost overlay to adapt to my screen size and orientation, so that I have a consistent experience across devices

#### Acceptance Criteria

1. WHEN the screen size changes, THE Ghost GIF SHALL remain centered in the exercise zone
2. WHEN the device orientation changes, THE Ghost GIF SHALL scale appropriately
3. WHEN viewed on mobile devices, THE Ghost GIF SHALL scale to fit the screen
4. WHEN viewed on desktop devices, THE Ghost GIF SHALL scale to match typical webcam proportions
5. THE Ghost GIF SHALL maintain proper positioning on screens with aspect ratios from 9:16 to 16:9

### Requirement 4

**User Story:** As a user, I want the ghost overlay to have a ethereal appearance, so that it clearly indicates reference form without being distracting

#### Acceptance Criteria

1. THE Ghost GIF SHALL be rendered with semi-transparent styling
2. THE Ghost GIF SHALL have a subtle glow effect to enhance visibility
3. THE Ghost GIF SHALL use CSS positioning with absolute or fixed positioning
4. THE Ghost GIF SHALL have appropriate z-index values to ensure correct layering
5. THE Ghost GIF SHALL be non-interactive (pointer-events: none)
