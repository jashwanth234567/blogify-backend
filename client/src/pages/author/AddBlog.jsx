import React, { useEffect, useRef, useState } from 'react'
import { assets, blogCategories } from '../../assets/assets'
import Quill from 'quill';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { parse } from 'marked'

const AddBlog = () => {
    const { axios } = useAppContext()
    const [isAdding, setIsAdding] = useState(false)
    const [loading, setLoading] = useState(false)

    const editorRef = useRef(null)
    const quillRef = useRef(null)

    const [image, setImage] = useState(false);
    const [title, setTitle] = useState('');
    const [subTitle, setSubTitle] = useState('');
    const [category, setCategory] = useState('Startup');
    const [isPublished, setIsPublished] = useState(false);
    const [isAiGenerated, setIsAiGenerated] = useState(false);

    // Title Suggestions
    const [suggestedTitles, setSuggestedTitles] = useState([]);
    const [suggestingTitles, setSuggestingTitles] = useState(false);
    const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);

    const handleSuggestTitles = async () => {
        if (!title) return toast.error('Please enter a brief topic/draft title first');
        try {
            setSuggestingTitles(true);
            setShowTitleSuggestions(true);
            const { data } = await axios.post('/api/ai/suggest-titles', { topic: title });
            if (data.success) {
                setSuggestedTitles(data.titles);
            } else {
                toast.error(data.message);
                setShowTitleSuggestions(false);
            }
        } catch (error) {
            toast.error(error.message);
            setShowTitleSuggestions(false);
        } finally {
            setSuggestingTitles(false);
        }
    };

    const generateContent = async () => {
        if (!title) return toast.error('Please enter a title')

        try {
            setLoading(true);
            const { data } = await axios.post('/api/blog/generate', { prompt: title })
            if (data.success) {
                quillRef.current.root.innerHTML = parse(data.content)
                setIsAiGenerated(true);
                toast.success('AI content generated successfully');
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault();
            setIsAdding(true)

            const blog = {
                title, 
                subTitle, 
                description: quillRef.current.root.innerHTML,
                category, 
                isPublished,
                isAiGenerated
            }

            const formData = new FormData();
            formData.append('blog', JSON.stringify(blog))
            formData.append('image', image)

            const { data } = await axios.post('/api/blog/add', formData);

            if (data.success) {
                toast.success(data.message);
                setImage(false)
                setTitle('')
                setSubTitle('')
                quillRef.current.root.innerHTML = ''
                setCategory('Startup')
                setIsAiGenerated(false)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsAdding(false)
        }
    }

    useEffect(() => {
        if (!quillRef.current && editorRef.current) {
            quillRef.current = new Quill(editorRef.current, { theme: 'snow' })
        }
    }, [])

    return (
        <form onSubmit={onSubmitHandler} className='flex-1 bg-[rgb(219,218,218)] dark:bg-slate-950 text-slate-600 dark:text-slate-300 h-full overflow-y-auto p-8 sm:p-10'>
            <div className='bz-card w-full max-w-3xl p-6 md:p-10 mx-auto border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900'>

                <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">Upload thumbnail</p>
                <label htmlFor="image">
                    <img src={!image ? assets.upload_area : URL.createObjectURL(image)} alt="" className='mt-2 h-16 rounded-xl cursor-pointer hover:opacity-90 transition-opacity' />
                    <input onChange={(e) => setImage(e.target.files[0])} type="file" id='image' hidden required />
                </label>

                {/* Blog title and SEO title suggester */}
                <p className='mt-5 font-semibold text-sm text-slate-700 dark:text-slate-300 flex items-center justify-between max-w-lg'>
                    <span>Blog title</span>
                    <button
                        type="button"
                        onClick={handleSuggestTitles}
                        className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                        ✨ Suggest SEO Title
                    </button>
                </p>
                <div className="relative max-w-lg">
                    <input 
                        type="text" 
                        placeholder='Type here' 
                        required 
                        className='bz-input mt-2' 
                        onChange={e => setTitle(e.target.value)} 
                        value={title} 
                    />
                    
                    {suggestingTitles && (
                        <div className="absolute right-3 top-5 text-xs text-slate-450 dark:text-slate-500 animate-pulse">Analyzing...</div>
                    )}
                    
                    {showTitleSuggestions && suggestedTitles.length > 0 && (
                        <div className="absolute left-0 right-0 mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-2.5 z-40 space-y-1">
                            <div className="flex justify-between items-center px-2 mb-1.5 border-b border-slate-100 dark:border-slate-800 pb-1">
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Choose an SEO Title</p>
                                <button onClick={() => setShowTitleSuggestions(false)} className="text-[10px] text-slate-400 hover:text-slate-600">close</button>
                            </div>
                            {suggestedTitles.map((t, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => {
                                        setTitle(t);
                                        setShowTitleSuggestions(false);
                                    }}
                                    className="p-2 hover:bg-violet-50/50 dark:hover:bg-slate-800/60 text-xs rounded-lg cursor-pointer text-slate-700 dark:text-slate-300 transition-colors"
                                >
                                    {t}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <p className='mt-5 font-semibold text-sm text-slate-700 dark:text-slate-300'>Sub title</p>
                <input type="text" placeholder='Type here' required className='bz-input mt-2 max-w-lg' onChange={e => setSubTitle(e.target.value)} value={subTitle} />

                <p className='mt-5 font-semibold text-sm text-slate-700 dark:text-slate-300'>Blog Description</p>
                <div className='max-w-lg h-74 pb-16 sm:pb-10 pt-2 relative'>
                    <div ref={editorRef} className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md"></div>
                    {loading && (
                        <div className='absolute right-0 top-0 bottom-0 flex-1 flex items-center justify-center p-10 bg-[rgb(219,218,218)] dark:bg-slate-900 text-slate-800 dark:text-slate-200'>
                            <div className='w-8 h-8 rounded-full border-2 border-t-white animate-spin'></div>
                        </div>)}
                    <button disabled={loading} type='button' onClick={generateContent} className='absolute bottom-2.5 right-2 ml-2 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-lg hover:shadow-violet-500/25 px-4 py-1.5 rounded-lg transition-all duration-300 cursor-pointer z-30 shadow'>Generate with AI</button>
                </div>

                <p className='mt-5 font-semibold text-sm text-slate-700 dark:text-slate-300'>Blog category</p>
                <select onChange={e => setCategory(e.target.value)} value={category} name="category" className='bz-input mt-2 max-w-xs'>
                    <option value="">Select category</option>
                    {blogCategories.map((item, index) => {
                        return <option key={index} value={item}>{item}</option>
                    })}
                </select>

                <div className='flex items-center gap-2.5 mt-5'>
                    <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">Publish Now</p>
                    <input type="checkbox" checked={isPublished} className='scale-125 cursor-pointer accent-violet-600' onChange={e => setIsPublished(e.target.checked)} />
                </div>

                <button disabled={isAdding} type="submit" className='mt-8 w-40 h-11 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl shadow-[0_4px_12px_rgba(124,58,237,0.2)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 font-semibold cursor-pointer text-sm'>
                    {isAdding ? 'Adding...' : 'Add Blog'}
                </button>

            </div>
        </form>
    )
}

export default AddBlog
