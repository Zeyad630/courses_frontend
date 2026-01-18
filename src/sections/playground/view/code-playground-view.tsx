import { useState, useCallback, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Fade from '@mui/material/Fade';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';

import { AICodeAssistant } from './ai-code-assistant';

const premiumGlass = (theme: any) => ({
  background: alpha(theme.palette.background.paper, 0.6),
  backdropFilter: 'blur(12px)',
  border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
  boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.05)}`,
  borderRadius: 3,
});

// Judge0 API configuration
const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = import.meta.env.VITE_JUDGE0_API_KEY || 'your-api-key-here';

// Supported languages
const LANGUAGES = [
  { id: 63, name: 'JavaScript', monacoId: 'javascript', ext: 'js' },
  { id: 74, name: 'TypeScript', monacoId: 'typescript', ext: 'ts' },
  { id: 71, name: 'Python', monacoId: 'python', ext: 'py' },
  { id: 62, name: 'Java', monacoId: 'java', ext: 'java' },
  { id: 54, name: 'C++', monacoId: 'cpp', ext: 'cpp' },
  { id: 50, name: 'C', monacoId: 'c', ext: 'c' },
];

// Sample code templates
const CODE_TEMPLATES: { [key: number]: string } = {
  63: `// JavaScript Playground
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci sequence:");
for (let i = 0; i < 10; i++) {
  console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}`,
  74: `// TypeScript Playground
interface User {
  name: string;
  age: number;
}

const greet = (user: User): string => {
  return \`Hello, \${user.name}! You are \${user.age} years old.\`;
};

const user: User = { name: "Alex", age: 25 };
console.log(greet(user));`,
  71: `# Python Playground
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print("Fibonacci sequence:")
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")`,
  62: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
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
}`
};

interface ExecutionResult {
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  status: { id: number; description: string };
  time: string;
  memory: string;
}

function CustomTabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other} style={{ height: '100%', display: value === index ? 'flex' : 'none', flexDirection: 'column' }}>
      {value === index && (
        <Box sx={{ p: 2, flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export function CodePlaygroundView() {
  const theme = useTheme();
  const [language, setLanguage] = useState(63); // JavaScript default
  const [code, setCode] = useState(CODE_TEMPLATES[63]);
  const [input, setInput] = useState('');
  const [tabValue, setTabValue] = useState(0);
  
  const [loading, setLoading] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const editorRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (event: any) => {
    const newId = event.target.value;
    setLanguage(newId);
    setCode(CODE_TEMPLATES[newId] || '');
    setExecutionResult(null);
    setError('');
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const executeCode = useCallback(async () => {
    if (!code.trim()) {
      setError('Please enter some code');
      setTabValue(0); // Switch to Output tab
      return;
    }

    setLoading(true);
    setError('');
    setExecutionResult(null);
    setTabValue(0); // Switch to Output tab

    try {
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

      if (!submitResponse.ok) throw new Error('Failed to submit code');
      const { token } = await submitResponse.json();

      let result = null;
      let attempts = 0;
      while (attempts < 20) {
        const resultResponse = await fetch(`${JUDGE0_API_URL}/submissions/${token}?base64_encoded=false`, {
          headers: {
            'X-RapidAPI-Key': JUDGE0_API_KEY,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          },
        });
        if (!resultResponse.ok) throw new Error('Failed to fetch result');
        result = await resultResponse.json();
        if (result.status.id > 2) break; // Finished
        await new Promise((r) => setTimeout(r, 1000));
        attempts++;
      }

      setExecutionResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Execution failed');
    } finally {
      setLoading(false);
    }
  }, [code, language, input]);

  const currentLangName = LANGUAGES.find(l => l.id === language)?.monacoId || 'javascript';

  return (
    <DashboardContent maxWidth="xl" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', pb: 0, pt: { xs: 8, md: 2 } }}>
       {/* Premium Header */}
       <Box
          sx={{
            mb: 2,
            p: 2.5,
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
           {/* Background Mesh Gradient */}
           <Box sx={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: `radial-gradient(at 0% 0%, ${alpha(theme.palette.secondary.dark, 0.8)} 0px, transparent 50%),
                           radial-gradient(at 100% 0%, ${alpha(theme.palette.primary.main, 0.9)} 0px, transparent 50%),
                           linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)`, 
              zIndex: 0
           }} />

           <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
             <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.common.white, 0.1) }}>
                <Iconify icon="solar:code-square-bold" width={32} sx={{ color: 'common.white' }} />
             </Box>
             <Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: 'common.white', lineHeight: 1 }}>
                  Code Playground
                </Typography>
                <Typography variant="caption" sx={{ color: 'common.white', opacity: 0.7 }}>
                  Advanced Editor & Runtime
                </Typography>
             </Box>
           </Box>

           <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', gap: 1 }}>
              <Select
                value={language}
                onChange={handleLanguageChange}
                size="small"
                sx={{ 
                    bgcolor: alpha(theme.palette.common.white, 0.1), 
                    color: 'common.white',
                    '.MuiSelect-icon': { color: 'common.white' },
                    borderRadius: 2,
                    minWidth: 140,
                    border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`
                }}
              >
                {LANGUAGES.map((lang) => (
                    <MenuItem key={lang.id} value={lang.id}>{lang.name}</MenuItem>
                ))}
              </Select>
           </Box>
        </Box>

       {/* Main Split Layout */}
       <Box sx={{ 
           flex: 1, 
           display: 'grid', 
           gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, 
           gap: 2, 
           minHeight: 0, 
           pb: 2 
       }}>
            {/* Left Panel: Editor */}
            <Card sx={{ 
                ...premiumGlass(theme), 
                display: 'flex', 
                flexDirection: 'column',
                overflow: 'hidden',
                background: alpha('#1e1e1e', 0.6) // Darker for editor contrast
            }}>
                {/* Editor Toolbar */}
                <Box sx={{ 
                    p: 1.5, 
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Iconify icon="solar:file-code-bold-duotone" /> 
                        main.{LANGUAGES.find(l => l.id === language)?.ext}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Reset Code">
                            <IconButton size="small" onClick={() => setCode(CODE_TEMPLATES[language] || '')} sx={{ color: 'white' }}>
                                <Iconify icon="solar:restart-bold" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={copied ? 'Copied!' : 'Copy Code'}>
                            <IconButton size="small" onClick={handleCopyCode} sx={{ color: copied ? 'white' : 'text.secondary' }}>
                                <Iconify icon={copied ? "solar:check-read-bold" : "solar:copy-bold"} />
                            </IconButton>
                        </Tooltip>
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={executeCode}
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={16} color="success"/> : <Iconify icon="solar:play-bold" />}
                            sx={{ 
                                borderRadius: 2, 
                                fontWeight: 700, 
                                boxShadow: theme.shadows[8],
                                px: 3
                            }}
                        >
                            {loading ? 'Running...' : 'Run'}
                        </Button>
                    </Box>
                </Box>

                {/* Monaco Editor */}
                <Box sx={{ flex: 1, position: 'relative' }}>
                    <Editor
                        height="100%"
                        language={currentLangName}
                        value={code}
                        onChange={(value) => setCode(value || '')}
                        onMount={handleEditorDidMount}
                        theme="vs-dark"
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                            padding: { top: 20 },
                            scrollBeyondLastLine: false,
                            smoothScrolling: true,
                            cursorBlinking: 'smooth',
                            cursorSmoothCaretAnimation: 'on',
                            formatOnPaste: true,
                            roundedSelection: true,
                        }}
                    />
                </Box>
            </Card>

            {/* Right Panel: Tools */}
            <Card sx={{ ...premiumGlass(theme), display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Box sx={{ borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    <Tabs 
                        value={tabValue} 
                        onChange={(e, v) => setTabValue(v)} 
                        variant="fullWidth"
                        sx={{
                            minHeight: 48,
                            '& .MuiTab-root': {
                                minHeight: 48,
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                opacity: 0.7,
                                '&.Mui-selected': { opacity: 1, color: 'primary.main' }
                            }
                        }}
                    >
                        <Tab icon={<Iconify icon="solar:terminal-line-duotone" width={20}/>} iconPosition="start" label="Output" />
                        <Tab icon={<Iconify icon="solar:keyboard-bold-duotone" width={20}/>} iconPosition="start" label="Input" />
                        <Tab icon={<Iconify icon="solar:magic-stick-3-bold-duotone" width={20}/>} iconPosition="start" label="AI Help" />
                    </Tabs>
                </Box>

                {/* Output Tab */}
                <CustomTabPanel value={tabValue} index={0}>
                    {error ? (
                         <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.error.main, 0.1), border: `1px solid ${theme.palette.error.main}` }}>
                            <Typography color="error" variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Iconify icon="solar:danger-triangle-bold" /> Execution Error
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1, fontFamily: 'monospace' }}>{error}</Typography>
                         </Paper>
                    ) : executionResult ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {/* Status Chips */}
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Paper sx={{ px: 1.5, py: 0.5, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Iconify icon="solar:clock-circle-bold" width={14} color="success.main" />
                                    <Typography variant="caption" color="success.main" fontWeight={700}>
                                        {executionResult.time}s
                                    </Typography>
                                </Paper>
                                <Paper sx={{ px: 1.5, py: 0.5, bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Iconify icon="solar:cpu-bold" width={14} color="info.main" />
                                    <Typography variant="caption" color="info.main" fontWeight={700}>
                                        {executionResult.memory}KB
                                    </Typography>
                                </Paper>
                                {executionResult.status.id !== 3 && (
                                     <Paper sx={{ px: 1.5, py: 0.5, bgcolor: alpha(theme.palette.warning.main, 0.1), borderRadius: 1 }}>
                                         <Typography variant="caption" color="warning.main" fontWeight={700}>
                                             {executionResult.status.description}
                                         </Typography>
                                     </Paper>
                                )}
                            </Box>

                            {/* Console Output */}
                            <Paper sx={{ 
                                p: 2, 
                                bgcolor: '#1e1e1e', 
                                color: '#4caf50', 
                                fontFamily: "'JetBrains Mono', monospace", 
                                fontSize: '0.85rem',
                                borderRadius: 1.5,
                                minHeight: 200,
                                overflow: 'auto',
                                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
                            }}>
                                <Typography component="pre" sx={{ m: 0, whiteSpace: 'pre-wrap' }}>
                                    {executionResult.stdout || executionResult.stderr || executionResult.compile_output || '(No output)'}
                                </Typography>
                            </Paper>
                        </Box>
                    ) : (
                        <Box sx={{ 
                            flex: 1, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: 'text.secondary',
                            opacity: 0.6 
                        }}>
                             <Iconify icon="solar:terminal-line-duotone" width={64} sx={{ mb: 2, opacity: 0.5 }} />
                             <Typography variant="body2">Run code to see output</Typography>
                        </Box>
                    )}
                </CustomTabPanel>

                {/* Input Tab */}
                <CustomTabPanel value={tabValue} index={1}>
                    <TextField
                        fullWidth
                        multiline
                        rows={8}
                        placeholder="Enter standard input (stdin) for your program..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        variant="outlined"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                fontFamily: 'monospace',
                                bgcolor: alpha(theme.palette.background.default, 0.5)
                            }
                        }}
                    />
                </CustomTabPanel>

                {/* AI Help Tab */}
                <CustomTabPanel value={tabValue} index={2}>
                    <AICodeAssistant 
                        currentCode={code} 
                        language={LANGUAGES.find(l => l.id === language)?.name || 'JavaScript'} 
                        onCodeSuggestion={(newCode) => {
                            setCode(newCode);
                            // Optionally switch back to Output or show success
                        }}
                        inline
                    />
                </CustomTabPanel>
            </Card>
       </Box>
    </DashboardContent>
  );
}
