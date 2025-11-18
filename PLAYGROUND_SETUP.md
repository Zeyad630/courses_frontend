# Code Playground Setup Guide

## Overview
The Code Playground feature allows students to write, execute, and test code in multiple programming languages directly within the application using the Judge0 API.

## Prerequisites

1. **Judge0 API Account**
   - Visit: https://rapidapi.com/judge0-official/api/judge0-ce
   - Sign up for a free account
   - Subscribe to the Judge0 API (free tier available)
   - Get your API key from the dashboard

## Setup Instructions

### Step 1: Create Environment File

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Or manually create `.env.local` in the project root with:
   ```
   VITE_JUDGE0_API_KEY=your-judge0-api-key-here
   ```

### Step 2: Add Your API Key

1. Go to https://rapidapi.com/judge0-official/api/judge0-ce
2. Log in to your account
3. Copy your API key from the dashboard
4. Replace `your-judge0-api-key-here` in `.env.local` with your actual API key

### Step 3: Restart Dev Server

```bash
npm run dev
```

The dev server will automatically pick up the new environment variables.

## Usage

### Accessing the Playground

1. **Login** to the application with your credentials
2. Click **"Code Playground"** in the left navigation menu
3. You'll see the code editor interface

### Writing and Executing Code

1. **Select a Language**: Choose from the dropdown (C++, C, Java, Python, JavaScript, TypeScript)
2. **Write Code**: Enter your code in the editor
3. **Add Input** (optional): Provide standard input if your program needs it
4. **Run Code**: Click the "Run Code" button
5. **View Results**: See execution output, status, time, and memory usage

### Saving Code Snippets

1. Click the **"Save"** button
2. Enter a name for your snippet
3. Click **"Save"** in the dialog
4. Your snippet is saved to browser storage

### Loading Saved Snippets

1. Click the **"Saved Snippets"** tab
2. Find your snippet in the list
3. Click **"Load"** to open it in the editor
4. Click **"Delete"** to remove it

## Supported Languages

| Language   | File Extension |
|-----------|-----------------|
| C++       | .cpp            |
| C         | .c              |
| Java      | .java           |
| Python    | .py             |
| JavaScript| .js             |
| TypeScript| .ts             |

## Features

✅ **Real-time Code Execution** - Execute code instantly with Judge0
✅ **Multiple Languages** - Support for 6 programming languages
✅ **Error Handling** - Detailed error messages and compilation output
✅ **Performance Metrics** - View execution time and memory usage
✅ **Code Snippets** - Save and manage code snippets locally
✅ **Responsive Design** - Works on desktop and mobile devices
✅ **Modern UI** - Professional Material-UI interface with red theme

## Troubleshooting

### Error: "ReferenceError: process is not defined"
- Make sure you're using `VITE_` prefix for environment variables
- Restart the dev server after adding `.env.local`

### Error: "API Key Invalid"
- Verify your API key is correct in `.env.local`
- Check that you've subscribed to Judge0 on RapidAPI
- Ensure the key is copied without extra spaces

### Code Execution Timeout
- Judge0 has execution time limits
- Check your code for infinite loops
- Try with simpler code first

### Snippets Not Saving
- Check browser localStorage is enabled
- Clear browser cache if having issues
- Try a different browser

## API Rate Limits

The free tier of Judge0 has rate limits:
- Check RapidAPI dashboard for your specific limits
- Upgrade to a paid plan if you need higher limits

## Security Notes

- Never commit `.env.local` to version control (it's in `.gitignore`)
- Keep your API key private
- Don't share your API key in code or documentation

## Support

For issues with Judge0 API:
- Visit: https://judge0.com/
- Check API documentation: https://judge0.com/docs

For issues with the playground feature:
- Check the browser console for error messages
- Verify environment variables are set correctly
- Ensure dev server is running with `npm run dev`
