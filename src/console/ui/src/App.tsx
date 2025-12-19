import { useState, useEffect, useRef } from 'react';
import { Shield, Activity, XCircle, Terminal, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LogEvent {
  type: 'log' | 'stats' | 'approval_request';
  payload: any;
  timestamp: number;
}

function App() {
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [stats, setStats] = useState({ total: 0, blocked: 0, avgLatency: 0 });
  const [connected, setConnected] = useState(false);
  const [view, setView] = useState<'feed' | 'policies' | 'tools'>('feed');
  const [config, setConfig] = useState<any>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.host}`);

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'log') {
        setLogs(prev => [...prev, data].slice(-100)); // Keep last 100 logs
      } else if (data.type === 'stats') {
        setStats(data.payload);
      } else if (data.type === 'config') {
        setConfig(data.payload);
      }
    };

    return () => ws.close();
  }, []);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
  //   const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
  //   const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
  //   setAutoScroll(isNearBottom);
  // };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800 bg-gray-900/50 backdrop-blur p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-8 px-2">
          <Shield className="w-8 h-8 text-emerald-500" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            MCP Shield
          </h1>
        </div>

        <nav className="space-y-1 flex-1">
          <NavItem icon={<Activity />} label="Live Feed" active={view === 'feed'} onClick={() => setView('feed')} />
          <NavItem icon={<Lock />} label="Policies" active={view === 'policies'} onClick={() => setView('policies')} />
          <NavItem icon={<Terminal />} label="Tools" active={view === 'tools'} onClick={() => setView('tools')} />
        </nav>

        <div className="mt-auto pt-4 border-t border-gray-800">
          <div className="flex items-center gap-2 px-2 text-sm text-gray-400">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {connected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-hidden flex flex-col">
        {view === 'feed' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <StatCard title="Total Requests" value={stats.total} icon={<Activity className="text-blue-400" />} />
              <StatCard title="Threats Blocked" value={stats.blocked} icon={<Shield className="text-red-400" />} />
              <StatCard title="Avg Latency" value={`${stats.avgLatency.toFixed(0)}ms`} icon={<Terminal className="text-purple-400" />} />
            </div>

            {/* Live Logs */}
            <div className="flex-1 bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                <h2 className="font-semibold flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-gray-400" />
                  Live Traffic
                </h2>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setAutoScroll(!autoScroll)}
                    className={`text-xs px-2 py-1 rounded border ${autoScroll ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-gray-700 text-gray-500'}`}
                  >
                    Auto-scroll: {autoScroll ? 'ON' : 'OFF'}
                  </button>
                  <span className="text-xs text-gray-500 font-mono">buffer: 100</span>
                </div>
              </div>

              <div
                className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-sm"
              >
                <AnimatePresence initial={false}>
                  {logs.map((log, i) => (
                    <motion.div
                      key={log.timestamp + i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-4 p-2 rounded hover:bg-gray-800/50 transition-colors"
                    >
                      <span className="text-gray-500 shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <LogContent payload={log.payload} />
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={logsEndRef} />
              </div>
            </div>
          </>
        )}

        {view === 'policies' && <PoliciesView config={config} />}
        {view === 'tools' && <ToolsView config={config} />}
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${active ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
        }`}>
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function PoliciesView({ config }: { config: any }) {
  if (!config) return <div className="text-gray-500">Loading configuration...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Policy Configuration</h2>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 text-emerald-400">Global Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <ConfigItem label="Default Effect" value={config.policy?.defaultEffect || 'deny'} />
          <ConfigItem label="PII Detection" value={config.detection?.pii?.enabled ? 'Enabled' : 'Disabled'} />
          <ConfigItem label="Injection Detection" value={config.detection?.injection?.enabled ? 'Enabled' : 'Disabled'} />
          <ConfigItem label="Neural Detection" value={config.detection?.neural?.enabled ? 'Enabled' : 'Disabled'} />
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-blue-400">Rules</h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-800/50 text-gray-400">
            <tr>
              <th className="p-4">Tools</th>
              <th className="p-4">Effect</th>
              <th className="p-4">Conditions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {config.policy?.rules?.map((rule: any, i: number) => (
              <tr key={i} className="hover:bg-gray-800/30">
                <td className="p-4 font-mono text-gray-300">
                  {rule.tools.map((t: string) => (
                    <span key={t} className="inline-block bg-gray-800 px-2 py-1 rounded mr-2 mb-1">{t}</span>
                  ))}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${rule.effect === 'allow' ? 'bg-emerald-500/20 text-emerald-400' :
                      rule.effect === 'deny' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                    }`}>
                    {rule.effect.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 text-gray-500">
                  {rule.conditions ? JSON.stringify(rule.conditions) : '-'}
                </td>
              </tr>
            ))}
            {(!config.policy?.rules || config.policy.rules.length === 0) && (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-500">No explicit rules defined</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ToolsView({ config }: { config: any }) {
  if (!config) return <div className="text-gray-500">Loading configuration...</div>;

  // Extract unique tools from rules
  const tools = new Set<string>();
  config.policy?.rules?.forEach((r: any) => r.tools.forEach((t: string) => tools.add(t)));
  const toolList = Array.from(tools).sort();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Configured Tools</h2>
      <p className="text-gray-400">Tools explicitly referenced in policy rules.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {toolList.map(tool => {
          // Find rule for this tool (simplified logic, takes first match)
          const rule = config.policy?.rules?.find((r: any) => r.tools.includes(tool));
          const effect = rule?.effect || config.policy?.defaultEffect || 'deny';

          return (
            <div key={tool} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
              <div className="font-mono text-sm text-gray-200">{tool}</div>
              <span className={`px-2 py-1 rounded text-xs font-bold ${effect === 'allow' ? 'bg-emerald-500/20 text-emerald-400' :
                  effect === 'deny' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                }`}>
                {effect.toUpperCase()}
              </span>
            </div>
          );
        })}
        {toolList.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-8">
            No tools explicitly configured in policies.
          </div>
        )}
      </div>
    </div>
  );
}

function ConfigItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center p-2 bg-gray-800/30 rounded">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="font-mono text-sm font-medium">{value}</span>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string | number, icon: any }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-xl backdrop-blur">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        {icon}
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

function LogContent({ payload }: { payload: any }) {
  if (payload.event === 'tool_call') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-blue-400">CALL</span>
        <span className="text-gray-300">{payload.tool}</span>
        <span className="text-gray-600">({JSON.stringify(payload.args).slice(0, 50)}...)</span>
      </div>
    );
  }
  if (payload.event === 'blocked') {
    return (
      <div className="flex items-center gap-2">
        <XCircle className="w-4 h-4 text-red-500" />
        <span className="text-red-400">BLOCKED</span>
        <span className="text-gray-300">{payload.tool}</span>
        <span className="text-gray-500">- {payload.reason}</span>
      </div>
    );
  }
  return <span className="text-gray-400">{JSON.stringify(payload)}</span>;
}

export default App;
