import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  Plus,
  Edit,
  Trash2,
  Layers,
  Search,
  BookOpen,
  HelpCircle,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { subjectApi, unitApi, Subject, Unit } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import FormModal from '@/components/shared/FormModal';
import ConfirmModal from '@/components/shared/ConfirmModal';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const Units: React.FC = () => {
  const navigate = useNavigate();
  const { subjectId: paramSubjectId } = useParams<{ subjectId?: string }>();
  const queryClient = useQueryClient();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(paramSubjectId || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    unit: 1,
  });

  // ✅ Auto-select subject if navigated from Subjects page
  useEffect(() => {
    if (paramSubjectId) {
      setSelectedSubjectId(paramSubjectId);
    }
  }, [paramSubjectId]);

  // Fetch all subjects
  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectApi.getAll().then(res => res.data),
  });

  // Fetch units for selected subject
  const { data: units, isLoading: unitsLoading } = useQuery({
    queryKey: ['units', selectedSubjectId],
    queryFn: () => unitApi.getBySubject(selectedSubjectId).then(res => res.data),
    enabled: !!selectedSubjectId,
  });

  // ✅ Create unit
  const createMutation = useMutation({
    mutationFn: async (data: Omit<Unit, '_id'>) => {
      if (!selectedSubjectId) throw new Error('Subject ID missing');
      const payload = {
        subjectId: selectedSubjectId,
        unit: Number(data.unit) || 1,
        title: data.title?.trim(),
        subtitle: data.subtitle?.trim() || '',
      };
      return unitApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units', selectedSubjectId] });
      toast.success('Unit created successfully!');
      closeModal();
    },
    onError: (error: any) => {
      console.error('Unit creation failed:', error);
      toast.error('Failed to create unit');
    },
  });

  // ✅ Update unit
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Unit> }) =>
      unitApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units', selectedSubjectId] });
      toast.success('Unit updated successfully!');
      closeModal();
    },
    onError: (error: any) => {
      console.error('Failed to update unit:', error);
      toast.error('Failed to update unit');
    },
  });

  // ✅ Delete unit
  const deleteMutation = useMutation({
    mutationFn: (id: string) => unitApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units', selectedSubjectId] });
      toast.success('Unit deleted successfully!');
      setIsDeleteModalOpen(false);
      setSelectedUnit(null);
    },
    onError: () => toast.error('Failed to delete unit'),
  });

  const openCreateModal = () => {
    if (!selectedSubjectId) {
      toast.warning('Please select a subject first');
      return;
    }
    setSelectedUnit(null);
    setFormData({
      title: '',
      subtitle: '',
      unit: (units?.length || 0) + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (unit: Unit) => {
    setSelectedUnit(unit);
    setFormData({
      title: unit.title,
      subtitle: unit.subtitle || '',
      unit: unit.unit || 1,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUnit(null);
    setFormData({ title: '', subtitle: '', unit: 1 });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUnit) {
      updateMutation.mutate({ id: selectedUnit._id, data: formData });
    } else {
      createMutation.mutate({ ...formData, subjectId: selectedSubjectId } as Omit<Unit, '_id'>);
    }
  };

  const filteredUnits = units?.filter(unit =>
    unit.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedSubject = subjects?.find(s => s._id === selectedSubjectId);

  if (subjectsLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 sm:space-y-8 px-0 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Units</h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm md:text-base">
            Organize content into manageable learning modules.
          </p>
        </motion.div>

        {/* Modern Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col lg:flex-row gap-4 justify-between lg:items-center"
        >
          {/* Left Side: Subject Filter + Search */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="w-full sm:w-[280px]">
              <Select
                value={selectedSubjectId}
                onValueChange={setSelectedSubjectId}
              >
                <SelectTrigger className="h-10 w-full bg-background border-input/60 focus:ring-primary/20">
                  <div className="flex items-center gap-2 truncate">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">
                      {selectedSubject ? selectedSubject.name : "Select a Subject"}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {subjects?.map(subject => (
                    <SelectItem key={subject._id} value={subject._id}>
                      <span className="font-medium">{subject.code}</span>
                      <span className="mx-2 text-muted-foreground">-</span>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedSubjectId && (
              <div className="relative w-full sm:w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search units..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 h-10 bg-background/50 border-input/60 focus:bg-background transition-all"
                />
              </div>
            )}
          </div>

          {/* Right Side: Actions */}
          <Button
            onClick={openCreateModal}
            variant="default"
            disabled={!selectedSubjectId}
            className="h-10 gap-2 px-6 shadow-sm hover:shadow-md transition-all w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add Unit
          </Button>
        </motion.div>
      </div>

      {/* Main Content Area */}
      {!selectedSubjectId ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-xl bg-muted/5 mt-8"
        >
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">No Subject Selected</h3>
          <p className="text-muted-foreground mt-2 max-w-sm text-center">
            Please select a subject from the dropdown above to view and manage its curriculum units.
          </p>
        </motion.div>
      ) : (
        <>
          {unitsLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-4">
              {filteredUnits?.map((unit, index) => (
                <motion.div
                  key={unit._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Card
                    className="group hover:border-primary/50 transition-all duration-300 border-border/60 bg-card/50 hover:bg-card hover:shadow-sm"
                  >
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                        {/* Unit Number Badge */}
                        <div className="flex-shrink-0 flex items-center">
                          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-primary/10 text-primary flex flex-col items-center justify-center border border-primary/20">
                            <span className="text-xs font-semibold uppercase tracking-wider opacity-70">Unit</span>
                            <span className="text-xl sm:text-2xl font-bold leading-none">{unit.unit || index + 1}</span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                            {unit.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {unit.subtitle || 'No subtitle provided'}
                          </p>
                          <div className="flex items-center gap-4 pt-1">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                              <HelpCircle className="w-3 h-3" />
                              <span>{unit.questionCount || 0} Questions</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Area */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-4 sm:pt-0 border-t sm:border-0 border-border/50">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/questions/${unit._id}`)}
                            className="h-9 gap-2 group/btn"
                          >
                            <span>Questions</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                          </Button>

                          <div className="flex items-center gap-1 border-l pl-3 ml-1 border-border/50">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => openEditModal(unit)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                setSelectedUnit(unit);
                                setIsDeleteModalOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {filteredUnits?.length === 0 && (
                <div className="text-center py-16 border-2 border-dashed rounded-xl bg-muted/10">
                  <div className="bg-muted/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Layers className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No units found</h3>
                  <p className="text-muted-foreground text-sm mt-1 max-w-xs mx-auto">
                    {searchTerm
                      ? `No results for "${searchTerm}"`
                      : `Get started by adding the first unit to ${selectedSubject?.name}`}
                  </p>
                  {!searchTerm && (
                    <Button onClick={openCreateModal} variant="link" className="mt-2 text-primary">
                      Create first unit
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      <FormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedUnit ? 'Edit Unit' : 'Create Unit'}
        description={
          selectedUnit
            ? 'Update the unit details'
            : `Add a new unit to ${selectedSubject?.name}`
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3 space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Linear Algebra"
                  required
                />
              </div>
              <div className="col-span-1 space-y-2">
                <Label htmlFor="unit">Unit No.</Label>
                <Input
                  id="unit"
                  type="number"
                  min={1}
                  value={formData.unit}
                  onChange={e => setFormData({ ...formData, unit: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Textarea
                id="subtitle"
                value={formData.subtitle}
                onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Brief description of topics covered..."
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : selectedUnit
                  ? 'Save Changes'
                  : 'Create Unit'}
            </Button>
          </div>
        </form>
      </FormModal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => selectedUnit && deleteMutation.mutate(selectedUnit._id)}
        title="Delete Unit"
        description={`Are you sure you want to delete "${selectedUnit?.title}"? All associated questions will also be removed.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default Units;