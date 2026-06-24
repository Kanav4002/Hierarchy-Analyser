import { useState } from 'react'

function TreeNode({ name, children, level = 0 }) {
  const hasChildren = children && Object.keys(children).length > 0

  return (
    <div style={{ paddingLeft: `${level * 24}px` }}>
      <div className="flex items-center gap-2 py-1">
        <div className={`w-2 h-2 rounded-full ${hasChildren ? 'bg-blue-500' : 'bg-green-500'}`}></div>
        <span className="font-medium text-gray-800">{name}</span>
        {!hasChildren && <span className="text-xs text-gray-400">leaf</span>}
      </div>
      {hasChildren && (
        <div className="border-l-2 border-gray-200 ml-1">
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="px-4 sm:px-5 py-3 sm:py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm">
              {index + 1}
            </span>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Tree {index + 1}</h3>
              <p className="text-xs sm:text-sm text-gray-500">Root: <span className="font-medium text-gray-700">{root}</span></p>
            </div>
          </div>
          {has_cycle ? (
            <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-red-100 text-red-700 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wide">
              Cycle
            </span>
          ) : (
            <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-green-100 text-green-700 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wide">
              Depth: {depth}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {has_cycle ? (
          <div className="bg-red-50 rounded-lg p-3 sm:p-4 text-center">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-red-600 font-medium text-sm sm:text-base">Cycle detected in this group</p>
            <p className="text-red-500 text-xs sm:text-sm mt-1">No tree structure available</p>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 overflow-x-auto">
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

      const res = await fetch('/bfhl', {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <header className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Hierarchy Analyzer</h1>
          <p className="text-gray-500 text-base sm:text-lg">Analyze hierarchical relationships from node connections</p>
        </header>

        <form onSubmit={handleSubmit} className="mb-8 sm:mb-10">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Node Relationships (one edge per line)
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={"A->B\nA->C\nB->D\nX->Y\nY->Z\nZ->X"}
              className="w-full h-36 sm:h-44 p-3 sm:p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
            />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
              <p className="text-xs sm:text-sm text-gray-400">{"Format: X->Y where X, Y are uppercase letters A-Z"}</p>
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
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
                  'Analyze'
                )}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 sm:mb-8 flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm sm:text-base">{error}</span>
          </div>
        )}

        {response && (
          <div className="space-y-6 sm:space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800 text-sm sm:text-base">User Information</h2>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">User ID</p>
                    <p className="font-medium text-gray-800 text-sm sm:text-base break-all">{response.user_id}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Email</p>
                    <p className="font-medium text-gray-800 text-sm sm:text-base break-all">{response.email_id}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4 sm:col-span-2 md:col-span-1">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Roll Number</p>
                    <p className="font-medium text-gray-800 text-sm sm:text-base">{response.college_roll_number}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800 text-sm sm:text-base">Summary</h2>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-3 gap-2 sm:gap-6">
                  <div className="text-center p-3 sm:p-6 bg-blue-50 rounded-xl">
                    <div className="text-2xl sm:text-4xl font-bold text-blue-600 mb-1">{response.summary.total_trees}</div>
                    <div className="text-xs sm:text-sm text-gray-500 font-medium">Trees</div>
                  </div>
                  <div className="text-center p-3 sm:p-6 bg-red-50 rounded-xl">
                    <div className="text-2xl sm:text-4xl font-bold text-red-600 mb-1">{response.summary.total_cycles}</div>
                    <div className="text-xs sm:text-sm text-gray-500 font-medium">Cycles</div>
                  </div>
                  <div className="text-center p-3 sm:p-6 bg-green-50 rounded-xl">
                    <div className="text-2xl sm:text-4xl font-bold text-green-600 mb-1">{response.summary.largest_tree_root}</div>
                    <div className="text-xs sm:text-sm text-gray-500 font-medium">Largest Root</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Hierarchies</h2>
              <div className="grid gap-4 sm:gap-6">
                {response.hierarchies.map((h, i) => (
                  <HierarchyCard key={i} hierarchy={h} index={i} />
                ))}
              </div>
            </div>

            {response.invalid_entries.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-800 text-sm sm:text-base">Invalid Entries</h2>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="flex flex-wrap gap-2">
                    {response.invalid_entries.map((entry, i) => (
                      <span key={i} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-100 text-red-700 rounded-lg text-xs sm:text-sm font-medium">
                        {entry || '(empty)'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {response.duplicate_edges.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-800 text-sm sm:text-base">Duplicate Edges</h2>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="flex flex-wrap gap-2">
                    {response.duplicate_edges.map((edge, i) => (
                      <span key={i} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-yellow-100 text-yellow-700 rounded-lg text-xs sm:text-sm font-medium">
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
