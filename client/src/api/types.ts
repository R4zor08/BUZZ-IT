export interface AuthResponse {
  tokenType: "Bearer";
  accessToken: string;
  expiresInMinutes: number;
  username: string;
  role: string;
}

export interface ApiErrorBody {
  error: string;
  details?: { field: string; message: string }[];
}

export interface PostDTO {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: number;
  priority: number;
  dueDate: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderDTO {
  id: string;
  userId: string;
  title: string;
  time: string;
  description: string;
  category: number;
  priority: number;
  dueDate: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
