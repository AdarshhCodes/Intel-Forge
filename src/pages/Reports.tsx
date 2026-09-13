import React, { useState } from 'react';
import {
  FileText,
  Clock,
  Printer,
  Download,
  AlertTriangle,
  Users,
  Network,
  RefreshCw,
} from 'lucide-react';
import { useInvestigationStore } from '../stores';
import { investigationService, evidenceService, alertService } from '../services';

export const Reports: React.FC = () => {
  const { currentCase, currentInvestigator, historyEvents, addHistoryEvent } =
    useInvestigationStore();

  const [activeTab, setActiveTab] = useState<'REPORT' | 'HISTORY'>('REPORT');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [reportGenerated, setReportGenerated] = useState(true);

  const entities = investigationService.getEntities(currentCase.id);
  const people = entities.filter((e) => e.type === 'PERSON');
  const evidenceList = evidenceService.getEvidence();
  const relationships = investigationService.getRelationships(currentCase.id);
  const alerts = alertService.getAlerts();

  const confirmedLinks = relationships.filter((r) => r.verificationStatus === 'HUMAN_VERIFIED');
  const suggestedLinks = relationships.filter((r) => r.verificationStatus === 'AI_SUGGESTED');

  const generationSteps = [
    'Gathering evidence records...',
    'Adding connections and people...',
    'Compiling risk alerts...',
    'Finishing report...',
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setGenerationStep(0);

    for (let i = 0; i < generationSteps.length; i++) {
      setGenerationStep(i);
      await new Promise((resolve) => setTimeout(resolve, 350));
    }

    setIsGenerating(false);
    setReportGenerated(true);

    addHistoryEvent({
      action: 'Report Generated',
      description: `Generated investigation report for case ${currentCase.code}`,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const reportContent = `
INVESTIGATION REPORT — ${currentCase.name} (${currentCase.code})
Date: ${new Date().toLocaleDateString()}
Investigator: ${currentInvestigator.name} (${currentInvestigator.badge})

1. SUMMARY
Investigation into organized network operations.
Total people/entities: ${entities.length}
Evidence items collected: ${evidenceList.length}
Confirmed connections: ${confirmedLinks.length}
Suggested connections: ${suggestedLinks.length}
Active risk alerts: ${alerts.length}

2. PEOPLE INVOLVED
${people.map((p) => `- ${p.name} (${p.role || 'Person of interest'}) - Risk: ${p.riskScore}/100`).join('\n')}

3. EVIDENCE COLLECTED
${evidenceList.map((e) => `- [${e.id}] ${e.title} (${e.type}) | Source: ${e.source}`).join('\n')}

4. CONNECTIONS
- Confirmed Connections: ${confirmedLinks.length}
${confirmedLinks.map((r) => `  * ${r.sourceId} -> ${r.targetId} (${r.label || r.type})`).join('\n')}
- Suggested Connections: ${suggestedLinks.length}
${suggestedLinks.map((r) => `  * ${r.sourceId} -> ${r.targetId} (${r.label || r.type}) [Suggested]`).join('\n')}

5. RISK ALERTS
${alerts.map((a) => `- [${a.severity}] ${a.title}: ${a.description}`).join('\n')}

Note: Sample report — demonstration data only.
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Investigation_Report_${currentCase.code}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-forge-panel border border-forge-border p-5 rounded-lg shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded bg-forge-cyan/15 text-forge-cyan border border-forge-cyan/30">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white font-mono">
              Reports & History
            </h1>
            <p className="text-xs text-forge-text-secondary mt-0.5">
              Generate case reports and view chronological investigation history.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1 bg-forge-card p-1 rounded border border-forge-border">
          <button
            onClick={() => setActiveTab('REPORT')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition ${
              activeTab === 'REPORT'
                ? 'bg-forge-cyan text-black font-bold shadow-sm'
                : 'text-forge-text-secondary hover:text-white'
            }`}
          >
            Report
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition ${
              activeTab === 'HISTORY'
                ? 'bg-forge-cyan text-black font-bold shadow-sm'
                : 'text-forge-text-secondary hover:text-white'
            }`}
          >
            History ({historyEvents.length})
          </button>
        </div>
      </div>

      {/* TAB 1: REPORT */}
      {activeTab === 'REPORT' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex items-center justify-between bg-forge-panel border border-forge-border p-4 rounded-lg shadow-sm">
            <div className="text-xs text-forge-text-secondary">
              Case: <strong className="text-white">{currentCase.name}</strong>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="px-4 py-2 rounded bg-forge-cyan hover:bg-forge-cyanLight text-black text-xs font-bold transition flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{generationSteps[generationStep]}</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5" />
                    <span>Generate Report</span>
                  </>
                )}
              </button>

              {reportGenerated && (
                <>
                  <button
                    onClick={handleDownload}
                    className="px-3 py-2 rounded bg-forge-card hover:bg-forge-cardHover border border-forge-border text-white text-xs font-medium transition flex items-center space-x-1"
                  >
                    <Download className="w-3.5 h-3.5 text-forge-cyan" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-3 py-2 rounded bg-forge-card hover:bg-forge-cardHover border border-forge-border text-white text-xs font-medium transition flex items-center space-x-1"
                  >
                    <Printer className="w-3.5 h-3.5 text-forge-cyan" />
                    <span>Print</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Report Preview Document */}
          {reportGenerated && (
            <div className="bg-forge-panel border border-forge-border rounded-lg p-8 shadow-sm space-y-6">
              {/* Report Header */}
              <div className="border-b border-forge-border pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono text-forge-cyan uppercase tracking-wider block">
                    INVESTIGATION SUMMARY REPORT
                  </span>
                  <h2 className="text-xl font-bold text-white font-mono mt-0.5">
                    {currentCase.name}
                  </h2>
                  <div className="text-xs text-forge-text-secondary mt-0.5">
                    Case Code: {currentCase.code}
                  </div>
                </div>

                <div className="text-right text-xs font-mono text-forge-text-muted space-y-0.5">
                  <div>Officer: {currentInvestigator.name}</div>
                  <div>Badge: {currentInvestigator.badge}</div>
                  <div className="text-[10px] text-forge-cyan">
                    Sample report — demonstration data only
                  </div>
                </div>
              </div>

              {/* 1. Summary */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  1. Summary
                </h3>
                <p className="text-xs text-forge-text-secondary leading-relaxed bg-forge-card p-3 rounded border border-forge-border">
                  This investigation connects multiple lines of evidence including phone call logs, banking
                  transactions, and toll plaza camera sightings. The primary syndicate operation links key suspect
                  Rajesh Kumar with overseas financing accounts and localized distribution coordinators.
                </p>
              </div>

              {/* 2. People Involved */}
              <div className="space-y-2">
                <div className="flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5 text-forge-cyan" />
                  <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    2. People Involved ({people.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {people.map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 rounded bg-forge-card border border-forge-border flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-white">{p.name}</div>
                        <div className="text-[10px] font-mono text-forge-text-muted">
                          {p.role || 'Person of Interest'}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-forge-rose">
                        Risk: {p.riskScore}/100
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Evidence */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  3. Evidence ({evidenceList.length})
                </h3>
                <div className="space-y-2">
                  {evidenceList.slice(0, 6).map((ev) => (
                    <div
                      key={ev.id}
                      className="p-2.5 rounded bg-forge-card border border-forge-border text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{ev.title}</span>
                        <span className="text-[10px] font-mono text-forge-text-muted">
                          {ev.id} · {ev.source}
                        </span>
                      </div>
                      <p className="text-[11px] text-forge-text-secondary font-mono leading-relaxed">
                        {ev.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Connections (Confirmed vs Suggested) */}
              <div className="space-y-2">
                <div className="flex items-center space-x-1.5">
                  <Network className="w-3.5 h-3.5 text-forge-cyan" />
                  <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    4. Connections
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Confirmed */}
                  <div className="space-y-2 p-3 rounded bg-forge-card border border-forge-border">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-forge-emerald font-mono">
                        Confirmed Connections ({confirmedLinks.length})
                      </span>
                      <span className="text-[10px] font-mono text-forge-text-muted">Verified</span>
                    </div>
                    <div className="space-y-1.5">
                      {confirmedLinks.slice(0, 4).map((r) => (
                        <div key={r.id} className="text-[11px] font-mono text-forge-text-secondary">
                          • {r.sourceId} ➔ {r.targetId} ({r.label || r.type})
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggested */}
                  <div className="space-y-2 p-3 rounded bg-forge-card border border-forge-border">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-forge-amber font-mono">
                        Suggested Connections ({suggestedLinks.length})
                      </span>
                      <span className="text-[10px] font-mono text-forge-text-muted">Under Review</span>
                    </div>
                    <div className="space-y-1.5">
                      {suggestedLinks.slice(0, 4).map((r) => (
                        <div key={r.id} className="text-[11px] font-mono text-forge-text-secondary">
                          • {r.sourceId} ➔ {r.targetId} ({r.label || r.type})
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Risk Alerts */}
              <div className="space-y-2">
                <div className="flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-forge-rose" />
                  <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    5. Risk Alerts ({alerts.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {alerts.map((al) => (
                    <div
                      key={al.id}
                      className="p-2.5 rounded bg-forge-card border border-forge-border text-xs flex items-start justify-between gap-3"
                    >
                      <div>
                        <span className="font-semibold text-white">{al.title}</span>
                        <p className="text-xs text-forge-text-secondary mt-0.5">
                          {al.description}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-forge-rose shrink-0">
                        {al.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Document Disclaimer */}
              <div className="pt-4 border-t border-forge-border text-[10px] font-mono text-forge-text-muted flex justify-between">
                <span>INTEL-FORGE CASE RECORD</span>
                <span>Sample report — demonstration data only</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HISTORY */}
      {activeTab === 'HISTORY' && (
        <div className="bg-forge-panel border border-forge-border rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-forge-border pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-forge-cyan" />
              <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Investigation History
              </h2>
            </div>
            <span className="text-[10px] text-forge-text-muted font-mono">
              Actions automatically recorded
            </span>
          </div>

          {historyEvents.length === 0 ? (
            <div className="p-8 text-center text-xs text-forge-text-muted border border-dashed border-forge-border rounded">
              No actions recorded in this session yet.
            </div>
          ) : (
            <div className="space-y-3">
              {historyEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-3.5 rounded bg-forge-card border border-forge-border text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-white">{event.action}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-forge-panel border border-forge-border text-forge-cyan">
                        {event.id}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-forge-text-muted">
                      {event.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-forge-text-secondary leading-relaxed">
                    {event.description}
                  </p>

                  <div className="text-[10px] font-mono text-forge-text-muted pt-0.5">
                    Actor: <strong className="text-forge-text-secondary">{event.actor}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
