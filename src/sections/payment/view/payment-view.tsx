import { useEffect, useMemo, useState, useCallback } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Fade from '@mui/material/Fade';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme, alpha } from '@mui/material/styles';

import { DashboardContent } from 'src/layouts/dashboard';
import { useApplicationsContext } from 'src/contexts/applications-context';

import { paymentProofStorage } from 'src/utils/payment-proof-storage';

import {
  buildOptimizedDeliveryUrl,
  getCloudinaryCloudNameFromUrl,
  uploadToCloudinaryUnsigned,
} from 'src/utils/cloudinary-upload';

import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const premiumGlass = (theme: any) => ({
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
  boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.05)}`,
  borderRadius: 3,
});

type PaymentViewProps = {
  applicationId: string;
};

export function PaymentView({ applicationId }: PaymentViewProps) {
  const theme = useTheme();
  const { applications } = useApplicationsContext();
  const [appError, setAppError] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>('');
  const [optimizedUrl, setOptimizedUrl] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const cloudName = useMemo(
    () => getCloudinaryCloudNameFromUrl(import.meta.env.VITE_CLOUDINARY_URL as string | undefined),
    []
  );
  const uploadPreset = (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined) ?? '';

  const appFromContext = useMemo(
    () => applications.find((a) => String(a.id) === String(applicationId)),
    [applications, applicationId]
  );

  useEffect(() => {
    if (!selectedFile) {
      setLocalPreviewUrl('');
      return undefined;
    }
    const url = URL.createObjectURL(selectedFile);
    setLocalPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  useEffect(() => {
    const stored = paymentProofStorage.get(String(applicationId));
    if (!stored) return;
    setUploadedUrl(stored.url);
    setOptimizedUrl(stored.optimizedUrl);
    setSuccess(true);
  }, [applicationId]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleUpload = useCallback(async () => {
    if (!applicationId) return;
    if (!selectedFile) return;
    if (!cloudName) {
      setAppError('Cloudinary is not configured. Missing CLOUDINARY_URL.');
      return;
    }
    if (!uploadPreset) {
      setAppError('Cloudinary unsigned upload is not configured. Add VITE_CLOUDINARY_UPLOAD_PRESET in .env.local');
      return;
    }

    setUploading(true);
    setAppError(null);

    try {
      const uploaded = await uploadToCloudinaryUnsigned({
        file: selectedFile,
        cloudName,
        uploadPreset,
        folder: 'payment_proofs',
      });

      const optimized = buildOptimizedDeliveryUrl({ cloudName, publicId: uploaded.public_id, width: 1000 });

      paymentProofStorage.set({
        applicationId: String(applicationId),
        publicId: uploaded.public_id,
        url: uploaded.secure_url,
        optimizedUrl: optimized,
        bytes: uploaded.bytes,
        createdAt: new Date().toISOString(),
      });

      setUploadedUrl(uploaded.secure_url);
      setOptimizedUrl(optimized);
      setSuccess(true);
    } catch (e: any) {
      setAppError(e?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [applicationId, cloudName, selectedFile, uploadPreset]);

  const goToMyCourses = useCallback(() => {
    window.location.href = '/my-courses';
  }, []);

  const handleFileDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <DashboardContent>
      <Container maxWidth="lg">
        {/* Background Mesh */}
        <Box
          sx={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: -1,
            background: `radial-gradient(circle at 10% 20%, ${alpha(theme.palette.primary.lighter, 0.2)} 0%, transparent 40%),
                         radial-gradient(circle at 90% 80%, ${alpha(theme.palette.secondary.lighter, 0.2)} 0%, transparent 40%)`,
          }}
        />

        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="h3" fontWeight={800} sx={{ mb: 2 }}>
            Complete Your Enrollment
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight={500} sx={{ maxWidth: 600, mx: 'auto' }}>
            To activate your access, simply transfer the course fees and upload your receipt below.
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 340px' }, gap: 4 }}>
          {/* Main Content: Payment Methods & Upload */}
          <Stack spacing={4}>
             {/* Payment Methods */}
             <Card sx={{ ...premiumGlass(theme), overflow: 'hidden' }}>
               <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                 <Typography variant="h6" fontWeight={800} display="flex" alignItems="center" gap={1}>
                    <Iconify icon="solar:wallet-money-bold-duotone" width={24} sx={{ color: 'primary.main' }} />
                    Payment Methods
                 </Typography>
               </Box>
               <CardContent sx={{ p: 4 }}>
                 <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                   {[
                     { label: 'InstaPay', number: '01000000000', name: 'GenZCoders', icon: 'solar:smartphone-2-bold-duotone', colorKey: 'primary' },
                     { label: 'Vodafone Cash', number: '01000000000', name: 'GenZCoders', icon: 'solar:card-transfer-bold-duotone', colorKey: 'error' }
                   ].map((method) => (
                     (() => {
                       const methodColor =
                         method.colorKey === 'error' ? theme.palette.error.main : theme.palette.primary.main;

                       return (
                     <Box 
                        key={method.label} 
                        sx={{ 
                          p: 3, 
                          borderRadius: 3, 
                          border: `1px dashed ${alpha(theme.palette.grey[500], 0.2)}`,
                          bgcolor: alpha(theme.palette.background.default, 0.5),
                          transition: 'all 0.3s',
                          '&:hover': { borderColor: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.04) }
                        }}
                     >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                           <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: alpha(methodColor, 0.1), color: methodColor }}>
                              <Iconify icon={method.icon} width={24} />
                           </Box>
                           <Box>
                             <Typography variant="subtitle2">{method.label}</Typography>
                             <Typography variant="caption" color="text.secondary">{method.name}</Typography>
                           </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'background.paper', p: 1, borderRadius: 1.5, border: `1px solid ${theme.palette.divider}` }}>
                           <Typography variant="h6" fontWeight={800} sx={{ ml: 1 }}>{method.number}</Typography>
                           <Tooltip title={copied === method.label ? "Copied!" : "Copy"}>
                             <IconButton size="small" onClick={() => handleCopy(method.number, method.label)}>
                               <Iconify icon={copied === method.label ? "solar:check-circle-bold" : "solar:copy-bold"} sx={{ color: copied === method.label ? 'success.main' : 'text.secondary' }} />
                             </IconButton>
                           </Tooltip>
                        </Box>
                     </Box>
                       );
                     })()
                   ))}
                 </Box>
               </CardContent>
             </Card>

             {/* Upload Section */}
             <Card sx={{ ...premiumGlass(theme) }}>
               <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" fontWeight={800} display="flex" alignItems="center" gap={1}>
                    <Iconify icon="solar:upload-square-bold-duotone" width={24} sx={{ color: 'info.main' }} />
                    Upload Receipt
                  </Typography>
                  {success && <Chip label="Payment Verified" color="success" variant="filled" icon={<Iconify icon="solar:verified-check-bold" />} />}
               </Box>
               
               <Divider sx={{ borderStyle: 'dashed' }} />
               
               <CardContent sx={{ p: 4 }}>
                  {appError && <Alert severity="error" sx={{ mb: 3 }}>{appError}</Alert>}

                  {!success ? (
                    <Box 
                      component="label"
                      onDrop={handleFileDrop}
                      onDragOver={(e) => e.preventDefault()}
                      sx={{ 
                        border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
                        borderRadius: 3,
                        p: 6,
                        textAlign: 'center',
                        cursor: 'pointer',
                        display: 'block',
                        transition: 'all 0.3s',
                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                        }
                      }}
                    >
                      <input 
                        type="file" 
                        hidden 
                        accept="image/*" 
                        onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} 
                      />
                      
                      {selectedFile ? (
                         <Box>
                            <Box 
                              component="img" 
                              src={localPreviewUrl} 
                              sx={{ 
                                height: 200, 
                                objectFit: 'contain', 
                                borderRadius: 2, 
                                boxShadow: theme.shadows[4],
                                mb: 2
                              }} 
                            />
                            <Typography variant="subtitle1">{selectedFile.name}</Typography>
                            <Typography variant="caption" color="text.secondary">Click to change file</Typography>
                         </Box>
                      ) : (
                        <>
                           <SvgColor src="/assets/icons/Iconly/Iconly/Curved/Outline/Image.svg" sx={{ width: 64, height: 64, color: 'text.secondary', mb: 2, mx: 'auto' }} />
                           <Typography variant="h6" gutterBottom>Drop or Select Image</Typography>
                           <Typography variant="body2" color="text.secondary">Upload the screenshot of your transaction here.</Typography>
                        </>
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Box sx={{ 
                           width: 80, height: 80, 
                           borderRadius: '50%', 
                           bgcolor: alpha(theme.palette.success.main, 0.1),
                           color: 'success.main',
                           display: 'flex', alignItems: 'center', justifyContent: 'center',
                           mx: 'auto', mb: 3
                        }}>
                           <Iconify icon="solar:check-circle-bold" width={48} />
                        </Box>
                        <Typography variant="h4" fontWeight={800} gutterBottom>Payment Submitted!</Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                          Your proof has been uploaded successfully. You can now access your course.
                        </Typography>
                        
                        <Button 
                          variant="contained" 
                          size="large"
                          onClick={goToMyCourses}
                          sx={{ borderRadius: 30, px: 5, py: 1.5, fontWeight: 700, boxShadow: theme.shadows[8] }}
                          endIcon={<Iconify icon="solar:arrow-right-bold" />}
                        >
                          Go to My Courses
                        </Button>
                    </Box>
                  )}
               </CardContent>
               
               {!success && (
                <Box sx={{ p: 3, pt: 0, textAlign: 'right' }}>
                   <Button
                      variant="contained"
                      size="large"
                      onClick={handleUpload}
                      disabled={!selectedFile || uploading}
                      startIcon={uploading ? <Iconify icon="solar:clock-circle-outline" /> : <Iconify icon="solar:upload-bold" />}
                      sx={{ borderRadius: 30, px: 4, fontWeight: 700 }}
                   >
                      {uploading ? 'Processing...' : 'Submit Payment'}
                   </Button>
                </Box>
               )}
             </Card>
          </Stack>

          {/* Sidebar: Course Summary */}
          <Box>
            <Card sx={{ ...premiumGlass(theme), position: 'sticky', top: 100 }}>
              <Box sx={{ 
                 height: 140, 
                 background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 color: 'white'
              }}>
                <SvgColor src="/assets/icons/Iconly/Iconly/Curved/Outline/Category.svg" sx={{ width: 64, height: 64, opacity: 0.5 }} />
              </Box>
              <CardContent sx={{ p: 3 }}>
                <Chip
                  label="Application Approved"
                  color="success"
                  size="small"
                  variant="filled"
                  sx={{
                    mb: 2,
                    fontWeight: 700,
                    bgcolor: alpha(theme.palette.success.main, 0.12),
                    color: theme.palette.success.dark,
                  }}
                />
                <Typography variant="h5" fontWeight={800} gutterBottom>
                  {appFromContext?.metadata?.courseName || 'Selected Course'}
                </Typography>
                
                <Box sx={{ my: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                  <Typography variant="subtitle2">Total Amount</Typography>
                  <Typography variant="h4" fontWeight={800} color="primary.main">
                    {appFromContext?.metadata?.coursePrice ?? 0} EGP
                  </Typography>
                </Box>

                <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                       <Iconify icon="solar:user-bold-duotone" width={20} sx={{ color: 'text.secondary' }} />
                       <Typography variant="body2" fontWeight={600} color="text.secondary">
                         Student: {appFromContext?.metadata?.fullName || 'You'}
                       </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                       <Iconify icon="solar:calendar-bold-duotone" width={20} sx={{ color: 'text.secondary' }} />
                       <Typography variant="body2" fontWeight={600} color="text.secondary">
                         Date: {new Date().toLocaleDateString()}
                       </Typography>
                    </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </DashboardContent>
  );
}
