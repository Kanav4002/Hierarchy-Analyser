import { useState } from 'react'

function TreeNode({ name, children, level = 0 }) {
  const hasChildren = children && Object.keys(children).length > 0

  return (
    <div style={{ paddingLeft: `${level * 20}px` }}>
      <div className="flex items-center gap-2 py-1.5">
        <div className={`w-2.5 h-2.5 rounded-full ${hasChildren ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
        <span className="font-semibold text-gray-800 text-sm">{name}</span>
        {!hasChildren && <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">leaf</span>}
      </div>
      {hasChildren && (
        <div className="border-l-2 border-gray-200 ml-1.5">
          {Object.entries(children).map(([child, grandchildren]) => (
            <TreeNode key={child} name={child} children={grandchildren} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function HierarchyCard({ hierarchy, index }) {
  const { root, tree, depth, has_cycle } = hierarchy

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {index + 1}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Component {index + 1}</h3>
              <p className="text-xs text-gray-500">Root: <span className="font-semibold text-gray-700">{root}</span></p>
            </div>
          </div>
          {has_cycle ? (
            <span className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-bold uppercase tracking-wider">
              Cycle
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-xs font-bold">
                Depth: {depth}
              </span>
              <span className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-full text-xs font-bold">
                {Object.keys(tree[root] || {}).length} children
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-5">
        {has_cycle ? (
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 text-center border border-red-100">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p className="text-red-700 font-bold">Circular Dependency Detected</p>
            <p className="text-red-500 text-sm mt-1">This component forms a cycle and cannot be represented as a tree</p>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-4 border border-gray-100">
            <TreeNode name={root} children={tree[root]} />
          </div>
        )}
      </div>
    </div>
  )
}

function App() {
  const [input, setInput] = useState('')
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const dataArray = input
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)

      if (dataArray.length === 0) {
        throw new Error('Please enter at least one edge')
      }

      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/bfhl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: dataArray }),
      })

      if (!res.ok) throw new Error('API request failed')

      const data = await res.json()
      setResponse(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 border border-blue-100">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Hierarchy Analyzer
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            Graph Structure <span className="text-blue-600">Analyzer</span>
          </h1>
          <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
            Visualize hierarchical relationships, detect cycles, and analyze tree structures from node connections
          </p>
        </header>

        <form onSubmit={handleSubmit} className="mb-10">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <label className="text-sm font-semibold text-gray-700">
                Input Edges
              </label>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={"A->B\nA->C\nB->D\nX->Y\nY->Z\nZ->X"}
              className="w-full h-40 sm:h-48 p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm bg-gray-50 placeholder-gray-400"
            />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
              <p className="text-xs text-gray-400">{"Format: X->Y (single uppercase letters A-Z)"}</p>
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Analyze Graph
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-8 flex items-center gap-3 shadow-sm">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {response && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="font-bold text-gray-900">User Information</h2>
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-[10px] text-blue-500 uppercase tracking-widest font-bold mb-1">User ID</p>
                    <p className="font-bold text-gray-900 text-sm">{response.user_id}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                    <p className="text-[10px] text-purple-500 uppercase tracking-widest font-bold mb-1">Email</p>
                    <p className="font-bold text-gray-900 text-sm break-all">{response.email_id}</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100 sm:col-span-2 lg:col-span-1">
                    <p className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold mb-1">Roll Number</p>
                    <p className="font-bold text-gray-900 text-sm">{response.college_roll_number}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h2 className="font-bold text-gray-900">Analysis Summary</h2>
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl text-white shadow-lg shadow-blue-500/25">
                    <div className="text-3xl sm:text-4xl font-bold mb-1">{response.summary.total_trees}</div>
                    <div className="text-xs sm:text-sm text-blue-100 font-medium">Trees</div>
                  </div>
                  <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl text-white shadow-lg shadow-red-500/25">
                    <div className="text-3xl sm:text-4xl font-bold mb-1">{response.summary.total_cycles}</div>
                    <div className="text-xs sm:text-sm text-red-100 font-medium">Cycles</div>
                  </div>
                  <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl text-white shadow-lg shadow-emerald-500/25">
                    <div className="text-3xl sm:text-4xl font-bold mb-1">{response.summary.largest_tree_root}</div>
                    <div className="text-xs sm:text-sm text-emerald-100 font-medium">Largest Root</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Connected Components</h2>
              </div>
              <div className="grid gap-4 sm:gap-5">
                {response.hierarchies.map((h, i) => (
                  <HierarchyCard key={i} hierarchy={h} index={i} />
                ))}
              </div>
            </div>

            {response.invalid_entries.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="font-bold text-gray-900">Invalid Entries</h2>
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-bold">{response.invalid_entries.length}</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap gap-2">
                    {response.invalid_entries.map((entry, i) => (
                      <span key={i} className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold">
                        {entry || '(empty)'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {response.duplicate_edges.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h2 className="font-bold text-gray-900">Duplicate Edges</h2>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full text-xs font-bold">{response.duplicate_edges.length}</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap gap-2">
                    {response.duplicate_edges.map((edge, i) => (
                      <span key={i} className="px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg text-xs font-semibold font-mono">
                        {edge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
