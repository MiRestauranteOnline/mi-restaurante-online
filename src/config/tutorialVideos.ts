// Tutorial video configuration for signup steps
// Update the YouTube embed URLs here for each step

export const tutorialVideos = {
  // Step 1: Basic Information
  step1: "https://www.youtube.com/embed/afAJiAWU54M", // CHANGE YOUTUBE LINK FOR STEP 1 HERE
  
  // Step 2: Payment Information
  step2: "https://www.youtube.com/embed/dQw4w9WgXcQ", // CHANGE YOUTUBE LINK FOR STEP 2 HERE
  
  // Step 3: Restaurant Details
  step3: "https://www.youtube.com/embed/U5pR5GnEdlA", // CHANGE YOUTUBE LINK FOR STEP 3 HERE
  
  // Step 4: Menu, Team and reviews
  step4: "https://www.youtube.com/embed/oQ3tG6WCsKM", // CHANGE YOUTUBE LINK FOR STEP 4 HERE
  
  // Step 5: Opening Hours
  step5: "https://www.youtube.com/embed/tfts7jJGO8o", // CHANGE YOUTUBE LINK FOR STEP 5 HERE
  
  // Step 6: Images Upload
  step6: "https://www.youtube.com/embed/oz1BEr2dmK0", // CHANGE YOUTUBE LINK FOR STEP 6 HERE
  
  // Step 7: FAQs
  step7: "https://www.youtube.com/embed/VES_Yfbsfa0", // CHANGE YOUTUBE LINK FOR STEP 7 HERE
} as const;

export type TutorialStep = keyof typeof tutorialVideos;
