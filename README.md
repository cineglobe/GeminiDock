# GeminiDock

GeminiDock is a modern chat application powered by Google's Gemini AI. It features a clean, intuitive interface, image upload capabilities, and user authentication with Supabase.

## Features

- 🔒 User authentication with Supabase
- 💬 Chat with Gemini AI models
- 📸 Upload and analyze images
- 🌓 Dark/light theme
- 📱 Responsive design
- 💾 Cloud storage for chats and API keys
- 📤 Export/import functionality

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- A Gemini API key from [Google AI Studio](https://ai.google.dev/)
- A Supabase account and project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/geminidock.git
   cd geminidock
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   > **Note:** The repository includes a sample `.env` file with the public Supabase URL and anon key. You can use these for testing, but for production, you should create your own Supabase project.

4. Set up your Supabase database:
   - Create a new Supabase project
   - Go to the SQL Editor in your Supabase dashboard
   - Copy the contents of `supabase-setup.sql` from this repository
   - Paste and run the SQL in the Supabase SQL Editor
   - Enable email/password authentication in the Auth settings
   - Configure email templates for verification emails

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:5173`

## Supabase Setup Details

### Creating the Database Tables

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of `supabase-setup.sql` from this repository
5. Run the query to create the necessary tables and security policies

### Configuring Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Under Email Auth, enable "Enable Email Signup"
3. Configure the Site URL to match your application URL
4. Customize email templates for verification emails
5. If you're using a local development environment, you may want to disable email confirmation for testing

## Deployment

To build the app for production:

```bash
npm run build
```

The built files will be in the `dist` directory, ready to be deployed to your hosting provider of choice.

## Distribution

If you're distributing this application for others to use:

1. Make sure to include the `.env` file with your Supabase URL and anon key
2. Users will need to:
   - Create their own Gemini API key
   - Sign up for an account in your Supabase project
   - Enter their API key in the settings (it will be saved to their account)

Alternatively, users can fork this repository and set up their own Supabase project by:
1. Creating a new Supabase project
2. Running the `supabase-setup.sql` script in the SQL Editor
3. Updating the `.env` file with their own Supabase URL and anon key

## Using the Application

1. Sign up for an account or log in
2. Enter your Gemini API key in the settings (it will be saved to your account)
3. Start a new chat
4. Upload images or send text messages to interact with the AI
5. Use the account menu to manage your account and chats

## Security Considerations

- The Supabase anon key included in the `.env` file is a public key that only allows access through your Row Level Security (RLS) policies
- API keys are stored securely in the Supabase database and are only accessible to the user who created them
- All data is protected by RLS policies to ensure users can only access their own data

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Google Gemini API](https://ai.google.dev/gemini-api)
- [Supabase](https://supabase.com/)
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/) 