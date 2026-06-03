import { useState } from "react";
import { blogCategories } from "../assets/assets";
import BlogCard from "./BlogCard";
import { useAppContext } from "../context/AppContext";

const BlogList = () => {
    const [menu, setMenu] = useState("All");
    const { blogs, input } = useAppContext();

    const filteredBlogs = () => {
        if (input === "") {
            return blogs;
        }
        return blogs.filter((blog) => blog.title.toLowerCase().includes(input.toLowerCase()) || blog.category.toLowerCase().includes(input.toLowerCase()));
    };

    return (
        <div>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 my-10 relative px-4">
                {blogCategories.map((item) => (
                    <div key={item} className="relative">
                        <button
                            onClick={() => setMenu(item)}
                            className={`cursor-pointer px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 active:translate-y-0 ${
                                menu === item
                                    ? "text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-[0_4px_12px_rgba(124,58,237,0.2)]"
                                    : "text-slate-600 bg-white border border-slate-200 hover:bg-[rgb(219,218,218)] hover:text-slate-900 dark:text-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                            }`}
                        >
                            {item}
                        </button>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-24 mx-8 sm:mx-16 xl:mx-40">
                {filteredBlogs()
                    .filter((blog) => (menu === "All" ? true : blog.category === menu))
                    .map((blog) => (
                        <BlogCard key={blog._id} blog={blog} />
                    ))}
            </div>
        </div>
    );
};

export default BlogList;
