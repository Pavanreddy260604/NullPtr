import { QueryClient } from "@tanstack/react-query";
import {
    getSubject,
    getUnitsBySubject,
    getUnit,
    getMCQsByUnit,
    getFillBlanksByUnit,
    getDescriptivesByUnit,
    Subject,
    safeStorage
} from "./api";

/**
 * Prefetches all data for a specific subject (Metadata, Units, and All Questions)
 */
export async function syncSubject(queryClient: QueryClient, subjectId: string) {
    try {
        // 1. Fetch Subject Metadata
        const subject = await queryClient.fetchQuery({
            queryKey: ['subject', subjectId],
            queryFn: () => getSubject(subjectId),
            staleTime: 0, // Force fresh check
        });

        // 2. Update local version tracking
        if (subject.version !== undefined) {
            safeStorage.setItem(`subject_v_${subjectId}`, subject.version.toString());
        }

        // 3. Fetch Units List
        const units = await queryClient.fetchQuery({
            queryKey: ['units', subjectId],
            queryFn: () => getUnitsBySubject(subjectId),
        });

        // 4. Batch fetch data for all units
        // We do this sequentially to avoid overwhelming the serverless function 
        // and to allow for granular progress tracking if we expand this later
        for (const unit of units) {
            await queryClient.prefetchQuery({
                queryKey: ['unitData', unit._id],
                queryFn: async () => {
                    const [unitData, mcqs, fillBlanks, descriptives] = await Promise.all([
                        getUnit(unit._id),
                        getMCQsByUnit(unit._id),
                        getFillBlanksByUnit(unit._id),
                        getDescriptivesByUnit(unit._id)
                    ]);
                    return { unit: unitData, mcqs, fillBlanks, descriptives };
                },
                staleTime: 1000 * 60 * 60 * 24 * 7, // 7 days (Offline preference)
            });
        }

        return true;
    } catch (error) {
        console.error(`❌ Sync failed for subject ${subjectId}:`, error);
        throw error;
    }
}

/**
 * Prefetches the entire curriculum (All subjects and their contents)
 */
export async function syncAll(queryClient: QueryClient, subjects: Subject[], onProgress?: (msg: string) => void) {
    let successCount = 0;

    for (let i = 0; i < subjects.length; i++) {
        const subject = subjects[i];
        if (onProgress) onProgress(`Syncing ${i + 1}/${subjects.length}: ${subject.name}...`);

        try {
            await syncSubject(queryClient, subject._id);
            successCount++;
        } catch (e) {
            // Continue with next subject even if one fails
        }
    }

    return successCount === subjects.length;
}
