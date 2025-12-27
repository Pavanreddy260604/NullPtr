import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen, Layers, HelpCircle, Activity,
  ArrowUpRight, Clock, ShieldCheck, ChevronRight
} from 'lucide-react';
import { subjectApi, unitApi, mcqApi, fillBlankApi, descriptiveApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

/* --- STAT CARD COMPONENT --- */
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  bg: string;
  delay?: number;
  isLoading?: boolean;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, bg, delay = 0, isLoading, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    onClick={onClick}
    className={onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}
  >
    <Card className="border-border/60 shadow-sm hover:shadow-md transition-all duration-300 h-full">
      <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-3">
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
          {isLoading ? (
            <div className="h-7 sm:h-8 w-16 bg-muted animate-pulse rounded" />
          ) : (
            <p className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{value}</p>
          )}
        </div>
        <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${color}`} />
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

/* --- QUICK ACTION CARD --- */
interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  onClick: () => void;
  delay?: number;
}

const QuickAction: React.FC<QuickActionProps> = ({ title, description, icon: Icon, iconColor, onClick, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
  >
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-muted/30 hover:bg-muted/50 active:scale-[0.98] transition-all text-left group"
    >
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-background border shadow-sm flex items-center justify-center flex-shrink-0">
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm sm:text-base truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
    </button>
  </motion.div>
);

/* --- MAIN DASHBOARD --- */
const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // 1. Fetch Subjects (Base Data)
  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectApi.getAll().then(res => res.data),
  });

  const subjectCount = subjects?.length || 0;
  const recentSubjects = subjects?.slice(0, 3) || [];

  return (
    <div className="space-y-3 sm:space-y-6 md:space-y-8 max-w-7xl mx-auto">

      {/* Header - Compact on mobile */}
      <div className="flex flex-col gap-1">
        <motion.h1
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight"
        >
          Admin Overview
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xs sm:text-sm text-muted-foreground"
        >
          Monitor your curriculum content and system status.
        </motion.p>
      </div>

      {/* Stats Grid - 2 cols on mobile, 3 on tablet+ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <StatCard
          title="Total Subjects"
          value={subjectCount}
          icon={BookOpen}
          color="text-blue-600"
          bg="bg-blue-50 dark:bg-blue-900/20"
          isLoading={subjectsLoading}
          delay={0.1}
          onClick={() => navigate('/subjects')}
        />
        <StatCard
          title="System Status"
          value="Healthy"
          icon={Activity}
          color="text-green-600"
          bg="bg-green-50 dark:bg-green-900/20"
          delay={0.2}
        />
        <div className="col-span-2 sm:col-span-1">
          <StatCard
            title="Admin Access"
            value="Active"
            icon={ShieldCheck}
            color="text-purple-600"
            bg="bg-purple-50 dark:bg-purple-900/20"
            delay={0.3}
          />
        </div>
      </div>

      {/* Main Content - Stack on mobile, side-by-side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">

        {/* Recent Subjects - Full width on mobile */}
        <div className="lg:col-span-2 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold flex items-center gap-2">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Recent Subjects
              </h2>
              <Badge variant="outline" className="text-[10px] sm:text-xs text-muted-foreground">
                Total: {subjectCount}
              </Badge>
            </div>

            {subjectsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-20 sm:h-24 bg-muted/50 rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {recentSubjects.length > 0 ? (
                  recentSubjects.map((subject) => (
                    <Card
                      key={subject._id}
                      className="group hover:border-primary/40 transition-colors cursor-pointer active:scale-[0.99]"
                      onClick={() => navigate(`/subjects/${subject._id}/units`)}
                    >
                      <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                        {/* Thumbnail / Icon */}
                        <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                          {subject.thumbnail ? (
                            <img src={subject.thumbnail} alt={subject.name} className="h-full w-full object-cover" />
                          ) : (
                            <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-muted-foreground/40" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-semibold text-sm sm:text-base truncate">{subject.name}</h3>
                            <Badge variant="secondary" className="text-[9px] sm:text-[10px] font-mono shrink-0 hidden sm:inline-flex">
                              {subject.code}
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 mt-0.5">
                            {subject.description || "No description provided."}
                          </p>
                          <div className="flex items-center gap-3 sm:gap-4 mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Layers className="w-3 h-3" /> {subject.units?.length || 0} Units
                            </span>
                            <span className="flex items-center gap-1 hidden sm:flex">
                              <Clock className="w-3 h-3" /> Updated recently
                            </span>
                          </div>
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-10 sm:py-12 border-2 border-dashed rounded-xl">
                    <p className="text-sm text-muted-foreground">No subjects found. Start adding content!</p>
                    <Button variant="link" className="mt-2" onClick={() => navigate('/subjects')}>
                      Add first subject
                    </Button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick Actions - Shows as horizontal scroll on mobile */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Jump to common tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3">
                <QuickAction
                  title="Manage Subjects"
                  description="Add or edit subjects"
                  icon={BookOpen}
                  iconColor="text-blue-500"
                  onClick={() => navigate('/subjects')}
                  delay={0.6}
                />
                <QuickAction
                  title="Manage Units"
                  description="Organize learning modules"
                  icon={Layers}
                  iconColor="text-orange-500"
                  onClick={() => navigate('/units')}
                  delay={0.7}
                />
                <QuickAction
                  title="Add Questions"
                  description="Create MCQ, Fill-blank, Descriptive"
                  icon={HelpCircle}
                  iconColor="text-purple-500"
                  onClick={() => navigate('/questions')}
                  delay={0.8}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;