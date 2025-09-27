// This file provides a helper to fetch generated course content from a Cloud Function endpoint.
// You can adjust the endpoint and payload as needed.

export async function fetchGeneratedContent({ topic, format, language, difficulty }) {
  // Prefer an env-provided endpoint. Set VITE_GENERATED_ENDPOINT in .env if you have a deployed function.
  const ENDPOINT = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GENERATED_ENDPOINT
    ? import.meta.env.VITE_GENERATED_ENDPOINT
    : "";

  // Helper demo content (matches GeneratedContent shape in Review.tsx)
  const demoData = {
    outline: [
      { module: "Introduction to Web Development", lessons: ["HTML Basics", "CSS Fundamentals", "JavaScript Introduction"], duration: "2 hours" },
      { module: "Advanced Frontend", lessons: ["React Components", "State Management", "API Integration"], duration: "3 hours" }
    ],
    quizzes: [
      { question: "What does HTML stand for?", options: ["HyperText Markup Language", "High Tech Modern Language"], correct: 0, explanation: "HTML stands for HyperText Markup Language." }
    ],
    script: "# Demo Script\n\nThis is a demo video script used when no server is available.",
    content: "<h1>Demo Content</h1><p>This is fallback content provided locally.</p>"
  };

  // If no endpoint configured, try to load previously saved generated content from localStorage
  if (!ENDPOINT) {
    try {
      const stored = localStorage.getItem('aiCourseCreatorData');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.currentGeneratedContent) {
          return parsed.currentGeneratedContent;
        }
      }
    } catch (e) {
      console.warn('Could not read saved generated content from localStorage', e);
    }

    // No endpoint and no saved content — return demo data instead of throwing.
    console.info('No generation endpoint configured; returning demo content. Set VITE_GENERATED_ENDPOINT to enable cloud fetching.');
    return demoData;
  }

  // If endpoint is configured, attempt to contact the cloud function.
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, format, language, difficulty }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Cloud function returned error:', text);
      // Fall back to demoData instead of throwing so UI remains usable
      return demoData;
    }

    const data = await response.json();
    // Basic validation
    if (!data || !data.outline || !data.quizzes || !data.script || !data.content) {
      console.warn('Cloud function response missing fields, using demo content');
      return demoData;
    }

    return data;
  } catch (err) {
    console.error('Error fetching generated content from cloud function:', err);
    return demoData;
  }
}
