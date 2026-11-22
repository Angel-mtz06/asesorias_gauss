export type Level = 'secundaria' | 'preparatoria' | 'universidad';
export type VideoStatus = 'draft' | 'published';

export const LEVELS: { id: Level; label: string }[] = [
  { id: 'secundaria', label: 'Secundaria' },
  { id: 'preparatoria', label: 'Preparatoria' },
  { id: 'universidad', label: 'Universidad' },
];

export interface Teacher {
  id: number;
  name: string;
  email: string;
  specialty: string;
  bio: string;
  avatarColor: string;
  createdAt: string;
}

export interface TeacherStats {
  totalVideos: number;
  published: number;
  drafts: number;
  totalSeconds: number;
  totalViews: number;
  subjects: number;
}

export interface Subject {
  id: number;
  name: string;
  level: Level;
  description: string;
  color: string;
  createdAt: string;
}

export interface SubjectSummary extends Subject {
  unitCount: number;
  videoCount: number;
  publishedCount: number;
  totalSeconds: number;
}

export interface Unit {
  id: number;
  number: number;
  title: string;
  subjectId: number;
}

export interface VideoMaterial {
  title: string;
  url: string;
}

export interface Video {
  id: number;
  title: string;
  summary: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  durationSeconds: number;
  position: number;
  status: VideoStatus;
  views: number;
  materials: VideoMaterial[];
  unitId: number;
  teacherId: number;
  createdAt: string;
  updatedAt: string;
  unit?: Unit & { subject?: Subject };
  teacher?: Teacher;
}

export interface UnitWithVideos extends Unit {
  videos: Video[];
}

export interface SubjectDetail extends Subject {
  units: UnitWithVideos[];
}

export interface VideoInput {
  title: string;
  summary: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  durationSeconds: number;
  position?: number;
  status: VideoStatus;
  materials: VideoMaterial[];
  unitId: number;
  teacherId: number;
}

export interface VideoQuery {
  teacherId?: number;
  subjectId?: number;
  unitId?: number;
  status?: VideoStatus;
  search?: string;
  limit?: number;
}
