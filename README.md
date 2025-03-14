# GeminiDock

GeminiDock is a "run it yourself" application that provides a clean chat interface for locally chatting with Google Gemini.

This project is intended for people who can't normally access AI on the internet due to school or work restrictions, as this project is run locally on your machine.

## Disclaimer

- This project runs on your local computer, serving a website in which you can chat with Gemini using your own API key. The project connects to our Supabase integration in order for accounts to work.
## Why do I need to make an account and what is stored? I thought this was a local app?

ℹ️ We offer account integration in order to have your chats stored within your account which are, again, end-to-end encrypted, allowing you to access them from anywhere. Your API key for Gemini is end-to-end encrypted and stored with your account.

## Features

- GeminiDock Account
-  Chat with Gemini 2.0 Flash and 1.5 Pro
-  Upload and analyze images, PDFs, Audio
-  Dark/light theme
-  Responsive design
-  Secure cloud storage for chats and settings
-  Export/import functionality

## Quick Start (Recommended)

For the fastest way to get started:

1. Download the latest release from [GitHub Releases](https://github.com/sharkdudefin12/geminidock/releases)
2. Extract the zip file to a location on your computer
3. Open a command prompt or terminal in the extracted folder
4. Run the following command (requires Node.js):
   ```bash
   npx serve
   ```
5. Open your browser and navigate to the URL shown in the terminal (typically http://localhost:3000)
6. Sign up for an account and enter your Gemini API key in the settings

# Alternative Ways to Run

## Running from Source Code

If you prefer to run from source or want to make modifications:

1. Clone the repository:
   ```bash
   git clone https://github.com/sharkdudefin12/geminidock.git
   cd geminidock
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the URL shown in the terminal (typically http://localhost:5173)

## Using the Application

1. Sign up for an account or log in
2. Enter your Gemini API key in the settings 
3. Start a new chat
4. Upload images or send text messages to interact
5. Use the account menu to manage your account and chats

## Security Features

- All user chats are stored securely on Supabase
- Chat messages are encrypted
- User authentication ensures only you can access your chats

## Getting a Gemini API Key

To use GeminiDock, you'll need a Gemini API key:

1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Navigate to the API section and create an API key
3. Copy the API key and paste it into the GeminiDock settings

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Google Gemini API](https://ai.google.dev/gemini-api)
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/) 
