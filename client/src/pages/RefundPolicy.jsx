import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const RefundPolicy = () => {
    return (
        <div className="relative overflow-hidden min-h-screen flex flex-col justify-between">
            {/* Background elements */}
            <div className="absolute top-[-100px] left-[-10%] w-[450px] h-[450px] rounded-full bg-violet-500/5 blur-[80px] -z-10 animate-float-slow" />
            <div className="absolute top-[-120px] right-[-5%] w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[90px] -z-10 animate-float-medium" />

            <Navbar />

            <div className="mx-6 sm:mx-20 xl:mx-32 my-16 flex-grow">
                <div className="max-w-4xl mx-auto bz-card border border-slate-200 dark:border-slate-800 p-8 md:p-12 rounded-3xl shadow-xl transition-all duration-300 bg-white dark:bg-slate-900">
                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-500 bg-clip-text text-transparent dark:from-violet-400 dark:via-indigo-400 dark:to-purple-500">
                        Return & Refund Policy
                    </h1>
                    
                    <p className="text-slate-650 dark:text-slate-300 mb-8 leading-relaxed text-lg font-medium transition-colors duration-300">
                        Thank you for purchasing services and premium memberships at Blogify. We strive to provide premium content creation tools. If you are not completely satisfied, we are here to support you.
                    </p>
 
                    <div className="space-y-8 text-slate-700 dark:text-slate-400 transition-colors duration-300">
                        <section className="space-y-3">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 transition-colors duration-300">
                                1. Refund Eligibility
                            </h2>
                            <p className="leading-relaxed text-sm">
                                Refunds for premium subscription plans are evaluated on a case-by-case basis. Below are general conditions under which refund requests are approved:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-sm pl-4 text-slate-600 dark:text-slate-300 transition-colors duration-300">
                                <li><strong>Accidental Renewal:</strong> If you requested cancellation prior to renewal, but your card was charged due to system lag, request a refund within 7 days of the renewal charge.</li>
                                <li><strong>Technical Outages:</strong> If a persistent technical issue renders the platform unusable and our developers are unable to resolve it within 5 business days, a partial refund will be issued.</li>
                                <li><strong>AI Credits:</strong> Once Gemini AI credits are utilized to generate blog posts or summaries, those tokens cannot be refunded.</li>
                            </ul>
                        </section>
 
                        <section className="space-y-3">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 transition-colors duration-300">
                                2. Processing Refunds
                            </h2>
                            <p className="leading-relaxed text-sm">
                                Approved refunds are processed and returned to the original payment method within 5 to 10 business days, depending on your bank's processing policies.
                            </p>
                        </section>
 
                        <section className="space-y-3">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 transition-colors duration-300">
                                3. Contact Support
                            </h2>
                            <p className="leading-relaxed text-sm">
                                To submit a refund request, send an email describing the billing issue. Include your account email and transaction ID.
                            </p>
                            <div className="pt-4">
                                <a 
                                    href="mailto:billing@blogify.com" 
                                    className="inline-block bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold px-8 py-3 rounded-xl shadow-[0_4px_12px_rgba(124,58,237,0.2)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer text-sm"
                                >
                                    Contact Billing
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

export default RefundPolicy;
