import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const ReturnInfo = () => {
    return (
        <div className="relative overflow-hidden min-h-screen flex flex-col justify-between">
            {/* Background elements */}
            <div className="absolute top-[-100px] left-[-10%] w-[450px] h-[450px] rounded-full bg-violet-500/5 blur-[80px] -z-10 animate-float-slow" />
            <div className="absolute top-[-120px] right-[-5%] w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[90px] -z-10 animate-float-medium" />

            <Navbar />

            <div className="mx-6 sm:mx-20 xl:mx-32 my-16 flex-grow">
                <div className="max-w-4xl mx-auto bz-card border border-slate-200 dark:border-slate-800 p-8 md:p-12 rounded-3xl shadow-xl transition-all duration-300 bg-white dark:bg-slate-900">
                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-500 bg-clip-text text-transparent dark:from-violet-400 dark:via-indigo-400 dark:to-purple-500">
                        Return Information
                    </h1>
                    
                    <p className="text-slate-650 dark:text-slate-300 mb-8 leading-relaxed text-lg font-medium transition-colors duration-300">
                        At Blogify, we want you to have the absolute best experience with our writing services, premium content platforms, and membership options. Here's a complete guide on how returns, account downgrades, and subscriptions are managed.
                    </p>
 
                    <div className="space-y-8 text-slate-700 dark:text-slate-400 transition-colors duration-300">
                        <section className="space-y-3">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 transition-colors duration-300">
                                1. Subscription & Digital Content
                            </h2>
                            <p className="leading-relaxed text-sm">
                                Since Blogify serves premium articles, custom audio generation, and translation software online, our products are categorized as digital content. Once a membership or premium token pack is purchased and accessed, it cannot be physically "returned."
                            </p>
                        </section>
 
                        <section className="space-y-3">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 transition-colors duration-300">
                                2. Trial Period & Account Cancellation
                            </h2>
                            <p className="leading-relaxed text-sm">
                                Any user who wishes to cancel their premium plan can do so at any time directly through their Dashboard Settings. Upon cancellation:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-sm pl-4 text-slate-600 dark:text-slate-300 transition-colors duration-300">
                                <li>You will retain access to premium features until the end of your billing cycle.</li>
                                <li>No further subscription payments will be charged to your card.</li>
                                <li>All your published drafts and custom logs remain stored safely.</li>
                            </ul>
                        </section>
 
                        <section className="space-y-3">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 transition-colors duration-300">
                                3. Help & Assistance
                            </h2>
                            <p className="leading-relaxed text-sm">
                                If you have questions about subscription renewals, billing history, or encountered a payment processing issue, please contact our support team. We reply within 24-48 business hours.
                            </p>
                            <div className="pt-4">
                                <a 
                                    href="mailto:support@blogify.com" 
                                    className="inline-block bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold px-8 py-3 rounded-xl shadow-[0_4px_12px_rgba(124,58,237,0.2)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer text-sm"
                                >
                                    Email Support
                                </a>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ReturnInfo;
