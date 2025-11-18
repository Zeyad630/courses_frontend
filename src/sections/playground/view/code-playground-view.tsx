import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

// Judge0 API configuration
const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = import.meta.env.VITE_JUDGE0_API_KEY || 'your-api-key-here';

// Supported languages
const LANGUAGES = [
  { id: 54, name: 'C++', ext: 'cpp' },
  { id: 50, name: 'C', ext: 'c' },
  { id: 62, name: 'Java', ext: 'java' },
  { id: 71, name: 'Python', ext: 'py' },
  { id: 63, name: 'JavaScript', ext: 'js' },
  { id: 73, name: 'TypeScript', ext: 'ts' },
];

// Sample code templates
const CODE_TEMPLATES: { [key: number]: string } = {
  54: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
  50: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
  62: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  71: `print("Hello, World!")`,
  63: `console.log("Hello, World!");`,
  73: `console.log("Hello, World!");`,
};

interface ExecutionResult {
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  status_id: number;
  status: { id: number; description: string };
  time: string;
  memory: string;
}

function TabPanel(props: any) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export function CodePlaygroundView() {
  const [language, setLanguage] = useState(71); // Python by default
  const [code, setCode] = useState(CODE_TEMPLATES[71]);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [snippetName, setSnippetName] = useState('');
  const [savedSnippets, setSavedSnippets] = useState<Array<{ name: string; code: string; language: number }>>([]);

  // Save snippet to localStorage
  const saveSnippet = useCallback(() => {
    if (!snippetName.trim()) {
      setError('Please enter a snippet name');
      return;
    }

    const newSnippet = { name: snippetName, code, language };
    const updated = [...savedSnippets, newSnippet];
    setSavedSnippets(updated);
    localStorage.setItem('codeSnippets', JSON.stringify(updated));
    setSaveDialogOpen(false);
    setSnippetName('');
    setError('');
  }, [snippetName, code, language, savedSnippets]);

  // Load snippet
  const loadSnippet = useCallback((snippet: any) => {
    setCode(snippet.code);
    setLanguage(snippet.language);
    setError('');
    setOutput('');
  }, []);

  // Delete snippet
  const deleteSnippet = useCallback((index: number) => {
    const updated = savedSnippets.filter((_, i) => i !== index);
    setSavedSnippets(updated);
    localStorage.setItem('codeSnippets', JSON.stringify(updated));
  }, [savedSnippets]);

  // Execute code using Judge0
  const executeCode = useCallback(async () => {
    if (!code.trim()) {
      setError('Please enter some code');
      return;
    }

    setLoading(true);
    setError('');
    setOutput('');
    setExecutionResult(null);

    try {
      // Submit code for execution
      const submitResponse = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=false`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': JUDGE0_API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        },
        body: JSON.stringify({
          language_id: language,
          source_code: code,
          stdin: input || '',
        }),
      });

      if (!submitResponse.ok) {
        throw new Error('Failed to submit code');
      }

      const submission = await submitResponse.json();
      const token = submission.token;

      // Poll for result
      let result = null;
      let attempts = 0;
      const maxAttempts = 30;

      while (attempts < maxAttempts) {
        const resultResponse = await fetch(`${JUDGE0_API_URL}/submissions/${token}?base64_encoded=false`, {
          headers: {
            'X-RapidAPI-Key': JUDGE0_API_KEY,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          },
        });

        if (!resultResponse.ok) {
          throw new Error('Failed to fetch result');
        }

        result = await resultResponse.json();

        // Status 1 = In Queue, 2 = Processing
        if (result.status.id > 2) {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
        attempts += 1;
      }

      setExecutionResult(result);

      if (result.status.id === 3) {
        // Accepted
        setOutput(result.stdout || '(No output)');
      } else if (result.status.id === 4) {
        // Wrong Answer
        setError('Wrong Answer');
        setOutput(result.stdout || '');
      } else if (result.status.id === 5) {
        // Time Limit Exceeded
        setError('Time Limit Exceeded');
      } else if (result.status.id === 6) {
        // Compilation Error
        setError('Compilation Error');
        setOutput(result.compile_output || '');
      } else if (result.status.id === 7) {
        // Runtime Error
        setError('Runtime Error');
        setOutput(result.stderr || '');
      } else {
        setError(`Execution failed: ${result.status.description}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [code, language, input]);

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            Code Playground
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Write, execute, and test your code in multiple programming languages
          </Typography>
        </Box>

        {/* Main Layout */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3, mb: 4 }}>
          {/* Code Editor Section */}
          <Card sx={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)' }}>
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Code Editor
              </Typography>

              {/* Language Selector */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Language</InputLabel>
                <Select
                  value={language}
                  label="Language"
                  onChange={(e) => {
                    const newLang = e.target.value as number;
                    setLanguage(newLang);
                    setCode(CODE_TEMPLATES[newLang] || '');
                  }}
                >
                  {LANGUAGES.map((lang) => (
                    <MenuItem key={lang.id} value={lang.id}>
                      {lang.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Code Input */}
              <TextField
                fullWidth
                multiline
                rows={15}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter your code here..."
                variant="outlined"
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'monospace',
                  },
                }}
              />

              {/* Input Section */}
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Standard Input
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter input for your program (if needed)..."
                variant="outlined"
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'monospace',
                  },
                }}
              />

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Iconify icon="solar:eye-bold" />}
                  onClick={executeCode}
                  disabled={loading}
                  sx={{ flex: 1 }}
                >
                  {loading ? 'Executing...' : 'Run Code'}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Iconify icon="solar:pen-bold" />}
                  onClick={() => setSaveDialogOpen(true)}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Iconify icon="solar:restart-bold" />}
                  onClick={() => {
                    setCode(CODE_TEMPLATES[language] || '');
                    setInput('');
                    setOutput('');
                    setError('');
                  }}
                >
                  Reset
                </Button>
              </Box>
            </Box>
          </Card>

          {/* Output Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Status */}
            {executionResult && (
              <Paper sx={{ p: 2, bgcolor: 'background.neutral' }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={executionResult.status.description}
                      color={executionResult.status.id === 3 ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Time
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {executionResult.time}s
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Memory
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {executionResult.memory}KB
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}

            {/* Error Alert */}
            {error && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {/* Output Display */}
            <Card sx={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)', flex: 1 }}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Output
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: '#1a1a1a',
                    color: '#00ff00',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    minHeight: '200px',
                    maxHeight: '400px',
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                      <CircularProgress />
                    </Box>
                  ) : output ? (
                    output
                  ) : (
                    <Typography sx={{ color: '#666' }}>Run your code to see output here...</Typography>
                  )}
                </Paper>
              </Box>
            </Card>
          </Box>
        </Box>

        {/* Snippets Section */}
        <Card sx={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Saved Snippets" icon={<Iconify icon="solar:pen-bold" />} iconPosition="start" />
              <Tab label="Documentation" icon={<Iconify icon="solar:eye-bold" />} iconPosition="start" />
            </Tabs>
          </Box>

          {/* Saved Snippets Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ p: 3 }}>
              {savedSnippets.length === 0 ? (
                <Typography color="text.secondary">No saved snippets yet. Save your code to see it here!</Typography>
              ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                  {savedSnippets.map((snippet, index) => (
                    <Paper key={index} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                        {snippet.name}
                      </Typography>
                      <Chip
                        label={LANGUAGES.find((l) => l.id === snippet.language)?.name || 'Unknown'}
                        size="small"
                        sx={{ mb: 2 }}
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          fullWidth
                          onClick={() => loadSnippet(snippet)}
                        >
                          Load
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          onClick={() => deleteSnippet(index)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          </TabPanel>

          {/* Documentation Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Supported Languages
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                {LANGUAGES.map((lang) => (
                  <Paper key={lang.id} sx={{ p: 2, bgcolor: 'background.neutral' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {lang.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      File extension: .{lang.ext}
                    </Typography>
                  </Paper>
                ))}
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 700, mt: 4, mb: 2 }}>
                Features
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Write code in multiple programming languages
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Execute code with custom input
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Save and load code snippets
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  View execution time and memory usage
                </Typography>
                <Typography component="li" variant="body2">
                  Real-time error reporting
                </Typography>
              </Box>
            </Box>
          </TabPanel>
        </Card>
      </Container>

      {/* Save Snippet Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save Code Snippet</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Snippet Name"
            value={snippetName}
            onChange={(e) => setSnippetName(e.target.value)}
            placeholder="e.g., Fibonacci Function"
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveSnippet}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
