import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  Terminal as TerminalIcon, 
  ShieldCheck, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  Lock, 
  Unlock,
  ChevronRight,
  Database,
  Wallet
} from "lucide-react";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from "./lib/utils";

// Mock data for the ERC-8004 Agent identities
const AGENTS = [
  {
    id: "oracle-v9",
    name: "CryptoOracle-v9",
    address: "0x8F9B932fFf0110EEAc81c109A12BEb151A6Cb2DF",
    reputation: 98,
    status: "Active Validator",
    cost: "0.1 USDC"
  },
  {
    id: "sentiment-v2",
    name: "SentimentMatrix-v2",
    address: "0x3A2B112fCe0110EFAc41c109A12BEb151A6Cb7AB",
    reputation: 91,
    status: "Active Validator",
    cost: "0.05 USDC"
  },
  {
    id: "arbitrage-bot",
    name: "ArbScanner_Pro",
    address: "0x111C932fFf0110EEAc81c109A12BEb151A6Cb999",
    reputation: 84,
    status: "Active Validator",
    cost: "0.25 USDC"
  }
];

export default function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(31.42);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]);

  const [topic, setTopic] = useState("AVAX");
  const [logs, setLogs] = useState<{ id: string; text: React.ReactNode; type: "info" | "success" | "warn" | "error" | "action" }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [payload, setPayload] = useState<{ topic: string; analysis: string; timestamp: string, settledVia: string } | null>(null);
  const [txHistory, setTxHistory] = useState<{ id: string; amount: number; time: string; agent: string }[]>([]);
  const [isAgentLoading, setIsAgentLoading] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (text: React.ReactNode, type: "info" | "success" | "warn" | "error" | "action" = "info") => {
    setLogs((prev) => [...prev, { id: Math.random().toString(36).substring(7), text, type }]);
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const connectWallet = async () => {
    setIsConnecting(true);
    await delay(1000);
    setWalletAddress("0x71C83a45a19B2E3d4F7A6C9B8c7D6E5F4A3B2A2B");
    setIsConnecting(false);
  };

  const handleAgentChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setIsAgentLoading(true);
    await delay(600);
    setSelectedAgent(AGENTS.find(a => a.id === val)!);
    setIsAgentLoading(false);
  };

  const executeAutonomousFlow = async () => {
    if (!walletAddress) {
      addLog("❌ Error: Web3 Wallet not connected. Please connect wallet first.", "error");
      return;
    }
    if (!topic.trim()) return;
    
    setIsLoading(true);
    setPayload(null);
    setLogs([]); // Clear logs on new run

    addLog("Initializing Autonomous Agent Execution sequence...", "info");
    await delay(800);

    // Step 1: ERC-8004 Verification
    addLog(`🔍 Querying ERC-8004 registry for agent validity [Addr: ${selectedAgent.address}]...`, "action");
    await delay(1200);
    addLog(`✅ Identity Verified. Reputation score: ${selectedAgent.reputation}/100`, "success");
    await delay(1000);

    // Step 2: Initial Fetch (No TX Hash)
    addLog(`Initiating unauthenticated request to /api/v1/agent/analytics for topic: ${topic}...`, "action");
    addLog("Sending payload: { txHash: null }", "info");
    
    try {
      const initialResponse = await fetch("/api/v1/agent/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, agentId: selectedAgent.id }),
      });

      // Step 3: Catch HTTP 402
      if (initialResponse.status === 402) {
        const errorData = await initialResponse.json();
        addLog(`⚠️ HTTP 402 Caught! Protocol: ${errorData.protocol}. Payment required: ${errorData.cost}`, "warn");
        await delay(1500);

        // Step 4: Simulate x402 payment
        addLog("💳 Simulating autonomous x402 payment settlement on Avalanche Fuji C-Chain...", "action");
        await delay(2000);
        
        // Generate mock tx hash
        const mockHash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
        addLog(
          <span>⚓ Payment Confirmed! TX Hash: <a href={`https://testnet.snowtrace.io/tx/${mockHash}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-300">{mockHash.substring(0, 10)}...{mockHash.substring(60)}</a></span>,
          "success"
        );
        await delay(1000);

        // Step 5: Resubmit with TX Hash
        addLog(`Resubmitting request with authorized txHash to unlock agent payload...`, "action");
        const authorizedResponse = await fetch("/api/v1/agent/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, txHash: mockHash, agentId: selectedAgent.id }),
        });

        if (authorizedResponse.ok) {
          const successData = await authorizedResponse.json();
          const costValue = parseFloat(selectedAgent.cost.split(' ')[0]);
          addLog("🔓 Payload unlocked! Fetching and decrypting data...", "success");
          await delay(800);
          setPayload(successData.data);
          setBalance(prev => Math.max(0, prev - costValue));
          setTxHistory(prev => {
            const newTx = {
              id: Math.random().toString(36).substring(7),
              amount: parseFloat(selectedAgent.cost.split(' ')[0]),
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              agent: selectedAgent.name
            };
            const next = [...prev, newTx];
            if (next.length > 5) return next.slice(next.length - 5);
            return next;
          });
        } else {
          addLog("❌ Failed to unlock payload with provided transaction.", "error");
        }

      } else {
        addLog(`Unexpected response status: ${initialResponse.status}`, "error");
      }
    } catch (err) {
      addLog("Network error occurred while connecting to the smart agent.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#0A0A0B] bg-grid-white text-slate-200 min-h-screen flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="h-20 border-b border-white/5 bg-gradient-to-r from-[#0A0A0B] to-[#141416] flex items-center justify-between px-4 lg:px-8 shrink-0 w-full z-10">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center">
              AgentNexus <span className="text-[#E84142] ml-2">🌐</span>
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] bg-[#E84142]/10 text-[#E84142] border border-[#E84142]/20 font-mono tracking-widest hidden sm:inline-block">
              AVALANCHE FUJI
            </span>
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-1 hidden sm:block">
            Autonomous M2M Payments • x402 Protocol • ERC-8004 Registry
          </p>
        </div>
        <div className="flex gap-6 items-center">
          {walletAddress ? (
            <div className="flex gap-4 items-center tracking-tight">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest hidden lg:block">Balance</p>
                <p className="text-sm font-mono text-emerald-400 font-semibold">{balance.toFixed(2)} USDC</p>
              </div>
              <div className="hidden sm:block h-8 w-px bg-white/10 mx-1"></div>
              <div className="text-right hidden sm:block">
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Connected</p>
                <p className="text-sm font-mono text-indigo-400">{walletAddress.substring(0,6)}...{walletAddress.substring(walletAddress.length - 4)}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                 <Wallet className="w-5 h-5" />
              </div>
            </div>
          ) : (
            <button onClick={connectWallet} disabled={isConnecting} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-lg transition-all flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 lg:p-6 overflow-hidden w-full max-w-7xl mx-auto container relative z-10">
        
        {/* Left Column: Target Configuration */}
        <aside className="w-full lg:w-1/3 flex flex-col gap-4 overflow-y-auto pr-1">
          
          <div className="bg-[#111113] border border-white/5 rounded-xl p-6 flex flex-col gap-6 shrink-0 lg:h-full">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-2">Target Agent Service</label>
                <div className="flex items-center justify-between p-1 bg-white/5 rounded-lg border border-white/10 mb-2">
                  <select 
                    value={selectedAgent.id} 
                    onChange={handleAgentChange}
                    disabled={isLoading || isAgentLoading}
                    className="w-full bg-transparent p-2 text-sm font-semibold text-white focus:outline-none appearance-none cursor-pointer disabled:opacity-50"
                  >
                    {AGENTS.map(agent => (
                      <option key={agent.id} value={agent.id} className="bg-slate-900">{agent.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-between px-1">
                  <div className="flex flex-col">
                    {isAgentLoading ? (
                      <div className="h-4 w-32 bg-white/5 rounded animate-pulse mt-1"></div>
                    ) : (
                      <span className="text-[11px] font-mono text-slate-500">{selectedAgent.address.substring(0, 6)}...{selectedAgent.address.substring(38)}</span>
                    )}
                  </div>
                  <a href={`https://testnet.snowtrace.io/address/${selectedAgent.address}`} target="_blank" rel="noopener noreferrer" className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-1 rounded border border-emerald-500/20 flex items-center gap-1 transition-colors cursor-pointer">
                    <ShieldCheck className="w-3 h-3" /> VERIFIED
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Reputation Score</label>
                  {isAgentLoading ? (
                    <div className="mt-1 space-y-3">
                      <div className="h-8 w-16 bg-white/10 rounded animate-pulse"></div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                         <div className="bg-indigo-500/20 h-full w-[98%] animate-pulse"></div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-white tracking-tight">{selectedAgent.reputation}<span className="text-sm text-slate-500 font-normal">/100</span></div>
                      <div className="w-full bg-white/10 h-1 rounded-full mt-2">
                        <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${selectedAgent.reputation}%` }}></div>
                      </div>
                    </>
                  )}
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Service Cost</label>
                  {isAgentLoading ? (
                    <div className="mt-1 space-y-3">
                      <div className="h-8 w-24 bg-white/10 rounded animate-pulse"></div>
                      <div className="h-3 w-20 bg-white/5 rounded animate-pulse"></div>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-white tracking-tight leading-none flex items-baseline gap-1">
                        {selectedAgent.cost.split(' ')[0]}<span className="text-sm text-slate-500 font-normal">{selectedAgent.cost.split(' ')[1]}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2">Per Analytic Query</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Input Action */}
            <div className="space-y-4 pt-4 border-t border-white/5 mt-auto">
              <div>
                <label htmlFor="topic" className="text-[10px] text-slate-500 uppercase tracking-widest block mb-2">
                  Analytic Prompt Target
                </label>
                <input
                  id="topic"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isLoading}
                  placeholder="e.g. BTC, ETH..."
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50 transition-all font-mono"
                />
              </div>

              <button
                onClick={executeAutonomousFlow}
                disabled={isLoading || !topic.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold py-4 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    Executing...
                  </span>
                ) : (
                  <>
                    <Zap className="w-5 h-5 text-indigo-200 group-hover:scale-110 transition-transform" /> EXECUTE AGENTIC WORKFLOW
                  </>
                )}
              </button>
            </div>
          </div>
        </aside>

        {/* Right Column: Real-Time Pipeline Engine Logs */}
        <section className="flex-1 flex flex-col gap-4 overflow-hidden min-h-[500px]">
          <div className="flex-1 bg-black rounded-xl border border-white/5 flex flex-col overflow-hidden font-mono text-[13px] shadow-lg relative scanlines">
            <div className="bg-[#111113] px-4 py-2 border-b border-white/5 flex items-center justify-between shrink-0 relative z-30">
              <span className="text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span> Pipeline Runtime Console
              </span>
              <span className="text-[11px] text-slate-600">v0.4.2-stable</span>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto text-slate-400 space-y-3">
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-600 italic">
                  Waiting for execution signal...
                </div>
              ) : (
                logs.map((log) => (
                  <div 
                    key={log.id} 
                    className={cn(
                      "flex gap-3 leading-relaxed animate-fade-in opacity-0 [animation-fill-mode:forwards]",
                      log.type === "error" && "text-rose-400",
                      log.type === "warn" && "text-amber-500",
                      log.type === "success" && "text-emerald-400",
                      log.type === "info" && "text-white",
                      log.type === "action" && "text-indigo-400"
                    )}
                  >
                    <span className="text-slate-600 shrink-0 select-none">
                      [{new Date().toISOString().split('T')[1].substring(0,8)}]
                    </span>
                    <span>{log.text}</span>
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </div>

          {/* Bottom Section: Secured Payload Console */}
          <div className="h-48 lg:h-56 bg-[#111113] border border-white/5 rounded-xl p-5 flex flex-col gap-3 relative overflow-hidden shrink-0 shadow-lg">
            {/* Decryption grid overlay effect */}
            {isLoading && (
              <div className="absolute inset-0 bg-[#111113]/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-4 animate-fade-in">
                <Lock className="w-8 h-8 text-indigo-500 animate-pulse" />
                <span className="text-slate-500 font-mono text-sm tracking-widest uppercase">Encrypted Payload Awaiting x402 Settlement</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Secured AI Payload Output</h3>
              <span className="text-[10px] text-indigo-400 flex items-center gap-1 font-mono tracking-wider">
                <Unlock className="w-3 h-3" /> {payload ? "DECRYPTED" : "END-TO-END ENCRYPTED"}
              </span>
            </div>

            <div className={cn(
              "flex-1 flex gap-4 transition-all",
              !payload && !isLoading && "bg-black/40 rounded-lg p-4 font-mono text-sm border-dashed border border-white/10 text-slate-600 items-center justify-center",
              isLoading && "bg-[#111113] rounded-lg border border-white/5 overflow-hidden"
            )}>
              {isLoading ? (
                <div className="flex-1 flex flex-col gap-4 w-full h-full p-4 justify-center">
                   <div className="w-1/4 h-4 bg-white/5 rounded animate-pulse"></div>
                   <div className="w-full h-4 bg-white/5 rounded animate-pulse"></div>
                   <div className="w-5/6 h-4 bg-white/5 rounded animate-pulse"></div>
                   <div className="w-2/3 h-4 bg-white/5 rounded animate-pulse"></div>
                   <div className="w-1/2 h-4 bg-white/5 rounded animate-pulse mt-2"></div>
                </div>
              ) : payload ? (
                <>
                  <div className="flex-1 bg-black/40 rounded-lg p-4 font-mono text-sm text-indigo-100/80 border border-indigo-500/10 overflow-y-auto w-2/3">
                    <div className="animate-fade-in flex flex-col h-full justify-between">
                      <div>
                         <span className="text-emerald-400">{"{"}</span>
                         <br/>
                         &nbsp;&nbsp;<span className="text-indigo-300">"target"</span>: <span className="text-emerald-300">"{payload.topic}"</span>,
                         <br/>
                         &nbsp;&nbsp;<span className="text-indigo-300">"analysis"</span>: <span className="text-slate-300">"{payload.analysis}"</span>,
                         <br/>
                         &nbsp;&nbsp;<span className="text-indigo-300">"settlement"</span>: <span className="text-amber-400">"{payload.settledVia}"</span>,
                         <br/>
                         &nbsp;&nbsp;<span className="text-indigo-300">"timestamp"</span>: <span className="text-emerald-400">{new Date(payload.timestamp).getTime()}</span>
                         <br/>
                         <span className="text-emerald-400">{"}"}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Transaction History Chart */}
                  <div className="w-1/3 bg-black/40 rounded-lg p-3 border border-indigo-500/10 flex flex-col pt-1">
                    <h4 className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2 flex items-center justify-between">
                      <span>Tx History</span>
                      <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded">USDC</span>
                    </h4>
                    <div className="flex-1 min-h-0 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={txHistory}>
                          <defs>
                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#111113', borderColor: '#1e1e24', fontSize: '10px', borderRadius: '6px' }}
                            itemStyle={{ color: '#818cf8', padding: 0 }}
                            labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                          />
                          <Area type="monotone" dataKey="amount" stroke="#818cf8" fillOpacity={1} fill="url(#colorAmount)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-xs">
                  <Database className="w-5 h-5 opacity-40 mb-1" />
                  <span className="tracking-widest uppercase text-[10px] opacity-60">No payload loaded</span>
                </div>
              )}
            </div>
          </div>
        </section>

      </main>
      
      {/* Footer */}
      <footer className="h-12 bg-[#0A0A0B] border-t border-white/5 px-4 lg:px-8 flex items-center justify-between text-[11px] text-slate-600 shrink-0 w-full z-10 relative">
        <div className="flex gap-4 sm:gap-6 font-mono">
          <span className="hidden sm:inline">Protocol: x402-v1</span>
          <span>Network: Fuji C-Chain</span>
        </div>
        <div>
          Built for Avalanche Hackathon 2026 &copy; AgentNexus System
        </div>
      </footer>
    </div>
  );
}

