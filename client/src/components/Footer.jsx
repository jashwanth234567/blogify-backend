import { assets, footer_data } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const Footer = () => {
    const { navigate, isDarkMode } = useAppContext();

    const handleFooterLink = (e, link) => {
        if (link === "Home") {
            e.preventDefault();
            navigate("/");
        } else if (link === "Return & Refund Policy") {
            e.preventDefault();
            navigate("/refund-policy");
        } else if (link === "Delivery Information" || link === "Return Information") {
            e.preventDefault();
            navigate("/return-info");
        }
    };

    return (
        <div className="w-full px-6 md:px-16 lg:px-24 xl:px-32 bg-white dark:bg-[#111827] border-t border-slate-200 dark:border-slate-800 relative overflow-hidden transition-colors duration-300 shadow-[0_-1px_3px_rgba(0,0,0,0.02)]">
            {/* Decorative glow blob at the bottom footer corner */}
            <div className="absolute bottom-[-100px] right-[-100px] w-64 h-64 rounded-full bg-violet-500/5 blur-[50px] -z-10" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 py-16 border-b border-slate-200 dark:border-slate-800/60 text-slate-600 dark:text-slate-400 transition-colors duration-300">
                <div className="md:col-span-5 space-y-6">
                    <img src={isDarkMode ? assets.logo_light : assets.logo} alt="logo" className="w-36 cursor-pointer" onClick={() => navigate("/")} />
                    <p className="max-w-[360px] text-sm text-slate-500 dark:text-slate-400/80 leading-relaxed font-medium transition-colors duration-300">
                        Blogify is your premium space to think out loud, share what matters, and write without filters. Start your blogging journey today.
                    </p>
                    {/* Social links */}
                    <div className="flex gap-3">
                        <a href="#" className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-all duration-300 hover:shadow-lg hover:shadow-violet-600/20">
                            <img src={assets.facebook_icon} className="w-4" alt="Facebook" />
                        </a>
                        <a href="#" className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-all duration-300 hover:shadow-lg hover:shadow-violet-600/20">
                            <img src={assets.twitter_icon} className="w-4" alt="Twitter" />
                        </a>
                        <a href="#" className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-all duration-300 hover:shadow-lg hover:shadow-violet-600/20">
                            <img src={assets.linkedin_icon} className="w-4" alt="LinkedIn" />
                        </a>
                    </div>
                </div>

                <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
                    {footer_data.map((section, index) => (
                        <div key={index} className="space-y-4">
                            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider transition-colors duration-300">{section.title}</h3>
                            <ul className="text-sm space-y-2.5">
                                {section.links.map((link, i) => (
                                    <li key={i}>
                                        <a href="#" onClick={(e) => handleFooterLink(e, link)} className="text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:translate-x-1 transition-all duration-200 inline-block font-medium">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            <p className="py-6 text-center text-xs sm:text-sm text-slate-450 dark:text-slate-500 font-medium transition-colors duration-300">
                Copyright 2026 © Blogify GreatStack - All Rights Reserved.
            </p>
        </div>
    );
};

export default Footer;
