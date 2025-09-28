# GlyphBreaker: Advanced AI Red Teaming Toolkit

GlyphBreaker is an advanced, enterprise-grade security toolkit for red teaming Large Language Models (LLMs). Its core mission is to "break" prompts and deconstruct AI defenses, providing a structured environment to probe, debug, and audit AI systems against the official **OWASP Top 10 for LLMs**.

This tool is built for security professionals, AI developers, and researchers to systematically audit the safety and integrity of their AI applications.

---

## Key Features

-   **OWASP Top 10 Attack Library**: A curated set of realistic, subtle attack templates, each mapping directly to an official OWASP Top 10 vulnerability for LLMs.
-   **Adversarial Mode**: An AI-driven attack generator that analyzes the conversation and suggests the next optimal prompt, transforming manual testing into an adaptive, guided threat simulation.
-   **Custom Attack Templates**: Define, save, and reuse your own attack scenarios directly within the UI to tailor testing to your specific needs.
-   **Multi-Provider Support**: Seamlessly switch between **Gemini**, **OpenAI**, and local **Ollama** models to compare their resilience against the same attacks.
-   **Advanced Model Configuration**: Real-time control over core sampling parameters (`Temperature`, `Top-P`, `Top-K`) to fine-tune model behavior.
-   **Deep-Learning-Based Defense Analysis**: An AI-driven security analyst that provides a real-time threat report on your conversations, framed with concepts from deep learning security.
-   **Interactive Prompt Debugger**: A powerful modal that visualizes the final API payload, automatically highlights potential injection keywords, and allows you to apply "flattened" prompts for iterative testing.
-   **Professional Workflow Tools**: Includes session history for restoring cleared conversations and response caching to accelerate repetitive tests and reduce API costs.

---

## Getting Started: A Foolproof Guide

Follow these steps carefully to set up and run GlyphBreaker on your local machine without any issues.

### Step 1: Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later is recommended)
    > **Note:** Node.js is required to manage project packages (`npm`) and to run the local development server. The application itself is a client-side tool and does not use a Node.js backend.

### Step 2: Clone the Repository

```bash
git clone https://github.com/google/glyphbreaker.git
cd glyphbreaker
```

### Step 3: Configure Your Gemini API Key (The Most Important Step)

GlyphBreaker uses the Gemini API for its core **Defense Analysis** and **Adversarial Mode** features, regardless of which model you are chatting with. **This step is mandatory for the application to function correctly.** If this key is missing, these features will fail, and you will not be able to use Gemini models in the chat.

#### 3a. Create the `.env` File

This file stores your Gemini API key securely.

1.  In the main `glyphbreaker` folder (the "root" of the project), create a new file named exactly `.env`.
    > You can do this by copying the example file. This is the recommended method:
    > ```bash
    > cp .env.example .env
    > ```

2.  **Verify the file's location.** It must be in the same directory as `package.json` and `src/`.

    ```
    glyphbreaker/
    ├── src/
    ├── .env           <-- ✅ CORRECT: Your file must be here
    ├── .env.example   <-- (This is the example file)
    ├── package.json
    └── README.md
    ```

#### 3b. Add Your API Key

1.  Open the `.env` file you just created.
2.  Add your Gemini API key inside it. You can get a key from the [Google AI Studio](https://aistudio.google.com/app/apikey).

    Your `.env` file content must look exactly like this, with no extra spaces or quotes:

    ```
    # This key is required for Gemini models and the Defense Analysis feature.
    API_KEY=YOUR_GEMINI_API_KEY_HERE
    ```
    *(Replace `YOUR_GEMINI_API_KEY_HERE` with your actual key.)*

#### 3c. Avoid Common Mistakes

-   **Wrong Name:** The file must be named `.env`, not `env`, `glyphbreaker.env`, or `.env.local`. Be careful that your text editor doesn't save it as `.env.txt`.
-   **Wrong Location:** Do not place the `.env` file inside the `src/` folder or any other sub-folder.
-   **App Was Already Running:** If you create or change the `.env` file while the application is already running, you **must** stop and restart it for the new key to be loaded.

### Step 4: Install Dependencies & Run

With your API key configured, you can now start the application.

```bash
# Install all the necessary packages
npm install

# Run the development server
npm run dev
```
*(Note: The previous instructions suggested `npm start`, but `npm run dev` is the correct command for this project.)*

The application will start, and your browser should automatically open to the correct local address. The "Defense Analysis" panel will now be fully functional.

---

## Using OpenAI and Ollama

For security, your keys and URLs for other services are handled differently:

-   **OpenAI API Keys** and **Ollama Base URLs** are **not** stored in the `.env` file.
-   You must enter them directly into the UI's "API Keys" section.
-   These credentials are stored only in your browser's local storage.

### Using Ollama (Local Models)

GlyphBreaker has first-class support for running against local models via [Ollama](https://ollama.com/).

#### 1. Install and Run Ollama

First, download and install the Ollama application for your operating system from the official website. Once installed, it runs in the background.

#### 2. Download Models

Open your terminal and pull the models that GlyphBreaker is pre-configured to use.

```bash
ollama pull llama3
ollama pull mistral
ollama pull codellama
```

#### 3. Configure CORS

For GlyphBreaker (running in your browser) to communicate with Ollama (running on your machine), you must configure Ollama's Cross-Origin Resource Sharing (CORS) policy.

##### macOS

Open the Terminal app and run these commands to set the required environment variable and restart Ollama:

```bash
# Allow any web page to connect to Ollama
launchctl setenv OLLAMA_ORIGINS "*"

# Restart Ollama to apply the change
launchctl unload ~/Library/LaunchAgents/com.ollama.ollama.plist
launchctl load ~/Library/LaunchAgents/com.ollama.ollama.plist
```

##### Windows

You need to set a system environment variable:

1.  Press the **Windows key**, type `env`, and select **"Edit the system environment variables"**.
2.  In the System Properties window, click **"Environment Variables..."**.
3.  Under "System variables", click **"New..."**.
4.  For **Variable name**, enter: `OLLAMA_ORIGINS`
5.  For **Variable value**, enter: `*`
6.  Click OK on all windows to save.
7.  **Restart your computer** for the change to take effect.

##### Linux

You need to add the variable to the Ollama systemd service.

1.  Open the service file for editing:
    ```bash
    sudo systemctl edit ollama.service
    ```
2.  This will open a text editor. Add the following lines:
    ```ini
    [Service]
    Environment="OLLAMA_ORIGINS=*"
    ```
3.  Save the file and exit the editor.
4.  Reload the systemd configuration and restart Ollama:
    ```bash
    sudo systemctl daemon-reload
    sudo systemctl restart ollama
    ```

After these steps, select "Ollama" as the provider in the GlyphBreaker UI. The status indicator next to the URL input should turn green.

---

## How to Use GlyphBreaker

### 1. Configuration Panel (Left)

This is your command center for setting up a test scenario.

-   **Model & API Keys**: Choose the AI you want to test and input credentials if required.
-   **Model Parameters**: Adjust Temperature, Top-P, and Top-K to control model behavior.
-   **Attack Templates**: Select a pre-built scenario from the OWASP Top 10 list or one of your own custom templates.
    -   Click the **"Manage"** button to open the Custom Template Manager, where you can create, edit, and delete your own attack templates for repeated use.
-   **Adversarial Mode**: After selecting an attack template that has a defined "Goal," you can enable this toggle. This activates the AI-assisted attack generation feature.
-   **System Prompt**: Define the AI's core rules, personality, and defenses. Use the suggested prompts from a template or write your own.
-   **Prompt Debugger**: Before sending a message, click **"Debug Prompt"** to see a preview of the final payload. It highlights common injection keywords in your user prompt.

### 2. Interaction Panel (Center & Right)

This is where the action happens.

-   **Chat Panel**: Your direct line to the LLM. The user prompt from an attack template appears here.
    -   When **Adversarial Mode** is active, a new **target button** appears. Click it to have the Red Team AI analyze the conversation and generate the next optimal attack step for you, streaming it directly into the input box.
-   **Defense Analysis Panel**: After a conversation, click **"Analyze"**. An AI security analyst will perform a deep threat analysis and generate a clean, professional report with an executive summary, threat vector analysis, impact assessment, and concrete defense recommendations.