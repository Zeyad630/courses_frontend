# Integration Examples

## How to Add Assignments to Your Course Room

### Example 1: Simple Assignment in Course Room

```typescript
import { AssignmentCodeEditor, Assignment } from 'src/sections/playground';

export function CourseRoomAssignments() {
  const assignment: Assignment = {
    id: 'assignment-1',
    title: 'Write Your First Program',
    description: `Write a program that prints your name.

Requirements:
- Print your name exactly as provided
- Use the appropriate print statement for your language`,
    language: 'Python',
    starterCode: '# Write your code here\nname = "Your Name"\n',
    hints: [
      'Use the print() function',
      'Pass the name variable to print()',
      'Make sure the output matches exactly'
    ],
    testCases: [
      {
        id: 'test1',
        input: '',
        expectedOutput: 'Your Name',
        description: 'Print name test'
      }
    ]
  };

  const handleSubmit = (code: string, results: ValidationResult[]) => {
    console.log('Student submitted:', code);
    console.log('Test results:', results);
    // Save to database
  };

  return (
    <Box>
      <AssignmentCodeEditor 
        assignment={assignment}
        onSubmit={handleSubmit}
      />
    </Box>
  );
}
```

### Example 2: Multiple Assignments in a Tab

```typescript
import { useState } from 'react';
import { AssignmentCodeEditor, Assignment } from 'src/sections/playground';
import { Tabs, Tab, Box } from '@mui/material';

const assignments: Assignment[] = [
  {
    id: 'assign-1',
    title: 'Hello World',
    // ... assignment details
  },
  {
    id: 'assign-2',
    title: 'Sum Calculator',
    // ... assignment details
  }
];

export function AssignmentTabs() {
  const [activeTab, setActiveTab] = useState(0);
  const [submissions, setSubmissions] = useState<Map<string, any>>(new Map());

  return (
    <Box>
      <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
        {assignments.map((a) => (
          <Tab key={a.id} label={a.title} />
        ))}
      </Tabs>

      {assignments.map((assignment, index) => (
        activeTab === index && (
          <Box key={assignment.id} sx={{ mt: 2 }}>
            <AssignmentCodeEditor
              assignment={assignment}
              onSubmit={(code, results) => {
                const newSubmissions = new Map(submissions);
                newSubmissions.set(assignment.id, { code, results });
                setSubmissions(newSubmissions);
              }}
            />
          </Box>
        )
      ))}
    </Box>
  );
}
```

### Example 3: Assignment with Progress Tracking

```typescript
import { AssignmentCodeEditor, Assignment, ValidationResult } from 'src/sections/playground';
import { Card, Box, Typography, LinearProgress, Chip } from '@mui/material';

interface AssignmentProgress {
  assignmentId: string;
  completed: boolean;
  passedTests: number;
  totalTests: number;
  submittedCode: string;
}

export function AssignmentWithProgress() {
  const [progress, setProgress] = useState<Map<string, AssignmentProgress>>(new Map());

  const assignment: Assignment = {
    id: 'prog-assign-1',
    title: 'Calculate Average',
    description: 'Calculate the average of three numbers',
    language: 'Python',
    starterCode: 'a = int(input())\nb = int(input())\nc = int(input())\n',
    hints: [
      'Add all three numbers',
      'Divide by 3',
      'Print the result'
    ],
    testCases: [
      {
        id: 'test1',
        input: '10\n20\n30',
        expectedOutput: '20.0',
        description: 'Average of 10, 20, 30'
      },
      {
        id: 'test2',
        input: '5\n5\n5',
        expectedOutput: '5.0',
        description: 'Average of equal numbers'
      }
    ]
  };

  const handleSubmit = (code: string, results: ValidationResult[]) => {
    const passedTests = results.filter(r => r.passed).length;
    const newProgress = new Map(progress);
    newProgress.set(assignment.id, {
      assignmentId: assignment.id,
      completed: passedTests === results.length,
      passedTests,
      totalTests: results.length,
      submittedCode: code
    });
    setProgress(newProgress);
  };

  const assignmentProgress = progress.get(assignment.id);

  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6">{assignment.title}</Typography>
          {assignmentProgress && (
            <Chip
              label={`${assignmentProgress.passedTests}/${assignmentProgress.totalTests}`}
              color={assignmentProgress.completed ? 'success' : 'warning'}
            />
          )}
        </Box>
        {assignmentProgress && (
          <LinearProgress
            variant="determinate"
            value={(assignmentProgress.passedTests / assignmentProgress.totalTests) * 100}
          />
        )}
      </Box>

      <AssignmentCodeEditor
        assignment={assignment}
        onSubmit={handleSubmit}
      />
    </Card>
  );
}
```

### Example 4: Using AI Assistant Standalone

```typescript
import { AICodeAssistant } from 'src/sections/playground';
import { Box, TextField } from '@mui/material';
import { useState } from 'react';

export function CodeEditorWithAI() {
  const [code, setCode] = useState('');

  return (
    <Box>
      <AICodeAssistant
        currentCode={code}
        language="Python"
        onCodeSuggestion={(suggestion) => {
          setCode(suggestion);
        }}
      />

      <TextField
        fullWidth
        multiline
        rows={10}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Your code here..."
      />
    </Box>
  );
}
```

### Example 5: Using Code Validator Standalone

```typescript
import { CodeValidator, TestCase, ValidationResult } from 'src/sections/playground';
import { Box } from '@mui/material';

export function CodeValidatorExample() {
  const testCases: TestCase[] = [
    {
      id: 'test1',
      input: '5',
      expectedOutput: '120',
      description: 'Factorial of 5'
    },
    {
      id: 'test2',
      input: '0',
      expectedOutput: '1',
      description: 'Factorial of 0'
    }
  ];

  const handleValidate = (results: ValidationResult[]) => {
    console.log('Validation results:', results);
    results.forEach(result => {
      if (result.passed) {
        console.log(`✓ ${result.testCaseId} passed`);
      } else {
        console.log(`✗ ${result.testCaseId} failed`);
        console.log(`  Expected: ${result.expectedOutput}`);
        console.log(`  Actual: ${result.actualOutput}`);
      }
    });
  };

  return (
    <Box>
      <CodeValidator
        testCases={testCases}
        onValidate={handleValidate}
      />
    </Box>
  );
}
```

## Adding to Course Room

To add assignments to the course room view:

1. **Import the component**:
```typescript
import { AssignmentCodeEditor, Assignment } from 'src/sections/playground';
```

2. **Define your assignments**:
```typescript
const assignments: Assignment[] = [
  // Your assignments here
];
```

3. **Add to course room tabs**:
```typescript
<Tabs>
  <Tab label="Materials" />
  <Tab label="Assignments" />
  <Tab label="Grades" />
</Tabs>

<TabPanel value={tabValue} index={1}>
  {/* Render assignments here */}
</TabPanel>
```

## Database Integration

When submitting assignments, save to your database:

```typescript
const handleSubmit = async (code: string, results: ValidationResult[]) => {
  const submission = {
    assignmentId: assignment.id,
    studentId: currentUser.id,
    code,
    results,
    submittedAt: new Date(),
    passed: results.every(r => r.passed)
  };

  // Save to database
  await api.post('/submissions', submission);
};
```

## Real AI Integration

Replace mock AI with real API:

```typescript
const generateAIResponse = async (query: string) => {
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
        content: `Help me with ${language} programming: ${query}`
      }]
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
};
```

## Real Code Execution

Replace mock validation with Judge0:

```typescript
const validateCode = async (code: string, testCase: TestCase) => {
  const submission = await fetch(`${JUDGE0_API_URL}/submissions`, {
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

  // Poll for results...
};
```
