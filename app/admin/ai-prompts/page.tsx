"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Sparkles, 
    Save, 
    RotateCcw, 
    AlertTriangle, 
    Type, 
    FileText, 
    Image as ImageIcon,
    CheckCircle2,
    Info,
    ArrowRight
} from "lucide-react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { getAIPrompts, updateAIPrompts, type AIPrompt } from "@/lib/supabase-api"

export default function AIPromptsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<string | null>(null)
    const [prompts, setPrompts] = useState<Partial<AIPrompt>>({
        title_prompt: "",
        description_prompt: "",
        image_prompt: ""
    })

    useEffect(() => {
        loadPrompts()
    }, [])

    const loadPrompts = async () => {
        setLoading(true)
        const data = await getAIPrompts()
        if (data) {
            setPrompts(data)
            if (data.updated_at) setLastSaved(new Date(data.updated_at).toLocaleString())
        } else {
            // Defaults
            setPrompts({
                title_prompt: "Analyze this product image and provide a catchy title in Moroccan Darija (Arabic script only, no French).",
                description_prompt: "Write a professional marketing description in Moroccan Darija (Arabic script only, no French).",
                image_prompt: "Transform the uploaded clothing image into a professional fashion e-commerce product photo. CRITICAL: PULL BACK SIGNIFICANTLY. The entire product must be seen from top to bottom. Leave wide empty white margins on all FOUR sides. DO NOT CROP."
            })
        }
        setLoading(false)
    }

    const handleSave = async () => {
        setSaving(true)
        const success = await updateAIPrompts(prompts)
        if (success) {
            setLastSaved(new Date().toLocaleString())
            toast.success("AI Intelligence updated successfully", {
                description: "Your new prompts are now live across all AI features."
            })
        } else {
            toast.error("Failed to update prompts. Check database connection.")
        }
        setSaving(false)
    }

    const resetToDefaults = () => {
        setPrompts({
            title_prompt: "Analyze this product image and provide a catchy title in Moroccan Darija (Arabic script only, no French).",
            description_prompt: "Write a professional marketing description in Moroccan Darija (Arabic script only, no French).",
            image_prompt: "Transform the uploaded clothing image into a professional fashion e-commerce product photo. CRITICAL: PULL BACK SIGNIFICANTLY. The entire product must be seen from top to bottom. Leave wide empty white margins on all FOUR sides. DO NOT CROP."
        })
        toast.info("Restored factory defaults")
    }

    return (
        <div className="min-h-screen bg-[#F8F9FF] selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
            <AdminSidebar />
            
            <main className="lg:pl-72 relative min-h-screen pb-20">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/10 to-violet-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
                <div className="absolute bottom-40 left-40 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />

                <div className="max-w-5xl mx-auto p-6 md:p-10">
                    
                    {/* Glass Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 relative">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-2"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xl shadow-indigo-200">
                                    <Sparkles className="w-6 h-6 animate-pulse" />
                                </div>
                                <h1 className="text-4xl font-black tracking-tight text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600">
                                    AI Core Intelligence
                                </h1>
                            </div>
                            <p className="text-gray-500 font-medium max-w-xl text-lg leading-relaxed">
                                Define the neural guidelines that govern how <span className="text-indigo-600 font-bold">Droutfit AI</span> interacts with your products.
                            </p>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-3 bg-white/40 backdrop-blur-md p-2 rounded-3xl border border-white shadow-sm self-start md:self-auto"
                        >
                            <Button 
                                variant="ghost" 
                                onClick={resetToDefaults} 
                                className="rounded-2xl h-12 px-6 font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" /> Reset Defaults
                            </Button>
                            <Button 
                                onClick={handleSave} 
                                disabled={saving} 
                                className="rounded-2xl h-12 shadow-xl shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700 font-black px-10 transition-all group active:scale-95"
                            >
                                {saving ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Syncing...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Save className="w-4 h-4" /> Save Configuration
                                    </div>
                                )}
                            </Button>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Prompts Section */}
                        <div className="lg:col-span-8 space-y-8">
                            
                            <PromptSection 
                                title="Title Generation Strategy"
                                badge="IDENTITY"
                                icon={<Type className="w-5 h-5" />}
                                value={prompts.title_prompt || ""}
                                onChange={(val) => setPrompts({...prompts, title_prompt: val})}
                                delay={0}
                                color="indigo"
                                info="This prompt determines the product's primary name and naming style."
                            />

                            <PromptSection 
                                title="Marketing Description Logic"
                                badge="STORYTELLING"
                                icon={<FileText className="w-5 h-5" />}
                                value={prompts.description_prompt || ""}
                                onChange={(val) => setPrompts({...prompts, description_prompt: val})}
                                delay={0.1}
                                color="violet"
                                info="Craft the narrative and voice used in product descriptions."
                            />

                            <PromptSection 
                                title="Photography Transformation"
                                badge="VISUALS"
                                icon={<ImageIcon className="w-5 h-5" />}
                                value={prompts.image_prompt || ""}
                                onChange={(val) => setPrompts({...prompts, image_prompt: val})}
                                delay={0.2}
                                color="blue"
                                isImage
                                info="Dictates the style, lighting, and framing of generated photos."
                            />
                        </div>

                        {/* Sidebar Info */}
                        <div className="lg:col-span-4 space-y-6">
                            <Card className="p-6 rounded-[2rem] border-none shadow-xl shadow-indigo-100/50 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white relative overflow-hidden">
                                <div className="absolute top-[-20%] right-[-20%] w-40 h-40 bg-white/10 blur-3xl rounded-full" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Info className="w-5 h-5 opacity-70" />
                                        <h3 className="text-sm font-black uppercase tracking-widest leading-none">Status Intelligence</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-xs border-b border-white/10 pb-4">
                                            <span className="opacity-60 font-bold uppercase">Last Updated</span>
                                            <span className="font-black">{lastSaved || "System Default"}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs border-b border-white/10 pb-4">
                                            <span className="opacity-60 font-bold uppercase">Engine</span>
                                            <span className="font-black bg-white/20 px-2 py-0.5 rounded">Droutfit AI</span>
                                        </div>
                                        <div className="space-y-2 pt-2">
                                            <p className="text-[11px] leading-relaxed opacity-80 font-medium">
                                                Your configuration is pushed directly to the Droutfit Core. All changes impact live image and text generation immediately.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    <div className="mt-20 flex flex-col items-center gap-6">
                        <div className="w-16 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">
                            Neural Configuration Management &bull; Azana Studio
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}

function PromptSection({ title, badge, icon, value, onChange, delay, color, info, isImage }: any) {
    const [isFocused, setIsFocused] = useState(false)

    const colors: any = {
        indigo: "border-indigo-100 bg-indigo-50/20 text-indigo-600 focus:ring-indigo-500/20 shadow-indigo-100/30 font-indigo-text",
        violet: "border-violet-100 bg-violet-50/20 text-violet-600 focus:ring-violet-500/20 shadow-violet-100/30 font-violet-text",
        blue: "border-blue-100 bg-blue-50/20 text-blue-600 focus:ring-blue-500/20 shadow-blue-100/30 font-blue-text"
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className={`group bg-white rounded-[2.5rem] border border-gray-100 p-8 transition-all hover:shadow-2xl hover:shadow-gray-200/40 relative ${isFocused ? 'ring-2 ring-indigo-500/5 shadow-2xl' : ''}`}
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color].split(' ')[1]} ${colors[color].split(' ')[2]} shadow-inner`}>
                        {icon}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${colors[color].split(' ')[1]} ${colors[color].split(' ')[2]}`}>
                                {badge}
                            </span>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">{title}</h3>
                    </div>
                </div>
                <div className="bg-gray-50/80 px-4 py-2 rounded-xl text-[10px] font-bold text-gray-400 hidden md:block">
                    {info}
                </div>
            </div>

            <div className="relative">
                <textarea 
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`w-full ${isImage ? 'min-h-[160px]' : 'min-h-[120px]'} p-6 rounded-3xl bg-gray-50/50 border-gray-100 focus:bg-white focus:ring-4 ${colors[color].split(' ')[3]} text-gray-700 font-medium text-sm leading-relaxed transition-all outline-none resize-none`}
                    placeholder={`Define your AI strategy for ${title.toLowerCase()}...`}
                />
                
                <AnimatePresence>
                    {isFocused && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute bottom-4 right-4 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 pointer-events-none"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                            Live Editing Mode
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-4 flex items-center gap-2 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                <ArrowRight className="w-3 h-3 text-indigo-400" />
                Refined by your custom instructions
            </div>
        </motion.div>
    )
}
