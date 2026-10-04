# Photography 3D Platform - Implementation Plan

## Phase 1: Foundation & Firebase Setup
1. **Next.js Initialization**: Scaffold a new Next.js project using App Router, TypeScript, and Tailwind CSS.
2. **Firebase Configuration**: Set up Firebase client SDKs for Auth and Firestore.
3. **Database Schema**:
   - `users` collection: `uid`, `displayName`, `photoURL`, `createdAt`
   - `photos` collection: `id`, `userId`, `storageUrl`, `status` (`pending` | `approved`), `featured` (boolean), `createdAt`, `title`
4. **Security Rules**: Write Firestore rules to ensure only authenticated users can upload, only the Admin can modify statuses, and anyone can read approved photos.

## Phase 2: Global UI & Navigation
1. **State Management**: Use Zustand or React Context to manage user authentication state and UI state (e.g., is the menu open?).
2. **Navigation Overlay**: Build the sleek, full-screen hamburger menu overlay that sits above the 3D canvas and provides links to Explore, Upload, and Profile.
3. **Authentication Flow**: Implement the Google Sign-In button and user session persistence.

## Phase 3: The 3D Hall of Fame Sphere (Landing Page)
1. **R3F Setup**: Initialize a full-screen `<Canvas>` using `react-three-fiber` and `@react-three/drei`.
2. **Data Fetching**: Query Firestore for photos where `featured == true` and `status == 'approved'`.
3. **Sphere Layout**: Programmatically calculate 3D positions to arrange the image planes in a spherical or cylindrical gallery orbiting the center.
4. **Interactions**:
   - Implement drag-to-rotate using pointer controls.
   - Implement click-to-focus: zooming the camera into the selected photo.
   - Display HTML overlays (photographer name, title) using Drei's `<Html>` component when an image is focused.

## Phase 4: Upload System & Compression (The ADR Implementation)
1. **Upload UI**: Build a clean drag-and-drop file upload interface.
2. **Client-Side Compression**: Integrate `browser-image-compression`. Enforce a max width/height of 1920px and a file size limit of ~500KB *before* upload.
3. **Storage & DB**: Upload the compressed blob to Cloudinary using an unsigned upload preset, get the secure URL, and create a `pending` document in Firestore.

## Phase 5: The 2D Galleries
1. **Explore Gallery**: Build a responsive Masonry-style grid page displaying all `approved` photos. Include a download button for each.
2. **User Profiles**: Build dynamic routes (`/user/[uid]`) to display a photographer's portfolio of approved uploads.

## Phase 6: Admin Dashboard
1. **Admin Protection**: Create a hidden `/admin` route, accessible only if the logged-in user's UID matches a specific `NEXT_PUBLIC_ADMIN_UID` environment variable.
2. **Moderation Queue**: Build a UI to fetch and display `pending` photos with "Approve" and "Reject" actions.
3. **Curation**: Build a UI for approved photos to toggle their `featured` status for the 3D Sphere.
