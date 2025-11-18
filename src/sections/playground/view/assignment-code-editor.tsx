import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
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

import { CodeValidator } from './code-validator';
import { AICodeAssistant } from './ai-code-assistant';

import type { TestCase, ValidationResult } from './code-validator';

export interface Assignment {
  id: string;
  title: string;
  description: string;
  language: string;
  starterCode: string;
  hints: string[];
  testCases: TestCase[];
}

interface AssignmentCodeEditorProps {
  assignment: Assignment;
  onSubmit: (code: string, results: ValidationResult[]) => void;
}

function TabPanel(props: any) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export function AssignmentCodeEditor({ assignment, onSubmit }: AssignmentCodeEditorProps) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState(assignment.starterCode);
  const [language, setLanguage] = useState(assignment.language);
  const [tabValue, setTabValue] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);

  const handleCodeSuggestion = useCallback((suggestion: string) => {
    setCode(suggestion);
  }, []);

  const handleValidationComplete = useCallback((results: ValidationResult[]) => {
    setValidationResults(results);
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      // Simulate submission delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onSubmit(code, validationResults);
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }, [code, validationResults, onSubmit]);

  const handleNextHint = useCallback(() => {
    if (currentHintIndex < assignment.hints.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1);
    }
  }, [currentHintIndex, assignment.hints.length]);

  const handlePreviousHint = useCallback(() => {
    if (currentHintIndex > 0) {
      setCurrentHintIndex(currentHintIndex - 1);
    }
  }, [currentHintIndex]);

  return (
    <>
      <Button
        variant="contained"
        startIcon={<Iconify icon="solar:pen-bold" />}
        onClick={() => setOpen(true)}
      >
        Open Code Editor
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{assignment.title}</Typography>
            <Chip label={language} size="small" color="primary" />
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Code" icon={<Iconify icon="solar:pen-bold" />} iconPosition="start" />
              <Tab label="Description" icon={<Iconify icon="solar:eye-bold" />} iconPosition="start" />
              <Tab label="Hints" icon={<Iconify icon="solar:share-bold" />} iconPosition="start" />
              <Tab label="Test Cases" icon={<Iconify icon="solar:cart-3-bold" />} iconPosition="start" />
            </Tabs>
          </Box>

          {/* Code Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <AICodeAssistant currentCode={code} language={language} onCodeSuggestion={handleCodeSuggestion} />
              <CodeValidator testCases={assignment.testCases} onValidate={handleValidationComplete} />
            </Box>

            <TextField
              fullWidth
              multiline
              rows={15}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your code here..."
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

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => setCode(assignment.starterCode)}
                startIcon={<Iconify icon="solar:restart-bold" />}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={20} /> : <Iconify icon="solar:eye-bold" />}
              >
                {submitting ? 'Submitting...' : 'Submit Solution'}
              </Button>
            </Box>
          </TabPanel>

          {/* Description Tab */}
          <TabPanel value={tabValue} index={1}>
            <Paper sx={{ p: 2, bgcolor: 'background.neutral' }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {assignment.description}
              </Typography>
            </Paper>
          </TabPanel>

          {/* Hints Tab */}
          <TabPanel value={tabValue} index={2}>
            {assignment.hints.length === 0 ? (
              <Typography color="text.secondary">No hints available for this assignment.</Typography>
            ) : (
              <Box>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Hint {currentHintIndex + 1} of {assignment.hints.length}
                    </Typography>
                    <Chip
                      label={`${Math.round(((currentHintIndex + 1) / assignment.hints.length) * 100)}%`}
                      size="small"
                    />
                  </Box>
                </Box>

                <Paper sx={{ p: 2, bgcolor: '#FEF3C7', border: '1px solid #FBBF24', mb: 2 }}>
                  <Typography variant="body2">{assignment.hints[currentHintIndex]}</Typography>
                </Paper>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={handlePreviousHint}
                    disabled={currentHintIndex === 0}
                  >
                    Previous Hint
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleNextHint}
                    disabled={currentHintIndex === assignment.hints.length - 1}
                  >
                    Next Hint
                  </Button>
                </Box>
              </Box>
            )}
          </TabPanel>

          {/* Test Cases Tab */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Test Cases ({assignment.testCases.length})
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {assignment.testCases.map((testCase) => (
                <Card key={testCase.id} sx={{ p: 2, bgcolor: 'background.neutral' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    {testCase.description}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Input:
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {testCase.input || '(no input)'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Expected Output:
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {testCase.expectedOutput}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Box>
          </TabPanel>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
