import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUploadResume } from '@/hooks/useResume';

export const ResumeUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { mutateAsync: uploadResume, isPending } = useUploadResume();
  const navigate = useNavigate();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles, rejectedFiles) => {
      setError(null);
      if (rejectedFiles.length > 0) {
        setError('Please upload a valid PDF or DOCX file under 10MB.');
        return;
      }
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
      }
    },
  });

  const handleUpload = async () => {
    if (!file) return;
    setError(null);
    try {
      await uploadResume(file);
      navigate('/review');
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Failed to process resume. Please try again.';
      setError(msg);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Card>
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold">Upload Your Resume</CardTitle>
          <CardDescription>
            Supported formats: PDF or DOCX. PyMuPDF & NLP extract verified skills, education, and projects.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-md bg-destructive/10 text-destructive border border-destructive/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Upload className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold">
                  {file ? file.name : 'Click to select or drag & drop your resume'}
                </p>
                <p className="text-xs text-muted-foreground">PDF or DOCX up to 10MB</p>
              </div>
            </div>
          </div>

          {file && (
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/40 text-xs">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="font-medium">{file.name}</span>
                <span className="text-muted-foreground">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
              </div>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
          )}

          {isPending && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Analyzing resume with NLP & Sentence Transformers...</span>
                <span>Extracting skills</span>
              </div>
              <Progress value={65} className="h-1.5" />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} disabled={isPending}>
            Skip for now
          </Button>
          <Button onClick={handleUpload} disabled={!file || isPending} className="gap-2">
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Processing AI extraction...
              </>
            ) : (
              'Analyze & Continue'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

