import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  description: string;
}

export interface ValidationResult {
  testCaseId: string;
  passed: boolean;
  actualOutput: string;
  expectedOutput: string;
  error?: string;
}

interface CodeValidatorProps {
  testCases: TestCase[];
  onValidate: (results: ValidationResult[]) => void;
}

export function CodeValidator({ testCases, onValidate }: CodeValidatorProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const validateCode = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate validation delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock validation results
      const mockResults: ValidationResult[] = testCases.map((testCase) => ({
        testCaseId: testCase.id,
        passed: Math.random() > 0.3, // 70% pass rate for demo
        actualOutput: testCase.expectedOutput, // In real scenario, run the code
        expectedOutput: testCase.expectedOutput,
      }));

      setResults(mockResults);
      setShowResults(true);
      onValidate(mockResults);
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setLoading(false);
    }
  }, [testCases, onValidate]);

  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  const passPercentage = totalCount > 0 ? (passedCount / totalCount) * 100 : 0;

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<Iconify icon="solar:eye-bold" />}
        onClick={() => setOpen(true)}
        sx={{ mb: 2 }}
      >
        Validate Solution
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Code Validation</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {!showResults ? (
            <Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Your code will be tested against {testCases.length} test case{testCases.length !== 1 ? 's' : ''}:
              </Typography>

              <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'background.neutral' }}>
                      <TableCell>Test Case</TableCell>
                      <TableCell>Input</TableCell>
                      <TableCell>Expected Output</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {testCases.map((testCase) => (
                      <TableRow key={testCase.id}>
                        <TableCell>{testCase.description}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          {testCase.input || '(no input)'}
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          {testCase.expectedOutput}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Button
                variant="contained"
                fullWidth
                onClick={validateCode}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Iconify icon="solar:eye-bold" />}
              >
                {loading ? 'Validating...' : 'Run Tests'}
              </Button>
            </Box>
          ) : (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Test Results
                  </Typography>
                  <Chip
                    label={`${passedCount}/${totalCount} Passed`}
                    color={passedCount === totalCount ? 'success' : passedCount > 0 ? 'warning' : 'error'}
                    variant="filled"
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={passPercentage}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: passedCount === totalCount ? '#10B981' : '#F59E0B',
                    },
                  }}
                />
              </Box>

              {passedCount === totalCount && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  🎉 Excellent! All tests passed! Your solution is correct.
                </Alert>
              )}

              {passedCount < totalCount && passedCount > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  ⚠️ Some tests failed. Review the results below and fix your code.
                </Alert>
              )}

              {passedCount === 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  ❌ All tests failed. Check your logic and try again.
                </Alert>
              )}

              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'background.neutral' }}>
                      <TableCell>Test Case</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Expected</TableCell>
                      <TableCell>Actual</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.map((result) => {
                      const testCase = testCases.find((tc) => tc.id === result.testCaseId);
                      return (
                        <TableRow key={result.testCaseId}>
                          <TableCell>{testCase?.description}</TableCell>
                          <TableCell>
                            <Chip
                              label={result.passed ? 'Passed' : 'Failed'}
                              color={result.passed ? 'success' : 'error'}
                              size="small"
                              variant="filled"
                            />
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                            {result.expectedOutput}
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                            {result.actualOutput}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {showResults && (
            <Button onClick={() => setShowResults(false)} variant="outlined">
              Back
            </Button>
          )}
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
