import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: any[]) => Promise<void>;
  title: string;
  description: string;
  templateFields: { name: string; required: boolean; example: string }[];
  parseItem: (row: Record<string, string>) => any;
}

const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  title,
  description,
  templateFields,
  parseItem,
}) => {
  const [activeTab, setActiveTab] = useState<'csv' | 'json'>('csv');
  const [csvText, setCsvText] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateCSVTemplate = () => {
    const headers = templateFields.map(f => f.name).join(',');
    const example = templateFields.map(f => f.example).join(',');
    return `${headers}\n${example}`;
  };

  const generateJSONTemplate = () => {
    const template = templateFields.reduce((acc, f) => {
      acc[f.name] = f.example;
      return acc;
    }, {} as Record<string, string>);
    return JSON.stringify([template], null, 2);
  };

  const downloadTemplate = () => {
    const content = activeTab === 'csv' ? generateCSVTemplate() : generateJSONTemplate();
    const blob = new Blob([content], { type: activeTab === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template.${activeTab}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) throw new Error('CSV must have at least a header row and one data row');
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows: Record<string, string>[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });
      rows.push(row);
    }
    
    return rows;
  };

  const parseJSON = (text: string): Record<string, string>[] => {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) throw new Error('JSON must be an array of objects');
    return parsed;
  };

  const validateData = (data: Record<string, string>[]): string[] => {
    const validationErrors: string[] = [];
    const requiredFields = templateFields.filter(f => f.required).map(f => f.name);

    data.forEach((row, idx) => {
      requiredFields.forEach(field => {
        if (!row[field] || row[field].trim() === '') {
          validationErrors.push(`Row ${idx + 1}: Missing required field "${field}"`);
        }
      });
    });

    return validationErrors;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (file.name.endsWith('.csv')) {
        setActiveTab('csv');
        setCsvText(content);
      } else if (file.name.endsWith('.json')) {
        setActiveTab('json');
        setJsonText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setErrors([]);
    setImportResult(null);
    setIsImporting(true);

    try {
      const text = activeTab === 'csv' ? csvText : jsonText;
      if (!text.trim()) {
        setErrors(['Please provide data to import']);
        return;
      }

      const data = activeTab === 'csv' ? parseCSV(text) : parseJSON(text);
      const validationErrors = validateData(data);

      if (validationErrors.length > 0) {
        setErrors(validationErrors.slice(0, 5)); // Show first 5 errors
        if (validationErrors.length > 5) {
          setErrors(prev => [...prev, `... and ${validationErrors.length - 5} more errors`]);
        }
        return;
      }

      const items = data.map(parseItem);
      await onImport(items);
      
      setImportResult({ success: items.length, failed: 0 });
      setTimeout(() => {
        onClose();
        resetState();
      }, 2000);
    } catch (error: any) {
      setErrors([error.message || 'Failed to parse data']);
    } finally {
      setIsImporting(false);
    }
  };

  const resetState = () => {
    setCsvText('');
    setJsonText('');
    setErrors([]);
    setImportResult(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => { onClose(); resetState(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'csv' | 'json')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="csv">CSV Format</TabsTrigger>
            <TabsTrigger value="json">JSON Format</TabsTrigger>
          </TabsList>

          <TabsContent value="csv" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Upload a CSV file or paste CSV data below
              </p>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="w-4 h-4 mr-1" />
                Template
              </Button>
            </div>
            <Textarea
              placeholder={generateCSVTemplate()}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
          </TabsContent>

          <TabsContent value="json" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Upload a JSON file or paste JSON data below
              </p>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="w-4 h-4 mr-1" />
                Template
              </Button>
            </div>
            <Textarea
              placeholder={generateJSONTemplate()}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
          </TabsContent>
        </Tabs>

        {/* File Upload */}
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1"
          >
            <FileText className="w-4 h-4 mr-2" />
            Upload File
          </Button>
        </div>

        {/* Required Fields Info */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="text-sm font-medium mb-2">Required Fields:</h4>
          <div className="flex flex-wrap gap-2">
            {templateFields.map((field) => (
              <span
                key={field.name}
                className={`px-2 py-1 rounded text-xs ${
                  field.required
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {field.name}{field.required ? '*' : ''}
              </span>
            ))}
          </div>
        </div>

        {/* Errors */}
        <AnimatePresence>
          {errors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-destructive/10 border border-destructive/20 rounded-lg p-4"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                <div className="space-y-1">
                  {errors.map((error, idx) => (
                    <p key={idx} className="text-sm text-destructive">{error}</p>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Result */}
        <AnimatePresence>
          {importResult && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-500/10 border border-green-500/20 rounded-lg p-4"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <p className="text-sm text-green-700 dark:text-green-400">
                  Successfully imported {importResult.success} items!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => { onClose(); resetState(); }}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            onClick={handleImport}
            disabled={isImporting || !!importResult}
          >
            {isImporting ? 'Importing...' : 'Import Data'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkImportModal;
