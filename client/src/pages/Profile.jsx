import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Profile = () => {
  const { username: paramUsername } = useParams();
  const { user: currentUser, token, isDarkMode, toggleDarkMode, handleLogout, fetchProfile } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  // Lists inside modals
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [followersSearch, setFollowersSearch] = useState("");
  const [followingSearch, setFollowingSearch] = useState("");
  const [followersPage, setFollowersPage] = useState(1);
  const [followingPage, setFollowingPage] = useState(1);
  const [hasMoreFollowers, setHasMoreFollowers] = useState(true);
  const [hasMoreFollowing, setHasMoreFollowing] = useState(true);

  // Edit fields
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editIsPrivate, setEditIsPrivate] = useState(false);
  const [editLikesNotify, setEditLikesNotify] = useState(true);
  const [editFollowsNotify, setEditFollowsNotify] = useState(true);
  const [editCommentsNotify, setEditCommentsNotify] = useState(true);
  const [newPassword, setNewPassword] = useState("");

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Fetch complete profile details
  const getProfileData = async () => {
    try {
      setLoading(true);
      // If no parameter, use logged in user's username or ID
      const target = paramUsername || currentUser?.username || currentUser?._id;
      if (!target) {
        setLoading(false);
        return;
      }
      const { data } = await axios.get(`/api/profile/${target}`, {
        headers: { Authorization: token },
      });
      if (data.success) {
        setProfile(data.profile);
        // Pre-fill edit fields
        setEditName(data.profile.name || "");
        setEditUsername(data.profile.username || "");
        setEditBio(data.profile.bio || "");
        setEditPhone(data.profile.phone || "");
        setEditWebsite(data.profile.website || "");
        setEditLocation(data.profile.location || "");
        setEditIsPrivate(data.profile.privacySettings?.isPrivate || false);
        setEditLikesNotify(data.profile.notificationSettings?.likes !== false);
        setEditFollowsNotify(data.profile.notificationSettings?.follows !== false);
        setEditCommentsNotify(data.profile.notificationSettings?.comments !== false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token || paramUsername) {
      getProfileData();
    }
  }, [paramUsername, token, currentUser]);

  // Handle Follow/Unfollow toggles
  const handleFollowToggle = async () => {
    if (!token) {
      toast.error("Please login to follow users.");
      return;
    }
    try {
      const isFollowing = profile.isFollowing;
      const endpoint = `/api/users/${profile._id}/follow`;
      const config = { headers: { Authorization: token } };

      const { data } = isFollowing
        ? await axios.delete(endpoint, config)
        : await axios.post(endpoint, {}, config);

      if (data.success) {
        toast.success(isFollowing ? "Unfollowed user" : "Following user");
        // Update local stats
        setProfile(prev => ({
          ...prev,
          isFollowing: !isFollowing,
          stats: {
            ...prev.stats,
            followersCount: prev.stats.followersCount + (isFollowing ? -1 : 1),
          },
        }));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong.");
    }
  };

  // Follow/Unfollow other users in Lists
  const toggleFollowUserInList = async (userInList, type) => {
    try {
      const isCurrentlyFollowing = userInList.isFollowing;
      const endpoint = `/api/users/${userInList._id}/follow`;
      const config = { headers: { Authorization: token } };

      const { data } = isCurrentlyFollowing
        ? await axios.delete(endpoint, config)
        : await axios.post(endpoint, {}, config);

      if (data.success) {
        const updater = list =>
          list.map(u => (u._id === userInList._id ? { ...u, isFollowing: !isCurrentlyFollowing } : u));
        if (type === "followers") setFollowersList(updater);
        if (type === "following") setFollowingList(updater);
        toast.success(isCurrentlyFollowing ? "Unfollowed" : "Following");
      }
    } catch (error) {
      toast.error("Action failed.");
    }
  };

  // Fetch Followers Modal Data
  const fetchFollowers = async (reset = false) => {
    try {
      const pageToFetch = reset ? 1 : followersPage;
      const targetSearch = reset ? "" : followersSearch;
      const { data } = await axios.get(
        `/api/users/${profile._id}/followers?page=${pageToFetch}&limit=10&search=${targetSearch}`,
        { headers: { Authorization: token } }
      );
      if (data.success) {
        if (reset) {
          setFollowersList(data.followers);
          setFollowersPage(2);
        } else {
          setFollowersList(prev => [...prev, ...data.followers]);
          setFollowersPage(prev => prev + 1);
        }
        setHasMoreFollowers(data.followers.length === 10);
      }
    } catch (error) {
      toast.error("Failed to load followers list.");
    }
  };

  // Fetch Following Modal Data
  const fetchFollowing = async (reset = false) => {
    try {
      const pageToFetch = reset ? 1 : followingPage;
      const targetSearch = reset ? "" : followingSearch;
      const { data } = await axios.get(
        `/api/users/${profile._id}/following?page=${pageToFetch}&limit=10&search=${targetSearch}`,
        { headers: { Authorization: token } }
      );
      if (data.success) {
        if (reset) {
          setFollowingList(data.following);
          setFollowingPage(2);
        } else {
          setFollowingList(prev => [...prev, ...data.following]);
          setFollowingPage(prev => prev + 1);
        }
        setHasMoreFollowing(data.following.length === 10);
      }
    } catch (error) {
      toast.error("Failed to load following list.");
    }
  };

  // Trigger loading when modal opens or search changes
  useEffect(() => {
    if (showFollowersModal && profile) {
      fetchFollowers(true);
    }
  }, [showFollowersModal, followersSearch]);

  useEffect(() => {
    if (showFollowingModal && profile) {
      fetchFollowing(true);
    }
  }, [showFollowingModal, followingSearch]);

  // Upload handlers
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    const loadingToast = toast.loading("Uploading avatar...");
    try {
      const { data } = await axios.post("/api/profile/avatar", formData, {
        headers: { Authorization: token, "Content-Type": "multipart/form-data" },
      });
      if (data.success) {
        toast.success("Avatar updated!");
        setProfile(prev => ({ ...prev, image: data.avatarUrl }));
        fetchProfile(token); // refresh global state
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Upload failed.");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    const loadingToast = toast.loading("Uploading cover photo...");
    try {
      const { data } = await axios.post("/api/profile/cover", formData, {
        headers: { Authorization: token, "Content-Type": "multipart/form-data" },
      });
      if (data.success) {
        toast.success("Cover banner updated!");
        setProfile(prev => ({ ...prev, coverPhoto: data.coverUrl }));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Upload failed.");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  // Submit Profile edits
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        "/api/profile",
        {
          name: editName,
          username: editUsername,
          bio: editBio,
          phone: editPhone,
          website: editWebsite,
          location: editLocation,
          privacySettings: { isPrivate: editIsPrivate },
          notificationSettings: {
            likes: editLikesNotify,
            follows: editFollowsNotify,
            comments: editCommentsNotify,
          },
        },
        { headers: { Authorization: token } }
      );
      if (data.success) {
        toast.success("Profile saved!");
        setShowEditModal(false);
        getProfileData();
        fetchProfile(token);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to update profile.");
    }
  };

  // Saved bookmark actions
  const handleUnsavePost = async (postId) => {
    try {
      const { data } = await axios.delete(`/api/posts/${postId}/save`, {
        headers: { Authorization: token },
      });
      if (data.success) {
        toast.success("Removed from Saved");
        setProfile(prev => ({
          ...prev,
          savedPosts: prev.savedPosts.filter(p => p._id !== postId),
        }));
      }
    } catch (error) {
      toast.error("Failed to unsave post.");
    }
  };

  // Delete Account
  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you absolutely sure you want to permanently delete your account? This action is irreversible.")) return;
    try {
      // Endpoint logic is optionally implemented on server. Let's delete user activity.
      toast.success("Account deletion simulation complete. Logging out...");
      handleLogout();
    } catch (error) {
      toast.error("Failed to delete account.");
    }
  };

  // Handle Like/Unlike from posts list inside profile
  const handleLikeToggle = async (postId, currentLikeState) => {
    if (!token) {
      toast.error("Please login to like posts.");
      return;
    }
    try {
      const endpoint = `/api/posts/${postId}/like`;
      const config = { headers: { Authorization: token } };

      const { data } = currentLikeState
        ? await axios.delete(endpoint, config)
        : await axios.post(endpoint, {}, config);

      if (data.success) {
        const updater = posts =>
          posts.map(p =>
            p._id === postId
              ? {
                  ...p,
                  likes: p.likes + (currentLikeState ? -1 : 1),
                  isLikedByMe: !currentLikeState,
                }
              : p
          );

        // Update posts inside the tabs dynamically
        setProfile(prev => ({
          ...prev,
          posts: updater(prev.posts),
          likedPosts: currentLikeState
            ? prev.likedPosts.filter(p => p._id !== postId)
            : [...prev.likedPosts, prev.posts.find(p => p._id === postId)],
          savedPosts: updater(prev.savedPosts),
        }));
        toast.success(currentLikeState ? "Liked removed" : "Post liked");
      }
    } catch (error) {
      toast.error("Failed to update like status.");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
          <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-3xl mb-8"></div>
          <div className="flex gap-6 mb-8 items-center">
            <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800"></div>
            <div className="flex-1 space-y-3">
              <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded"></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white">Profile Not Found</h2>
          <p className="text-slate-500 dark:text-slate-400">The user you are looking for does not exist or has set their profile to private.</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
        
        {/* Cover Photo / Header Banner */}
        <div className="relative group/cover h-40 sm:h-56 w-full rounded-3xl overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-md">
          {profile.coverPhoto ? (
            <img src={profile.coverPhoto} alt="cover banner" className="w-full h-full object-cover transition-transform duration-500 group-hover/cover:scale-105" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-violet-600/30 to-indigo-600/30 backdrop-blur-md"></div>
          )}
          {profile.isOwnProfile && (
            <button
              onClick={() => coverInputRef.current.click()}
              className="absolute right-4 bottom-4 p-2 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-lg"
            >
              📷 Edit Banner
            </button>
          )}
          <input type="file" ref={coverInputRef} onChange={handleCoverUpload} accept="image/*" className="hidden" />
        </div>

        {/* Profile Details Container */}
        <div className="relative px-4 sm:px-8 -mt-16 sm:-mt-20 mb-8 z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            {/* Profile Picture */}
            <div className="relative group/avatar w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white dark:border-slate-950 overflow-hidden shadow-2xl bg-white dark:bg-slate-900">
              <img src={profile.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150"} alt="profile" className="w-full h-full object-cover" />
              {profile.isOwnProfile && (
                <button
                  onClick={() => avatarInputRef.current.click()}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white text-xs font-bold cursor-pointer"
                >
                  Change Photo
                </button>
              )}
              <input type="file" ref={avatarInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
            </div>

            {/* Username & Joined date */}
            <div className="space-y-1 mb-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-1.5">
                {profile.name}
                {profile.verified && (
                  <span className="text-blue-500 text-lg" title="Verified Badge">✓</span>
                )}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">@{profile.username}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-xs text-slate-400 dark:text-slate-500 mt-1">
                {profile.location && <span>📍 {profile.location}</span>}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noreferrer" className="text-violet-600 dark:text-violet-400 hover:underline">
                    🔗 {profile.website.replace(/(^\w+:|^)\/\//, "")}
                  </a>
                )}
                <span>📅 Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</span>
              </div>
            </div>
          </div>

          {/* Follow Actions buttons */}
          <div className="flex items-center justify-center gap-3">
            {profile.isOwnProfile ? (
              <>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-6 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="p-2.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl transition-all cursor-pointer shadow-sm"
                  aria-label="Settings"
                >
                  ⚙️
                </button>
              </>
            ) : (
              <button
                onClick={handleFollowToggle}
                className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98] ${
                  profile.isFollowing
                    ? "bg-slate-200 dark:bg-slate-800 hover:bg-slate-350 text-slate-800 dark:text-slate-200"
                    : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-violet-600/20"
                }`}
              >
                {profile.isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>

        {/* Biography Block */}
        {profile.bio && (
          <div className="px-4 sm:px-8 mb-8 text-center sm:text-left">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}

        {/* Statistics Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4 px-4 sm:px-8 mb-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-3 sm:p-4 rounded-2xl text-center shadow-sm">
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{profile.stats.postsCount}</p>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">Posts</p>
          </div>
          <div
            onClick={() => setShowFollowersModal(true)}
            className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-3 sm:p-4 rounded-2xl text-center shadow-sm cursor-pointer hover:border-violet-500/50 transition-colors"
          >
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{profile.stats.followersCount}</p>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">Followers</p>
          </div>
          <div
            onClick={() => setShowFollowingModal(true)}
            className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-3 sm:p-4 rounded-2xl text-center shadow-sm cursor-pointer hover:border-violet-500/50 transition-colors"
          >
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{profile.stats.followingCount}</p>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">Following</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-3 sm:p-4 rounded-2xl text-center shadow-sm">
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">❤️ {profile.stats.totalLikesReceived}</p>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">Likes</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-3 sm:p-4 rounded-2xl text-center shadow-sm">
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">👁 {profile.stats.totalViews}</p>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">Views</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-3 sm:p-4 rounded-2xl text-center shadow-sm col-span-3 sm:col-span-1">
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">💬 {profile.stats.totalCommentsReceived}</p>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">Comments</p>
          </div>
        </div>

        {/* Profile Tabs Navigation */}
        <div className="border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-8 mb-6 flex items-center justify-center gap-6 sm:gap-10">
          <button
            onClick={() => setActiveTab("posts")}
            className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
              activeTab === "posts"
                ? "border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400"
                : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-700"
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab("liked")}
            className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
              activeTab === "liked"
                ? "border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400"
                : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-700"
            }`}
          >
            Likes
          </button>
          {profile.isOwnProfile && (
            <>
              <button
                onClick={() => setActiveTab("saved")}
                className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
                  activeTab === "saved"
                    ? "border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400"
                    : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-700"
                }`}
              >
                Saved
              </button>
              <button
                onClick={() => setActiveTab("drafts")}
                className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
                  activeTab === "drafts"
                    ? "border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400"
                    : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-700"
                }`}
              >
                Drafts ({profile.stats.draftsCount})
              </button>
            </>
          )}
        </div>

        {/* Tab Content: Grid Layout */}
        <div className="px-4 sm:px-8">
          {activeTab === "posts" && (
            profile.posts.length === 0 ? (
              <div className="text-center py-16 text-slate-400 dark:text-slate-650">No published posts yet</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {profile.posts.map(post => (
                  <div key={post._id} className="relative group overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 aspect-[4/3] shadow-sm hover:shadow-md transition-shadow">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-4 text-white">
                      <div className="flex justify-between items-center text-xs">
                        <span className="bg-violet-600/80 px-2 py-0.5 rounded text-[10px] uppercase font-bold">{post.category}</span>
                        <span>👁 {post.views}</span>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm line-clamp-2 leading-tight">{post.title}</h4>
                      </div>
                      <div className="flex justify-between items-center text-xs pt-2">
                        <button
                          onClick={() => handleLikeToggle(post._id, post.isLikedByMe)}
                          className="flex items-center gap-1.5 hover:text-red-500 transition-colors font-bold"
                        >
                          {post.isLikedByMe ? "❤️" : "🤍"} {post.likes}
                        </button>
                        <a href={`/blog/${post._id}`} className="text-[10px] font-bold text-violet-400 hover:underline">Read →</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === "liked" && (
            profile.likedPosts.length === 0 ? (
              <div className="text-center py-16 text-slate-400">No liked posts yet</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {profile.likedPosts.map(post => (
                  <div key={post._id} className="relative group overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 aspect-[4/3]">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-4 text-white">
                      <div className="flex justify-between items-center text-xs">
                        <span className="bg-violet-600/80 px-2 py-0.5 rounded text-[10px] uppercase font-bold">{post.category}</span>
                        <span>👁 {post.views}</span>
                      </div>
                      <h4 className="font-extrabold text-sm line-clamp-2">{post.title}</h4>
                      <div className="flex justify-between items-center text-xs">
                        <button
                          onClick={() => handleLikeToggle(post._id, true)}
                          className="text-red-500 font-bold"
                        >
                          ❤️ {post.likes}
                        </button>
                        <a href={`/blog/${post._id}`} className="text-violet-400 hover:underline text-[10px] font-bold">Read →</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === "saved" && (
            profile.savedPosts.length === 0 ? (
              <div className="text-center py-16 text-slate-400">No saved posts yet</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {profile.savedPosts.map(post => (
                  <div key={post._id} className="relative group overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 aspect-[4/3]">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-4 text-white">
                      <div className="flex justify-between items-center text-xs">
                        <span className="bg-violet-600/80 px-2 py-0.5 rounded text-[10px] uppercase">{post.category}</span>
                        <button onClick={() => handleUnsavePost(post._id)} className="text-yellow-400 text-sm hover:scale-110 transition-transform">★</button>
                      </div>
                      <h4 className="font-extrabold text-sm line-clamp-2">{post.title}</h4>
                      <a href={`/blog/${post._id}`} className="text-violet-400 hover:underline text-[10px] font-bold self-end">Read →</a>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === "drafts" && (
            profile.drafts.length === 0 ? (
              <div className="text-center py-16 text-slate-400">No drafts yet</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {profile.drafts.map(post => (
                  <div key={post._id} className="relative group overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 aspect-[4/3]">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-4 text-white">
                      <span className="bg-yellow-600/80 px-2 py-0.5 rounded text-[10px] uppercase font-bold self-start">Draft</span>
                      <h4 className="font-extrabold text-sm line-clamp-2">{post.title}</h4>
                      <a href={`/author/add-blog?edit=${post._id}`} className="text-violet-400 hover:underline text-[10px] font-bold self-end">Edit Draft →</a>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 text-slate-850 dark:text-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Edit Profile Settings</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-semibold cursor-pointer">×</button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-violet-500 outline-none text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Username</label>
                <input type="text" value={editUsername} onChange={e => setEditUsername(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-violet-500 outline-none text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Bio</label>
                <textarea value={editBio} onChange={e => setEditBio(e.target.value)} rows="3" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-violet-500 outline-none text-sm resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Website Link</label>
                <input type="text" value={editWebsite} onChange={e => setEditWebsite(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-violet-500 outline-none text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</label>
                  <input type="text" value={editPhone} onChange={e => setEditPhone(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-violet-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Location</label>
                  <input type="text" value={editLocation} onChange={e => setEditLocation(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-violet-500 outline-none text-sm" />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                <span className="text-sm font-semibold">Private Profile</span>
                <input type="checkbox" checked={editIsPrivate} onChange={e => setEditIsPrivate(e.target.checked)} className="h-5 w-5 rounded text-violet-600 focus:ring-violet-500 border-slate-300" />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-sm font-bold cursor-pointer shadow-md">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Profile Settings</h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-semibold cursor-pointer">×</button>
            </div>

            <div className="space-y-5">
              {/* Notification Toggles */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Push Notification Toggles</h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Likes Notifications</span>
                  <input type="checkbox" checked={editLikesNotify} onChange={e => setEditLikesNotify(e.target.checked)} className="h-5 w-5 rounded text-violet-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Follows Notifications</span>
                  <input type="checkbox" checked={editFollowsNotify} onChange={e => setEditFollowsNotify(e.target.checked)} className="h-5 w-5 rounded text-violet-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Comments Notifications</span>
                  <input type="checkbox" checked={editCommentsNotify} onChange={e => setEditCommentsNotify(e.target.checked)} className="h-5 w-5 rounded text-violet-600" />
                </div>
              </div>

              {/* Theme Settings */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-between">
                <span className="text-sm font-semibold">Dark Mode</span>
                <button
                  onClick={toggleDarkMode}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold cursor-pointer"
                >
                  {isDarkMode ? "ON" : "OFF"}
                </button>
              </div>

              {/* Account deletion and logout */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                <button
                  onClick={() => {
                    handleLogout();
                    setShowSettingsModal(false);
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Log Out
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 font-bold rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Followers</h3>
              <button onClick={() => setShowFollowersModal(false)} className="text-slate-400 text-xl font-bold cursor-pointer">×</button>
            </div>
            
            <input
              type="text"
              placeholder="Search followers..."
              value={followersSearch}
              onChange={e => setFollowersSearch(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 mb-4 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
            />

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {followersList.length === 0 ? (
                <p className="text-center text-slate-400 py-8 text-sm">No followers found</p>
              ) : (
                followersList.map(u => (
                  <div key={u._id} className="flex items-center justify-between gap-3">
                    <a href={`/profile/${u.username}`} className="flex items-center gap-3">
                      <img src={u.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80"} alt={u.name} className="w-10 h-10 rounded-full object-cover bg-slate-100" />
                      <div>
                        <p className="text-sm font-bold leading-tight">{u.name}</p>
                        <p className="text-xs text-slate-450">@{u.username}</p>
                      </div>
                    </a>
                    {currentUser && currentUser._id !== u._id && (
                      <button
                        onClick={() => toggleFollowUserInList(u, "followers")}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          u.isFollowing
                            ? "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            : "bg-violet-600 hover:bg-violet-750 text-white"
                        }`}
                      >
                        {u.isFollowing ? "Following" : "Follow"}
                      </button>
                    )}
                  </div>
                ))
              )}
              {hasMoreFollowers && (
                <button onClick={() => fetchFollowers(false)} className="w-full text-center py-2 text-xs font-semibold text-violet-600 hover:underline">Load More</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Following</h3>
              <button onClick={() => setShowFollowingModal(false)} className="text-slate-400 text-xl font-bold cursor-pointer">×</button>
            </div>

            <input
              type="text"
              placeholder="Search following..."
              value={followingSearch}
              onChange={e => setFollowingSearch(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 mb-4 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
            />

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {followingList.length === 0 ? (
                <p className="text-center text-slate-400 py-8 text-sm">Not following anyone yet</p>
              ) : (
                followingList.map(u => (
                  <div key={u._id} className="flex items-center justify-between gap-3">
                    <a href={`/profile/${u.username}`} className="flex items-center gap-3">
                      <img src={u.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80"} alt={u.name} className="w-10 h-10 rounded-full object-cover bg-slate-100" />
                      <div>
                        <p className="text-sm font-bold leading-tight">{u.name}</p>
                        <p className="text-xs text-slate-450">@{u.username}</p>
                      </div>
                    </a>
                    {currentUser && currentUser._id !== u._id && (
                      <button
                        onClick={() => toggleFollowUserInList(u, "following")}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          u.isFollowing
                            ? "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            : "bg-violet-600 hover:bg-violet-750 text-white"
                        }`}
                      >
                        {u.isFollowing ? "Following" : "Follow"}
                      </button>
                    )}
                  </div>
                ))
              )}
              {hasMoreFollowing && (
                <button onClick={() => fetchFollowing(false)} className="w-full text-center py-2 text-xs font-semibold text-violet-600 hover:underline">Load More</button>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Profile;
