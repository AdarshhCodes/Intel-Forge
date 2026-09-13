import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Search,
  FileText,
  Video,
  PhoneCall,
  DollarSign,
  Mic,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { useInvestigationStore } from '../stores';
import { evidenceService } from '../services';
import { EvidenceType } from '../types';

export const ReviewGatePage: React.FC = () => {
  const {
    verifyEvidenceAction,
    rejectEvidenceAction,
    openEvidenceModal,
  } = useInvestigationStore();

  const [activeTab, setActiveTab] = useState<'PENDING' | 'VERIFIED' | 'REJECTED'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectReasonModalId, setRejectReasonModalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Insufficient corroboration');

  // Load evidence dynamically with store re-renders
  const allEvidence = evidenceService.getEvidence();

  const filteredEvidence = allEvidence.filter((e) => {
    // Status filter
    if (activeTab === 'PENDING') {
      if (e.verificationStatus === 'HUMAN_VERIFIED' || e.verificationStatus === 'REJECTED') {
        return false;
      }
    } else if (activeTab === 'VERIFIED') {
      if (e.verificationStatus !== 'HUMAN_VERIFIED') return false;
    } else if (activeTab === 'REJECTED') {
      if (e.verificationStatus !== 'REJECTED') return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        e.source.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = allEvidence.filter(
    (e) => e.verificationStatus !== 'HUMAN_VERIFIED' && e.verificationStatus !== 'REJECTED'
  ).length;

  const verifiedCount = allEvidence.filter((e) => e.verificationStatus === 'HUMAN_VERIFIED').length;
  const rejectedCount = allEvidence.filter((e) => e.verificationStatus === 'REJECTED').length;

  const handleApprove = async (id: string) => {
    await verifyEvidenceAction(id);
  };

  const handleConfirmReject = async (id: string) => {
    await rejectEvidenceAction(id, rejectReason);
    setRejectReasonModalId(null);
  };

  const getTypeIcon = (type: EvidenceType) => {
    switch (type) {
      case 'FIR':
        return <FileText className="w-4 h-4 text-forge-cyan" />;
      case 'CCTV':
        return <Video className="w-4 h-4 text-forge-amber" />;
      case 'CDR':
        return <PhoneCall className="w-4 h-4 text-forge-emerald" />;
      case 'FINANCIAL':
        return <DollarSign className="w-4 h-4 text-forge-purple" />;
      case 'AUDIO':
        return <Mic className="w-4 h-4 text-forge-rose" />;
      default:
        return <FileText className="w-4 h-4 text-forge-cyan" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-forge-panel border border-forge-border p-5 rounded-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded bg-forge-amber/15 text-forge-amber border border-forge-amber/30">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white font-mono tracking-wide">
              HUMAN-IN-THE-LOOP (HITL) REVIEW GATE
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-forge-amber/20 text-forge-amber font-mono font-semibold">
              DATA INTEGRITY
            </span>
          </div>
          <p className="text-xs text-forge-text-secondary mt-1.5 max-w-2xl">
            As outlined in PPT Slide 3: All low-confidence AI parsing is quarantined here for human officer verification.
            Only approved exhibits are committed to the active case knowledge graph.
          </p>
        </div>

        {/* Counter Badges */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <div className="px-3 py-1.5 rounded bg-forge-card border border-forge-border text-center">
            <div className="text-[10px] text-forge-text-muted">PENDING REVIEW</div>
            <div className="text-forge-amber font-bold text-sm">{pendingCount}</div>
          </div>
          <div className="px-3 py-1.5 rounded bg-forge-card border border-forge-border text-center">
            <div className="text-[10px] text-forge-text-muted">VERIFIED</div>
            <div className="text-forge-emerald font-bold text-sm">{verifiedCount}</div>
          </div>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-forge-border pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition ${
              activeTab === 'PENDING'
                ? 'bg-forge-amber/20 text-forge-amber border border-forge-amber/40 shadow-sm'
                : 'text-forge-text-secondary hover:text-white bg-forge-card'
            }`}
          >
            Pending Review ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab('VERIFIED')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition ${
              activeTab === 'VERIFIED'
                ? 'bg-forge-emerald/20 text-forge-emerald border border-forge-emerald/40 shadow-sm'
                : 'text-forge-text-secondary hover:text-white bg-forge-card'
            }`}
          >
            Verified ({verifiedCount})
          </button>
          <button
            onClick={() => setActiveTab('REJECTED')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition ${
              activeTab === 'REJECTED'
                ? 'bg-forge-rose/20 text-forge-rose border border-forge-rose/40 shadow-sm'
                : 'text-forge-text-secondary hover:text-white bg-forge-card'
            }`}
          >
            Rejected ({rejectedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-forge-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter queue by title or source..."
            className="w-full bg-forge-card border border-forge-border rounded pl-8 pr-3 py-1.5 text-xs text-forge-text-primary placeholder:text-forge-text-muted focus:outline-none focus:border-forge-cyan"
          />
        </div>
      </div>

      {/* Review Queue Cards */}
      {filteredEvidence.length === 0 ? (
        <div className="p-12 text-center bg-forge-panel border border-dashed border-forge-border rounded-lg space-y-3">
          <CheckCircle2 className="w-10 h-10 text-forge-emerald mx-auto opacity-70" />
          <div className="text-sm font-semibold text-white">No exhibits currently in this queue</div>
          <p className="text-xs text-forge-text-muted max-w-md mx-auto">
            {activeTab === 'PENDING'
              ? 'Great work! All evidence exhibits have been verified or rejected by an officer.'
              : 'No exhibits found matching the current search filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvidence.map((item) => {
            return (
              <div
                key={item.id}
                className="bg-forge-panel border border-forge-border rounded-lg p-5 hover:border-forge-borderLight transition shadow-sm space-y-4"
              >
                {/* Top Row: Meta + Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-forge-border pb-3">
                  <div className="flex items-center space-x-2.5">
                    <span className="p-1.5 rounded bg-forge-card border border-forge-border">
                      {getTypeIcon(item.type)}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-white">{item.id}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-forge-card text-forge-cyan border border-forge-border">
                          {item.type}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-white mt-0.5">{item.title}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded font-bold ${
                        item.confidence >= 75
                          ? 'bg-forge-emerald/20 text-forge-emerald border border-forge-emerald/30'
                          : 'bg-forge-amber/20 text-forge-amber border border-forge-amber/30'
                      }`}
                    >
                      AI Confidence: {item.confidence}%
                    </span>
                    <button
                      onClick={() => openEvidenceModal(item)}
                      className="p-1.5 rounded bg-forge-card hover:bg-forge-cardHover border border-forge-border text-forge-text-secondary hover:text-white transition text-xs flex items-center space-x-1"
                      title="Inspect Original Exhibit Details"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="text-[11px] hidden sm:inline">Inspect</span>
                    </button>
                  </div>
                </div>

                {/* Evidence Content Snippet */}
                <div className="text-xs text-forge-text-secondary leading-relaxed bg-forge-card p-3 rounded border border-forge-border font-mono">
                  {item.description || item.contentSnippet}
                </div>

                {/* Source & Cryptographic Seal Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
                  <div className="flex items-center space-x-3 text-forge-text-muted text-[11px] font-mono">
                    <span>Source: <strong className="text-forge-text-secondary">{item.source}</strong></span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Lock className="w-3 h-3 text-forge-cyan" />
                      <span>{item.hash.substring(0, 16)}...</span>
                    </span>
                  </div>

                  {/* Actions for Pending exhibits */}
                  {item.verificationStatus !== 'HUMAN_VERIFIED' && item.verificationStatus !== 'REJECTED' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setRejectReasonModalId(item.id)}
                        className="px-3 py-1.5 rounded bg-forge-rose/15 hover:bg-forge-rose/25 text-forge-rose border border-forge-rose/30 text-xs font-semibold flex items-center space-x-1.5 transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject Exhibit</span>
                      </button>
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="px-4 py-1.5 rounded bg-forge-emerald hover:bg-forge-emerald/90 text-black text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve & Ingest to Graph</span>
                      </button>
                    </div>
                  )}

                  {/* Badges for Verified or Rejected */}
                  {item.verificationStatus === 'HUMAN_VERIFIED' && (
                    <div className="flex items-center space-x-1.5 text-forge-emerald font-semibold text-xs font-mono">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>OFFICER VERIFIED & COMMITTED TO GRAPH</span>
                    </div>
                  )}

                  {item.verificationStatus === 'REJECTED' && (
                    <div className="flex items-center space-x-1.5 text-forge-rose font-semibold text-xs font-mono">
                      <XCircle className="w-4 h-4" />
                      <span>REJECTED FROM ADMISSIBLE DOCKET</span>
                    </div>
                  )}
                </div>

                {/* Inline Rejection Reason Modal */}
                {rejectReasonModalId === item.id && (
                  <div className="p-3 mt-3 rounded bg-forge-rose/10 border border-forge-rose/30 space-y-2 animate-fadeIn">
                    <label className="block text-xs font-semibold text-forge-rose uppercase">
                      Reason for Rejection:
                    </label>
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full bg-forge-bg border border-forge-border rounded px-3 py-1.5 text-xs text-forge-text-primary focus:outline-none focus:border-forge-rose"
                      placeholder="e.g. Unverified witness, noisy CCTV blur, duplicate entry"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setRejectReasonModalId(null)}
                        className="px-3 py-1 rounded bg-forge-card text-xs text-forge-text-secondary hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleConfirmReject(item.id)}
                        className="px-3 py-1 rounded bg-forge-rose text-white text-xs font-bold hover:bg-forge-rose/90"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
