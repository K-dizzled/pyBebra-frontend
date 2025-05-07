import type { OptimizationEvent } from "./types"

// Mock function to simulate server-sent events
export async function optimizeFunction(code: string, onEvent: (event: OptimizationEvent) => void): Promise<void> {
  // Simulate network delay
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  // Send "generation started" event
  onEvent({
    type: "generation_started",
    data: { timestamp: new Date() },
  })

  await delay(1000)

  // Send "RAG retrieved" event with mock code samples
  const codeSamples = [
    `def fibonacci_memoization(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    memo[n] = fibonacci_memoization(n-1, memo) + fibonacci_memoization(n-2, memo)
    return memo[n]`,

    `def fibonacci_iterative(n):
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b`,

    `import functools

@functools.lru_cache(maxsize=None)
def fibonacci_cached(n):
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    return fibonacci_cached(n-1) + fibonacci_cached(n-2)`,
  ]

  onEvent({
    type: "rag_retrieved",
    data: { code_samples: codeSamples },
  })

  await delay(1500)

  // First failed attempt
  onEvent({
    type: "generation_attempt",
    data: {
      finished: false,
      generated_code: `def fibonacci_optimized(n):
    # Using memoization to avoid redundant calculations
    memo = {}
    
    def fib(n):
        if n in memo:
            return memo[n]
        if n <= 0:
            return 0
        elif n == 1:
            return 1
        memo[n] = fib(n-1) + fib(n-2)
        return memo[n]
    
    return fib(n)`,
      differs_on_input: "fibonacci_optimized(30) produces incorrect result",
    },
  })

  await delay(2000)

  // Second failed attempt
  onEvent({
    type: "generation_attempt",
    data: {
      finished: false,
      generated_code: `def fibonacci_optimized(n):
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    
    # Using dynamic programming with tabulation
    fib = [0] * (n + 1)
    fib[1] = 1
    
    for i in range(2, n + 1):
        fib[i] = fib[i-1] + fib[i-2]
    
    return fib[n]`,
      differs_on_input: "fibonacci_optimized(-5) should return 0",
    },
  })

  await delay(1800)

  // Successful attempt
  const optimizedCode = `def fibonacci_optimized(n):
    """
    Optimized fibonacci function using iterative approach.
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b`

  onEvent({
    type: "generation_attempt",
    data: {
      finished: true,
      generated_code: optimizedCode,
      differs_on_input: null,
    },
  })

  await delay(500)

  // Final success event
  onEvent({
    type: "optimization_success",
    data: {
      generated_code: optimizedCode,
      performance_improvement: "~99.9% faster for n > 30",
    },
  })
}
