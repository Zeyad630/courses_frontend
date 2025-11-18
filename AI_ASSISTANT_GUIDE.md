# AI Code Assistant & Assignment System Guide

## Overview

The AI Code Assistant and Assignment System provides an integrated learning environment where students can:
- Write and execute code in multiple languages
- Get AI-powered coding hints and suggestions
- Validate their solutions against test cases
- Complete interactive programming assignments
- Track their progress and submissions

## Features

### 1. AI Code Assistant
**Purpose**: Help students learn coding concepts and get suggestions

**Features**:
- Ask questions about coding concepts
- Get language-specific code examples
- Receive multiple code suggestions
- Apply suggestions directly to the editor

**How to Use**:
1. Click "AI Code Assistant" button
2. Ask a question (e.g., "How do I create a loop?")
3. Get AI response with code suggestions
4. Click "Use This Code" to apply a suggestion

**Supported Questions**:
- How to print output
- How to create loops
- How to define functions
- How to work with arrays/lists
- How to use conditionals

### 2. Code Validator
**Purpose**: Test code against predefined test cases

**Features**:
- Run code against multiple test cases
- View pass/fail status for each test
- Compare expected vs actual output
- Get execution metrics (time, memory)
- Visual progress indicator

**How to Use**:
1. Click "Validate Solution" button
2. Review test cases
3. Click "Run Tests"
4. View results and fix code if needed

**Test Case Structure**:
```typescript
{
  id: 'test1',
  input: '5',
  expectedOutput: '120',
  description: 'Factorial of 5'
}
```

### 3. Assignment Code Editor
**Purpose**: Complete interactive programming assignments

**Features**:
- Tabbed interface (Code, Description, Hints, Test Cases)
- AI Code Assistant integration
- Code Validator integration
- Progressive hint system
- Starter code templates
- Submit solutions with validation

**Tabs**:
- **Code**: Write and test your solution
- **Description**: Read assignment requirements
- **Hints**: Get progressive hints (unlock one at a time)
- **Test Cases**: View all test cases upfront

**How to Use**:
1. Click "Open Code Editor"
2. Read the assignment description
3. Use hints if needed
4. Write your code
5. Click "Validate Solution" to test
6. Click "Submit Solution" when ready

## Integration with Course Room

### Adding Assignments to Courses

To add assignments to your course room, use the `AssignmentCodeEditor` component:

```typescript
import { AssignmentCodeEditor, Assignment } from 'src/sections/playground';

const assignment: Assignment = {
  id: '1',
  title: 'Hello World',
  description: 'Write a program that prints "Hello, World!"',
  language: 'Python',
  starterCode: '# Write your code here\n',
  hints: [
    'Use the print() function',
    'Include the exact string: "Hello, World!"'
  ],
  testCases: [
    {
      id: 'test1',
      input: '',
      expectedOutput: 'Hello, World!',
      description: 'Basic output test'
    }
  ]
};

<AssignmentCodeEditor 
  assignment={assignment}
  onSubmit={(code, results) => {
    // Handle submission
    console.log('Code:', code);
    console.log('Results:', results);
  }}
/>
```

### Sample Assignments

Three sample assignments are included in the demo:

1. **Hello World** - Basic output
2. **Sum of Two Numbers** - Input/output and arithmetic
3. **Fibonacci Sequence** - Loops and algorithms

Access them at `/assignments` route (after adding to navigation).

## Component Architecture

### File Structure
```
src/sections/playground/view/
├── code-playground-view.tsx      # Main playground
├── ai-code-assistant.tsx         # AI helper component
├── code-validator.tsx            # Test validator component
├── assignment-code-editor.tsx    # Assignment editor
├── assignment-demo.tsx           # Demo assignments
└── index.ts                       # Exports
```

### Component Relationships

```
AssignmentCodeEditor
├── AICodeAssistant
├── CodeValidator
└── Tabbed Interface
    ├── Code Editor Tab
    ├── Description Tab
    ├── Hints Tab
    └── Test Cases Tab
```

## API Integration

### AI Code Assistant

Currently uses mock responses. To integrate with real AI:

**Option 1: OpenAI GPT**
```typescript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [{
      role: 'user',
      content: `Help me with ${language}: ${question}`
    }]
  })
});
```

**Option 2: Anthropic Claude**
```typescript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': CLAUDE_API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Help me with ${language}: ${question}`
    }]
  })
});
```

### Code Validator

Currently uses mock validation. To integrate with Judge0:

```typescript
const result = await fetch(`${JUDGE0_API_URL}/submissions`, {
  method: 'POST',
  headers: {
    'X-RapidAPI-Key': JUDGE0_API_KEY,
    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
  },
  body: JSON.stringify({
    language_id: languageId,
    source_code: code,
    stdin: testCase.input
  })
});
```

## Customization

### Adding New Languages

Edit `LANGUAGES` in `code-playground-view.tsx`:

```typescript
const LANGUAGES = [
  { id: 54, name: 'C++', ext: 'cpp' },
  { id: 50, name: 'C', ext: 'c' },
  { id: 62, name: 'Java', ext: 'java' },
  { id: 71, name: 'Python', ext: 'py' },
  { id: 63, name: 'JavaScript', ext: 'js' },
  { id: 73, name: 'TypeScript', ext: 'ts' },
  // Add more languages here
];
```

### Creating Custom Assignments

```typescript
const customAssignment: Assignment = {
  id: 'custom-1',
  title: 'Your Assignment Title',
  description: 'Detailed description of what to do',
  language: 'Python',
  starterCode: 'def solution():\n    pass\n',
  hints: [
    'First hint',
    'Second hint',
    'Third hint'
  ],
  testCases: [
    {
      id: 'test1',
      input: 'input data',
      expectedOutput: 'expected output',
      description: 'Test case description'
    }
  ]
};
```

### Modifying AI Responses

Edit the `generateAIResponse` function in `ai-code-assistant.tsx` to customize responses for different questions.

## Best Practices

### For Instructors

1. **Create Clear Assignments**
   - Write detailed descriptions
   - Provide starter code
   - Include multiple test cases

2. **Use Hints Effectively**
   - Start with general hints
   - Progress to specific hints
   - Avoid giving away the solution

3. **Design Test Cases**
   - Include edge cases
   - Test boundary conditions
   - Provide clear descriptions

### For Students

1. **Use AI Assistant Wisely**
   - Ask specific questions
   - Understand suggestions before using
   - Try to solve without hints first

2. **Validate Early and Often**
   - Test after each major change
   - Check edge cases
   - Review error messages

3. **Read Hints Progressively**
   - Try without hints first
   - Use hints when stuck
   - Don't skip to the last hint

## Troubleshooting

### AI Assistant Not Responding
- Check internet connection
- Verify API key (if using real AI)
- Check browser console for errors

### Code Validation Fails
- Review test case requirements
- Check for exact output format
- Verify input parsing

### Submission Not Working
- Ensure all test cases pass
- Check code syntax
- Verify language selection

## Future Enhancements

1. **Real AI Integration**
   - Connect to OpenAI, Claude, or Gemini
   - Personalized learning paths
   - Adaptive difficulty

2. **Advanced Features**
   - Code plagiarism detection
   - Performance benchmarking
   - Collaborative coding

3. **Analytics**
   - Student progress tracking
   - Time spent on assignments
   - Common mistakes analysis

4. **Gamification**
   - Points and badges
   - Leaderboards
   - Achievement system

## Support

For issues or questions:
1. Check the browser console for errors
2. Review this documentation
3. Check component prop types
4. Review sample assignments for examples
