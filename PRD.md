## 1. Project Overview

**Objective:**  
Build a web application that generates Twitter content—including tweets, threads, and bios—based on user input. The app will be built with Next.js (for both the client and server-side logic), use OpenAI's API for generating text, and leverage Supabase for user authentication and data storage.

**Technology Stack & Dependencies:**  
- **Frontend & Server:**  
  - **Next.js (v14):** Utilize App Router, Server Actions, and API routes for seamless client-server interaction.  
  - **React:** For building reusable UI components.
- **AI Integration:**  
  - **OpenAI API:** To generate tweet threads, individual tweets, and bios.
    - *Dependency:* `openai` npm package or integration via LangChain for advanced chaining.
- **Backend & Database:**  
  - **Supabase:** For user authentication (using Supabase Auth) and as your PostgreSQL database.
    - *Dependency:* `@supabase/supabase-js` and optionally `@supabase/auth-helpers-nextjs` for Next.js integration.
- **Authentication:**  
  - Implement Supabase's built-in authentication for secure user management.
- **Hosting & Deployment:**  
  - Utilize Vercel for hosting Next.js applications and Supabase for managed database services.

**High-Level Architecture Diagram (Textual):**  
- **Client (Browser):** Next.js client components make API calls to the backend.  
- **Next.js API Routes / Server Actions:**  
  - Serve static pages, handle form submissions, and interact with OpenAI's API for content generation.  
- **Supabase Backend:**  
  - Manage user authentication and data storage (user data, logs, generated content).  
- **OpenAI API:**  
  - Processes requests from the Next.js server and returns generated text.  
- **Data Flow:**  
  1. User logs in via Supabase Auth.
  2. User inputs a prompt (for tweet thread or bio).
  3. The Next.js server constructs a request to the OpenAI API with a well-formatted prompt.
  4. The generated content is returned and optionally saved to Supabase.

---

## 2. Features

**A. Twitter Thread Generator**  
- **Description:** Given a prompt (topic, tone, style), generate a coherent series of tweets forming a thread.
- **User Flow:**  
  1. User logs in.
  2. User enters a prompt for a thread.
  3. The app calls the OpenAI API; the result is displayed as a tweet thread.
  4. Optionally, the user can edit and post tweets manually.

**B. Individual Tweet Generator**  
- **Description:** Generate a single tweet based on user input (topic, tone, style).
- **User Flow:**  
  1. User logs in.
  2. User enters a prompt for a tweet.
  3. The app calls the OpenAI API; the result is displayed as a tweet.
  4. The user can accept or further refine the tweet.

**C. Twitter Bio Generator**  
- **Description:** Generate a professional and creative bio for a Twitter user based on their inputs (interests, career, personality).
- **User Flow:**  
  1. User enters relevant bio parameters.
  2. The app calls the OpenAI API; the result is displayed as a bio.
  3. The user can accept or further refine the bio.

**D. User Authentication & Profile Management**  
- **Description:** User sign-up, login, and profile management.
- **User Flow:**  
  1. Sign-up / Login using Supabase Auth.
  2. User profile data is stored in Supabase (e.g., username, email, history of generated content).

**D. History and Analytics Dashboard** (Optional Future Feature)  
- **Description:** Maintain a record of generated content and analytics on usage.
- **User Flow:**  
  1. After each generation, the result is stored in a database.
  2. Users can view their past prompts and generated outputs.

---

## 3. Requirements for Each Feature

### A. Twitter Thread Generator

**Functional Requirements:**
- **Input Form:**  
  - Fields:  
    - `prompt` (string): User's prompt text.
    - `thread_length` (number): Optional number of tweets (default is 5).
    - `tone` (string): Optional parameter (e.g., "casual", "professional").
- **Processing:**  
  - Server API route `/api/generate-thread` receives a JSON payload.
  - Constructs a prompt for the OpenAI API using a template such as:  
    ```
    "Generate a Twitter thread of {thread_length} tweets on the topic: '{prompt}'. Tone: {tone}. Ensure tweets are concise and engaging."
    ```
- **Output:**  
  - Returns an array of tweet strings.
- **Non-Functional Requirements:**  
  - Response time under 2 seconds for generation.
  - Proper error handling (e.g., network issues, API errors).

**Dependencies and Variable Names:**  
- Variable names:  
  - **Client Side:**  
    - `tweetPrompt` for the user's input.
    - `threadTweets` for the returned array.
  - **Server Side API:**  
    - Request body fields: `{ prompt, thread_length, tone }`.
    - OpenAI API call using model `"gpt-3.5-turbo"` or a more recent model.
    - Use environment variable `OPENAI_API_KEY`.
- **API Dependency:**  
  - OpenAI package for making the text completion call.

### B. Individual Tweet Generator

**Functional Requirements:**
- **Input Form:**  
  - Fields:  
    - `tweetPrompt` (string): User's prompt for the tweet.
    - `tone` (string): Optional parameter (e.g., "casual", "professional").
- **Processing:**  
  - Server API route `/api/generate-tweet` processes input and constructs a prompt:
    ```
    "Generate a single tweet on the topic: '{tweetPrompt}'. Tone: {tone}. Ensure the tweet is concise and engaging."
    ```
- **Output:**  
  - Returns a string (the tweet).
- **Non-Functional Requirements:**  
  - Must support personalization and immediate feedback.

**Dependencies and Variable Names:**  
- Client-side variables:  
  - `tweetInput` for the prompt.
  - `generatedTweet` for the output.
- Server-side:  
  - Request payload fields: `{ tweetPrompt, tone }`.
  - OpenAI API integration as above.

### C. Twitter Bio Generator

**Functional Requirements:**
- **Input Form:**  
  - Fields:  
    - `bioKeywords` (string): Keywords that describe the user.
    - `personalStyle` (string): Optional style indicator.
- **Processing:**  
  - Server API route `/api/generate-bio` processes input and constructs a prompt:
    ```
    "Generate a Twitter bio that reflects the following keywords: '{bioKeywords}', with a {personalStyle} style."
    ```
- **Output:**  
  - Returns a string (the bio).
- **Non-Functional Requirements:**  
  - Must support personalization and immediate feedback.

**Dependencies and Variable Names:**  
- Client-side variables:  
  - `bioInput` for keywords.
  - `generatedBio` for the output.
- Server-side:  
  - Request payload fields: `{ bioKeywords, personalStyle }`.
  - OpenAI API integration as above.

### D. User Authentication & Profile Management

**Functional Requirements:**
- **Sign-up/Login:**  
  - Use Supabase Auth for user authentication.
  - API routes handled either client-side via Supabase client or server-side using `@supabase/auth-helpers-nextjs`.
- **Profile Data:**  
  - Store additional user information in a table, e.g., table name `users`.
  - Fields:  
    - `id` (UUID from Supabase Auth),  
    - `username` (string),  
    - `email` (string),  
    - `generatedHistory` (JSON array).
- **Non-Functional Requirements:**  
  - Secure handling of credentials.
  - Minimal latency in authentication.

**Dependencies and Variable Names:**  
- Use environment variables:  
  - `NEXT_PUBLIC_SUPABASE_URL`  
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Client-side library:  
  - `@supabase/supabase-js` and `@supabase/auth-helpers-nextjs`.
- Variable names:  
  - `userProfile` for storing the logged-in user's data.
  - API endpoints as needed for user management.

### D. History and Analytics Dashboard (Optional)

**Functional Requirements:**
- **Display History:**  
  - Fetch from table (e.g., `generated_content`) that includes fields:  
    - `id`,  
    - `user_id`,  
    - `prompt`,  
    - `generated_text`,  
    - `timestamp`.
- **Analytics:**  
  - Count usage metrics such as total generations per user.
- **Non-Functional Requirements:**  
  - Fast retrieval and pagination if needed.

**Dependencies and Variable Names:**  
- API endpoint: `/api/user/history`.
- Use Supabase query functions to fetch records.
- Variable names:  
  - `contentHistory` for storing fetched history.
  
---

## 4. API Contract

### General Guidelines
- **Content-Type:** All API endpoints should accept and return JSON.
- **Authentication:**  
  - Secure API routes require Supabase authentication tokens.
- **Error Handling:**  
  - Return HTTP status codes (e.g., 200 for success, 400 for bad request, 500 for server errors) and an error message in the response JSON.

### Endpoints

#### 1. **Generate Tweet Thread**
- **Endpoint:** `POST /api/generate-thread`
- **Request Body:**
  ```json
  {
    "prompt": "string",
    "thread_length": "number (optional, default 5)",
    "tone": "string (optional, e.g., 'casual')"
  }
  ```
- **Processing:**  
  - Server constructs prompt:  
    ```
    "Generate a Twitter thread of {thread_length} tweets on the topic: '{prompt}'. Tone: {tone}. Each tweet should be less than 280 characters."
    ```
  - Calls OpenAI API.
- **Response:**
  ```json
  {
    "tweets": ["Tweet 1", "Tweet 2", "..."]
  }
  ```
- **Dependencies:**
  - Environment variable: `OPENAI_API_KEY`.
  - Use OpenAI API endpoint `https://api.openai.com/v1/completions` with model `"gpt-3.5-turbo"`.

#### 2. **Generate Individual Tweet**
- **Endpoint:** `POST /api/generate-tweet`
- **Request Body:**
  ```json
  {
    "tweetPrompt": "string",
    "tone": "string (optional)"
  }
  ```
- **Processing:**  
  - Constructs prompt:  
    ```
    "Generate a single tweet on the topic: '{tweetPrompt}'. Tone: {tone}. Ensure the tweet is concise and engaging."
    ```
  - Calls OpenAI API.
- **Response:**
  ```json
  {
    "tweet": "Generated tweet..."
  }
  ```
- **Dependencies:**
  - Same as above (OpenAI API).

#### 3. **Generate Twitter Bio**
- **Endpoint:** `POST /api/generate-bio`
- **Request Body:**
  ```json
  {
    "bioKeywords": "string",
    "personalStyle": "string (optional)"
  }
  ```
- **Processing:**  
  - Constructs prompt:  
    ```
    "Generate a creative Twitter bio using these keywords: '{bioKeywords}' with a {personalStyle} tone."
    ```
  - Calls OpenAI API.
- **Response:**
  ```json
  {
    "bio": "Generated Twitter bio..."
  }
  ```
- **Dependencies:**
  - Same as above (OpenAI API).

#### 4. **User Authentication (handled by Supabase)**
- **Endpoints:**  
  - Use Supabase's built-in endpoints for sign-up and login.
  - For example, a client-side call:
    ```js
    const { user, session, error } = await supabase.auth.signUp({
      email: emailValue,
      password: passwordValue
    });
    ```
- **Synchronization:**  
  - Use Supabase webhooks (or Next.js API routes that listen for user creation events) to mirror user data into your custom `users` table if additional fields are required.
- **Variable Names:**  
  - User's unique ID: `user.id`
  - Additional fields: `username`, `email`.

#### 5. **Fetch User History**
- **Endpoint:** `GET /api/user/history?userId=<userId>`
- **Processing:**  
  - Query Supabase table `generated_content` filtering by `user_id`.
- **Response:**
  ```json
  {
    "history": [
      {
        "id": "string",
        "prompt": "string",
        "generated_text": "string",
        "timestamp": "ISO8601 string"
      },
      "..."
    ]
  }
  ```
- **Dependencies:**  
  - Use Supabase client library with appropriate authentication.

