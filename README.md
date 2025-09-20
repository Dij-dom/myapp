# MingAI 🧠✨

**“Upgrade your lifestyle with personalized guidance — your buddy who keeps you on track, every step of the way.”**


## 🚀 Google Drive Link

**[Working Demo](https://drive.google.com/file/d/1_lA05XwPUOeap_OWaKjOqotJiAIKZjcN/view?usp=sharing)**

---

---

## 🚀 Netlify 

**[Access the live application here](https://mellow-nasturtium-7cd661.netlify.app)**

---



About MingAI

Staying consistent with daily goals is tough in today’s fast-paced world. MingAI is your personalized AI companion that helps you plan, track, and improve your habits every day. 

Each night, you set up to five tasks, and MingAI refines them into actionable, achievable steps using smart AI guidance. You review and approve suggestions, keeping full control, while MingAI acts as a coach that learns from your progress. 

With reminders, progress tracking, and a conversational interface, MingAI turns your goals into daily wins — your buddy who keeps you accountable, motivated, and moving forward.

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
