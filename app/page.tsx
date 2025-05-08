"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle, Code, Zap } from "lucide-react"
import OptimizationLog from "@/components/optimization-log"
import Header from "@/components/header"
import { optimizeFunction } from "@/lib/api"
import type { OptimizationRun } from "@/lib/types"
import Editor from 'react-simple-code-editor'
import Prism from 'prismjs'
import 'prismjs/components/prism-python'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import "prismjs/themes/prism-tomorrow.css"

export default function Home() {
  const [pythonCode, setPythonCode] = useState<string>(
    `def fibonacci(n):\n    if n <= 0:\n        return 0\n    elif n == 1:\n        return 1\n    else:\n        return fibonacci(n-1) + fibonacci(n-2)\n\n# This function is inefficient for large values of n\n# due to repeated calculations`,
  )
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false)
  const [currentRun, setCurrentRun] = useState<OptimizationRun | null>(null)
  const [pastRuns, setPastRuns] = useState<OptimizationRun[]>([])

  const handleOptimize = async () => {
    if (!pythonCode.trim() || isOptimizing) return

    setIsOptimizing(true)
    const runId = `run-${Date.now()}`

    const newRun: OptimizationRun = {
      id: runId,
      originalCode: pythonCode,
      events: [],
      optimizedCode: null,
      status: "running",
      timestamp: new Date(),
    }

    setCurrentRun(newRun)

    let addedToHistory = false

    try {
      await optimizeFunction(pythonCode, (event) => {
        setCurrentRun((prev) => {
          if (!prev) return null

          const updatedRun = {
            ...prev,
            events: [...prev.events, event],
          }

          if (
            !addedToHistory &&
            (event.type === "optimization_success" || event.type === "generated_function_rejected" || event.type === "error")
          ) {
            addedToHistory = true
            if (event.type === "optimization_success") {
              updatedRun.optimizedCode = event.data.generated_code
              updatedRun.status = "success"
            } else {
              updatedRun.status = "failed"
            }
            setPastRuns((oldRuns) => [updatedRun, ...oldRuns])
            return null
          }

          return updatedRun
        })
      })
    } catch (error) {
      console.error("Optimization error:", error)
      setCurrentRun((prev) => {
        if (!prev) return null
        return {
          ...prev,
          status: "failed",
          events: [
            ...prev.events,
            {
              type: "error",
              data: { message: "An error occurred during optimization" },
            },
          ],
        }
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1e1f22] text-white flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">PyBebra optimizes your awful Python code</h2>
            <p className="mb-6 text-gray-300">
              Paste your Python function below and click "Optimize" to improve its performance. Be aware, this page is static and your generation history lives in your browser. If you refresh the page, your history will be lost. If you encounter any issues, please try a simpler request, try again later, or contact us on Slack.
            </p>

            <Card className="bg-[#2b2d30] border-[#323438] p-4">
              <Editor
                value={pythonCode}
                onValueChange={setPythonCode}
                highlight={code => Prism.highlight(code, Prism.languages.python, 'python')}
                padding={16}
                textareaId="codeArea"
                textareaClassName="min-h-[200px] font-mono bg-[#1e1f22] border border-[#323438] text-gray-200 w-full rounded-md focus:outline-none"
                style={{
                  fontFamily: 'monospace',
                  fontSize: 14,
                  background: '#1e1f22',
                  color: '#d4d4d4',
                  borderRadius: '0.375rem',
                  minHeight: 200,
                  outline: 'none',
                  ...vscDarkPlus['pre'],
                }}
                placeholder="Paste your Python function here..."
              />
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleOptimize}
                  disabled={isOptimizing || !pythonCode.trim()}
                  className="bg-[#4a86e8] hover:bg-[#3b77d9] text-white"
                >
                  {isOptimizing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Optimize
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </section>

          {currentRun && (
            <section>
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Code className="mr-2 h-5 w-5" />
                Current Optimization
                {currentRun.status === "running" && <Loader2 className="ml-2 h-4 w-4 animate-spin text-[#4a86e8]" />}
                {currentRun.status === "success" && <CheckCircle className="ml-2 h-4 w-4 text-green-500" />}
                {currentRun.status === "failed" && <XCircle className="ml-2 h-4 w-4 text-red-500" />}
              </h3>

              <OptimizationLog run={currentRun} />
            </section>
          )}

          {pastRuns.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold mb-4">Optimization History</h3>
              <div className="space-y-6">
                {pastRuns.map((run) => (
                  <OptimizationLog key={run.id} run={run} collapsed />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}
