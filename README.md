# GlyphBreaker: Advanced AI Red Teaming Toolkit

![GlyphBreaker UI Screenshot](https://i.imgur.com/2YyL2qg.png)

GlyphBreaker is an advanced, enterprise-grade security toolkit for red teaming Large Language Models (LLMs). Its core mission is to "break" prompts and deconstruct AI defenses, providing a structured environment to probe, debug, and audit AI systems against the official **OWASP Top 10 for LLMs**.

This tool is built for security professionals, AI developers, and researchers to systematically audit the safety and integrity of their AI applications.

---

## Key Features

- **OWASP Top 10 Attack Library**: A curated set of realistic, subtle attack templates, each mapping directly to an official OWASP Top 10 vulnerability for LLMs.
- **Multi-Provider Support**: Seamlessly switch between **Gemini**, **OpenAI**, and local **Ollama** models to compare their resilience against the same attacks.
- **Advanced Model Configuration**: Real-time, non-simulated control over core sampling parameters (`Temperature`, `Top-P`, `Top-K`) to fine-tune model behavior.
- **Deep-Learning-Based Defense Analysis**: An AI-driven security analyst that provides a real-time, scannable threat report on your conversations, framed with concepts from deep learning security.
- **Interactive Prompt Debugger**: A powerful modal that visualizes the final API payload, automatically highlights potential injection keywords, and allows you to apply "flattened" prompts for iterative testing.
- **Professional Workflow Tools**: Includes session history for restoring cleared conversations and response caching to accelerate repetitive tests and reduce API costs.

---

## Getting Started: Local Setup

Follow these instructions to run GlyphBreaker on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### 1. Clone the Repository

```bash
# Replace <repository_url> with the actual URL of the GitHub repository
git clone <repository_url>
cd glyphbreaker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure API Keys

GlyphBreaker requires a Gemini API key to power its core features, especially the Defense Analysis.

1.  **Create a `.env` file** in the root directory of the project.
2.  **Add your Gemini API key** to this file. You can get one from the [Google AI Studio](https://aistudio.google.com/app/apikey).

Your `.env` file should look like this:

```
# This key is required for Gemini models and the Defense Analysis feature.
API_KEY=YOUR_GEMINI_API_KEY_HERE
```

**Important:**
- The **Gemini** key is loaded from this `.env` file automatically.
- **OpenAI** API keys and **Ollama** base URLs are **not** stored in a file. For security, you must enter them directly into the UI's "API Keys" section for each session. They are not saved or persisted anywhere.

### 4. Run the Application

```bash
npm start
```

The application should now be running on `http://localhost:3000` (or another port if 3000 is in use).

---

## How to Use GlyphBreaker

### The Interface

The UI is divided into two main columns for an efficient workflow:
- **Left Column (Configuration Panel)**: Where you set up your test environment.
- **Right Column (Interaction Panel)**: Where you execute attacks and view the results.

### 1. Configuration Panel

This is your command center for setting up a test scenario.

- **Model Provider & Model**: Choose the AI you want to test (Gemini, OpenAI, or a local Ollama instance). The model dropdown will update with options for the selected provider.
- **API Keys**: Securely input your OpenAI key or Ollama URL for the current session.
- **Model Parameters**:
    - **Temperature**: Controls creativity (0.0 = deterministic, 1.0 = highly creative).
    - **Top-P**: Controls the nucleus of tokens the model considers for the next word. A value of `0.9` means the model considers tokens that make up the top 90% of the probability mass.
    - **Top-K**: Limits the model's choices to the `K` most likely next tokens. *Note: This is hidden for OpenAI, as their API does not use this parameter.*
- **Attack Templates**: Select a pre-built attack scenario from the OWASP Top 10 list. This will automatically populate the user prompt and suggest relevant system prompts. Hover over the info icon (`ℹ️`) for a description of each attack.
- **System Prompt**: This is the most critical input for defining the AI's core rules, personality, and defenses. Use the suggested prompts from a template or write your own.
- **Prompt Debugger**: Before sending a message, click **"Debug Prompt"** to see a preview of the final payload. It highlights common injection keywords in your user prompt. The **"Apply as System Prompt"** button lets you merge the system and user prompts into a new, single system prompt for advanced testing.

### 2. Interaction Panel

This is where the action happens.

- **Chat Panel**: This is your direct line to the LLM. The user prompt from an attack template appears here, ready to be sent. The conversation history is maintained for context.
- **Defense Analysis Panel**: After a conversation, click **"Analyze"**. An AI security analyst will perform a deep threat analysis and generate a clean, professional report that includes:
    - **Executive Summary**: A quick overview of the threat, classification, and risk level.
    - **Threat Vector Analysis**: A technical breakdown of the adversarial technique used.
    - **Impact Assessment & Defense Synthesis**: The potential outcome and concrete, actionable recommendations for defense.