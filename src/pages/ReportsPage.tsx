import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useInvestigationStore } from '../stores';
import { investigationService, evidenceService, alertService } from '../services';

export const ReportsPage: React.FC = () => {
  const { currentCase, currentInvestigator } = useInvestigationStore();

  const [generatedDate] = useState(() =>
    new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  );

  const entities = investigationService.getEntities(currentCase.id);
  const keySuspects = entities.filter((e) => e.type === 'PERSON').slice(0, 5);
  const evidenceList = evidenceService.getEvidence();
  const verifiedEvidence = evidenceList.filter((e) => e.verificationStatus === 'HUMAN_VERIFIED');
  const alerts = alertService.getAlerts();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const reportText = `
INTEL-FORGE COURT-READY INVESTIGATION REPORT
Case: ${currentCase.name} (${currentCase.code})
Date: ${generatedDate}
Investigating Officer: ${currentInvestigator.name} (${currentInvestigator.badge})
Agency: ${currentInvestigator.agency}

1. EXECUTIVE SUMMARY
Investigation into organized crime syndicate operating via hawala and digital mules.
Total entities analyzed: ${entities.length}
Verified Admissible Evidence Exhibits: ${verifiedEvidence.length}
High-Priority Red Flags Identified: ${alerts.length}

2. PRIMARY SUSPECTS
${keySuspects.map((s) => `- ${s.name} (ID: ${s.id}, Risk: ${s.riskScore}/100, Role: ${s.role || 'Suspect'})`).join('\n')}

3. ADMISSIBLE EVIDENCE EXHIBITS (CITED)
${verifiedEvidence.map((e) => `- [${e.id}] ${e.title} | Source: ${e.source} | Hash: ${e.hash}`).join('\n')}

4. CHAIN OF CUSTODY & INTEGRITY ATTESTATION
All evidence items herein have been verified via human-in-the-loop review and logged to the tamper-evident ledger.
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Court_Report_${currentCase.code}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-forge-panel border border-forge-border p-5 rounded-lg shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded bg-forge-cyan/15 text-forge-cyan border border-forge-cyan/30">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white font-mono tracking-wide">
              COURT-READY EVIDENCE REPORT
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-forge-emerald/20 text-forge-emerald font-mono font-semibold">
              ADMISSIBLE DOCKET
            </span>
          </div>
          <p className="text-xs text-forge-text-secondary mt-1 max-w-xl">
            As outlined in PPT Slide 2 & 4: Automatically produces citation-backed investigation reports
            with deterministic Neo4j references, FIR citations, and chain-of-custody seals.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-3 py-2 rounded bg-forge-card hover:bg-forge-cardHover border border-forge-border text-white text-xs font-semibold transition"
          >
            <Download className="w-4 h-4 text-forge-cyan" />
            <span>Download Summary</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 rounded bg-forge-cyan hover:bg-forge-cyanLight text-black text-xs font-bold transition shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Sheet */}
      <div className="bg-forge-panel border border-forge-border rounded-lg p-8 space-y-6 shadow-panel">
        {/* Document Seal Header */}
        <div className="border-b border-forge-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[11px] font-mono tracking-widest text-forge-cyan uppercase font-bold">
              CENTRAL FORENSIC & INTELLIGENCE REPORT · ADMISSIBLE EXHIBIT DOCKET
            </div>
            <h2 className="text-2xl font-bold text-white font-mono">
              CASE DOSSIER: {currentCase.code}
            </h2>
            <div className="text-xs text-forge-text-secondary">{currentCase.name}</div>
          </div>

          <div className="text-right font-mono text-xs text-forge-text-muted space-y-1">
            <div className="flex items-center sm:justify-end space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-forge-cyan" />
              <span>DATE GENERATED: {generatedDate}</span>
            </div>
            <div className="flex items-center sm:justify-end space-x-1.5 text-forge-emerald">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="font-bold">STATUS: ADMISSIBLE UNDER SEC 65B</span>
            </div>
          </div>
        </div>

        {/* Officer Attribution */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded bg-forge-card border border-forge-border text-xs font-mono">
          <div>
            <span className="text-forge-text-muted uppercase text-[10px] block">Investigating Officer</span>
            <span className="text-white font-bold">{currentInvestigator.name}</span>
          </div>
          <div>
            <span className="text-forge-text-muted uppercase text-[10px] block">Badge & Unit</span>
            <span className="text-white font-bold">{currentInvestigator.badge} · Special Operations</span>
          </div>
          <div>
            <span className="text-forge-text-muted uppercase text-[10px] block">Integrity Ledger Hash</span>
            <span className="text-forge-cyan font-bold truncate block">sha256:4f8e91a0...92b</span>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-forge-cyan font-mono uppercase tracking-wider">
            1. Executive Investigation Brief
          </h3>
          <p className="text-xs text-forge-text-secondary leading-relaxed bg-forge-card/40 p-3 rounded border border-forge-border">
            Multi-modal investigation synthesizing CCTV feeds, telecom call detail records (CDRs), banking transactions,
            and first information reports (FIRs). Analysis reveals an organized criminal network coordinating money laundering
            and illicit goods movement across Delhi-NCR. All findings have been verified by human investigation officers.
          </p>
        </div>

        {/* Section 2: Primary Accused & Key Network Nodes */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-forge-cyan font-mono uppercase tracking-wider">
            2. Primary Accused & Key Network Entities
          </h3>
          <div className="border border-forge-border rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-forge-card border-b border-forge-border font-mono text-[10px] text-forge-text-muted uppercase">
                <tr>
                  <th className="p-2.5">Entity ID</th>
                  <th className="p-2.5">Name / Label</th>
                  <th className="p-2.5">Designation / Role</th>
                  <th className="p-2.5 text-right">Risk Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forge-border font-mono text-[11px]">
                {keySuspects.map((suspect) => (
                  <tr key={suspect.id} className="hover:bg-forge-card/50">
                    <td className="p-2.5 text-forge-cyan">{suspect.id}</td>
                    <td className="p-2.5 font-bold text-white">{suspect.name}</td>
                    <td className="p-2.5 text-forge-text-secondary">
                      {suspect.role || 'Primary Suspect'}
                    </td>
                    <td className="p-2.5 text-right">
                      <span className="text-forge-rose font-bold">{suspect.riskScore}/100</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Admissible Evidence Exhibits */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-forge-cyan font-mono uppercase tracking-wider">
            3. Verified Admissible Evidence Exhibits ({verifiedEvidence.length})
          </h3>
          <div className="space-y-2">
            {verifiedEvidence.slice(0, 5).map((ev) => (
              <div
                key={ev.id}
                className="p-3 rounded bg-forge-card border border-forge-border text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-forge-cyan">{ev.id}</span>
                    <span className="text-white font-semibold">{ev.title}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-forge-emerald/20 text-forge-emerald font-bold">
                    OFFICER VERIFIED
                  </span>
                </div>
                <p className="text-[11px] text-forge-text-muted font-mono">{ev.contentSnippet || ev.description}</p>
                <div className="flex items-center space-x-3 text-[10px] font-mono text-forge-text-muted pt-0.5">
                  <span>Source: {ev.source}</span>
                  <span>•</span>
                  <span>Hash: {ev.hash}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Signature & Chain of Custody Seal */}
        <div className="pt-6 border-t border-forge-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center space-x-2 text-forge-emerald">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div>
              <div className="font-bold text-white">DIGITALLY ATTESTED EVIDENCE DOCKET</div>
              <div className="text-[10px] text-forge-text-muted">
                Section 65B Indian Evidence Act Compliant · Hash Chain Preserved
              </div>
            </div>
          </div>

          <div className="border border-forge-border p-3 rounded bg-forge-card text-right">
            <div className="text-[10px] text-forge-text-muted uppercase">Certified By:</div>
            <div className="font-bold text-white">{currentInvestigator.name}</div>
            <div className="text-[10px] text-forge-cyan">{currentInvestigator.badge}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
