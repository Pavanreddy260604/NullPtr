import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  Plus, Edit, Trash2, Search, ArrowLeft, CheckCircle2, Circle,
  Type, Code, List, Heading, Image as ImageIcon, Upload,
  BookOpen, Layers, FileText, MousePointerClick, ArrowUp, ArrowDown, X
} from 'lucide-react';
import {
  unitApi, mcqApi, fillBlankApi, descriptiveApi, uploadApi, subjectApi,
  MCQ, FillBlank, Descriptive, AnswerBlock,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import FormModal from '@/components/shared/FormModal';
import ConfirmModal from '@/components/shared/ConfirmModal';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

/* -------------------------------------------------------------------------- */
/* 🧠 MCQ FORM (Polished)                                                     */
/* -------------------------------------------------------------------------- */
const MCQForm: React.FC<{ formData: Partial<MCQ>; setFormData: any }> = ({ formData, setFormData }) => {
  const [options, setOptions] = useState<string[]>(formData.options || ['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState<string>(formData.correctAnswer || '');

  const updateOption = (i: number, t: string) => {
    const n = [...options]; n[i] = t; setOptions(n);
    setFormData({ ...formData, options: n });
  };

  const handleSelect = (opt: string) => {
    setCorrectAnswer(opt);
    setFormData({ ...formData, correctAnswer: opt });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-base">Question Text</Label>
        <Textarea
          value={formData.question || ''}
          onChange={e => setFormData({ ...formData, question: e.target.value })}
          placeholder="e.g., What is the powerhouse of the cell?"
          className="resize-none text-base"
          rows={3}
          required
        />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label>Options</Label>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">Click circle to select correct answer</span>
        </div>
        <div className="grid gap-3">
          {options.map((o, i) => (
            <div key={i} className={`group flex items-center gap-3 p-2 rounded-lg border-2 transition-all ${correctAnswer === o && o ? 'border-green-500 bg-green-50/50' : 'border-transparent bg-muted/30 focus-within:border-primary/50 hover:bg-muted/50'}`}>
              <button type="button" onClick={() => handleSelect(o)} className="shrink-0">
                {correctAnswer === o && o ? <CheckCircle2 className="w-6 h-6 text-green-600 fill-green-100" /> : <Circle className="w-6 h-6 text-muted-foreground group-hover:text-primary/50" />}
              </button>
              <Input
                value={o}
                onChange={e => updateOption(i, e.target.value)}
                className="border-0 shadow-none h-auto py-2 bg-transparent focus-visible:ring-0 text-base"
                placeholder={`Option ${i + 1}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 🧩 FILL IN THE BLANK FORM (With Live Preview)                              */
/* -------------------------------------------------------------------------- */
const FillBlankForm: React.FC<{ formData: Partial<FillBlank>; setFormData: any }> = ({ formData, setFormData }) => {
  // Generate preview HTML
  const getPreview = () => {
    if (!formData.question) return <span className="text-muted-foreground italic">Preview will appear here...</span>;
    const parts = formData.question.split('___');
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
              value={formData.question || ''}
              onChange={e => setFormData({ ...formData, question: e.target.value })}
              placeholder="Type your sentence here..."
              className="min-h-[120px] resize-none text-base"
              required
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono text-[10px] border border-primary/20">___</span>
              Type 3 underscores to create a blank.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Correct Answer</Label>
            <div className="relative">
              <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
              <Input
                value={formData.correctAnswer || ''}
                onChange={e => setFormData({ ...formData, correctAnswer: e.target.value })}
                placeholder="Exact word match (e.g., Paris)"
                className="pl-9 font-medium"
                required
              />
            </div>
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="space-y-2">
          <Label className="text-muted-foreground">Student Preview</Label>
          <div className="h-full min-h-[120px] bg-muted/30 rounded-xl border border-dashed border-primary/20 p-6 flex items-center justify-center text-center">
            {getPreview()}
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 🖼️ DESCRIPTIVE FORM (Rich Block Editor)                                    */
/* -------------------------------------------------------------------------- */
const DescriptiveForm: React.FC<{ formData: Partial<Descriptive>; setFormData: any; setIsUploadingGlobal: any }> = ({ formData, setFormData, setIsUploadingGlobal }) => {
  const [blocks, setBlocks] = useState<AnswerBlock[]>(formData.answer || [{ type: 'text', content: '' }]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadIndex, setActiveUploadIndex] = useState<number | null>(null);

  const updateBlocks = (newBlocks: AnswerBlock[]) => {
    setBlocks(newBlocks);
    setFormData({ ...formData, answer: newBlocks });
  };

  const updateContent = (i: number, v: string) => {
    const n = [...blocks]; n[i].content = v; updateBlocks(n);
  };

  const addBlock = (type: any) => {
    updateBlocks([...blocks, { type, content: '' }]);
  };

  const removeBlock = (i: number) => {
    if (blocks.length > 1) {
      const n = blocks.filter((_, x) => x !== i);
      updateBlocks(n);
    }
  };

  const moveBlock = (i: number, direction: 'up' | 'down') => {
    if (direction === 'up' && i > 0) {
      const n = [...blocks];
      [n[i], n[i - 1]] = [n[i - 1], n[i]];
      updateBlocks(n);
    } else if (direction === 'down' && i < blocks.length - 1) {
      const n = [...blocks];
      [n[i], n[i + 1]] = [n[i + 1], n[i]];
      updateBlocks(n);
    }
  };

  const triggerUpload = (index: number) => {
    setActiveUploadIndex(index);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || activeUploadIndex === null) return;

    setIsUploadingGlobal(true);
    toast.info("Uploading image...");

    try {
      const r = await uploadApi.upload(f);
      const n = [...blocks];
      n[activeUploadIndex].content = r.data.fileUrl;
      updateBlocks(n);
      toast.success("Image uploaded!");
    } catch {
      toast.error("Upload failed.");
    } finally {
      setIsUploadingGlobal(false);
      setActiveUploadIndex(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Question Title */}
      <div className="space-y-2">
        <Label>Question Title</Label>
        <Textarea
          value={formData.question || ''}
          onChange={e => setFormData({ ...formData, question: e.target.value })}
          placeholder="e.g., Explain the process of photosynthesis."
          className="font-medium text-lg resize-none"
          rows={2}
          required
        />
      </div>

      {/* Editor Toolbar */}
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

        {/* Hidden File Input */}
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

        {/* Blocks Area */}
        <ScrollArea className="h-[400px] border rounded-xl bg-muted/10 p-4 shadow-inner">
          <div className="space-y-3">
            {blocks.map((block, i) => (
              <motion.div layout key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative group bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow p-1">
                {/* Block Controls (Hover) */}
                <div className="absolute -right-3 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <Button type="button" variant="secondary" size="icon" className="h-6 w-6 rounded-full shadow border" onClick={() => removeBlock(i)}><X className="w-3 h-3 text-red-500" /></Button>
                  <Button type="button" variant="outline" size="icon" className="h-6 w-6 rounded-full bg-background" onClick={() => moveBlock(i, 'up')} disabled={i === 0}><ArrowUp className="w-3 h-3" /></Button>
                  <Button type="button" variant="outline" size="icon" className="h-6 w-6 rounded-full bg-background" onClick={() => moveBlock(i, 'down')} disabled={i === blocks.length - 1}><ArrowDown className="w-3 h-3" /></Button>
                </div>

                {/* Block Content */}
                <div className="p-3">
                  {/* Label Badge */}
                  <div className="mb-2">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-muted-foreground h-5">
                      {block.type}
                    </Badge>
                  </div>

                  {/* Render based on Type */}
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

          {/* Empty State Help */}
          {blocks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Click buttons above to add content blocks.
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 🚀 MAIN UNIFIED COMPONENT                                                  */
/* -------------------------------------------------------------------------- */
const Questions: React.FC = () => {
  const { unitId } = useParams<{ unitId?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Local State
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'mcq' | 'fillblank' | 'descriptive'>('mcq');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [isUploadingGlobal, setIsUploadingGlobal] = useState(false);

  // --- DATA FETCHING ---

  // 1. Get All Subjects (For Dropdown 1)
  const { data: allSubjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectApi.getAll().then(res => res.data),
  });

  // 2. Get Current Unit (If ID exists in URL) to sync dropdowns
  const { data: currentUnit } = useQuery({
    queryKey: ['unit', unitId],
    queryFn: () => unitApi.getById(unitId!).then(res => res.data),
    enabled: !!unitId,
  });

  // 3. Sync Subject Dropdown when Unit loads
  useEffect(() => {
    if (currentUnit?.subjectId) {
      const sId = typeof currentUnit.subjectId === 'object' ? currentUnit.subjectId._id : currentUnit.subjectId;
      setSelectedSubjectId(sId);
    }
  }, [currentUnit]);

  // 4. Get Units for the Selected Subject (For Dropdown 2)
  const { data: availableUnits } = useQuery({
    queryKey: ['units', selectedSubjectId],
    queryFn: () => unitApi.getBySubject(selectedSubjectId).then(res => res.data),
    enabled: !!selectedSubjectId,
  });

  // 5. Get Questions (Only if Unit selected)
  const { data: mcqs, isLoading: l1 } = useQuery({ queryKey: ['mcqs', unitId], queryFn: () => mcqApi.getByUnit(unitId!).then(res => res.data), enabled: !!unitId });
  const { data: fill, isLoading: l2 } = useQuery({ queryKey: ['fill', unitId], queryFn: () => fillBlankApi.getByUnit(unitId!).then(res => res.data), enabled: !!unitId });
  const { data: desc, isLoading: l3 } = useQuery({ queryKey: ['desc', unitId], queryFn: () => descriptiveApi.getByUnit(unitId!).then(res => res.data), enabled: !!unitId });

  // --- HANDLERS ---
  const handleSubjectChange = (val: string) => {
    setSelectedSubjectId(val);
    navigate('/questions'); // Clear URL to reset unit
  };

  const handleUnitChange = (val: string) => {
    navigate(`/questions/${val}`); // Navigate to specific unit
  };

  const getApi = () => (activeTab === 'mcq' ? mcqApi : activeTab === 'fillblank' ? fillBlankApi : descriptiveApi);

  const createMut = useMutation({
    mutationFn: (d: any) => {
      const api = getApi();
      if (!unitId || !selectedSubjectId) throw new Error("Missing ID");
      if (activeTab === 'mcq' && Array.isArray(d.options)) {
        // Auto-fix index for MCQ
        const idx = d.options.findIndex((o: string) => o === d.correctAnswer);
        d.correctAnswer = idx >= 0 ? idx : 0;
      }
      return api.create({ ...d, unitId, subjectId: selectedSubjectId, topic: currentUnit?.title || "General" });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [activeTab === 'mcq' ? 'mcqs' : activeTab === 'fillblank' ? 'fill' : 'desc', unitId] }); toast.success("Created!"); setIsModalOpen(false); }
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: any) => getApi().update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [activeTab === 'mcq' ? 'mcqs' : activeTab === 'fillblank' ? 'fill' : 'desc', unitId] }); toast.success("Updated!"); setIsModalOpen(false); }
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => getApi().delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [activeTab === 'mcq' ? 'mcqs' : activeTab === 'fillblank' ? 'fill' : 'desc', unitId] }); toast.success("Deleted!"); setIsDeleteModalOpen(false); }
  });

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); selectedQuestion ? updateMut.mutate({ id: selectedQuestion._id, data: formData }) : createMut.mutate(formData); };

  const openCreate = () => { setSelectedQuestion(null); setFormData(activeTab === 'mcq' ? { options: ['', '', '', ''] } : { answer: [{ type: 'text', content: '' }] }); setIsModalOpen(true); };
  const openEdit = (q: any) => { setSelectedQuestion(q); setFormData(q); setIsModalOpen(true); };

  const isLoading = l1 || l2 || l3;
  const list = activeTab === 'mcq' ? mcqs : activeTab === 'fillblank' ? fill : desc;

  // FIX: Safe filtering logic
  const filtered = list?.filter((q: any) =>
    (q.question || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 px-4 sm:px-0 max-w-7xl mx-auto">

      {/* --- 1. DUAL DROPDOWN HEADER (Replaces your List Page) --- */}
      <div className="flex flex-col gap-6 border-b pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => navigate('/')} className="h-10 w-10 rounded-full">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Question Manager</h1>
              <p className="text-sm text-muted-foreground">Select Subject & Unit to manage content.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* SUBJECT SELECT */}
            <div className="w-full sm:w-[250px]">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">1. Subject</Label>
              <Select value={selectedSubjectId} onValueChange={handleSubjectChange}>
                <SelectTrigger className="h-10 bg-background"><div className="flex gap-2 items-center"><BookOpen className="w-4 h-4 text-muted-foreground" /><SelectValue placeholder="Select Subject..." /></div></SelectTrigger>
                <SelectContent>
                  {allSubjects?.map((s: any) => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* UNIT SELECT */}
            <div className="w-full sm:w-[250px]">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">2. Unit</Label>
              <Select value={unitId || ''} onValueChange={handleUnitChange} disabled={!selectedSubjectId}>
                <SelectTrigger className="h-10 bg-background"><div className="flex gap-2 items-center"><Layers className="w-4 h-4 text-muted-foreground" /><SelectValue placeholder={!selectedSubjectId ? "Select Subject First" : "Select Unit..."} /></div></SelectTrigger>
                <SelectContent>
                  {availableUnits?.map((u: any) => <SelectItem key={u._id} value={u._id}><span className="text-muted-foreground mr-2">#{u.unit}</span>{u.title}</SelectItem>)}
                  {availableUnits?.length === 0 && <div className="p-2 text-center text-sm text-muted-foreground">No units found</div>}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* --- 2. MAIN CONTENT AREA --- */}

      {/* STATE A: NO UNIT SELECTED (Empty State) */}
      {!unitId ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-xl bg-muted/5">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <MousePointerClick className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Ready to Edit</h2>
          <p className="text-muted-foreground text-center mt-2 max-w-md">
            Please use the dropdowns above to select a <strong>Subject</strong> and a <strong>Unit</strong>. The questions list will appear here.
          </p>
        </motion.div>
      ) : (

        /* STATE B: UNIT SELECTED (Questions List) */
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-card/50 p-1 rounded-lg border">
            <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full sm:w-auto">
              <TabsList className="h-9 w-full sm:w-auto">
                <TabsTrigger value="mcq" className="text-xs">MCQ ({mcqs?.length || 0})</TabsTrigger>
                <TabsTrigger value="fillblank" className="text-xs">Fill ({fill?.length || 0})</TabsTrigger>
                <TabsTrigger value="descriptive" className="text-xs">Desc ({desc?.length || 0})</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-[200px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 h-9 text-sm bg-background/50" />
              </div>
              <Button onClick={openCreate} size="sm" className="h-9"><Plus className="w-3.5 h-3.5 mr-1" /> Add</Button>
            </div>
          </div>

          {/* List */}
          {isLoading ? <LoadingSpinner /> : (
            <div className="grid gap-3">
              {filtered?.map((q: any, i: number) => (
                <motion.div key={q._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-4 flex gap-4">
                      <div className={`w-10 h-10 rounded flex items-center justify-center bg-muted shrink-0`}>
                        {activeTab === 'mcq' ? <CheckCircle2 className="w-5 h-5 text-blue-500" /> : activeTab === 'fillblank' ? <Type className="w-5 h-5 text-amber-500" /> : <FileText className="w-5 h-5 text-purple-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-base truncate">{q.question}</h3>
                        <div className="text-xs text-muted-foreground mt-1 truncate">
                          {activeTab === 'mcq' && q.options && q.options.join(', ')}
                          {activeTab === 'fillblank' && <span>Answer: <span className="font-mono bg-muted px-1 rounded">{q.correctAnswer}</span></span>}
                          {activeTab === 'descriptive' && <span>{q.answer?.length || 0} Content Blocks</span>}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(q)}><Edit className="w-4 h-4 text-muted-foreground" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedQuestion(q); setIsDeleteModalOpen(true); }}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              {filtered?.length === 0 && <div className="text-center py-12 text-muted-foreground">No questions found.</div>}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <FormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedQuestion ? `Edit ${activeTab === 'mcq' ? 'MCQ' : activeTab === 'fillblank' ? 'Fill Blank' : 'Descriptive'}` : `Create ${activeTab === 'mcq' ? 'MCQ' : activeTab === 'fillblank' ? 'Fill Blank' : 'Descriptive'}`} size="lg">
        <form onSubmit={handleSubmit}>
          {activeTab === 'mcq' && <MCQForm formData={formData} setFormData={setFormData} />}
          {activeTab === 'fillblank' && <FillBlankForm formData={formData} setFormData={setFormData} />}
          {activeTab === 'descriptive' && <DescriptiveForm formData={formData} setFormData={setFormData} setIsUploadingGlobal={setIsUploadingGlobal} />}
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isUploadingGlobal || createMut.isPending || updateMut.isPending}>{isUploadingGlobal ? 'Uploading...' : 'Save Question'}</Button>
          </div>
        </form>
      </FormModal>

      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={() => selectedQuestion && deleteMut.mutate(selectedQuestion._id)} title="Delete Question" description="Are you sure?" isLoading={deleteMut.isPending} />
    </div>
  );
};

export default Questions;