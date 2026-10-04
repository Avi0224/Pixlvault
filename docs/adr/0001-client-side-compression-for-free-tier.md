# 1. Enforce aggressive client-side image compression

Date: 2026-10-04

## Status

Accepted

## Context

We are building an open platform for photographers to upload their best work. High-quality photography typically involves very large file sizes (e.g., RAW files, or 10-20MB high-res JPGs). 

The platform must operate completely within Firebase's free "Spark" plan tier. Firebase provides 5GB of total storage and 1GB/day of download bandwidth for free. If we allow original high-res image uploads, a small number of users uploading or downloading photos would quickly exhaust the bandwidth limit, resulting in the site going offline or requiring a paid plan.

## Decision

We will enforce strict client-side compression on all image uploads before they are sent to Firebase. The browser will resize images to a maximum of 1920px (on the longest edge) and compress them to target a file size of ~300-500KB using a library like `browser-image-compression`.

## Consequences

- **Positive:** We can store approximately 10,000 photos within the free tier's 5GB limit.
- **Positive:** The 1GB/day download bandwidth will stretch much further, accommodating thousands of image views/downloads per day.
- **Negative:** Users cannot distribute their full-resolution original files through the platform. The "download" feature will only provide the compressed 1920px HD version.
- **Negative:** Added complexity to the frontend upload logic to handle canvas resizing and compression before triggering the Firebase upload.
