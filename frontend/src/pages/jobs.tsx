import { useEffect, useState } from "react"
import api from "@/lib/api"
import { cn } from "@/lib/utils"
import { Terminal, Activity, CheckCircle, AlertCircle, Clock, FolderPlus, Zap, Cpu, Network } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Job {
  id: number
  job_id: string
  type: string
  status: string
  result?: string
  error_message?: string
  created_at: string
}

export function JobQueue() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null)

  useEffect(() => {
    const fetchJobs = async () => {
        try {
            const { data } = await api.get("/jobs/")
            setJobs(prev => {
                if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
                return data;
            })

            if (!selectedJobId && data.length > 0) {
                const processing = data.find((j: Job) => j.status === 'processing' && ['scan', 'ocr_batch'].includes(j.type))
                if (processing) setSelectedJobId(processing.id)
                else {
                     const firstVisible = data.find((j: Job) => ['scan', 'ocr_batch'].includes(j.type))
                     if (firstVisible) setSelectedJobId(firstVisible.id)
                }
            }
        } catch (e) { console.error(e) }
    }
    fetchJobs()
    const interval = setInterval(fetchJobs, 2000)
    return () => clearInterval(interval)
  }, [selectedJobId])

  const selectedJob = jobs.find(j => j.id === selectedJobId)
  const visibleJobs = jobs.filter(j => ['scan', 'ocr_batch'].includes(j.type))

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight">Intelligence Hub</h1>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> Monitoring background processing units
            </p>
         </div>
         
         <div className="flex gap-4 p-2 bg-muted/30 rounded-2xl border border-border/50 backdrop-blur-sm">
             <StatCard label="Active" count={jobs.filter(j => j.status === 'processing').length} color="bg-blue-500" />
             <StatCard label="Completed" count={jobs.filter(j => j.status === 'completed').length} color="bg-green-500" />
             <StatCard label="Failed" count={jobs.filter(j => j.status === 'failed').length} color="bg-red-500" />
         </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        
        {/* Task List */}
        <div className="w-full md:w-80 flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-thin">
            <AnimatePresence mode="popLayout">
                {visibleJobs.map(job => (
                    <motion.div 
                        layout
                        key={job.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => setSelectedJobId(job.id)}
                        className={cn(
                            "group p-4 rounded-2xl cursor-pointer transition-all duration-300 border relative overflow-hidden",
                            selectedJobId === job.id 
                                ? "bg-card border-primary ring-1 ring-primary shadow-xl shadow-primary/5 scale-[1.02]" 
                                : "bg-card/50 hover:bg-card border-transparent hover:border-border/50 shadow-sm"
                        )}
                    >
                        {selectedJobId === job.id && (
                            <motion.div layoutId="active-indicator" className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                        )}
                        
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "p-2 rounded-xl shrink-0 transition-colors",
                                    selectedJobId === job.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary"
                                )}>
                                    {job.type === 'scan' ? <FolderPlus className="w-4 h-4"/> : <Cpu className="w-4 h-4"/>}
                                </div>
                                <div>
                                    <span className="font-bold text-sm capitalize block leading-none mb-1">{job.type.replace('_', ' ')}</span>
                                    <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">{job.job_id.split('_').pop()}</span>
                                </div>
                            </div>
                            <StatusBadge status={job.status} />
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                                <Clock className="w-3 h-3 mr-1.5" />
                                {new Date(job.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            {job.status === 'processing' && (
                                <div className="flex gap-0.5">
                                    {[0, 1, 2].map(i => (
                                        <motion.div 
                                            key={i}
                                            animate={{ opacity: [0.3, 1, 0.3] }}
                                            transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                            className="w-1 h-1 rounded-full bg-primary"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
            {visibleJobs.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-muted/20 rounded-3xl border border-dashed">
                    <Zap className="w-8 h-8 text-muted-foreground/30 mb-2" />
                    <p className="text-sm font-medium text-muted-foreground">System Idle</p>
                </div>
            )}
        </div>

        {/* Console View */}
        <div className="flex-1 flex flex-col rounded-3xl border bg-[#050505] shadow-2xl overflow-hidden ring-1 ring-white/5 relative">
            {/* Glossy Header */}
            <div className="h-14 border-b border-white/10 px-6 bg-[#0a0a0a] flex justify-between items-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
                <div className="flex items-center gap-3 relative z-10">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40" />
                    </div>
                    <div className="h-4 w-[1px] bg-white/10 mx-2" />
                    <span className="text-[10px] font-black tracking-[0.2em] text-gray-500 uppercase flex items-center gap-2">
                        <Terminal className="w-3 h-3" /> Core Node Console
                    </span>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                     <span className="text-[10px] text-primary/70 font-mono tracking-tighter">SSH: 127.0.0.1</span>
                     {selectedJob && <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-gray-400 font-mono border border-white/5">PID: {Math.floor(Math.random() * 9000) + 1000}</span>}
                </div>
            </div>
            
            {/* Terminal Body */}
            <div className="flex-1 p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 font-mono text-[13px] leading-relaxed">
                <AnimatePresence mode="wait">
                    {selectedJob ? (
                        <motion.div 
                            key={selectedJob.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                                <ConsoleMeta label="Module" value={selectedJob.type} />
                                <ConsoleMeta label="Status" value={selectedJob.status.toUpperCase()} color={
                                    selectedJob.status === 'completed' ? 'text-green-400' : 
                                    selectedJob.status === 'failed' ? 'text-red-400' : 'text-blue-400'
                                } />
                                <ConsoleMeta label="Runtime" value="Real-time" />
                                <ConsoleMeta label="Environment" value="Production-01" />
                            </div>
                            
                            <div className="space-y-2">
                                <p className="text-gray-600 flex items-center gap-2 mb-4">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Stream initialized at {new Date(selectedJob.created_at).toLocaleString()}
                                </p>
                                
                                <div className="space-y-1">
                                    {selectedJob.result ? (
                                        selectedJob.result.split('\n').map((line, i) => (
                                            <motion.div 
                                                initial={{ opacity: 0, x: -5 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                key={i} 
                                                className="flex gap-4 group"
                                            >
                                                <span className="text-gray-700 select-none w-6 shrink-0 font-bold">{i + 1}</span>
                                                <span className="text-green-500/80 shrink-0 font-black">❯</span>
                                                <span className="text-gray-300 group-hover:text-white transition-colors">{line}</span>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="flex gap-4 italic text-gray-600">
                                            <span className="text-green-500/80 shrink-0 font-black">❯</span>
                                            Awaiting buffer synchronization...
                                        </div>
                                    )}

                                    {selectedJob.error_message && (
                                        <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 space-y-1 animate-in zoom-in-95 duration-300">
                                            <p className="font-bold flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4" /> FATAL EXCEPTION DETECTED
                                            </p>
                                            <p className="text-xs font-mono">{selectedJob.error_message}</p>
                                        </div>
                                    )}
                                    
                                    {selectedJob.status === 'processing' && (
                                        <div className="flex gap-4">
                                            <span className="text-green-500/80 shrink-0 font-black animate-pulse">❯</span>
                                            <motion.div 
                                                animate={{ opacity: [0, 1] }} 
                                                transition={{ repeat: Infinity, duration: 0.8 }}
                                                className="w-2 h-4 bg-primary/50"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-700 space-y-4">
                            <Network className="w-16 h-16 stroke-1 opacity-20" />
                            <div className="text-center">
                                <p className="text-sm font-bold tracking-widest uppercase">Select an active process</p>
                                <p className="text-xs text-gray-500 mt-1">Real-time telemetry not available in IDLE mode</p>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
            
            {/* Visual Decoration */}
            <div className="absolute bottom-0 left-0 right-0 h-[100px] bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
        </div>

      </div>
    </div>
  )
}

function StatCard({ label, count, color }: { label: string, count: number, color: string }) {
    return (
        <div className="px-4 py-1 flex items-center gap-3 border-r last:border-none border-border/50">
            <div className={cn("w-2 h-2 rounded-full", color)} />
            <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold leading-none">{label}</span>
                <span className="text-sm font-black mt-0.5">{count}</span>
            </div>
        </div>
    )
}

function ConsoleMeta({ label, value, color }: { label: string, value: string, color?: string }) {
    return (
        <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-gray-600">{label}</p>
            <p className={cn("text-xs font-bold truncate", color || "text-gray-300")}>{value}</p>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'completed') return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 text-[10px] font-black uppercase tracking-tighter">
            <CheckCircle className="w-3 h-3" /> OK
        </div>
    )
    if (status === 'failed') return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-black uppercase tracking-tighter">
            <AlertCircle className="w-3 h-3" /> ERR
        </div>
    )
    if (status === 'processing') return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[10px] font-black uppercase tracking-tighter">
            <Activity className="w-3 h-3 animate-pulse" /> RUN
        </div>
    )
    return null
}
