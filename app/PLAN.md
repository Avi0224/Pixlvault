# Pixlvault Rebranding Implementation Plan

## Goal Description
The objective is to rebrand the "Photography Platform" to **Pixlvault**. We will update the name across the application (metadata, loading screen) and introduce the newly provided glowing cube/camera logo. Following our design discussion, we will maintain the existing elegant, ultra-minimalist typography but enhance the initial Hall of Fame entrance and the global navigation by integrating the new icon.

## User Review Required
No breaking changes. The aesthetics will remain clean and premium, just with a new brand identity.

## Proposed Changes

### 1. Asset Management
- **Action**: Copy the uploaded logo to the `public/` directory as `logo.png` and configure it as the primary favicon.
- **Why**: Ensures the logo is statically served and can be referenced easily by Next.js components and metadata.

### 2. Global Metadata (`layout.tsx`)
- **Action**: Update the `<title>` and `<meta name="description">` from "Photography Portfolio" to "Pixlvault - Photography Portfolio".
- **Action**: Add metadata link to use the new logo as the favicon.

### 3. Start Screen (`HallOfFame.tsx`)
- **Action**: Replace the text "Photography Platform" with "PIXLVAULT".
- **Action**: Add an `<img>` tag for the new logo right above the text in the introductory scroll screen. It will smoothly fade in along with the text.
- **Action**: Add styling to keep the ultra-minimalist vibe (thin, widely spaced letters) per your request, while sizing the logo appropriately so it doesn't overwhelm the text.

### 4. Navigation Menu (`Navigation.tsx`)
- **Action**: Add a small, elegant version of the new logo in the top-left of the screen (or inside the navigation menu) to anchor the branding on every page.
- **Action**: Make the logo a clickable link that returns the user to the Hall of Fame.

## Verification Plan

### Manual Verification
1. Open the app in the browser and verify the browser tab says "Pixlvault" and shows the new icon.
2. Refresh the homepage and verify the new logo sits beautifully above the "PIXLVAULT" text in the 3D scroll entrance.
3. Open the hamburger menu or check the top-left corner to verify the logo appears globally.
