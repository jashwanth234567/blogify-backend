import React, { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "quill/dist/quill.snow.css";

import { useAppContext } from "./context/AppContext";
import { PageLoader } from "./components/Skeletons";
import ErrorBoundary from "./components/ErrorBoundary";

// ─── Eagerly loaded (critical path) ──────────────────────────────────────────
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Layout from "./pages/author/Layout";
import FloatingAIChat from "./components/FloatingAIChat";

// ─── Lazily loaded (non-critical / heavy pages) ───────────────────────────────
const Profile           = lazy(() => import("./pages/Profile"));
const Explore           = lazy(() => import("./pages/Explore"));
const Trending          = lazy(() => import("./pages/Trending"));
const MostLiked         = lazy(() => import("./pages/MostLiked"));
const MostViewed        = lazy(() => import("./pages/MostViewed"));
const NotificationsPage = lazy(() => import("./pages/Notifications"));
const UserDashboard     = lazy(() => import("./pages/Dashboard"));
const ReturnInfo        = lazy(() => import("./pages/ReturnInfo"));
const RefundPolicy      = lazy(() => import("./pages/RefundPolicy"));
const ForgotPassword    = lazy(() => import("./pages/ForgotPassword"));

// Author panel (only loaded when user navigates into /author)
const Dashboard            = lazy(() => import("./pages/author/Dashboard"));
const AddBlog              = lazy(() => import("./pages/author/AddBlog"));
const ListBlog             = lazy(() => import("./pages/author/ListBlog"));
const Comments             = lazy(() => import("./pages/author/Comments"));
const ActivityLogs         = lazy(() => import("./pages/author/ActivityLogs"));
const AIChatAssistant      = lazy(() => import("./pages/author/AIChatAssistant"));
const AINewsCenter         = lazy(() => import("./pages/author/AINewsCenter"));
const AIContentStudio      = lazy(() => import("./pages/author/AIContentStudio"));
const AIAnalytics          = lazy(() => import("./pages/author/AIAnalytics"));
const AITranslationCenter  = lazy(() => import("./pages/author/AITranslationCenter"));
const AIAudioStudio        = lazy(() => import("./pages/author/AIAudioStudio"));
const SystemReports        = lazy(() => import("./pages/author/SystemReports"));
const AuthorAdminDashboard = lazy(() => import("./pages/author/AdminDashboard"));
const SEOCenter            = lazy(() => import("./pages/author/SEOCenter"));
const EmailCampaignCenter  = lazy(() => import("./pages/author/EmailCampaignCenter"));
const HelpCenter           = lazy(() => import("./pages/author/HelpCenter"));

// ─── Dedicated Enterprise Admin Routes ────────────
const AdminLogin     = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout    = lazy(() => import("./pages/admin/AdminLayout"));
const AdminOverview  = lazy(() => import("./pages/admin/AdminOverview"));
const AdminUsers     = lazy(() => import("./pages/admin/AdminUsers"));
const AdminPosts     = lazy(() => import("./pages/admin/AdminPosts"));
const AdminComments  = lazy(() => import("./pages/admin/AdminComments"));
const AdminReports   = lazy(() => import("./pages/admin/AdminReports"));
const AdminSearch    = lazy(() => import("./pages/admin/AdminSearch"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminAuditLogs = lazy(() => import("./pages/admin/AdminAuditLogs"));
const AdminSettings  = lazy(() => import("./pages/admin/AdminSettings"));

// New Enterprise Modules
const AdminCategories   = lazy(() => import("./pages/admin/AdminCategories"));
const AdminSecurity     = lazy(() => import("./pages/admin/AdminSecurity"));
const AdminVerification = lazy(() => import("./pages/admin/AdminVerification"));
const AdminAiModeration = lazy(() => import("./pages/admin/AdminAiModeration"));

const OtpVerification = lazy(() => import("./pages/OtpVerification"));
const ResetPassword    = lazy(() => import("./pages/ResetPassword"));

const App = () => {
    const { token } = useAppContext();

    return (
        <div className="min-h-screen text-slate-800 dark:text-slate-100 selection:bg-violet-500/30 selection:text-white transition-colors duration-300">
            <Toaster />

            {/* Global floating AI Writing assistant */}
            <FloatingAIChat />

            <ErrorBoundary>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        {/* ─── Public Routes ─────────────────────────────── */}
                        <Route path="/"                  element={<Home />} />
                        <Route path="/explore"           element={<Explore />} />
                        <Route path="/blog/:id"          element={<Blog />} />
                        <Route path="/profile/:username" element={<Profile />} />
                        <Route path="/profile"           element={<Profile />} />
                        <Route path="/trending"          element={<Trending />} />
                        <Route path="/most-liked"        element={<MostLiked />} />
                        <Route path="/most-viewed"       element={<MostViewed />} />
                        <Route path="/notifications"     element={<NotificationsPage />} />
                        <Route path="/return-info"       element={<ReturnInfo />} />
                        <Route path="/refund-policy"     element={<RefundPolicy />} />
                        <Route path="/login"             element={<Login />} />
                        <Route path="/register"          element={<Register />} />
                        <Route path="/verify-otp"        element={<OtpVerification />} />
                        <Route path="/forgot-password"   element={<ForgotPassword />} />
                        <Route path="/reset-password"    element={<ResetPassword />} />
                        <Route path="/dashboard"         element={<UserDashboard />} />

                        {/* ─── Dedicated Enterprise Admin Routes ──────────── */}
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin" element={<AdminLayout />}>
                            <Route index          element={<AdminOverview />} />
                            <Route path="dashboard" element={<AdminOverview />} />
                            <Route path="users"     element={<AdminUsers />} />
                            <Route path="posts"     element={<AdminPosts />} />
                            <Route path="comments"  element={<AdminComments />} />
                            <Route path="reports"   element={<AdminReports />} />
                            <Route path="search"    element={<AdminSearch />} />
                            <Route path="categories" element={<AdminCategories />} />
                            <Route path="tags"       element={<AdminCategories />} />
                            <Route path="analytics" element={<AdminAnalytics />} />
                            <Route path="security"  element={<AdminSecurity />} />
                            <Route path="site-settings" element={<AdminSettings />} />
                            <Route path="settings"  element={<AdminSettings />} />
                            <Route path="verification" element={<AdminVerification />} />
                            <Route path="logs"       element={<AdminAuditLogs />} />
                            <Route path="audit-logs" element={<AdminAuditLogs />} />
                            <Route path="ai-moderation" element={<AdminAiModeration />} />
                        </Route>

                        {/* ─── Author Panel (nested) ──────────────────────── */}
                        <Route path="/author" element={token ? <Layout /> : <Login />}>
                            <Route index                    element={<Dashboard />} />
                            <Route path="add-blog"          element={<AddBlog />} />
                            <Route path="list-blog"         element={<ListBlog />} />
                            <Route path="list-comment"      element={<Comments />} />
                            <Route path="activity-logs"     element={<ActivityLogs />} />
                            <Route path="content-studio"    element={<AIContentStudio />} />
                            <Route path="chat-assistant"    element={<AIChatAssistant />} />
                            <Route path="seo-optimizer"     element={<SEOCenter />} />
                            <Route path="translator"        element={<AITranslationCenter />} />
                            <Route path="audio-reader"      element={<AIAudioStudio />} />
                            <Route path="analytics"         element={<AIAnalytics />} />
                            <Route path="email-center"      element={<EmailCampaignCenter />} />
                            <Route path="system-reports"    element={<SystemReports />} />
                            <Route path="help-center"       element={<HelpCenter />} />
                            <Route path="news-center"       element={<AINewsCenter />} />
                        </Route>
                    </Routes>
                </Suspense>
            </ErrorBoundary>
        </div>
    );
};

export default App;
