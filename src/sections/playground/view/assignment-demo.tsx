import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import { AssignmentCodeEditor } from './assignment-code-editor';

import type { ValidationResult } from './code-validator';
import type { Assignment } from './assignment-code-editor';

// Sample assignments for demonstration
const SAMPLE_ASSIGNMENTS: Assignment[] = [
  {
    id: '1',
    title: 'Hello World',
    description: `Write a program that prints "Hello, World!" to the console.

This is a simple warm-up exercise to get you familiar with the code editor.

Requirements:
- Print exactly "Hello, World!" (with the comma and exclamation mark)
- Use the appropriate print statement for your language`,
    language: 'Python',
    starterCode: '# Write your code here\n',
    hints: [
      'Use the print() function to output text',
      'Remember to include the exact string: "Hello, World!"',
      'Make sure the capitalization and punctuation are correct',
    ],
    testCases: [
      {
        id: 'test1',
        input: '',
        expectedOutput: 'Hello, World!',
        description: 'Basic output test',
      },
    ],
  },
  {
    id: '2',
    title: 'Sum of Two Numbers',
    description: `Write a program that reads two numbers and prints their sum.

Requirements:
- Read two numbers from input (separated by newline)
- Calculate their sum
- Print the result`,
    language: 'Python',
    starterCode: '# Read two numbers\na = int(input())\nb = int(input())\n\n# Calculate and print sum\n',
    hints: [
      'Use int(input()) to read integers from input',
      'Add the two numbers together',
      'Use print() to output the result',
    ],
    testCases: [
      {
        id: 'test1',
        input: '5\n3',
        expectedOutput: '8',
        description: 'Sum of 5 and 3',
      },
      {
        id: 'test2',
        input: '10\n20',
        expectedOutput: '30',
        description: 'Sum of 10 and 20',
      },
    ],
  },
  {
    id: '3',
    title: 'Fibonacci Sequence',
    description: `Write a program that generates the first N Fibonacci numbers.

The Fibonacci sequence starts with 0 and 1, and each subsequent number is the sum of the previous two.

Requirements:
- Read N from input
- Generate and print the first N Fibonacci numbers
- Print each number on a new line`,
    language: 'Python',
    starterCode: `# Read N
n = int(input())

# Generate Fibonacci sequence
`,
    hints: [
      'Start with two variables: a = 0, b = 1',
      'Use a loop to generate N numbers',
      'In each iteration, print the current number and update a and b',
      'Remember: next = a + b, then a = b, b = next',
    ],
    testCases: [
      {
        id: 'test1',
        input: '5',
        expectedOutput: '0\n1\n1\n2\n3',
        description: 'First 5 Fibonacci numbers',
      },
      {
        id: 'test2',
        input: '8',
        expectedOutput: '0\n1\n1\n2\n3\n5\n8\n13',
        description: 'First 8 Fibonacci numbers',
      },
    ],
  },
];

export function AssignmentDemo() {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Map<string, { code: string; results: ValidationResult[] }>>(
    new Map()
  );

  const handleSubmit = useCallback(
    (code: string, results: ValidationResult[]) => {
      if (selectedAssignment) {
        const newSubmissions = new Map(submissions);
        newSubmissions.set(selectedAssignment.id, { code, results });
        setSubmissions(newSubmissions);
      }
    },
    [selectedAssignment, submissions]
  );

  return (
    <DashboardContent>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            Programming Assignments
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Practice your coding skills with interactive assignments. Get hints, validate your code, and submit solutions.
          </Typography>
        </Box>

        {selectedAssignment ? (
          <Box>
            <AssignmentCodeEditor assignment={selectedAssignment} onSubmit={handleSubmit} />

            {submissions.has(selectedAssignment.id) && (
              <Alert severity="success" sx={{ mt: 2 }}>
                ✅ Assignment submitted! Check your results in the validation dialog.
              </Alert>
            )}
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
            {SAMPLE_ASSIGNMENTS.map((assignment) => {
              const submission = submissions.get(assignment.id);
              const passedTests = submission
                ? submission.results.filter((r) => r.passed).length
                : 0;
              const totalTests = assignment.testCases.length;

              return (
                <Card
                  key={assignment.id}
                  sx={{
                    p: 3,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
                      transform: 'translateY(-4px)',
                    },
                  }}
                  onClick={() => setSelectedAssignment(assignment)}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {assignment.title}
                    </Typography>
                    {submission && (
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: passedTests === totalTests ? '#ECFDF5' : '#FEF3C7',
                          border: '1px solid',
                          borderColor: passedTests === totalTests ? '#10B981' : '#F59E0B',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 600,
                            color: passedTests === totalTests ? '#10B981' : '#F59E0B',
                          }}
                        >
                          {passedTests}/{totalTests} Passed
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: '60px' }}>
                    {assignment.description.split('\n')[0]}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Box
                      sx={{
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: 'primary.lighter',
                        color: 'primary.main',
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {assignment.language}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: 'info.lighter',
                        color: 'info.main',
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {assignment.testCases.length} Test Cases
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: 'warning.lighter',
                        color: 'warning.main',
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {assignment.hints.length} Hints
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              );
            })}
          </Box>
        )}
      </Container>
    </DashboardContent>
  );
}
