import { useState, useCallback } from 'react';

import { alpha, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

const premiumGlass = (theme: any) => ({
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
  boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.05)}`,
  borderRadius: 3,
});

export interface AIAssistantProps {
  currentCode: string;
  language: string;
  onCodeSuggestion: (code: string) => void;
  inline?: boolean;
}

export function AICodeAssistant({ currentCode, language, onCodeSuggestion, inline = false }: AIAssistantProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Mock AI responses - in production, connect to Claude, ChatGPT, or similar
  const generateAIResponse = useCallback(async (query: string) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock AI responses based on common questions
      const lowerQuery = query.toLowerCase();
      let aiResponse = '';
      let codeSuggestions: string[] = [];

      if (lowerQuery.includes('hello') || lowerQuery.includes('print')) {
        aiResponse = `Here's how to print "Hello, World!" in ${language}:\n\n`;
        if (language === 'Python') {
          aiResponse += 'print("Hello, World!")';
          codeSuggestions = ['print("Hello, World!")', 'print("Hello")', 'msg = "Hello, World!"\nprint(msg)'];
        } else if (language === 'JavaScript' || language === 'TypeScript') {
          aiResponse += 'console.log("Hello, World!");';
          codeSuggestions = [
            'console.log("Hello, World!");',
            'console.log("Hello");',
            'const msg = "Hello, World!";\nconsole.log(msg);',
          ];
        } else if (language === 'Java') {
          aiResponse += 'System.out.println("Hello, World!");';
          codeSuggestions = [
            'System.out.println("Hello, World!");',
            'System.out.print("Hello");',
            'String msg = "Hello, World!";\nSystem.out.println(msg);',
          ];
        } else if (language === 'C++') {
          aiResponse += 'std::cout << "Hello, World!" << std::endl;';
          codeSuggestions = [
            'std::cout << "Hello, World!" << std::endl;',
            'printf("Hello, World!");',
            'std::string msg = "Hello, World!";\nstd::cout << msg;',
          ];
        }
      } else if (lowerQuery.includes('loop') || lowerQuery.includes('for')) {
        aiResponse = `Here's a basic loop in ${language}:\n\n`;
        if (language === 'Python') {
          aiResponse += 'for i in range(5):\n    print(i)';
          codeSuggestions = [
            'for i in range(5):\n    print(i)',
            'for i in range(1, 11):\n    print(i)',
            'i = 0\nwhile i < 5:\n    print(i)\n    i += 1',
          ];
        } else if (language === 'JavaScript' || language === 'TypeScript') {
          aiResponse += 'for (let i = 0; i < 5; i++) {\n  console.log(i);\n}';
          codeSuggestions = [
            'for (let i = 0; i < 5; i++) {\n  console.log(i);\n}',
            'for (let i = 1; i <= 10; i++) {\n  console.log(i);\n}',
            'let i = 0;\nwhile (i < 5) {\n  console.log(i);\n  i++;\n}',
          ];
        }
      } else if (lowerQuery.includes('function') || lowerQuery.includes('method')) {
        aiResponse = `Here's how to define a function in ${language}:\n\n`;
        if (language === 'Python') {
          aiResponse += 'def greet(name):\n    return f"Hello, {name}!"';
          codeSuggestions = [
            'def greet(name):\n    return f"Hello, {name}!"',
            'def add(a, b):\n    return a + b',
            'def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n-1)',
          ];
        } else if (language === 'JavaScript' || language === 'TypeScript') {
          aiResponse += 'function greet(name) {\n  return `Hello, ${name}!`;\n}';
          codeSuggestions = [
            'function greet(name) {\n  return `Hello, ${name}!`;\n}',
            'const add = (a, b) => a + b;',
            'function factorial(n) {\n  return n <= 1 ? 1 : n * factorial(n - 1);\n}',
          ];
        }
      } else if (lowerQuery.includes('array') || lowerQuery.includes('list')) {
        aiResponse = `Here's how to work with arrays/lists in ${language}:\n\n`;
        if (language === 'Python') {
          aiResponse += 'arr = [1, 2, 3, 4, 5]\nfor item in arr:\n    print(item)';
          codeSuggestions = [
            'arr = [1, 2, 3, 4, 5]',
            'arr = []\narr.append(1)\narr.append(2)',
            'arr = [x for x in range(10) if x % 2 == 0]',
          ];
        } else if (language === 'JavaScript' || language === 'TypeScript') {
          aiResponse += 'const arr = [1, 2, 3, 4, 5];\narr.forEach(item => console.log(item));';
          codeSuggestions = [
            'const arr = [1, 2, 3, 4, 5];',
            'const arr = [];\narr.push(1);\narr.push(2);',
            'const arr = Array.from({length: 10}, (_, i) => i);',
          ];
        }
      } else {
        aiResponse = `I can help you with ${language} programming! Try asking me about:\n- How to print output\n- How to create loops\n- How to define functions\n- How to work with arrays\n- How to use conditionals\n\nYour question: "${query}"\n\nI'm a mock AI assistant. In production, this would connect to a real AI API.`;
      }

      setResponse(aiResponse);
      setSuggestions(codeSuggestions);
    } catch (error) {
      console.error(error);
      setResponse('Error getting AI response. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [language]);

  const handleAskQuestion = useCallback(() => {
    if (!question.trim()) return;
    generateAIResponse(question);
  }, [question, generateAIResponse]);

  const handleApplySuggestion = useCallback(
    (suggestion: string) => {
      onCodeSuggestion(suggestion);
      setOpen(false);
      setQuestion('');
      setResponse('');
      setSuggestions([]);
    },
    [onCodeSuggestion]
  );

  const renderContent = () => (
    <>
       <TextField
            fullWidth
            multiline
            rows={3}
            label="Ask me anything about coding"
            placeholder="e.g., How do I create a loop? How do I define a function?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
          />

          <Button
            variant="contained"
            fullWidth
            onClick={handleAskQuestion}
            disabled={loading || !question.trim()}
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Get Help'}
          </Button>

          {response && (
            <Paper sx={{ 
                p: 3, 
                mb: 2, 
                ...premiumGlass(theme),
                bgcolor: alpha(theme.palette.background.default, 0.6),
                maxHeight: '400px', 
                overflow: 'auto',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:chat-round-line-duotone" color="primary.main"/> AI Response:
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', mb: 3, color: 'text.secondary', lineHeight: 1.6 }}>
                {response}
              </Typography>

              {suggestions.length > 0 && (
                <>
                  <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                     <Iconify icon="solar:code-file-bold-duotone" color="secondary.main"/> Code Suggestions:
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {suggestions.map((suggestion, index) => (
                      <Card 
                        key={index} 
                        sx={{ 
                            p: 0, 
                            bgcolor: '#1e1e1e', 
                            color: '#fff', 
                            borderRadius: 2,
                            overflow: 'hidden',
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                        }}
                      >
                         <Box sx={{ p: 2, bgcolor: alpha(theme.palette.common.white, 0.05), borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Suggestion {index + 1}</Typography>
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              startIcon={<Iconify icon="solar:copy-bold-duotone" />}
                              onClick={() => handleApplySuggestion(suggestion)}
                              sx={{ py: 0.5, px: 1.5, fontSize: '0.75rem', borderRadius: 1 }}
                            >
                              Use Code
                            </Button>
                         </Box>
                        <Box sx={{ p: 2, fontFamily: 'monospace', fontSize: '0.85rem', whiteSpace: 'pre-wrap', overflowX: 'auto' }}>
                           {suggestion}
                        </Box>
                      </Card>
                    ))}
                  </Box>
                </>
              )}
            </Paper>
          )}
    </>
  );

  if (inline) {
    return <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>{renderContent()}</Box>;
  }

  return (
    <>
      <Button
        variant="contained"
        color="secondary"
        size="large"
        startIcon={<Iconify icon="solar:magic-stick-3-bold-duotone" />}
        onClick={() => setOpen(true)}
        sx={{ 
            mb: 2, 
            borderRadius: 2, 
            textTransform: 'none', 
            fontWeight: 700,
            boxShadow: '0 8px 16px -4px rgba(0,0,0,0.2)',
            background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
        }}
      >
        AI Assistant
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>AI Code Assistant</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
           {renderContent()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
