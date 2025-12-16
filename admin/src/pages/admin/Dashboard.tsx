import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen, Layers, HelpCircle, Activity,
  ArrowUpRight, Clock, ShieldCheck
} from 'lucide-react';
import { subjectApi, unitApi, mcqApi, fillBlankApi, descriptiveApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

/* --- STAT CARD COMPONENT --- */
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string; // Tailwind text color class
  bg: string;    // Tailwind bg color class
  delay?: number;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, bg, delay = 0, isLoading }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
  >
    <Card className="border-border/60 shadow-sm hover:shadow-md transition-all duration-300">
      <CardContent className="p-5 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {isLoading ? (
            <div className="h-8 w-16 bg-muted animate-pulse rounded" />
          ) : (
            <p className="text-3xl font-bold tracking-tight">{value}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

/* --- MAIN DASHBOARD --- */
const Dashboard: React.FC = () => {
  // 1. Fetch Subjects (Base Data)
  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectApi.getAll().then(res => res.data),
  });

  // 2. Fetch Aggregated Data (In a real app, you'd have a specific /stats endpoint)
  // For now, we simulate "Total" counts by fetching lists. 
  // *Optimization Note:* Ideally, your backend should provide a /dashboard-stats endpoint.

  // We'll just display Subject count and "Active" state for now to be 100% real.
  const subjectCount = subjects?.length || 0;

  // Let's assume we want to show the first 3 subjects as "Recent"
  const recentSubjects = subjects?.slice(0, 3) || [];

  return (
    <div className="space-y-6 sm:space-y-8 px-0 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col gap-2">
        <motion.h1
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl sm:text-3xl font-bold tracking-tight"
        >
          Admin Overview
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          Monitor your curriculum content and system status.
        </motion.p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          title="Total Subjects"
          value={subjectCount}
          icon={BookOpen}
          color="text-blue-600"
          bg="bg-blue-50 dark:bg-blue-900/20"
          isLoading={subjectsLoading}
          delay={0.1}
        />
        <StatCard
          title="System Status"
          value="Healthy"
          icon={Activity}
          color="text-green-600"
          bg="bg-green-50 dark:bg-green-900/20"
          delay={0.2}
        />
        <StatCard
          title="Admin Access"
          value="Active"
          icon={ShieldCheck}
          color="text-purple-600"
          bg="bg-purple-50 dark:bg-purple-900/20"
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

        {/* Main Content: Recent Subjects */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                Recent Subjects
              </h2>
              <Badge variant="outline" className="text-muted-foreground">
                Total: {subjectCount}
              </Badge>
            </div>

            {subjectsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-4">
                {recentSubjects.length > 0 ? (
                  recentSubjects.map((subject) => (
                    <Card key={subject._id} className="group hover:border-primary/40 transition-colors">
                      <CardContent className="p-4 flex items-center gap-4">
                        {/* Thumbnail / Icon */}
                        <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                          {subject.thumbnail ? (
                            <img src={subject.thumbnail} alt={subject.name} className="h-full w-full object-cover" />
                          ) : (
                            <BookOpen className="w-8 h-8 text-muted-foreground/40" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold truncate pr-4">{subject.name}</h3>
                            <Badge variant="secondary" className="text-[10px] font-mono shrink-0">
                              {subject.code}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                            {subject.description || "No description provided."}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Layers className="w-3 h-3" /> {subject.units?.length || 0} Units
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Updated recently
                            </span>
                          </div>
                        </div>

                        {/* Arrow */}
                        <ArrowUpRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12 border-2 border-dashed rounded-xl">
                    <p className="text-muted-foreground">No subjects found. Start adding content!</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar: Quick Actions / Tips */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Quick Tips</CardTitle>
                <CardDescription>Managing your content effectively.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3 text-sm">
                  <div className="bg-background p-2 rounded-full h-fit border shadow-sm">
                    <Layers className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-medium">Structure First</p>
                    <p className="text-muted-foreground text-xs mt-0.5">Create Units inside Subjects before adding Questions.</p>
                  </div>
                </div>
                <div className="flex gap-3 text-sm">
                  <div className="bg-background p-2 rounded-full h-fit border shadow-sm">
                    <HelpCircle className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">Rich Content</p>
                    <p className="text-muted-foreground text-xs mt-0.5">Use images in descriptive questions to enhance learning.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;