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
    <div className="space-y-4 sm:space-y-6 md:space-y-8 max-w-7xl mx-auto">
      {/* Header Section - Compact on mobile */}
      <div className="flex flex-col gap-4 sm:gap-5">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">Units</h1>
          <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
            Organize content into manageable learning modules.
          </p>
        </motion.div>

        {/* Control Toolbar - Stacks on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-3"
        >
          {/* Subject Selector + Search Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="w-full sm:w-[280px]">
              <Select
                value={selectedSubjectId}
                onValueChange={setSelectedSubjectId}
              >
                <SelectTrigger className="h-11 sm:h-10 w-full bg-background border-input/60 focus:ring-primary/20 text-base sm:text-sm">
                  <div className="flex items-center gap-2 truncate">
                    <BookOpen className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">
                      {selectedSubject ? selectedSubject.name : "Select a Subject"}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {subjects?.map(subject => (
                    <SelectItem key={subject._id} value={subject._id} className="py-3 sm:py-2">
                      <span className="font-medium">{subject.code}</span>
                      <span className="mx-2 text-muted-foreground">-</span>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedSubjectId && (
              <div className="relative flex-1 sm:max-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search units..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 h-11 sm:h-10 bg-background/50 border-input/60 focus:bg-background transition-all text-base sm:text-sm"
                />
              </div>
            )}
          </div>

          {/* Add Unit Button - Full width on mobile */}
          <Button
            onClick={openCreateModal}
            disabled={!selectedSubjectId}
            className="h-11 sm:h-10 gap-2 px-4 sm:px-6 shadow-sm hover:shadow-md transition-all w-full sm:w-auto sm:self-end"
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
            <div className="space-y-3">
              {filteredUnits?.map((unit, index) => (
                <motion.div
                  key={unit._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Card
                    className="group hover:border-primary/50 active:scale-[0.99] transition-all duration-300 border-border/60 bg-card/50 hover:bg-card hover:shadow-sm"
                  >
                    <CardContent className="p-3 sm:p-4 md:p-5">
                      <div className="flex flex-col gap-3">
                        {/* Top Row: Unit badge + Title */}
                        <div className="flex items-start gap-3 sm:gap-4">
                          {/* Unit Number Badge - Compact on mobile */}
                          <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-lg sm:rounded-xl bg-primary/10 text-primary flex flex-col items-center justify-center border border-primary/20 flex-shrink-0">
                            <span className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider opacity-70">Unit</span>
                            <span className="text-lg sm:text-xl md:text-2xl font-bold leading-none">{unit.unit || index + 1}</span>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm sm:text-base md:text-lg truncate group-hover:text-primary transition-colors">
                              {unit.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 mt-0.5">
                              {unit.subtitle || 'No subtitle provided'}
                            </p>
                            <div className="flex items-center gap-2 sm:gap-4 mt-1 sm:mt-2">
                              <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-muted-foreground bg-muted/50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">
                                <HelpCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                <span>{unit.questionCount || 0} Questions</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Row: Actions - Full width on mobile */}
                        <div className="flex items-center justify-between gap-2 pt-2 sm:pt-3 border-t border-border/40">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/questions/${unit._id}`)}
                            className="h-9 sm:h-10 gap-1.5 sm:gap-2 flex-1 sm:flex-none group/btn text-xs sm:text-sm"
                          >
                            <span>Questions</span>
                            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                          </Button>

                          <div className="flex items-center gap-0.5 sm:gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 sm:h-10 sm:w-10 text-muted-foreground hover:text-foreground"
                              onClick={() => openEditModal(unit)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 sm:h-10 sm:w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
                <div className="text-center py-12 sm:py-16 border-2 border-dashed rounded-xl bg-muted/10">
                  <div className="bg-muted/30 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Layers className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium">No units found</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm mt-1 max-w-xs mx-auto px-4">
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