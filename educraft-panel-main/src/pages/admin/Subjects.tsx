import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, BookOpen, Search, Layers, Upload, FileDown } from 'lucide-react';
import { subjectApi, uploadApi, Subject } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import FormModal from '@/components/shared/FormModal';
import ConfirmModal from '@/components/shared/ConfirmModal';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import BulkImportModal from '@/components/shared/BulkImportModal';

const Subjects: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    thumbnail: '',
  });
  const [isUploading, setIsUploading] = useState(false);

  // ... (Keep all your existing API logic, queries, and mutations exactly the same)
  const { data: subjects, isLoading, error } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectApi.getAll().then(res => res.data),
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Subject, '_id'>) => subjectApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject created successfully!');
      closeModal();
    },
    onError: () => toast.error('Failed to create subject'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Subject> }) =>
      subjectApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject updated successfully!');
      closeModal();
    },
    onError: () => toast.error('Failed to update subject'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => subjectApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject deleted successfully!');
      setIsDeleteModalOpen(false);
      setSelectedSubject(null);
    },
    onError: () => toast.error('Failed to delete subject'),
  });

  // ... (Keep bulk import logic same)
  const handleBulkImport = async (items: Omit<Subject, '_id'>[]) => {
    let successCount = 0;
    for (const item of items) {
      try {
        await subjectApi.create(item);
        successCount++;
      } catch {
        console.error('Failed to import item:', item);
      }
    }
    queryClient.invalidateQueries({ queryKey: ['subjects'] });
    toast.success(`Imported ${successCount} of ${items.length} subjects`);
  };

  const bulkImportFields = [
    { name: 'name', required: true, example: 'Mathematics' },
    { name: 'code', required: true, example: 'MATH101' },
    { name: 'description', required: false, example: 'Introduction to algebra and calculus' },
  ];

  const parseSubjectRow = (row: Record<string, string>): Omit<Subject, '_id'> => ({
    name: row.name,
    code: row.code,
    description: row.description || '',
  });

  const openCreateModal = () => {
    setSelectedSubject(null);
    setFormData({ name: '', code: '', description: '', thumbnail: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (subject: Subject) => {
    setSelectedSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      description: subject.description,
      thumbnail: subject.thumbnail || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSubject(null);
    setFormData({ name: '', code: '', description: '', thumbnail: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSubject) {
      updateMutation.mutate({ id: selectedSubject._id, data: formData });
    } else {
      createMutation.mutate(formData as Omit<Subject, '_id'>);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    toast.info('Uploading image...');
    try {
      const response = await uploadApi.upload(file);
      setFormData({ ...formData, thumbnail: response.data.fileUrl });
      toast.success('Image uploaded successfully!');
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const filteredSubjects = subjects?.filter(
    subject =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <LoadingSpinner />;

  // ... (Keep Error State same)
  if (error) {
    return (
      <div className="space-y-6 px-4 sm:px-0">
        {/* ... existing error UI ... */}
        <div>Error loading subjects</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 sm:px-0 max-w-7xl mx-auto">
      {/* Modern Header Section 
        Changes:
        1. Separated Title from Controls
        2. Flexbox row for Search + Buttons
      */}
      <div className="flex flex-col gap-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Subjects</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage your curriculum and learning paths.
          </p>
        </motion.div>

        {/* Control Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-card/50 p-1 rounded-lg sm:bg-transparent sm:p-0"
        >
          {/* Search Bar - Wider and cleaner */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 bg-background/50 border-input/60 focus:bg-background transition-all"
            />
          </div>

          {/* Action Buttons - Compact and Modern */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => setIsBulkImportOpen(true)}
              className="flex-1 sm:flex-none h-10 gap-2 text-muted-foreground hover:text-foreground border-dashed"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Import</span>
              <span className="sm:hidden">Import</span>
            </Button>

            <Button
              onClick={openCreateModal}
              variant="default" // or "gradient" if you have that configured
              className="flex-1 sm:flex-none h-10 gap-2 px-6 shadow-sm hover:shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Subject
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredSubjects?.map((subject, index) => (
          <motion.div
            key={subject._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <Card
              className="group hover:border-primary/50 transition-all duration-300 h-full cursor-pointer overflow-hidden border-border/60 bg-card/50 hover:bg-card hover:shadow-lg"
              onClick={() => navigate(`/subjects/${subject._id}/units`)}
            >
              <CardContent className="p-0 flex flex-col h-full">
                {/* Image Section */}
                <div className="relative h-40 overflow-hidden bg-muted/30">
                  {subject.thumbnail ? (
                    <img
                      src={subject.thumbnail}
                      alt={subject.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                      <BookOpen className="w-12 h-12" />
                    </div>
                  )}
                  {/* Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-md bg-background/90 backdrop-blur-sm text-xs font-semibold shadow-sm border border-border/50">
                      {subject.code}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg tracking-tight group-hover:text-primary transition-colors">
                      {subject.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1 h-10">
                      {subject.description || 'No description available'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-auto border-t border-border/40">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <Layers className="w-3.5 h-3.5" />
                      <span>{subject.units?.length || 0} Units</span>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted" onClick={() => openEditModal(subject)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => {
                          setSelectedSubject(subject);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State if no subjects found 
        (Optional but makes it look very professional)
      */}
      {filteredSubjects?.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/10">
          <div className="bg-muted/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No subjects found</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Try adjusting your search or add a new subject.
          </p>
        </div>
      )}

      {/* Modals keep their logic but benefit from global style updates */}
      <FormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedSubject ? 'Edit Subject' : 'New Subject'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ... Keep existing form content ... */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input id="code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
            </div>
            {/* Thumbnail logic remains same */}
            <div className="space-y-2">
              <Label>Thumbnail</Label>
              <div className="flex gap-4 items-center border rounded-lg p-3 bg-muted/20">
                {formData.thumbnail && <img src={formData.thumbnail} className="w-12 h-12 rounded object-cover" />}
                <Input type="file" accept="image/*" onChange={handleFileUpload} disabled={isUploading} className="border-0 bg-transparent shadow-none p-0 h-auto file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button type="submit" disabled={isUploading}>{selectedSubject ? 'Save Changes' : 'Create Subject'}</Button>
          </div>
        </form>
      </FormModal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => selectedSubject && deleteMutation.mutate(selectedSubject._id)}
        title="Delete Subject"
        description={`Are you sure you want to delete "${selectedSubject?.name}"?`}
        isLoading={deleteMutation.isPending}
      />

      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImport={handleBulkImport}
        title="Bulk Import"
        description="Import subjects via CSV/JSON"
        templateFields={bulkImportFields}
        parseItem={parseSubjectRow}
      />
    </div>
  );
};

export default Subjects;