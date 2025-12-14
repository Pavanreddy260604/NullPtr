import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Type,
  Code,
  Heading,
  Image as ImageIcon,
  Upload,
  BookOpen,
  Layers,
  FileText,
  MousePointerClick,
  ArrowUp,
  ArrowDown,
  X,
  Loader2,
} from "lucide-react";
import {
  unitApi,
  mcqApi,
  fillBlankApi,
  descriptiveApi,
  uploadApi,
  subjectApi,
  MCQ,
  FillBlank,
  Descriptive,
  AnswerBlock,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import FormModal from "@/components/shared/FormModal";
import ConfirmModal from "@/components/shared/ConfirmModal";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

// Utility function for sanitizing input
const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Custom hook for bulk import operations
const useBulkImport = (activeTab: string, unitId: string, subjectId: string) => {
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isImportingData, setIsImportingData] = useState(false);
  const [uploadedRefs, setUploadedRefs] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const handleImageUpload = async (files: File[]) => {
    if (!files?.length) return toast.error("Please select image files first.");

    // 1️⃣ Validation: Check size & type
    const invalidFiles = files.filter(f => f.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      return toast.error(`File size limit (5MB) exceeded for: ${invalidFiles.map(f => f.name).join(', ')}`);
    }

    try {
      setIsUploadingImages(true);

      const refs: Record<string, string> = {};
      const BATCH_SIZE = 5;

      // 2️⃣ Batch Processing to prevent network bottleneck
      for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batch = files.slice(i, i + BATCH_SIZE);
        const uploadPromises = batch.map(file =>
          uploadApi.upload(file)
            .then(res => ({ file, data: res.data }))
            .catch(err => {
              console.error(`Failed to upload ${file.name}:`, err);
              return null;
            })
        );

        const results = await Promise.all(uploadPromises);

        results.forEach(result => {
          if (result) {
            // Use filename as ref key
            refs[result.file.name] = (result.data as any).fileUrl;
          }
        });
      }

      setUploadedRefs(refs);

      const successCount = Object.keys(refs).length;
      if (successCount === files.length) {
        toast.success(`✅ Successfully uploaded all ${successCount} images.`);
      } else if (successCount > 0) {
        toast.warning(`⚠️ Uploaded ${successCount}/${files.length} images. Some failed.`);
      } else {
        toast.error("❌ All uploads failed.");
      }

    } catch (err: any) {
      console.error(err);
      toast.error("Upload process encountered an error.");
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleBulkImport = async (files: File[], refImages: Record<string, string>) => {
    if (!files || files.length === 0) return toast.error("Please select at least one JSON file.");
    if (!unitId || !subjectId) return toast.error("Please select a subject and unit first.");

    try {
      setIsImportingData(true);

      let allItems: any[] = [];

      // Process each file
      for (const file of files) {
        const text = await file.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(`Invalid JSON in file: ${file.name}`);
        }

        let items = [];
        if (activeTab === "mcq") {
          items = Array.isArray(data) ? data : data.mcqs;
          if (!Array.isArray(items)) throw new Error(`File "${file.name}" must contain a 'mcqs' array or be an array of objects.`);
          // Validate each MCQ item
          for (const item of items) {
            if (!item.question || !Array.isArray(item.options) || item.options.length !== 4) {
              throw new Error(`Invalid MCQ format in file "${file.name}": ${JSON.stringify(item)}`);
            }
          }
        } else if (activeTab === "fillblank") {
          items = Array.isArray(data) ? data : data.fillBlanks;
          if (!Array.isArray(items)) throw new Error(`File "${file.name}" must contain a 'fillBlanks' array or be an array of objects.`);
          // Validate each fill blank item
          for (const item of items) {
            if (!item.question || !item.correctAnswer) {
              throw new Error(`Invalid Fill Blank format in file "${file.name}": ${JSON.stringify(item)}`);
            }
          }
        } else if (activeTab === "descriptive") {
          items = Array.isArray(data) ? data : data.descriptives;
          if (!Array.isArray(items)) throw new Error(`File "${file.name}" must contain a 'descriptives' array or be an array of objects.`);
          // Validate each descriptive item
          for (const item of items) {
            if (!item.question || !Array.isArray(item.answer)) {
              throw new Error(`Invalid Descriptive format in file "${file.name}": ${JSON.stringify(item)}`);
            }
          }
        }

        if (Array.isArray(items)) {
          allItems = [...allItems, ...items];
        }
      }

      if (allItems.length === 0) throw new Error("No valid questions found in uploaded files.");

      // Validate aggregated items (Simplified validation for brevity, keeps existing logic structure)
      // Note: Real-world app might want per-file error reporting, but we'll aggregate for now.

      // Add progress feedback
      toast.info(`Importing ${allItems.length} questions from ${files.length} file(s)...`);

      if (activeTab === "mcq") {
        await mcqApi.bulkCreate(allItems, unitId, subjectId);
      } else if (activeTab === "fillblank") {
        await fillBlankApi.bulkCreate(allItems, unitId, subjectId);
      } else if (activeTab === "descriptive") {
        await descriptiveApi.bulkCreate(allItems, unitId, subjectId, refImages);
      }

      toast.success(`✅ Successfully imported ${allItems.length} questions!`);
      queryClient.invalidateQueries({ queryKey: [activeTab === 'mcq' ? 'mcqs' : activeTab === 'fillblank' ? 'fill' : 'desc', unitId] });

      // Add delay before closing modal
      setTimeout(() => {
        return true; // Signal that modal should close
      }, 2000);
      return true;
    } catch (err: any) {
      console.error("❌ Bulk Import Error:", err);
      // Provide more specific error messages
      let msg = "Import failed.";
      if (err.message.includes("JSON")) {
        msg = err.message;
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.message) {
        msg = err.message;
      }
      toast.error(msg);
      return false; // Signal that modal should not close
    } finally {
      setIsImportingData(false);
    }
  };

  // 🚀 NEW: Combined single-step import using presigned URLs
  const handleCombinedImport = async (images: File[], jsonFiles: File[]) => {
    if (!unitId || !subjectId) return toast.error("Please select a subject and unit first.");
    if (jsonFiles.length === 0) return toast.error("Please select at least one JSON file.");

    // 0️⃣ Pre-validation: Check for invalid files
    const invalidFiles = images.filter(f => !f.type.startsWith('image/') || f.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      return toast.error(`Invalid files (non-image or >5MB): ${invalidFiles.map(f => f.name).join(', ')}`);
    }

    try {
      setIsImportingData(true);

      // 1️⃣ Get signature for direct Cloudinary uploads
      toast.info("Preparing upload...");
      const sigResponse = await uploadApi.getSignature();
      const signatureData = sigResponse.data;

      // 2️⃣ Upload all images directly to Cloudinary
      const uploadedRefs: Record<string, string> = {};
      if (images.length > 0) {
        toast.info(`Uploading ${images.length} images directly to cloud...`);

        const BATCH_SIZE = 5;
        for (let i = 0; i < images.length; i += BATCH_SIZE) {
          const batch = images.slice(i, i + BATCH_SIZE);
          const uploadPromises = batch.map(async (img) => {
            try {
              const result = await uploadApi.directUploadToCloudinary(img, signatureData);
              return { name: img.name, url: result.secure_url };
            } catch (err) {
              console.error(`Failed to upload ${img.name}:`, err);
              return null;
            }
          });

          const results = await Promise.all(uploadPromises);
          results.forEach((r) => {
            if (r) uploadedRefs[r.name] = r.url;
          });
        }

        const successCount = Object.keys(uploadedRefs).length;
        if (successCount < images.length) {
          toast.warning(`⚠️ Uploaded ${successCount}/${images.length} images. Some failed.`);
        }
      }

      // 3️⃣ Parse JSON files and resolve refs inline
      const allItems: any[] = [];
      for (const jsonFile of jsonFiles) {
        const text = await jsonFile.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(`Invalid JSON in file: ${jsonFile.name}`);
        }

        let items = Array.isArray(data) ? data : data.descriptives;
        if (!Array.isArray(items)) {
          throw new Error(`File "${jsonFile.name}" must contain a 'descriptives' array.`);
        }

        // Resolve refs -> URLs inline
        console.log("📦 Uploaded refs map:", uploadedRefs);
        // Helper for relaxed matching
        const findMatchingUrl = (ref: string, map: Record<string, string>) => {
          // 1. Exact match
          if (map[ref]) return map[ref];

          const lowerRef = ref.toLowerCase();
          const keys = Object.keys(map);

          // 2. Case-insensitive match
          const caseMatch = keys.find(k => k.toLowerCase() === lowerRef);
          if (caseMatch) return map[caseMatch];

          // 3. Match without extension (e.g. ref="img1" matches "img1.png")
          // If ref doesn't have an extension, look for a key that starts with ref + "."
          if (!ref.includes('.')) {
            const baseMatch = keys.find(k => k.toLowerCase().startsWith(lowerRef + '.'));
            if (baseMatch) return map[baseMatch];
          }

          return null;
        };

        items.forEach((q: any) => {
          if (q.answer && Array.isArray(q.answer)) {
            q.answer.forEach((block: any) => {
              if (block.type === "diagram" && block.ref) {
                console.log(`🔍 Looking for ref: "${block.ref}"`);

                const matchedUrl = findMatchingUrl(block.ref, uploadedRefs);

                if (matchedUrl) {
                  block.content = matchedUrl;
                  console.log(`✅ Resolved: "${block.ref}" -> ${matchedUrl}`);
                  delete block.ref;
                } else {
                  // Warn about unmatched ref
                  console.warn(`⚠️ No uploaded image matches ref: "${block.ref}"`);
                  console.warn(`   Available filenames:`, Object.keys(uploadedRefs));
                  // Toast only for the first failure to avoid spam
                  if (items.indexOf(q) === 0) {
                    toast.warning(`Could not find image for ref: "${block.ref}"`);
                  }
                }
              }
            });
          }
        });

        allItems.push(...items);
      }

      if (allItems.length === 0) {
        throw new Error("No valid questions found in uploaded files.");
      }

      // 4️⃣ Send to backend (no refImages needed - already resolved)
      toast.info(`Importing ${allItems.length} questions...`);
      await descriptiveApi.bulkCreate(allItems, unitId, subjectId, {});

      toast.success(`✅ Successfully imported ${allItems.length} questions!`);
      queryClient.invalidateQueries({ queryKey: ["desc", unitId] });

      return true;
    } catch (err: any) {
      console.error("❌ Combined Import Error:", err);
      const msg = err.response?.data?.message || err.message || "Import failed.";
      toast.error(msg);
      return false;
    } finally {
      setIsImportingData(false);
    }
  };

  return {
    isUploadingImages,
    isImportingData,
    uploadedRefs,
    handleImageUpload,
    handleBulkImport,
    handleCombinedImport,
  };
};

// Modal Layout Component
const ModalLayout: React.FC<{
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ title, children, footer }) => (
  <div className="p-6 space-y-6">
    <h2 className="text-xl font-semibold">{title}</h2>
    <div>{children}</div>
    {footer && <div className="pt-4 border-t flex justify-end gap-2">{footer}</div>}
  </div>
);

/* -------------------------------------------------------------------------- */
/* 🧠 MCQ FORM                                                                */
/* -------------------------------------------------------------------------- */
const MCQForm = memo<{ formData: Partial<MCQ>; setFormData: React.Dispatch<React.SetStateAction<Partial<MCQ>>> }>(({ formData, setFormData }) => {
  const [options, setOptions] = useState<string[]>(formData.options || ["", "", "", ""]);

  // Convert index to string for form display if needed
  const getCorrectAnswerValue = useCallback(() => {
    if (typeof formData.correctAnswer === 'number' && options[formData.correctAnswer]) {
      return options[formData.correctAnswer];
    }
    return String(formData.correctAnswer || "");
  }, [formData.correctAnswer, options]);

  const [correctAnswer, setCorrectAnswer] = useState<string>(getCorrectAnswerValue());

  // FIX: Sync form state with props
  useEffect(() => {
    setOptions(formData.options || ["", "", "", ""]);
    // Ensure correct answer is properly synced
    const newCorrectAnswer = getCorrectAnswerValue();
    if (newCorrectAnswer !== correctAnswer) {
      setCorrectAnswer(newCorrectAnswer);
    }
  }, [formData, getCorrectAnswerValue, correctAnswer]);

  const updateOption = (i: number, t: string) => {
    const newOptions = [...options];
    newOptions[i] = t;
    setOptions(newOptions);
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const handleSelect = (opt: string) => {
    setCorrectAnswer(opt);
    setFormData(prev => ({ ...prev, correctAnswer: opt }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Question Text</Label>
        <Textarea
          value={formData.question || ""}
          onChange={(e) =>
            setFormData(prev => ({ ...prev, question: sanitizeInput(e.target.value) }))
          }
          placeholder="e.g., What is powerhouse of the cell?"
          rows={3}
          required
        />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label>Options</Label>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">Click circle to select correct answer</span>
        </div>
        {options.map((o, i) => (
          <div
            key={i}
            className={`group flex items-center gap-3 p-2 rounded-lg border-2 transition-all ${correctAnswer === o && o
              ? "border-green-500 bg-green-50/50"
              : "border-transparent bg-muted/30 focus-within:border-primary/50 hover:bg-muted/50"
              }`}
          >
            <button type="button" onClick={() => handleSelect(o)} className="shrink-0">
              {correctAnswer === o && o ? (
                <CheckCircle2 className="w-6 h-6 text-green-600 fill-green-100" />
              ) : (
                <Circle className="w-6 h-6 text-muted-foreground group-hover:text-primary/50" />
              )}
            </button>
            <Input
              value={o}
              onChange={(e) => updateOption(i, sanitizeInput(e.target.value))}
              className="border-0 shadow-none h-auto py-2 bg-transparent focus-visible:ring-0 text-base"
              placeholder={`Option ${i + 1}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/* 🧩 FILL IN THE BLANK FORM                                                  */
/* -------------------------------------------------------------------------- */
const FillBlankForm = memo<{ formData: Partial<FillBlank>; setFormData: React.Dispatch<React.SetStateAction<Partial<FillBlank>>> }>(({ formData, setFormData }) => {
  const getPreview = () => {
    if (!formData.question)
      return (
        <span className="text-muted-foreground italic">
          Preview will appear here...
        </span>
      );
    const parts = formData.question.split("___");
    return (
      <div className="text-lg leading-relaxed font-medium text-foreground">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < parts.length - 1 && (
              <span className="inline-block w-24 border-b-2 border-primary mx-1 relative top-1"></span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Question Statement</Label>
            <Textarea
              value={formData.question || ""}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, question: sanitizeInput(e.target.value) }))
              }
              placeholder="Type your sentence here..."
              className="min-h-[120px] resize-none text-base"
              required
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono text-[10px] border border-primary/20">
                ___
              </span>
              Type 3 underscores to create a blank.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Correct Answer</Label>
            <div className="relative">
              <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
              <Input
                value={formData.correctAnswer || ""}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, correctAnswer: sanitizeInput(e.target.value) }))
                }
                placeholder="Exact word match (e.g., Paris)"
                className="pl-9 font-medium"
                required
              />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground">Student Preview</Label>
          <div className="h-full min-h-[120px] bg-muted/30 rounded-xl border border-dashed border-primary/20 p-6 flex items-center justify-center text-center">
            {getPreview()}
          </div>
        </div>
      </div>
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/* 🖼️ DESCRIPTIVE FORM                                                        */
/* -------------------------------------------------------------------------- */
const DescriptiveForm = memo<{
  formData: Partial<Descriptive>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Descriptive>>>;
  setIsUploadingGlobal: React.Dispatch<React.SetStateAction<boolean>>;
}>(({ formData, setFormData, setIsUploadingGlobal }) => {
  // FIX: Initialize blocks from formData and sync when it changes
  const [blocks, setBlocks] = useState<AnswerBlock[]>(
    formData.answer || [{ type: "text", content: "" }]
  );

  useEffect(() => {
    if (formData.answer) {
      setBlocks(formData.answer);
    }
  }, [formData.answer]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadIndex, setActiveUploadIndex] = useState<number | null>(null);

  const updateBlocks = (newBlocks: AnswerBlock[]) => {
    setBlocks(newBlocks);
    setFormData(prev => ({ ...prev, answer: newBlocks }));
  };

  const updateContent = (i: number, v: string) => {
    const newBlocks = [...blocks];
    newBlocks[i].content = sanitizeInput(v);
    updateBlocks(newBlocks);
  };

  const addBlock = (type: any) => {
    const newBlock = { type, content: "" };
    const newBlocks = [...blocks, newBlock];
    updateBlocks(newBlocks);
    // If it's a diagram, immediately trigger upload for the new block
    if (type === 'diagram') {
      const newIndex = newBlocks.length - 1;
      // FIX: Prevent race condition by capturing index before async operation
      setTimeout(() => triggerUpload(newIndex), 0);
    }
  };

  const removeBlock = (i: number) => {
    if (blocks.length > 1) {
      updateBlocks(blocks.filter((_, x) => x !== i));
    }
  };

  const moveBlock = (i: number, dir: "up" | "down") => {
    if ((dir === "up" && i > 0) || (dir === "down" && i < blocks.length - 1)) {
      const newBlocks = [...blocks];
      const swap = dir === "up" ? i - 1 : i + 1;
      [newBlocks[i], newBlocks[swap]] = [newBlocks[swap], newBlocks[i]];
      updateBlocks(newBlocks);
    }
  };

  const triggerUpload = (index: number) => {
    setActiveUploadIndex(index);
    // Clear the file input before triggering
    if (fileInputRef.current) fileInputRef.current.value = "";
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || activeUploadIndex === null) return;

    // Add file type and size validation
    if (!f.type.startsWith('image/')) {
      toast.error("Please select an image file.");
      return;
    }

    if (f.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("Image size should be less than 5MB.");
      return;
    }

    // FIX: Capture index before async operation to prevent race conditions
    const currentIndex = activeUploadIndex;
    setIsUploadingGlobal(true);
    toast.info("Uploading image...");

    try {
      const r = await uploadApi.upload(f);
      const newBlocks = [...blocks];
      newBlocks[currentIndex].content = (r.data as any).fileUrl;
      updateBlocks(newBlocks);
      toast.success("Image uploaded!");
    } catch (error) {
      // Revert block state on error
      const newBlocks = [...blocks];
      newBlocks[currentIndex].content = "";
      updateBlocks(newBlocks);
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploadingGlobal(false);
      setActiveUploadIndex(null);
      // FIX: Clear file input value to allow re-uploading the same file
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Question Title</Label>
        <Textarea
          value={formData.question || ""}
          onChange={(e) => setFormData(prev => ({ ...prev, question: sanitizeInput(e.target.value) }))}
          placeholder="e.g., Explain the process of photosynthesis."
          className="font-medium text-lg resize-none"
          rows={2}
          required
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Answer Blocks</Label>
          <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
            <Button type="button" variant="ghost" size="sm" onClick={() => addBlock('text')} className="h-7 text-xs gap-1 hover:bg-background hover:shadow-sm"><Type className="w-3 h-3" /> Text</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => addBlock('heading')} className="h-7 text-xs gap-1 hover:bg-background hover:shadow-sm"><Heading className="w-3 h-3" /> Header</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => addBlock('code')} className="h-7 text-xs gap-1 hover:bg-background hover:shadow-sm"><Code className="w-3 h-3" /> Code</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => addBlock('diagram')} className="h-7 text-xs gap-1 hover:bg-background hover:shadow-sm text-blue-600"><ImageIcon className="w-3 h-3" /> Image</Button>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />

        <ScrollArea className="h-[400px] border rounded-xl bg-muted/10 p-4 shadow-inner">
          <div className="space-y-3">
            {blocks.map((block, i) => (
              <motion.div layout key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative group bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow p-1">
                <div className="absolute -right-3 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <Button type="button" variant="secondary" size="icon" className="h-6 w-6 rounded-full shadow border" onClick={() => removeBlock(i)}><X className="w-3 h-3 text-red-500" /></Button>
                  <Button type="button" variant="outline" size="icon" className="h-6 w-6 rounded-full bg-background" onClick={() => moveBlock(i, 'up')} disabled={i === 0}><ArrowUp className="w-3 h-3" /></Button>
                  <Button type="button" variant="outline" size="icon" className="h-6 w-6 rounded-full bg-background" onClick={() => moveBlock(i, 'down')} disabled={i === blocks.length - 1}><ArrowDown className="w-3 h-3" /></Button>
                </div>

                <div className="p-3">
                  <div className="mb-2">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-muted-foreground h-5">
                      {block.type}
                    </Badge>
                  </div>

                  {block.type === 'diagram' ? (
                    <div
                      className={`relative border-2 border-dashed rounded-lg transition-colors ${!block.content ? 'border-blue-200 bg-blue-50/50 hover:bg-blue-50 cursor-pointer h-32 flex flex-col items-center justify-center' : 'border-border bg-muted/10 p-2'}`}
                      onClick={() => !block.content && triggerUpload(i)}
                    >
                      {block.content ? (
                        <div className="relative group/img">
                          <img src={block.content} alt="Block" className="max-h-60 rounded mx-auto object-contain" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity rounded">
                            <Button type="button" variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); triggerUpload(i); }}>Change Image</Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-blue-400 mb-2" />
                          <span className="text-sm text-blue-600 font-medium">Click to Upload Image</span>
                        </>
                      )}
                    </div>
                  ) : block.type === 'code' ? (
                    <Textarea
                      value={block.content}
                      onChange={e => updateContent(i, e.target.value)}
                      className="font-mono text-sm bg-slate-950 text-slate-50 border-0 resize-none"
                      placeholder="// Paste code here..."
                      rows={4}
                    />
                  ) : (
                    <Textarea
                      value={block.content}
                      onChange={e => updateContent(i, e.target.value)}
                      className={`border-0 shadow-none px-0 focus-visible:ring-0 resize-none ${block.type === 'heading' ? 'text-lg font-bold' : 'text-sm'}`}
                      placeholder={block.type === 'heading' ? "Enter Heading..." : "Enter paragraph text..."}
                      rows={block.type === 'heading' ? 1 : 3}
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {blocks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Click buttons above to add content blocks.
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/* 🚀 MAIN COMPONENT                                                          */
/* -------------------------------------------------------------------------- */
const Questions: React.FC = () => {
  const { unitId } = useParams<{ unitId?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [activeTab, setActiveTab] = useState<"mcq" | "fillblank" | "descriptive">("mcq");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [isUploadingGlobal, setIsUploadingGlobal] = useState(false);
  const [bulkImages, setBulkImages] = useState<File[]>([]);
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);

  // 🚀 NEW: Bulk Delete State & Handlers
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Use custom hook for bulk import operations
  const {
    isUploadingImages,
    isImportingData,
    uploadedRefs,
    handleImageUpload,
    handleBulkImport,
    handleCombinedImport,
  } = useBulkImport(activeTab, unitId!, selectedSubjectId);

  // Helper function to get the appropriate API based on active tab
  const getApi = () => {
    if (activeTab === 'mcq') return mcqApi;
    if (activeTab === 'fillblank') return fillBlankApi;
    return descriptiveApi;
  };

  // Helper to prepare data for API, especially for MCQs
  const prepareDataForApi = (data: any, tab: string) => {
    let preparedData = { ...data };
    if (tab === 'mcq' && Array.isArray(preparedData.options)) {
      const idx = preparedData.options.findIndex((o: string) => o === preparedData.correctAnswer);
      preparedData.correctAnswer = idx >= 0 ? idx : 0; // Default to 0 if not found
    }
    return preparedData;
  };

  // FIX #07: Add keepPreviousData to prevent flickering when switching tabs
  const { data: allSubjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: () => subjectApi.getAll().then((r) => r.data),
  });

  const { data: currentUnit } = useQuery({
    queryKey: ["unit", unitId],
    queryFn: () => unitApi.getById(unitId!).then((r) => r.data),
    enabled: !!unitId,
  });

  useEffect(() => {
    if (currentUnit?.subjectId)
      setSelectedSubjectId(
        typeof currentUnit.subjectId === "object"
          ? currentUnit.subjectId._id
          : currentUnit.subjectId
      );
  }, [currentUnit]);

  const { data: availableUnits } = useQuery({
    queryKey: ["units", selectedSubjectId],
    queryFn: () => unitApi.getBySubject(selectedSubjectId).then((r) => r.data),
    enabled: !!selectedSubjectId,
  });

  // FIX #07: Add keepPreviousData to prevent flickering when switching tabs
  const { data: mcqs, isLoading: isLoadingMcq } = useQuery({
    queryKey: ["mcqs", unitId],
    queryFn: () => mcqApi.getByUnit(unitId!).then((r) => r.data),
    enabled: !!unitId && activeTab === "mcq",
  });

  const { data: fill, isLoading: isLoadingFill } = useQuery({
    queryKey: ["fill", unitId],
    queryFn: () => fillBlankApi.getByUnit(unitId!).then((r) => r.data),
    enabled: !!unitId && activeTab === "fillblank",
  });

  const { data: desc, isLoading: isLoadingDesc } = useQuery({
    queryKey: ["desc", unitId],
    queryFn: () => descriptiveApi.getByUnit(unitId!).then((r) => r.data),
    enabled: !!unitId && activeTab === "descriptive",
  });


  const createMut = useMutation<any, Error, any>({
    mutationFn: (d: any) => {
      const api = getApi();
      // FIX #04: Add validation for subject and unit
      if (!unitId || !selectedSubjectId) {
        toast.error("Please select a subject and unit first.");
        throw new Error("Missing ID");
      }
      const preparedData = prepareDataForApi(d, activeTab);
      return api.create({ ...preparedData, unitId, subjectId: selectedSubjectId, topic: currentUnit?.title || "General" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [activeTab === 'mcq' ? 'mcqs' : activeTab === 'fillblank' ? 'fill' : 'desc', unitId] });
      toast.success("Created!");
      setIsModalOpen(false);
    }
  });

  const updateMut = useMutation<any, Error, any>({
    mutationFn: ({ id, data }: any) => {
      const api = getApi();
      const preparedData = prepareDataForApi(data, activeTab);
      return api.update(id, preparedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [activeTab === 'mcq' ? 'mcqs' : activeTab === 'fillblank' ? 'fill' : 'desc', unitId] });
      toast.success("Updated!");
      setIsModalOpen(false);
    }
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => {
      const api = getApi();
      return api.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [activeTab === 'mcq' ? 'mcqs' : activeTab === 'fillblank' ? 'fill' : 'desc', unitId] });
      toast.success("Deleted!");
      setIsDeleteModalOpen(false);
    }
  });

  const list: any[] = activeTab === "mcq" ? mcqs : activeTab === "fillblank" ? fill : desc;
  const isLoading = activeTab === "mcq" ? isLoadingMcq : activeTab === "fillblank" ? isLoadingFill : isLoadingDesc;

  // FIX #05: Reset form state when modal is opened/closed
  const openCreate = useCallback(() => {
    setSelectedQuestion(null);
    const initialData = activeTab === 'mcq' ? { options: ['', '', '', ''] } : { answer: [{ type: 'text', content: '' }] };
    setFormData(initialData);
    setIsModalOpen(true);
  }, [activeTab]);

  const openEdit = useCallback((q: any) => {
    setSelectedQuestion(q);
    let initialFormData = { ...q };
    if (activeTab === 'mcq' && typeof q.correctAnswer === 'number' && q.options) {
      // Convert index back to string for form
      initialFormData.correctAnswer = q.options[q.correctAnswer] || '';
    }
    setFormData(initialFormData);
    setIsModalOpen(true);
  }, [activeTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.question || formData.question.trim() === "") {
      toast.error("Question text is required");
      return;
    }

    if (activeTab === "mcq" && (!formData.options || formData.options.some(opt => !opt.trim()))) {
      toast.error("All MCQ options must be filled");
      return;
    }

    if (activeTab === "fillblank" && !formData.correctAnswer) {
      toast.error("Correct answer is required for fill-in-the-blank questions");
      return;
    }

    if (activeTab === "descriptive" && (!formData.answer || formData.answer.length === 0)) {
      toast.error("At least one answer block is required for descriptive questions");
      return;
    }

    // Proceed with submission
    if (selectedQuestion) {
      updateMut.mutate({ id: selectedQuestion._id, data: formData });
    } else {
      createMut.mutate(formData);
    }
  };

  // FIX #05: Reset bulk import state when modal is closed
  useEffect(() => {
    if (!isBulkModalOpen) {
      setBulkFiles([]);
      setBulkImages([]);
    }
  }, [isBulkModalOpen]);

  // FIX #09: Enhanced search to include answer text for descriptive questions
  const filtered = list?.filter((q: any) => {
    const questionMatch = (q.question || "").toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === "descriptive") {
      const answerMatch = JSON.stringify(q.answer || "").toLowerCase().includes(searchTerm.toLowerCase());
      return questionMatch || answerMatch;
    }
    return questionMatch;
  });

  // Handle bulk import with modal close logic
  const handleBulkImportWithModalClose = async () => {
    const shouldClose = await handleBulkImport(bulkFiles, uploadedRefs);
    if (shouldClose) {
      setIsBulkModalOpen(false);
    }
  };

  // 🚀 NEW: Handle combined import (images + JSON together) for descriptive
  const handleCombinedImportWithModalClose = async () => {
    const shouldClose = await handleCombinedImport(bulkImages, bulkFiles);
    if (shouldClose) {
      setIsBulkModalOpen(false);
    }
  };

  // 🚀 NEW: Bulk Delete Handlers
  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = filtered?.map((q: any) => q._id) || [];
      setSelectedIds(new Set(allIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} questions? This action cannot be undone.`)) {
      return;
    }

    setIsBulkDeleting(true);
    const api = getApi();
    const idsToDelete = Array.from(selectedIds);

    try {
      // Execute deletions in parallel
      await Promise.all(idsToDelete.map(id => api.delete(id)));

      toast.success(`Successfully deleted ${selectedIds.size} questions.`);
      setSelectedIds(new Set()); // Clear selection

      // Invalidate queries to refresh list
      queryClient.invalidateQueries({ queryKey: [activeTab === 'mcq' ? 'mcqs' : activeTab === 'fillblank' ? 'fill' : 'desc', unitId] });

    } catch (error) {
      console.error("Bulk delete failed:", error);
      toast.error("Failed to delete some questions. Please try again.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  return (
    <div className="space-y-6 px-4 sm:px-0 max-w-7xl mx-auto">
      {/* --- 1. DUAL DROPDOWN HEADER --- */}
      <div className="flex flex-col gap-6 border-b pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="h-10 w-10 rounded-full">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Question Manager</h1>
              <p className="text-sm text-muted-foreground">Select Subject & Unit to manage content.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-[250px]">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">1. Subject</Label>
              <Select value={selectedSubjectId} onValueChange={(v) => setSelectedSubjectId(v)}>
                <SelectTrigger className="h-10 bg-background">
                  <div className="flex gap-2 items-center">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <SelectValue placeholder="Select Subject..." />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {allSubjects?.map((s: any) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-[250px]">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">2. Unit</Label>
              <Select
                value={unitId || ""}
                onValueChange={(v) => navigate(`/questions/${v}`)}
                disabled={!selectedSubjectId}
              >
                <SelectTrigger className="h-10 bg-background">
                  <div className="flex gap-2 items-center">
                    <Layers className="w-4 h-4 text-muted-foreground" />
                    <SelectValue placeholder={!selectedSubjectId ? "Select Subject First" : "Select Unit..."} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {availableUnits?.map((u: any) => (
                    <SelectItem key={u._id} value={u._id}>
                      <span className="text-muted-foreground mr-2">#{u.unit}</span>
                      {u.title}
                    </SelectItem>
                  ))}
                  {availableUnits?.length === 0 && (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      No units found
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* --- 2. MAIN CONTENT AREA --- */}
      {!unitId ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-xl bg-muted/5"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <MousePointerClick className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Ready to Edit</h2>
          <p className="text-muted-foreground text-center mt-2 max-w-md">
            Please use dropdowns above to select a <strong>Subject</strong> and a
            <strong>Unit</strong>. The questions list will appear here.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-card/50 p-1 rounded-lg border">
            <Tabs
              value={activeTab}
              onValueChange={(v: any) => setActiveTab(v)}
              className="w-full sm:w-auto"
            >
              <TabsList className="h-9 w-full sm:w-auto">
                <TabsTrigger value="mcq" className="text-xs">
                  MCQ ({mcqs?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="fillblank" className="text-xs">
                  Fill ({fill?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="descriptive" className="text-xs">
                  Desc ({desc?.length || 0})
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-[200px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-9 text-sm bg-background/50"
                />
              </div>
              <Button onClick={openCreate} size="sm" className="h-9">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-9"
                onClick={() => setIsBulkModalOpen(true)}
              >
                <Upload className="w-3.5 h-3.5 mr-1" /> Bulk Import
              </Button>
            </div>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid gap-3">
              {/* 🚀 NEW: Select All Header */}
              {filtered.length > 0 && (
                <div className="flex items-center gap-4 px-4 py-2 bg-muted/30 rounded-lg border border-transparent hover:border-border transition-colors">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                  <span className="text-sm font-medium text-muted-foreground">Select All</span>
                  {/* 🚀 NEW: Bulk Delete Button */}
                  {selectedIds.size > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                      disabled={isBulkDeleting}
                      className="animate-in fade-in slide-in-from-right-5"
                    >
                      {isBulkDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                      Delete Selected ({selectedIds.size})
                    </Button>
                  )}
                </div>
              )}

              {filtered?.map((q: any, i: number) => (
                <motion.div
                  key={q._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={`hover:border-primary/50 transition-colors ${selectedIds.has(q._id) ? 'border-primary bg-primary/5' : ''}`}>
                    <CardContent className="p-4 flex gap-4">
                      {/* 🚀 NEW: Row Checkbox */}
                      <div className="pt-1">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                          checked={selectedIds.has(q._id)}
                          onChange={() => handleSelect(q._id)}
                        />
                      </div>

                      <div
                        className={`w-10 h-10 rounded flex items-center justify-center bg-muted shrink-0`}
                      >
                        {activeTab === "mcq" ? (
                          <CheckCircle2 className="w-5 h-5 text-blue-500" />
                        ) : activeTab === "fillblank" ? (
                          <Type className="w-5 h-5 text-amber-500" />
                        ) : (
                          <FileText className="w-5 h-5 text-purple-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-base truncate">
                          {q.question}
                        </h3>
                        <div className="text-xs text-muted-foreground mt-1 truncate">
                          {activeTab === "mcq" && q.options && q.options.join(", ")}
                          {activeTab === "fillblank" && (
                            <span>
                              Answer:{" "}
                              <span className="font-mono bg-muted px-1 rounded">
                                {q.correctAnswer}
                              </span>
                            </span>
                          )}
                          {activeTab === "descriptive" && (
                            <span>{q.answer?.length || 0} Content Blocks</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(q)}
                          aria-label={`Edit question: ${q.question}`}
                        >
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedQuestion(q);
                            setIsDeleteModalOpen(true);
                          }}
                          aria-label={`Delete question: ${q.question}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              {/* FIX #12: Show appropriate message when no questions found */}
              {filtered?.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  {isLoading ? "Loading questions..." : "No questions found in this unit."}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          selectedQuestion
            ? `Edit ${activeTab === 'mcq' ? 'MCQ' : activeTab === 'fillblank' ? 'Fill Blank' : 'Descriptive'}`
            : `Create ${activeTab === 'mcq' ? 'MCQ' : activeTab === 'fillblank' ? 'Fill Blank' : 'Descriptive'}`
        }
        size="lg"
      >
        <ModalLayout
          title={selectedQuestion ? "Edit Question" : "Create Question"}
          footer={
            <>
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUploadingGlobal || createMut.isPending || updateMut.isPending}
              >
                {isUploadingGlobal ? "Uploading..." : "Save Question"}
              </Button>
            </>
          }
        >
          <form onSubmit={handleSubmit}>
            {activeTab === "mcq" && (
              <MCQForm formData={formData} setFormData={setFormData} />
            )}
            {activeTab === "fillblank" && (
              <FillBlankForm formData={formData} setFormData={setFormData} />
            )}
            {activeTab === "descriptive" && (
              <DescriptiveForm
                formData={formData}
                setFormData={setFormData}
                setIsUploadingGlobal={setIsUploadingGlobal}
              />
            )}
          </form>
        </ModalLayout>
      </FormModal>

      {/* FIX #08: Include question text in delete confirmation */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          if (selectedQuestion) {
            deleteMut.mutate(selectedQuestion._id);
          }
        }}
        title="Delete Question"
        description={`Are you sure you want to delete this question? "${selectedQuestion?.question || ''}"`}
        isLoading={deleteMut.isPending}
      />

      {/* Bulk Import Modal */}
      <FormModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title={`Bulk Import ${activeTab.toUpperCase()}`}
        size="lg"
      >
        <div className="space-y-6">
          {activeTab === "descriptive" ? (
            // 🚀 SINGLE-STEP COMBINED IMPORT
            <div className="border rounded-2xl bg-gradient-to-br from-muted/40 to-background p-6 shadow-inner">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-500" /> Combined Import
                </h3>
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600">Direct Upload</Badge>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Select your images and JSON files together. Images will upload directly to cloud, then questions will be imported automatically.
              </p>

              {/* Images Selection */}
              <div className="space-y-3 mb-4">
                <Label className="text-sm font-medium">1. Select Diagram Images (optional)</Label>
                <label className="border-2 border-dashed border-blue-400/40 bg-blue-50/30 hover:bg-blue-50 cursor-pointer rounded-xl py-6 flex flex-col items-center justify-center transition-colors">
                  <ImageIcon className="w-8 h-8 text-blue-400 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to select <strong>images</strong>
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={(e) => {
                      const newFiles = Array.from(e.target.files || []);
                      setBulkImages(prev => [...prev, ...newFiles]);
                      // Reset input to allow re-selecting the same file
                      e.target.value = '';
                    }}
                  />
                </label>
                {bulkImages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {bulkImages.map((img, i) => (
                      <Badge key={i} variant="secondary" className="flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        {img.name}
                        <button onClick={() => setBulkImages(bulkImages.filter((_, idx) => idx !== i))} className="ml-1 hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* JSON Selection */}
              <div className="space-y-3 mb-4">
                <Label className="text-sm font-medium">2. Select JSON Files (required)</Label>
                <label className="border-2 border-dashed border-green-400/40 bg-green-50/30 hover:bg-green-50 cursor-pointer rounded-xl py-6 flex flex-col items-center justify-center transition-colors">
                  <FileText className="w-8 h-8 text-green-400 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to select <strong>JSON files</strong>
                  </p>
                  <input
                    type="file"
                    accept=".json"
                    multiple
                    hidden
                    onChange={(e) => {
                      const newFiles = Array.from(e.target.files || []);
                      setBulkFiles(prev => [...prev, ...newFiles]);
                      e.target.value = '';
                    }}
                  />
                </label>
                {bulkFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {bulkFiles.map((f, i) => (
                      <Badge key={i} variant="secondary" className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {f.name}
                        <button onClick={() => setBulkFiles(bulkFiles.filter((_, idx) => idx !== i))} className="ml-1 hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Template Download */}
              <div className="bg-muted/50 rounded-lg p-3 mb-4">
                <p className="text-xs text-muted-foreground mb-2">
                  <strong>Tip:</strong> Use filenames as <code className="bg-muted px-1 rounded">ref</code> in your JSON:
                </p>
                <pre className="text-xs bg-slate-900 text-slate-100 p-2 rounded overflow-auto">
                  {`{ "type": "diagram", "ref": "figure1.png" }`}
                </pre>
              </div>

              {/* ⚠️ CAUTION STATEMENT */}
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 mb-4 flex items-start gap-2">
                <span className="text-amber-600 text-lg">⚠️</span>
                <div className="text-xs text-amber-800">
                  <p className="font-semibold mb-1">Important: Exact Filename Match Required</p>
                  <p>The <code className="bg-amber-100 px-1 rounded">ref</code> in your JSON must <strong>exactly match</strong> the uploaded image filename <strong>including extension</strong> (case-sensitive).</p>
                  <p className="mt-1">Example: If you upload <code className="bg-amber-100 px-1 rounded">Network-Diagram.png</code>, use <code className="bg-amber-100 px-1 rounded">"ref": "Network-Diagram.png"</code></p>
                </div>
              </div>
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto mt-2"
                onClick={() => {
                  const template = {
                    descriptives: [
                      {
                        question: "Explain the concept shown in the diagram.",
                        topic: "General",
                        answer: [
                          { type: "text", content: "Your explanation here..." },
                          { type: "diagram", ref: "your-image-filename.png" },
                        ],
                      },
                    ],
                  };
                  const blob = new Blob([JSON.stringify(template, null, 2)], { type: "application/json" });
                  const link = document.createElement("a");
                  link.href = URL.createObjectURL(blob);
                  link.download = "descriptive_template.json";
                  link.click();
                }}
              >
                <FileText className="w-3 h-3 mr-1" /> Download Template
              </Button>
            </div>
          ) : (
            <div className="border rounded-2xl bg-gradient-to-br from-muted/40 to-background p-6 shadow-inner">
              <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" /> Upload JSON
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Upload <strong>JSON</strong> files containing your{" "}
                <strong>{activeTab.toUpperCase()}</strong> questions.
              </p>
              <label className="border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 cursor-pointer rounded-xl py-10 flex flex-col items-center justify-center transition-colors">
                <Upload className="w-10 h-10 text-primary mb-2" />
                <p className="text-sm text-muted-foreground">
                  Drag & drop or click to select <strong>multiple JSON</strong> files
                </p>
                <input
                  type="file"
                  accept=".json"
                  multiple
                  hidden
                  onChange={(e) => setBulkFiles(Array.from(e.target.files || []))}
                />
              </label>

              {/* Display selected file information */}
              {bulkFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {bulkFiles.map((f, i) => (
                    <div key={i} className="p-3 bg-primary/50 border border-primary/200 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{f.name}</p>
                          <p className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(2)} KB</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setBulkFiles(bulkFiles.filter((_, idx) => idx !== i))}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Import Button */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsBulkModalOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={bulkFiles.length === 0 || isImportingData}
              onClick={activeTab === "descriptive" ? handleCombinedImportWithModalClose : handleBulkImportWithModalClose}
              className={activeTab === "descriptive" ? "bg-purple-600 hover:bg-purple-700" : ""}
            >
              {isImportingData ? "Importing..." :
                activeTab === "descriptive" ?
                  `Import All (${bulkImages.length} images, ${bulkFiles.length} JSON)` :
                  "Upload & Import"}
            </Button>
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default Questions;