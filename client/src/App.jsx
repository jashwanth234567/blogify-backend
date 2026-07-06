import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import Profile from "./pages/Profile";
import Trending from "./pages/Trending";
import MostLiked from "./pages/MostLiked";
import MostViewed from "./pages/MostViewed";
import NotificationsPage from "./pages/Notifications";
import Layout from "./pages/author/Layout";
import Dashboard from "./pages/author/Dashboard";
import AddBlog from "./pages/author/AddBlog";
import ListBlog from "./pages/author/ListBlog";
import Comments from "./pages/author/Comments";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import UserDashboard from "./pages/Dashboard";
import ReturnInfo from "./pages/ReturnInfo";
import RefundPolicy from "./pages/RefundPolicy";
import ActivityLogs from "./pages/author/ActivityLogs";
import AIChatAssistant from "./pages/author/AIChatAssistant";
import AINewsCenter from "./pages/author/AINewsCenter";
import AIContentStudio from "./pages/author/AIContentStudio";
import AIAnalytics from "./pages/author/AIAnalytics";
import AITranslationCenter from "./pages/author/AITranslationCenter";
import AIAudioStudio from "./pages/author/AIAudioStudio";
import SystemReports from "./pages/author/SystemReports";
import AdminAnalytics from "./pages/author/AdminAnalytics";
import SEOCenter from "./pages/author/SEOCenter";
import EmailCampaignCenter from "./pages/author/EmailCampaignCenter";
import HelpCenter from "./pages/author/HelpCenter";
import FloatingAIChat from "./components/FloatingAIChat";
import "quill/dist/quill.snow.css";
import { Toaster } from "react-hot-toast";
import { useAppContext } from "./context/AppContext";

const App = () => {
    const { token } = useAppContext();

    return (
        <div className="min-h-screen text-slate-800 dark:text-slate-100 selection:bg-violet-500/30 selection:text-white transition-colors duration-300">
            <Toaster />
            {/* Global floating AI Writing assistant */}
            <FloatingAIChat />
            
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/blog/:id" element={<Blog />} />
                <Route path="/profile/:username" element={<Profile />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/trending" element={<Trending />} />
                <Route path="/most-liked" element={<MostLiked />} />
                <Route path="/most-viewed" element={<MostViewed />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/return-info" element={<ReturnInfo />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/author" element={token ? <Layout /> : <Login />}>
                    <Route index element={<Dashboard />} />
                    <Route path="add-blog" element={<AddBlog />} />
                    <Route path="list-blog" element={<ListBlog />} />
                    <Route path="list-comment" element={<Comments />} />
                    <Route path="activity-logs" element={<ActivityLogs />} />
                    <Route path="content-studio" element={<AIContentStudio />} />
                    <Route path="chat-assistant" element={<AIChatAssistant />} />
                    <Route path="seo-optimizer" element={<SEOCenter />} />
                    <Route path="translator" element={<AITranslationCenter />} />
                    <Route path="audio-reader" element={<AIAudioStudio />} />
                    <Route path="analytics" element={<AIAnalytics />} />
                    <Route path="email-center" element={<EmailCampaignCenter />} />
                    <Route path="system-reports" element={<SystemReports />} />
                    <Route path="admin-analytics" element={<AdminAnalytics />} />
                    <Route path="help-center" element={<HelpCenter />} />
                    <Route path="news-center" element={<AINewsCenter />} />
                </Route>
            </Routes>
        </div>
    );
};

export default App;
