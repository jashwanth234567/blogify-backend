import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Dashboard = () => {
    const { user, token, handleLogout, axios } = useAppContext();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("profile");
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [updatingProfile, setUpdatingProfile] = useState(false);
    const [updatingPassword, setUpdatingPassword] = useState(false);

    useEffect(() => {
        if (!token) {
            navigate("/login");
        } else if (user) {
            setName(user.name || "");
            setUsername(user.username || "");
            setBio(user.bio || "");
        }
    }, [token, user, navigate]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdatingProfile(true);
        try {
            const { data } = await axios.put("/api/profile", {
                name,
                username,
                bio
            }, {
                headers: { Authorization: token }
            });
            if (data.success) {
                toast.success("Profile updated successfully!");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setUpdatingProfile(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            return toast.error("New passwords do not match");
        }
        setUpdatingPassword(true);
        try {
            const { data } = await axios.put("/api/profile/change-password", {
                currentPassword,
                newPassword
            }, {
                headers: { Authorization: token }
            });
            if (data.success) {
                toast.success("Password changed successfully!");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmNewPassword("");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setUpdatingPassword(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
            <Navbar />
            <div className="flex-1 max-w-4xl mx-auto w-full p-6">
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-violet-200/50 dark:border-slate-800/60 rounded-2xl shadow-xl p-8 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                                Welcome back, <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">{user.name}</span>!
                            </h1>
                            <p className="text-slate-400 text-sm mt-1">Manage your account settings and profile details</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 font-bold rounded-xl transition-all text-sm cursor-pointer border border-rose-500/20 shadow-sm"
                        >
                            Logout
                        </button>
                    </div>

                    <div className="flex gap-4 mt-6 border-b border-slate-150 dark:border-slate-800">
                        <button
                            onClick={() => setActiveTab("profile")}
                            className={`pb-3 font-semibold text-sm transition-all border-b-2 cursor-pointer ${
                                activeTab === "profile" 
                                ? "border-violet-600 text-violet-650" 
                                : "border-transparent text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            Profile Details
                        </button>
                        <button
                            onClick={() => setActiveTab("edit")}
                            className={`pb-3 font-semibold text-sm transition-all border-b-2 cursor-pointer ${
                                activeTab === "edit" 
                                ? "border-violet-600 text-violet-650" 
                                : "border-transparent text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            Edit Profile
                        </button>
                        <button
                            onClick={() => setActiveTab("password")}
                            className={`pb-3 font-semibold text-sm transition-all border-b-2 cursor-pointer ${
                                activeTab === "password" 
                                ? "border-violet-600 text-violet-650" 
                                : "border-transparent text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            Change Password
                        </button>
                    </div>

                    <div className="mt-8">
                        {activeTab === "profile" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-violet-650/10 flex items-center justify-center text-violet-600 font-bold text-2xl">
                                        {user.name?.[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{user.name}</h3>
                                        <p className="text-sm text-slate-400">@{user.username}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-xs font-semibold text-slate-400 uppercase">Email Address</span>
                                        <p className="text-slate-700 dark:text-slate-300 font-medium">{user.email}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-slate-400 uppercase">Bio</span>
                                        <p className="text-slate-700 dark:text-slate-300 font-medium">{user.bio || "No bio yet"}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "edit" && (
                            <form onSubmit={handleUpdateProfile} className="max-w-md space-y-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)}
                                        required 
                                        className="border border-transparent bg-slate-50 dark:bg-slate-800 rounded-xl p-2.5 outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all duration-300 text-sm dark:text-slate-100"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Username</label>
                                    <input 
                                        type="text" 
                                        value={username} 
                                        onChange={(e) => setUsername(e.target.value)}
                                        required 
                                        className="border border-transparent bg-slate-50 dark:bg-slate-800 rounded-xl p-2.5 outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all duration-300 text-sm dark:text-slate-100"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bio</label>
                                    <textarea 
                                        value={bio} 
                                        onChange={(e) => setBio(e.target.value)}
                                        rows="3" 
                                        className="border border-transparent bg-slate-50 dark:bg-slate-800 rounded-xl p-2.5 outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all duration-300 text-sm dark:text-slate-100"
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={updatingProfile}
                                    className="px-6 py-2.5 bg-violet-600 hover:bg-violet-750 text-white rounded-xl font-bold shadow-lg shadow-violet-500/25 hover:shadow-violet-650/30 transition-all text-sm disabled:opacity-50 cursor-pointer"
                                >
                                    {updatingProfile ? "Saving..." : "Save Profile"}
                                </button>
                            </form>
                        )}

                        {activeTab === "password" && (
                            <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Password</label>
                                    <input 
                                        type="password" 
                                        value={currentPassword} 
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required 
                                        className="border border-transparent bg-slate-50 dark:bg-slate-800 rounded-xl p-2.5 outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all duration-300 text-sm dark:text-slate-100"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">New Password</label>
                                    <input 
                                        type="password" 
                                        value={newPassword} 
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required 
                                        className="border border-transparent bg-slate-50 dark:bg-slate-800 rounded-xl p-2.5 outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all duration-300 text-sm dark:text-slate-100"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confirm New Password</label>
                                    <input 
                                        type="password" 
                                        value={confirmNewPassword} 
                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                        required 
                                        className="border border-transparent bg-slate-50 dark:bg-slate-800 rounded-xl p-2.5 outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all duration-300 text-sm dark:text-slate-100"
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={updatingPassword}
                                    className="px-6 py-2.5 bg-violet-600 hover:bg-violet-750 text-white rounded-xl font-bold shadow-lg shadow-violet-500/25 hover:shadow-violet-650/30 transition-all text-sm disabled:opacity-50 cursor-pointer"
                                >
                                    {updatingPassword ? "Changing..." : "Change Password"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Dashboard;
