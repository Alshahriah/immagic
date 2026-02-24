import { useEffect, useState } from "react"
import api from "@/lib/api"
import { cn } from "@/lib/utils"
import { Terminal, Activity, CheckCircle, AlertCircle, Clock } from "lucide-react"

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
            
            // Prevent re-render loops if data is identical
            setJobs(prev => {
                if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
                return data;
            })

            // Auto-select logic only if nothing selected
            if (!selectedJobId && data.length > 0) {
                // Prefer processing jobs
                const processing = data.find((j: Job) => j.status === 'processing' && ['scan', 'ocr_batch'].includes(j.type))
                if (processing) setSelectedJobId(processing.id)
                else {
                     // Find first visible job
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
  
  // FILTER: Only show Scan and Batch OCR jobs. Hide individual image OCR tasks.
  const visibleJobs = jobs.filter(j => ['scan', 'ocr_batch'].includes(j.type))

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-4">
      <div className="flex items-center justify-between">
         <h1 className="text-3xl font-bold tracking-tight">System Console</h1>
         <div className="flex gap-2 text-sm text-muted-foreground">
             <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span> Processing</span>
             <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span> Completed</span>
             <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span> Failed</span>
         </div>
      </div>

      <div className="flex-1 flex border rounded-md overflow-hidden shadow-sm bg-background">
        
        {/* Sidebar Job List */}
        <div className="w-1/3 border-r bg-muted/10 overflow-y-auto">
            <div className="p-2 space-y-2">
                {visibleJobs.map(job => (
                    <div 
                        key={job.id}
                        onClick={() => setSelectedJobId(job.id)}
                        className={cn(
                            "p-3 rounded-md cursor-pointer transition-colors border",
                            selectedJobId === job.id 
                                ? "bg-accent text-accent-foreground border-accent-foreground/20" 
                                : "bg-card hover:bg-accent/50 border-transparent"
                        )}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold capitalize flex items-center gap-2">
                                {job.type === 'scan' ? <FolderPlusIcon className="w-3 h-3"/> : <Terminal className="w-3 h-3"/>}
                                {job.type}
                            </span>
                            <StatusBadge status={job.status} />
                        </div>
                        <div className="text-xs text-muted-foreground font-mono truncate">
                            ID: {job.job_id}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(job.created_at).toLocaleTimeString()}
                        </div>
                    </div>
                ))}
                {visibleJobs.length === 0 && <div className="p-4 text-center text-muted-foreground">No active tasks.</div>}
            </div>
        </div>

        {/* Console Output Area */}
        <div className="flex-1 flex flex-col bg-[#0c0c0c] text-green-400 font-mono text-sm">
            <div className="border-b border-white/10 p-2 bg-[#1a1a1a] flex justify-between items-center text-xs text-gray-400">
                <span>TERMINAL OUTPUT</span>
                <span>{selectedJob ? `JOB: ${selectedJob.job_id}` : 'IDLE'}</span>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto whitespace-pre-wrap">
                {selectedJob ? (
                    <>
                        <div className="mb-2 text-gray-500">
                            {'>'} Job Type: {selectedJob.type}<br/>
                            {'>'} Started: {new Date(selectedJob.created_at).toLocaleString()}<br/>
                            {'>'} Status: {selectedJob.status.toUpperCase()}
                        </div>
                        <div className="h-px bg-white/10 my-2"></div>
                        
                        {selectedJob.result ? (
                             selectedJob.result.split('\n').map((line, i) => (
                                 <div key={i} className="mb-1">
                                     <span className="text-green-600 mr-2">$</span>
                                     {line}
                                 </div>
                             ))
                        ) : (
                            <span className="text-gray-600 italic">Waiting for logs...</span>
                        )}

                        {selectedJob.error_message && (
                            <div className="mt-4 text-red-500 border-t border-red-900/50 pt-2">
                                <span className="font-bold">ERROR:</span> {selectedJob.error_message}
                            </div>
                        )}
                        
                        {selectedJob.status === 'processing' && (
                            <div className="mt-2 animate-pulse">_</div>
                        )}
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-600">
                        Select a job to view logs
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'completed') return <CheckCircle className="w-4 h-4 text-green-500" />
    if (status === 'failed') return <AlertCircle className="w-4 h-4 text-red-500" />
    if (status === 'processing') return <Activity className="w-4 h-4 text-blue-500 animate-spin" />
    return <div className="w-2 h-2 rounded-full bg-gray-400" />
}

function FolderPlusIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 10v6" />
        <path d="M9 13h6" />
        <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
      </svg>
    )
  }
