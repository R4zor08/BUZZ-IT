import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { PostsPage } from "./pages/PostsPage";
import { PostForm } from "./pages/PostForm";
import { RemindersPage } from "./pages/RemindersPage";
import { ReminderForm } from "./pages/ReminderForm";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/posts" replace />} />
          <Route path="/posts" element={<PostsPage />} />
          <Route path="/posts/new" element={<PostForm />} />
          <Route path="/posts/:id/edit" element={<PostForm />} />
          <Route path="/reminders" element={<RemindersPage />} />
          <Route path="/reminders/new" element={<ReminderForm />} />
          <Route path="/reminders/:id/edit" element={<ReminderForm />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/posts" replace />} />
    </Routes>
  );
}
