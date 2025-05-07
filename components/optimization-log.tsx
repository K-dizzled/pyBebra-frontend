"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ChevronDown, ChevronRight, CheckCircle, XCircle, AlertCircle, Database, Code, Loader2 } from "lucide-react"
import type { OptimizationRun } from "@/lib/types"
import CodeBlock from "@/components/code-block"

interface OptimizationLogProps {
  run: OptimizationRun
  collapsed?: boolean
}

export default function OptimizationLog({ run, collapsed = false }: OptimizationLogProps) {
  const [isExpanded, setIsExpanded] = useState(!collapsed)

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date)
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "generation_started":
        return <Loader2 className="h-4 w-4 text-blue-400" />
      case "rag_retrieved":
        return <Database className="h-4 w-4 text-purple-400" />
      case "generation_attempt":
        return <Code className="h-4 w-4 text-yellow-400" />
      case "optimization_success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "ran_out_of_attempts":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getEventTitle = (event: any) => {
    switch (event.type) {
      case "generation_started":
        return "Generation started"
      case "rag_retrieved":
        return `RAG retrieved ${event.data.code_samples.length} code samples`
      case "generation_attempt":
        return event.data.finished
          ? "Generation successful"
          : `Generation attempt failed: ${event.data.differs_on_input}`
      case "optimization_success":
        return "Optimization completed successfully"
      case "ran_out_of_attempts":
        return "Ran out of optimization attempts"
      default:
        return "Unknown event"
    }
  }

  return (
    <Card className="bg-[#2b2d30] border-[#323438] overflow-hidden">
      <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center">
          {run.status === "running" && <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-400" />}
          {run.status === "success" && <CheckCircle className="mr-2 h-4 w-4 text-green-500" />}
          {run.status === "failed" && <XCircle className="mr-2 h-4 w-4 text-red-500" />}
          <span className="font-medium mr-3">Run ID: {run.id}</span>
          <span className="text-sm text-gray-400">{formatTime(run.timestamp)}</span>
        </div>

        <Button variant="ghost" size="sm" className="p-1">
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      {isExpanded && (
        <div className="border-t border-[#323438]">
          <div className="p-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Original Code</h4>
              <CodeBlock code={run.originalCode} language="python" />
            </div>

            {run.optimizedCode && (
              <div>
                <h4 className="text-sm font-medium text-green-400 mb-2">Optimized Code</h4>
                <CodeBlock code={run.optimizedCode} language="python" />
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Optimization Log</h4>
              <div className="bg-[#1e1f22] rounded-md border border-[#323438] p-2 max-h-[300px] overflow-y-auto">
                <div className="space-y-2">
                  {run.events.map((event, index) => (
                    <div key={index} className="flex items-start p-2 text-sm border-b border-[#323438] last:border-0">
                      <div className="mr-2 mt-0.5">{getEventIcon(event.type)}</div>
                      <div className="flex-1">
                        <div className="font-medium">{getEventTitle(event)}</div>

                        {event.type === "rag_retrieved" && (
                          <Accordion type="single" collapsible className="mt-2">
                            <AccordionItem value="code-samples" className="border-[#323438]">
                              <AccordionTrigger className="py-2 text-xs text-gray-400">
                                View code samples
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2">
                                  {event.data.code_samples.map((sample: string, i: number) => (
                                    <CodeBlock key={i} code={sample} language="python" />
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        )}

                        {event.type === "generation_attempt" && !event.data.finished && (
                          <div className="mt-2 text-xs text-red-400">
                            Failed on input: {event.data.differs_on_input}
                          </div>
                        )}

                        {event.type === "generation_attempt" && (
                          <Accordion type="single" collapsible className="mt-2">
                            <AccordionItem value="generated-code" className="border-[#323438]">
                              <AccordionTrigger className="py-2 text-xs text-gray-400">
                                View generated code
                              </AccordionTrigger>
                              <AccordionContent>
                                <CodeBlock code={event.data.generated_code} language="python" />
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
