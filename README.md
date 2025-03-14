# GeminiDock

GeminiDock is a modern chat application powered by Google's Gemini AI. It features a clean, intuitive interface, image upload capabilities, and secure user authentication.

## Features

- 🔒 Secure user authentication
- 💬 Chat with Gemini AI models
- 📸 Upload and analyze images
- 🌓 Dark/light theme
- 📱 Responsive design
- 💾 Secure cloud storage for chats and settings
- 📤 Export/import functionality

## Quick Start (Recommended)

For the fastest way to get started:

1. Download the latest release from [GitHub Releases](https://github.com/yourusername/geminidock/releases)
2. Extract the zip file to a location on your computer
3. Open a command prompt or terminal in the extracted folder
4. Run the following command (requires Node.js):
   ```bash
   npx serve
   ```
5. Open your browser and navigate to the URL shown in the terminal (typically http://localhost:3000)
6. Sign up for an account and enter your Gemini API key in the settings

## Alternative Ways to Run

### Using Python's HTTP Server
```bash
# Navigate to the extracted directory
cd path/to/extracted/files

# For Python 3
python -m http.server

# For Python 2
python -m SimpleHTTPServer
```
Then open your browser and navigate to http://localhost:8000.

### Using Any Web Server
You can use XAMPP, WAMP, nginx, or any other web server. Just point the server to the directory containing the extracted files.

## Running from Source Code

If you prefer to run from source or want to make modifications:

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/geminidock.git
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
2. Enter your Gemini API key in the settings (it will be securely stored with your account)
3. Start a new chat
4. Upload images or send text messages to interact with the AI
5. Use the account menu to manage your account and chats

## Security Features

- All user data is stored securely in the cloud
- Chat messages are encrypted for privacy
- API keys are stored securely with your account
- User authentication ensures only you can access your chats

## Getting a Gemini API Key

To use GeminiDock, you'll need a Gemini API key:

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Create or sign in to your Google account
3. Navigate to the API section and create an API key
4. Copy the API key and paste it into the GeminiDock settings

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Google Gemini API](https://ai.google.dev/gemini-api)
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/) 