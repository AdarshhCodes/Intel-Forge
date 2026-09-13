import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  Network,
  FileSearch,
  ShieldAlert,
  ArrowRight,
  Inbox,
  Users,
  Search,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useInvestigationStore } from '../stores';
import { investigationService, alertService, evidenceService } from '../services';

export const CommandCentrePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentCase, selectEntity, selectAlert, runAiQuery } = useInvestigationStore();

  const entities = investigationService.getEntities(currentCase.id);
  const alerts = alertService.getAlerts();
  const evidenceList = evidenceService.getEvidence();

  const keySuspects = entities
    .filter((e) => e.type === 'PERSON')
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 4);

  const pendingReviewCount = evidenceList.filter(
    (e) => e.verificationStatus !== 'HUMAN_VERIFIED' && e.verificationStatus !== 'REJECTED'
  ).length;

  const topAlerts = alerts.slice(0, 3);

  const sampleQuestions = [
    'Show money transfers between Vikram Malhotra and Rohan Verma',
    'Which burner phone was in contact with Rajesh Kumar before the robbery?',
    'List all CCTV sightings near the Rohini Toll Plaza',
  ];

  const handleAskQuestion = (question: string) => {
    runAiQuery(question);
    navigate('/ai');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-forge-panel border border-forge-border p-5 rounded-lg shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded bg-forge-cyan/15 text-forge-cyan border border-forge-cyan/30">
              <LayoutDashboard className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white font-mono tracking-wide">
              INVESTIGATION COMMAND CENTRE
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-forge-cyan/20 text-forge-cyan font-mono font-semibold">
              LIVE CONSOLE
            </span>
          </div>
          <p className="text-xs text-forge-text-secondary mt-1 max-w-2xl">
            {currentCase.name} · SIH26189 AI-Powered Criminal Network Analysis Platform
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => navigate('/inbox')}
            className="flex items-center space-x-1.5 px-4 py-2 rounded bg-forge-cyan hover:bg-forge-cyanLight text-black text-xs font-bold transition shadow-sm"
          >
            <Inbox className="w-4 h-4" />
            <span>+ Evidence Inbox</span>
          </button>
          <button
            onClick={() => navigate('/graph')}
            className="flex items-center space-x-1.5 px-3 py-2 rounded bg-forge-card hover:bg-forge-cardHover border border-forge-border text-white text-xs font-semibold transition"
          >
            <Network className="w-4 h-4 text-forge-cyan" />
            <span>Open Graph</span>
          </button>
        </div>
      </div>

      {/* 4 Clean Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Suspects */}
        <div
          onClick={() => navigate('/graph')}
          className="p-4 rounded-lg bg-forge-panel border border-forge-border hover:border-forge-cyan/50 cursor-pointer transition shadow-sm group"
        >
          <div className="flex items-center justify-between text-xs text-forge-text-muted font-mono mb-1">
            <span>NETWORK ENTITIES</span>
            <Users className="w-4 h-4 text-forge-cyan group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{entities.length}</div>
          <div className="text-[11px] text-forge-cyan mt-1 flex items-center space-x-1">
            <span>Explore in Network Graph</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Metric 2: Evidence Exhibits */}
        <div
          onClick={() => navigate('/evidence')}
          className="p-4 rounded-lg bg-forge-panel border border-forge-border hover:border-forge-cyan/50 cursor-pointer transition shadow-sm group"
        >
          <div className="flex items-center justify-between text-xs text-forge-text-muted font-mono mb-1">
            <span>EVIDENCE EXHIBITS</span>
            <FileSearch className="w-4 h-4 text-forge-cyan group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{evidenceList.length}</div>
          <div className="text-[11px] text-forge-text-secondary mt-1 flex items-center space-x-1">
            <span>Browse Vault</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Metric 3: HITL Review Gate */}
        <div
          onClick={() => navigate('/review-gate')}
          className="p-4 rounded-lg bg-forge-panel border border-forge-border hover:border-forge-amber/50 cursor-pointer transition shadow-sm group"
        >
          <div className="flex items-center justify-between text-xs text-forge-text-muted font-mono mb-1">
            <span>HITL REVIEW QUEUE</span>
            <ShieldAlert className="w-4 h-4 text-forge-amber group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-forge-amber font-mono">{pendingReviewCount} Pending</div>
          <div className="text-[11px] text-forge-amber mt-1 flex items-center space-x-1">
            <span>Officer Verification Gate</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Metric 4: Risk Alerts */}
        <div
          onClick={() => navigate('/alerts')}
          className="p-4 rounded-lg bg-forge-panel border border-forge-border hover:border-forge-rose/50 cursor-pointer transition shadow-sm group"
        >
          <div className="flex items-center justify-between text-xs text-forge-text-muted font-mono mb-1">
            <span>PROACTIVE RISK ALERTS</span>
            <AlertTriangle className="w-4 h-4 text-forge-rose group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-forge-rose font-mono">{alerts.length} Flagged</div>
          <div className="text-[11px] text-forge-rose mt-1 flex items-center space-x-1">
            <span>Review Red Flags</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: Key Suspects & Primary Targets */}
        <div className="bg-forge-panel border border-forge-border rounded-lg p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-forge-border pb-3">
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center space-x-2">
              <Users className="w-4 h-4 text-forge-cyan" />
              <span>Primary Suspects & Persons of Interest</span>
            </h2>
            <button
              onClick={() => navigate('/graph')}
              className="text-[11px] font-mono text-forge-cyan hover:underline flex items-center space-x-1"
            >
              <span>View All on Graph</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {keySuspects.map((suspect) => (
              <div
                key={suspect.id}
                onClick={() => {
                  selectEntity(suspect);
                  navigate('/graph');
                }}
                className="p-3 rounded bg-forge-card hover:bg-forge-cardHover border border-forge-border cursor-pointer transition flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-forge-panel border border-forge-cyan/40 flex items-center justify-center font-mono font-bold text-forge-cyan text-xs">
                    {suspect.name
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{suspect.name}</div>
                    <div className="text-[10px] text-forge-text-muted font-mono">
                      ID: {suspect.id} · {suspect.role || 'Key Actor'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      suspect.riskScore >= 80
                        ? 'bg-forge-rose/20 text-forge-rose border border-forge-rose/30'
                        : 'bg-forge-amber/20 text-forge-amber border border-forge-amber/30'
                    }`}
                  >
                    Risk: {suspect.riskScore}/100
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-forge-text-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Active Red Flag Alerts */}
        <div className="bg-forge-panel border border-forge-border rounded-lg p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-forge-border pb-3">
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-forge-rose" />
              <span>Proactive Risk Alerts (Red Flags)</span>
            </h2>
            <button
              onClick={() => navigate('/alerts')}
              className="text-[11px] font-mono text-forge-rose hover:underline flex items-center space-x-1"
            >
              <span>View All Alerts</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {topAlerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => {
                  selectAlert(alert);
                  navigate('/alerts');
                }}
                className="p-3 rounded bg-forge-card hover:bg-forge-cardHover border border-forge-border cursor-pointer transition space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{alert.title}</span>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-forge-rose/20 text-forge-rose'
                        : 'bg-forge-amber/20 text-forge-amber'
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
                <p className="text-[11px] text-forge-text-muted line-clamp-2">{alert.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom: Natural Language Case Questions */}
      <div className="bg-forge-panel border border-forge-border rounded-lg p-5 space-y-3 shadow-sm">
        <div className="flex items-center space-x-2 text-white font-mono text-xs font-bold uppercase tracking-wider border-b border-forge-border pb-2">
          <Sparkles className="w-4 h-4 text-forge-cyan" />
          <span>Ask Intel-Forge AI in Plain English (Junior-Friendly Queries)</span>
        </div>
        <p className="text-xs text-forge-text-secondary">
          Click any investigation question below to immediately run an evidence-grounded search:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleAskQuestion(q)}
              className="p-3 rounded bg-forge-card hover:bg-forge-cardHover border border-forge-border hover:border-forge-cyan/50 text-left transition group flex items-start justify-between"
            >
              <div className="flex items-start space-x-2">
                <Search className="w-3.5 h-3.5 text-forge-cyan shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs text-forge-text-primary group-hover:text-white transition">
                  {q}
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-forge-text-muted group-hover:text-forge-cyan shrink-0 ml-1 mt-0.5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
