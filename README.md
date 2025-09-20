# MingAI 🧠✨

**“Upgrade your lifestyle with personalized guidance — your buddy who keeps you on track, every step of the way.”**

---

MingAI is an intelligent personal improvement application designed to help users turn their ambitious goals into actionable daily plans. By leveraging the power of Google's Gemini AI, MingAI bridges the gap between intention and action, making self-improvement accessible, structured, and personalized.

## The Problem

We all have goals we want to achieve: "get fit," "read more," "learn a new skill." However, these broad ambitions are often overwhelming. The initial motivation fades when we don't have a clear, step-by-step plan. Procrastination sets in, and our goals remain distant dreams.

## The Solution: AI-Powered Task Refinement

MingAI tackles this problem head-on. Instead of just being a simple to-do list, MingAI acts as your personal strategist.

1.  **Input Your Goals:** Start by telling MingAI up to five high-level tasks you want to accomplish.
2.  **AI Refinement:** Using **Google Gemini**, the app breaks down each vague goal (e.g., "Go to the gym") into concrete, actionable micro-tasks (e.g., "Go to the gym for 45 minutes," "Go to the gym in the morning").
3.  **Review & Finalize:** You have full control. Review the AI's suggestions, approve or edit them, and build a daily plan that works for you.
4.  **Daily Review & Targeted Feedback:** At the end of the day, review your progress. Based on your completed and missed tasks, MingAI provides new, targeted AI suggestions to help you improve and stay on track.

---

## Key Features

### 🔐 Secure Authentication & User State Retention

-   **Firebase Authentication:** MingAI uses Firebase for secure and reliable user authentication (Sign In & Sign Up).
-   **Persistent Sessions:** Your session is securely maintained, so you stay logged in and your data is always accessible.
-   **Real-time Database Sync:** We use **Firebase Realtime Database** to store and sync your daily plans. Your data is saved automatically and is available instantly whenever you log back in, ensuring a seamless user experience.

### 🧠 Intelligent Task Processing with Google Gemini

-   **Dynamic Task Generation:** The core of MingAI is powered by a **Genkit flow** that calls the Google Gemini model to refine user inputs. This turns vague goals into clear, actionable steps.
-   **Personalized Suggestions:** The "Daily Review" feature feeds your performance data back into Gemini to generate targeted advice, helping you overcome obstacles and build better habits.

### 🎨 Modern & Responsive User Interface

-   **Built with Next.js & ShadCN UI:** The frontend is a fast, server-rendered React application built with the Next.js App Router.
-   **Dynamic Theming:** Features a beautiful, animated gradient background that adapts seamlessly to both **Light and Dark modes**.
-   **Fully Responsive:** A clean, intuitive, and mobile-first design ensures a great experience on any device.

---

## Technology Stack

-   **Framework:** [Next.js](https://nextjs.org/) (App Router)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/)
-   **Authentication:** [Firebase Authentication](https://firebase.google.com/docs/auth)
-   **Database:** [Firebase Realtime Database](https://firebase.google.com/docs/database)
-   **AI Integration:** [Google AI (Gemini)](https://ai.google.dev/) via [Genkit](https://firebase.google.com/docs/genkit)

---

## Getting Started

### Prerequisites

-   Node.js (v18 or later)
-   npm or yarn

### Setup

1.  **Clone the repository:**
    ```bash
    git clone [your-repo-url]
    cd mingai-project
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Firebase:**
    -   Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
    -   Create a new Web App in your project settings.
    -   Copy the Firebase configuration object and paste it into `src/lib/firebase.ts`.
    -   Enable Email/Password authentication in the Firebase console.
    -   Set up Firebase Realtime Database and update the security rules to allow read/write access for authenticated users.

4.  **Set up Google AI:**
    -   Obtain a Google AI API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    -   Create a `.env.local` file in the root of the project and add your API key:
        ```
        GEMINI_API_KEY=your_api_key_here
        ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:3000`.
