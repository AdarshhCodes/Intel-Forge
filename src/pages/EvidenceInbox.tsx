import React, { useState } from 'react';
import {
  Inbox,
  UploadCloud,
  Search,
  CheckCircle2,
  FileText,
  PhoneCall,
  DollarSign,
  Video,
  Mic,
  X,
} from 'lucide-react';
import { useInvestigationStore } from '../stores';
import { evidenceService } from '../services';
import { Evidence, EvidenceType } from '../types';

export const EvidenceInbox: React.FC = () => {
  const { addEvidenceAction, verifyEvidenceAction } = useInvestigationStore();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<EvidenceType>('DOCUMENT');
  const [source, setSource] = useState('');
  const [details, setDetails] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [selectedItem, setSelectedItem] = useState<Evidence | null>(null);
  const [successNote, setSuccessNote] = useState<string | null>(null);

  const evidenceList = evidenceService.getEvidence();

  // 1-Click quick presets
  const handleApplyPreset = (presetTitle: string, presetType: EvidenceType, presetSource: string, presetDetails: string) => {
    setTitle(presetTitle);
    setType(presetType);
    setSource(presetSource);
    setDetails(presetDetails);
  };

  const handleAddEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !details.trim()) return;

    const newId = `IF-EV-${(evidenceList.length + 1).toString().padStart(3, '0')}`;
    const newRecord: Evidence = {
      id: newId,
      title: title.trim(),
      type,
      source: source.trim() || 'Field Officer Report',
      timestamp: new Date().toISOString(),
      description: details.trim(),
      contentSnippet: details.trim(),
      confidence: 85,
      verificationStatus: 'AI_SUGGESTED', // "Needs Review"
      entityIds: ['IF-P-001'],
      hash: `sha256_${Math.random().toString(36).substring(2, 10)}`,
      chainOfCustody: [
        {
          step: 1,
          officer: 'Insp. Vikramaditya Rathore',
          badgeNumber: 'DL-88219',
          agency: 'Cyber Operations Division',
          action: 'Initial Evidence Ingestion',
          timestamp: new Date().toISOString(),
          hashSignature: `sig_${Math.random().toString(36).substring(2, 8)}`,
        },
      ],
    };

    await addEvidenceAction(newRecord);
    setSuccessNote(`Evidence "${newRecord.title}" added to inbox with ID ${newRecord.id}!`);

    setTitle('');
    setSource('');
    setDetails('');
  };

  const handleToggleReview = async (item: Evidence) => {
    if (item.verificationStatus === 'HUMAN_VERIFIED') {
      return;
    }
    await verifyEvidenceAction(item.id);
    setSelectedItem((prev) => (prev ? { ...prev, verificationStatus: 'HUMAN_VERIFIED' } : null));
  };

  // Filter evidence list
  const filteredEvidence = evidenceList.filter((item) => {
    if (selectedTypeFilter !== 'ALL' && item.type !== selectedTypeFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getTypeLabel = (t: EvidenceType) => {
    switch (t) {
      case 'DOCUMENT':
      case 'FIR':
        return 'Document';
      case 'CDR':
        return 'Call Record';
      case 'FINANCIAL':
        return 'Financial Record';
      case 'CCTV':
        return 'Video';
      case 'AUDIO':
        return 'Audio Recording';
      default:
        return 'Evidence';
    }
  };

  const getTypeIcon = (t: EvidenceType) => {
    switch (t) {
      case 'DOCUMENT':
      case 'FIR':
        return <FileText className="w-3.5 h-3.5 text-forge-cyan" />;
      case 'CDR':
        return <PhoneCall className="w-3.5 h-3.5 text-forge-emerald" />;
      case 'FINANCIAL':
        return <DollarSign className="w-3.5 h-3.5 text-forge-purple" />;
      case 'CCTV':
        return <Video className="w-3.5 h-3.5 text-forge-amber" />;
      case 'AUDIO':
        return <Mic className="w-3.5 h-3.5 text-forge-rose" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-forge-cyan" />;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-forge-panel border border-forge-border p-5 rounded-lg shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded bg-forge-cyan/15 text-forge-cyan border border-forge-cyan/30">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white font-mono">
              Evidence Inbox
            </h1>
            <p className="text-xs text-forge-text-secondary mt-0.5">
              Add new evidence items to this investigation and review records.
            </p>
          </div>
        </div>
        <div className="text-xs font-mono text-forge-text-muted">
          Total Items: <span className="text-white font-bold">{evidenceList.length}</span>
        </div>
      </div>

      {/* Success Banner */}
      {successNote && (
        <div className="p-3.5 rounded bg-forge-emerald/15 border border-forge-emerald/30 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2 text-forge-emerald font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successNote}</span>
          </div>
          <button
            onClick={() => setSuccessNote(null)}
            className="text-forge-text-muted hover:text-white text-xs px-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. Upload / Input Area ("Dropbox") */}
      <div className="bg-forge-panel border border-forge-border rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-forge-border pb-3">
          <div className="flex items-center space-x-2">
            <UploadCloud className="w-4 h-4 text-forge-cyan" />
            <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Add New Evidence
            </h2>
          </div>
          {/* Quick presets */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-[11px] text-forge-text-muted hidden sm:inline">Try Sample:</span>
            <button
              type="button"
              onClick={() =>
                handleApplyPreset(
                  'CCTV Toll Plaza Sighting',
                  'CCTV',
                  'Delhi Highway Camera NH-44',
                  'Vehicle DL-08-AB-9921 crossing at 23:42. Driver matches Vikram Malhotra.'
                )
              }
              className="px-2 py-0.5 rounded bg-forge-card hover:bg-forge-cardHover border border-forge-border text-[10px] font-mono text-forge-cyan"
            >
              + CCTV Sighting
            </button>
            <button
              type="button"
              onClick={() =>
                handleApplyPreset(
                  'Bank Mule Account Ledger',
                  'FINANCIAL',
                  'Bank Intelligence Unit',
                  'INR 25,00,000 sent from account 40992819 to beneficiary Rajesh Kumar.'
                )
              }
              className="px-2 py-0.5 rounded bg-forge-card hover:bg-forge-cardHover border border-forge-border text-[10px] font-mono text-forge-cyan"
            >
              + Bank Transfer
            </button>
          </div>
        </div>

        <form onSubmit={handleAddEvidence} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-forge-text-secondary mb-1">
                Evidence Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Call Record from Burner SIM"
                className="w-full bg-forge-bg border border-forge-border rounded px-3 py-1.5 text-xs text-forge-text-primary placeholder:text-forge-text-muted focus:outline-none focus:border-forge-cyan"
              />
            </div>

            <div>
              <label className="block text-[11px] text-forge-text-secondary mb-1">
                Evidence Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as EvidenceType)}
                className="w-full bg-forge-bg border border-forge-border rounded px-3 py-1.5 text-xs text-forge-text-primary focus:outline-none focus:border-forge-cyan"
              >
                <option value="DOCUMENT">Document</option>
                <option value="CDR">Call Record</option>
                <option value="FINANCIAL">Financial Record</option>
                <option value="CCTV">Video</option>
                <option value="AUDIO">Audio Recording</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-forge-text-secondary mb-1">
                Source / Agency
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. Cyber Cell / Traffic Police"
                className="w-full bg-forge-bg border border-forge-border rounded px-3 py-1.5 text-xs text-forge-text-primary placeholder:text-forge-text-muted focus:outline-none focus:border-forge-cyan"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-forge-text-secondary mb-1">
              Evidence Details / Transcript
            </label>
            <textarea
              rows={2}
              required
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Paste details, text notes, transcript, or transfer description..."
              className="w-full bg-forge-bg border border-forge-border rounded px-3 py-2 text-xs text-forge-text-primary placeholder:text-forge-text-muted focus:outline-none focus:border-forge-cyan font-mono"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded bg-forge-cyan hover:bg-forge-cyanLight text-black text-xs font-bold transition flex items-center space-x-1.5"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Add Evidence Item</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Evidence List / Table */}
      <div className="bg-forge-panel border border-forge-border rounded-lg p-5 shadow-sm space-y-4">
        {/* Search & Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-forge-border pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Evidence Records ({filteredEvidence.length})
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Type filter */}
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="bg-forge-card border border-forge-border rounded px-2.5 py-1.5 text-xs text-forge-text-secondary focus:outline-none focus:border-forge-cyan"
            >
              <option value="ALL">All Types</option>
              <option value="DOCUMENT">Document</option>
              <option value="CDR">Call Record</option>
              <option value="FINANCIAL">Financial Record</option>
              <option value="CCTV">Video</option>
              <option value="AUDIO">Audio Recording</option>
            </select>

            {/* Keyword Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-forge-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search evidence..."
                className="bg-forge-card border border-forge-border rounded pl-8 pr-3 py-1.5 text-xs text-forge-text-primary placeholder:text-forge-text-muted focus:outline-none focus:border-forge-cyan w-44 sm:w-56"
              />
            </div>
          </div>
        </div>

        {/* Table / List */}
        {filteredEvidence.length === 0 ? (
          <div className="p-10 text-center text-xs text-forge-text-muted border border-dashed border-forge-border rounded space-y-2">
            <div>No evidence items match your filter.</div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTypeFilter('ALL');
              }}
              className="text-forge-cyan hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-forge-border">
            {filteredEvidence.map((item) => {
              const isReviewed = item.verificationStatus === 'HUMAN_VERIFIED';
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="py-3 px-2 rounded hover:bg-forge-card/60 cursor-pointer transition flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="p-1.5 rounded bg-forge-card border border-forge-border">
                      {getTypeIcon(item.type)}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-white truncate group-hover:text-forge-cyan transition">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-mono text-forge-text-muted">
                          {item.id}
                        </span>
                      </div>
                      <div className="text-[11px] text-forge-text-secondary truncate mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0 text-right">
                    <div className="text-[11px] text-forge-text-muted font-mono hidden md:block">
                      {item.source}
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                        isReviewed
                          ? 'bg-forge-emerald/20 text-forge-emerald border border-forge-emerald/30'
                          : 'bg-forge-amber/20 text-forge-amber border border-forge-amber/30'
                      }`}
                    >
                      {isReviewed ? 'Reviewed' : 'Needs Review'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Evidence Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-forge-panel border border-forge-border rounded-lg p-6 max-w-lg w-full space-y-4 shadow-panel">
            <div className="flex items-start justify-between border-b border-forge-border pb-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded bg-forge-card border border-forge-border">
                  {getTypeIcon(selectedItem.type)}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedItem.title}</h3>
                  <span className="text-[10px] font-mono text-forge-cyan">
                    {selectedItem.id} · {getTypeLabel(selectedItem.type)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-forge-text-muted hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-mono text-forge-text-muted uppercase block">
                  Description / Content
                </span>
                <p className="text-forge-text-primary bg-forge-card p-3 rounded border border-forge-border mt-1 font-mono leading-relaxed">
                  {selectedItem.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
                <div className="p-2 rounded bg-forge-card border border-forge-border">
                  <span className="text-forge-text-muted block text-[10px]">Source</span>
                  <span className="text-white font-medium">{selectedItem.source}</span>
                </div>
                <div className="p-2 rounded bg-forge-card border border-forge-border">
                  <span className="text-forge-text-muted block text-[10px]">Review Status</span>
                  <span
                    className={
                      selectedItem.verificationStatus === 'HUMAN_VERIFIED'
                        ? 'text-forge-emerald font-bold'
                        : 'text-forge-amber font-bold'
                    }
                  >
                    {selectedItem.verificationStatus === 'HUMAN_VERIFIED'
                      ? 'Reviewed'
                      : 'Needs Review'}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-forge-border pt-4 flex items-center justify-between">
              {selectedItem.verificationStatus !== 'HUMAN_VERIFIED' ? (
                <button
                  onClick={() => handleToggleReview(selectedItem)}
                  className="px-3 py-1.5 rounded bg-forge-emerald hover:bg-forge-emerald/90 text-black text-xs font-bold transition flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark as Reviewed</span>
                </button>
              ) : (
                <span className="text-xs text-forge-emerald flex items-center space-x-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Reviewed by Investigator</span>
                </span>
              )}

              <button
                onClick={() => setSelectedItem(null)}
                className="px-3 py-1.5 rounded bg-forge-card hover:bg-forge-cardHover border border-forge-border text-xs text-forge-text-secondary hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
