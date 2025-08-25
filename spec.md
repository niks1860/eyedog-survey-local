Okay, here is a comprehensive project specification for your Wayfinding Reaction Time Survey Tool, incorporating all our discussions.

---

## Project Specification: Wayfinding Reaction Time Survey Tool

**Document Version:** 1.0
**Date:** 2025-08-25

---

### 1. Introduction

This document outlines the requirements and specifications for a web-based survey tool designed to measure reaction times in wayfinding tasks. The primary goal is to assess the effectiveness and understandability of different signage on cognitive load and mental processing. This tool will provide a platform for researchers to conduct controlled experiments, collect precise reaction time data, and manage survey content and participant progress efficiently.

### 2. Project Goals & Objectives

The core objectives of this project are:

- To accurately measure the duration it takes for participants to respond to visual wayfinding prompts.
- To enable the configuration and deployment of various wayfinding survey tasks, primarily involving image selection.
- To provide robust administration features for managing surveys, questions, participants, and collected data.
- To support data export for in-depth statistical analysis.
- To ensure a smooth, intuitive, and performant experience for survey participants.

### 3. User Experience (UX) & Flow

The tool caters to two primary user types: **Participants** (those taking the survey) and **Administrators** (those managing the survey content and data).

#### 3.1 Participant Flow

Participants will experience a streamlined, focused flow:

1.  **Access:** Participants receive a unique, unauthenticated link (e.g., `your-app.com/survey/[survey_slug]?token=[uniqueLinkToken]`).
2.  **Introduction & Instructions:** Upon accessing the link, participants see a customizable introduction and general survey instructions.
3.  **Question Loop:**
    - **Pre-Question Instructions:** For each question, customizable instructions are displayed (can override survey-level instructions).
    - **Countdown:** A visual 3-second countdown (configurable) prepares the participant, indicating the imminent display of the task. No auditory cues.
    - **Task Presentation:** Images (for `4_image` type) or form fields (for `form` type) appear. Measurement of reaction time begins immediately upon content render.
    - **Interaction:**
      - **`4_image`:** Participants click on one of the four images. Visual feedback indicates the selection. They can change their selection before proceeding.
      - **`form`:** Participants interact with form input elements (text fields, checkboxes, etc.).
    - **Confirmation & Navigation:** After making a selection/filling out the form, a "Next" button appears. Clicking this button confirms their choice and advances to the next question.
    - **Progress Tracking:** The system records the participant's progress, allowing them to pause and resume the survey later.
4.  **Completion:** Upon completing all questions, a customizable "Thank You" message is displayed.

#### 3.2 Key Interaction Details

- **Countdown:** A visual timer (e.g., "3... 2... 1...") displayed prominently before each task.
- **`4_image` Interaction:**
  - Images are presented simultaneously.
  - Clicking an image registers an `initialSelectionTime`.
  - Subsequent clicks on different images register re-selection events.
  - The "Next" button is enabled only after an initial selection.
- **"Next" Button:** Explicit confirmation of choice. Clicking this button finalizes the current question's response and triggers the transition to the next.

### 4. Core Functionality

#### 4.1 Reaction Time Measurement

Precision is paramount for this tool.

- **Start Time:** `questionDisplayedAt` - Timestamp captured client-side when the question's visual elements (images, form inputs) are fully rendered and visible to the participant, after the countdown.
- **`initialSelectionTimeMs`:** Duration in milliseconds from `questionDisplayedAt` to the participant's first click on an image. (Applicable to `4_image` type only).
- **`finalSelectionTimeMs`:** Duration in milliseconds from `questionDisplayedAt` to the participant's click on the "Next" button, signifying their final decision for that question.
- **`reselectionEvents`:** For `4_image` questions, a series of events will be recorded if a participant changes their selected image before clicking "Next". Each event will include the `timestampMs` (duration from `questionDisplayedAt`) and the `selectedOptionId`.
- **Client-Side Capture:** All timestamps (`questionDisplayedAt`, `initialSelectionTimeMs`, `finalSelectionTimeMs`, and `reselectionEvents` timestamps) will be captured client-side using `performance.now()` for maximum accuracy, then sent to the server.

#### 4.2 Survey & Question Configuration

- **Survey Definition:** Administrators can create and manage surveys, defining their title, description, slug (for URL), general instructions, default countdown duration, and thank you message.
- **Question Types:**
  - **`4_image`:** Allows the upload of four static images. Each image will have an internal ID for data tracking. No "correct" answer is configured; the goal is to record reaction time and selection.
  - **`form`:** Allows the creation of custom forms with various input types (text, textarea, boolean, number, email, etc.). Form elements can be configured with labels, placeholders, default values, and validation rules (e.g., required).
- **Question Sequencing:** Questions can be ordered within a survey.
- **Instruction Overrides:** Individual questions can have specific instructions that override the survey's general instructions.
- **Countdown Overrides:** Individual questions can have a specific countdown duration, overriding the survey's default.

#### 4.3 Participant Management & Tracking

- **Unique Access:** Each participant is assigned a unique, secure link token that grants them access to a specific survey.
- **Progress Tracking:** The system tracks the `lastCompletedQuestion` for each participant, enabling them to pause and resume their survey sessions.
- **Participant Metadata:** The ability to store arbitrary metadata (e.g., age, gender, group ID) for each participant, potentially imported via CSV.
- **Status Management:** Participants can have statuses such as `new`, `in_progress`, `completed`, or `abandoned`.

### 5. Data Model (Payload CMS Schema)

The core data will be structured within Payload CMS as follows:

#### 5.1 `Surveys` Collection

- `id`: String (Payload default)
- `title`: String (e.g., "Wayfinding Study Q3 2025")
- `description`: Rich Text
- `slug`: String (Unique identifier for URL, e.g., `wayfinding-study-q3`)
- `instructions`: Rich Text (Displayed to participants before starting)
- `thankYouMessage`: Rich Text (Displayed at the end of the survey)
- `defaultCountdownSeconds`: Number (Default countdown duration for questions)
- `questions`: Array of Relationships (to `Questions` collection, ordered)
- `status`: Select (`draft`, `published`, `archived`)
- `createdAt`: DateTime (Payload default)
- `updatedAt`: DateTime (Payload default)

#### 5.2 `Questions` Collection

- `id`: String (Payload default)
- `title`: String (Internal name for the question, e.g., "Q1 - Museum Entrance")
- `type`: Select (`4_image`, `form`)
- `order`: Number (Defines sequence within a survey)
- `overrideInstructions`: Rich Text (Optional, overrides survey-level instructions)
- `countdownSeconds`: Number (Optional, overrides survey `defaultCountdownSeconds`)
- `createdAt`: DateTime (Payload default)
- `updatedAt`: DateTime (Payload default)
- **Conditional Fields (based on `type`):**
  - **If `type` is `4_image`:**
    - `images`: Array of Objects
      - `id`: String (Unique identifier for the image within the question, e.g., `image_a`)
      - `image`: Relationship (to Payload's `Media` collection for image content)
      - `label`: String (Optional, for internal identification)
  - **If `type` is `form`:**
    - `formElements`: Array of Objects (Defines input fields for the form)
      - `type`: Select (`text`, `textarea`, `boolean`, `number`, `email`, etc.)
      - `name`: String (Unique identifier for the input, e.g., `age`, `comments`)
      - `label`: String (Displayed to user, e.g., "Your Age:")
      - `placeholder`: String (Optional)
      - `defaultValue`: String/Boolean/Number (Optional)
      - `required`: Boolean

#### 5.3 `Participants` Collection

- `id`: String (Payload default)
- `participantId`: String (Unique identifier, can be user-defined or auto-generated UUID)
- `uniqueLinkToken`: String (Secure, unique token for generating access links)
- `currentSurvey`: Relationship (to `Surveys` collection, if a participant is tied to one survey at a time)
- `lastCompletedQuestion`: Relationship (to `Questions` collection, for pause/resume)
- `status`: Select (`new`, `in_progress`, `completed`, `abandoned`)
- `metadata`: JSON (For arbitrary participant-specific data, e.g., `{ "age": 30, "gender": "female" }`)
- `createdAt`: DateTime (Payload default)
- `updatedAt`: DateTime (Payload default)

#### 5.4 `Responses` Collection

- `id`: String (Payload default)
- `participant`: Relationship (to `Participants` collection)
- `survey`: Relationship (to `Surveys` collection)
- `question`: Relationship (to `Questions` collection)
- `questionDisplayedAt`: DateTime (Timestamp when question elements fully appeared to user)
- `initialSelectionTimeMs`: Number (Duration from `questionDisplayedAt` to first image click, for `4_image` type)
- `finalSelectionTimeMs`: Number (Duration from `questionDisplayedAt` to "Next" button click)
- `selectedOptionId`: String (For `4_image`, the `id` of the selected image, e.g., `image_a`)
- `reselectionEvents`: Array of Objects (For `4_image`, tracking re-selections)
  - `timestampMs`: Number (Duration from `questionDisplayedAt` to this re-selection)
  - `selectedOptionId`: String (The image ID selected at this event)
- `formData`: JSON (For `form` type, key-value pairs of form input data, e.g., `{ "age": 30, "comments": "..." }`)
- `createdAt`: DateTime (Payload default)
- `updatedAt`: DateTime (Payload default)

#### 5.5 `Media` Collection (Payload Default)

- For storing images uploaded for `4_image` questions.

### 6. Administration & Management

The Payload CMS will serve as the primary administration interface.

#### 6.1 Survey Management

- **CRUD Operations:** Create, Read, Update, and Delete surveys.
- **Question Ordering:** Drag-and-drop or numerical input for ordering questions within a survey.
- **Content Editing:** Rich text editors for instructions and messages.

#### 6.2 Content Management

- **Image Upload:** Integrate with Payload's Media collection for managing images used in `4_image` questions.

#### 6.3 Participant Management Dashboard

- **Overview:** A custom view within Payload listing participants with `participantId`, `currentSurvey`, `lastCompletedQuestion`, and `status`.
- **Link Generation:** A "Copy Link" action button/column for each participant, generating their unique survey URL.
- **CSV Import:** Ability to upload a CSV file to create multiple participant records, including `participantId` and `metadata`. Payload will automatically generate `uniqueLinkToken` for imported participants.
- **CSV Export:** Ability to export participant data, including `uniqueLinkToken` and `status`, for external management or analysis.

#### 6.4 Response Viewing & Export

- **Raw Data View:** Administrators can view individual response records within Payload.
- **Data Export:** Critical feature for research. Ability to export `Responses` data as a CSV file, with options for filtering by survey, participant, date range, etc. This CSV will contain all captured data points, including `questionDisplayedAt`, `initialSelectionTimeMs`, `finalSelectionTimeMs`, `selectedOptionId`, `reselectionEvents` (perhaps flattened or JSON string for CSV), and `formData`.

### 7. Technical Architecture

#### 7.1 Frontend: Next.js

- **Framework:** React-based framework for building the user-facing survey application.
- **Rendering:**
  - **Server-Side Rendering (SSR):** Ideal for survey pages to dynamically fetch survey details and question data from Payload based on the URL slug and participant token, ensuring content is available for initial render and enabling search engine indexing if desired (though not critical for a private survey).
  - **API Routes:** Next.js API routes will be used to handle client-side submissions of response data to the Payload backend, ensuring data integrity and potentially performing server-side validation.
- **Performance:**
  - **Image Optimization:** Utilize Next.js `Image` component for automatic image optimization (lazy loading, responsive sizing, modern formats like WebP) to ensure rapid image display.
  - **Preloading:** Implement strategies to preload images for upcoming questions during the current question's display or during the countdown to minimize perceived loading times.
  - **Client-Side Timestamps:** Leverage `performance.now()` in the browser for highly accurate reaction time measurements, sending these timestamps to the backend.

#### 7.2 Backend & CMS: Payload

- **Framework:** Headless CMS built on Node.js, providing a robust backend API and an intuitive admin interface.
- **Deployment:** Will be deployed as a separate Node.js application, potentially on Vercel as serverless functions or a dedicated instance.
- **API Interaction:** The Next.js frontend will communicate with Payload's REST API (or GraphQL if enabled) to:
  - Fetch survey and question configurations.
  - Update participant progress (`lastCompletedQuestion`).
  - Submit detailed `Responses` data.

#### 7.3 Database: PlanetScale (MySQL)

- **Type:** Serverless MySQL database.
- **Connection:** Payload will connect to PlanetScale. An ORM (e.g., Prisma) or a raw SQL client will be used for database interactions within the Payload application.
- **Scalability:** PlanetScale's architecture offers horizontal scalability and resilience, suitable for growing data needs.

#### 7.4 Deployment: Vercel

- **Frontend Deployment:** Vercel is well-suited for deploying the Next.js frontend, providing global CDN, serverless functions for API routes, and automatic scaling.
- **Backend Deployment:** Vercel can also host the Payload Node.js application as serverless functions, simplifying the deployment pipeline and infrastructure management.

### 8. Future Considerations (Out of Scope for Initial MVP)

- **Advanced Analytics Dashboard:** In-app dashboards within Payload or a separate Next.js admin app for real-time aggregate statistics and visualizations (e.g., average reaction time per question, completion rates).
- **More Question Types:** Expansion to include video stimuli, drag-and-drop interactions, or other specialized wayfinding tasks.
- **User Authentication:** If more secure access or personalized participant dashboards are needed beyond unique links, implement a full authentication system.
- **A/B Testing Integration:** Tools to facilitate testing different survey variants.
- **External Integrations:** Connecting with external analytics platforms or data visualization tools.

---

This specification provides a detailed roadmap for the development of your Wayfinding Reaction Time Survey Tool. It covers the core requirements from user experience to technical implementation, laying a solid foundation for the project.
