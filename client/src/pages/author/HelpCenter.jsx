import React, { useState } from "react";

const HelpCenter = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const faqs = [
        {
            q: "How do I generate an article outline using AI Content Studio?",
            a: "Navigate to the AI Content Studio on the sidebar, type your topic or keyword concept, select your desired tone, and click 'Outline'. The generated layout will render instantly in the output workspace."
        },
        {
            q: "How does the estimated reading time calculation operate?",
            a: "We compute estimated reading times dynamically based on word count. The average reading speed is assumed to be 200 words per minute, yielding an estimated minute count shown at the top of every blog post."
        },
        {
            q: "Can I review and manage pending reader comments?",
            a: "Yes! Click the 'Comments' menu on the sidebar to review, approve, or delete reader responses. Approved comments are instantly visible on the public details page."
        },
        {
            q: "How do I configure SMTP transporters for email dispatches?",
            a: "SMTP credentials can be customized in the backend `.env` variables using fields like `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS`. If not specified, the system logs email campaigns directly to MongoDB for diagnostics."
        }
    ];

    const toggleFaq = (idx) => {
        setActiveIndex(activeIndex === idx ? null : idx);
    };

    return (
        <div className="flex-1 bg-[rgb(219,218,218)] dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-6 md:p-10 overflow-y-auto font-sans">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <span>💡</span> Help &amp; FAQ Center
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Find user guides, diagnostic tips, and answers to common subscription questions.</p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
                {faqs.map((faq, idx) => (
                    <div key={idx} className={`bg-white dark:bg-slate-800 border rounded-2xl overflow-hidden transition-all duration-200 shadow-lg dark:shadow-none ${activeIndex === idx ? 'border-violet-200 dark:border-violet-500/30 shadow-lg dark:shadow-none' : 'border-transparent dark:border-slate-700'}`}>
                        <button
                            onClick={() => toggleFaq(idx)}
                            className="w-full text-left p-5 font-semibold text-sm sm:text-base text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white flex justify-between items-center outline-none focus:outline-none cursor-pointer transition-colors"
                        >
                            <span>{faq.q}</span>
                            <span className={`font-bold text-lg transition-transform duration-200 ${activeIndex === idx ? 'text-violet-600 dark:text-violet-400 rotate-0' : 'text-slate-400 dark:text-slate-500'}`}>
                                {activeIndex === idx ? "−" : "+"}
                            </span>
                        </button>
                        {activeIndex === idx && (
                            <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700/40 bg-[rgb(219,218,218)] dark:bg-transparent">
                                {faq.a}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HelpCenter;
