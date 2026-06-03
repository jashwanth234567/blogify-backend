import { useNavigate } from "react-router-dom";

const BlogCard = ({ blog }) => {
    const { title, description, category, image, _id } = blog;
    const navigate = useNavigate();

    return (
        <div onClick={() => navigate(`/blog/${_id}`)} className="group w-full bz-card bz-card-interactive !p-0 overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg cursor-pointer">
            <div className="relative aspect-video overflow-hidden">
                <img src={image} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-violet-600 dark:text-violet-400 border border-slate-200/80 dark:border-slate-700/50 uppercase tracking-widest">
                    {category}
                </div>
            </div>
            <div className="flex items-center mt-4 ml-5">
                {blog.isAiGenerated && (
                    <span className="px-2 py-0.5 bg-violet-600/10 border border-violet-500/20 text-violet-600 dark:bg-violet-950/60 dark:border-violet-700/40 dark:text-violet-400 rounded-full text-[10px] font-bold">
                        ✨ AI
                    </span>
                )}
            </div>
            <div className="p-5 pt-3">
                <h5 className="mb-2 font-semibold text-slate-800 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-300 leading-snug">{title}</h5>
                <p className="mb-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: description.slice(0, 80) }}></p>
            </div>
        </div>
    );
};

export default BlogCard;
