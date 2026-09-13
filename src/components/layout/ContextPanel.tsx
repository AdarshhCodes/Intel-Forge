import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ChevronLeft,
  User,
  ShieldAlert,
  FileSearch,
  ExternalLink,
  Search,
  Clock,
  Phone,
  Building,
  CreditCard,
  MapPin,
  Car,
  X,
} from 'lucide-react';
import { useInvestigationStore } from '../../stores';
import { investigationService } from '../../services';
import { EntityType, Relationship } from '../../types';

export const ContextPanel: React.FC = () => {
  const navigate = useNavigate();
  const {
    isRightPanelOpen,
    toggleRightPanel,
    selectedEntity,
    selectedEvidence,
    selectedAlert,
    currentCase,
    openEvidenceModal,
    runAiQuery,
    selectEntity,
  } = useInvestigationStore();

  if (!isRightPanelOpen) {
    return (
      <button
        onClick={() => toggleRightPanel(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 bg-forge-panel border border-forge-border border-r-0 rounded-l-md p-2 text-forge-cyan hover:bg-forge-card transition shadow-panel z-20"
        title="Open Details Inspector"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
    );
  }

  // Get relationships for selected entity if present
  const relatedLinks = selectedEntity
    ? investigationService.getRelationshipsForEntity(selectedEntity.id, currentCase.id)
    : [];

  const getEntityIcon = (type?: EntityType) => {
    switch (type) {
      case 'PERSON':
        return <User className="w-4 h-4 text-forge-cyan" />;
      case 'PHONE':
        return <Phone className="w-4 h-4 text-forge-emerald" />;
      case 'BANK_ACCOUNT':
        return <CreditCard className="w-4 h-4 text-forge-purple" />;
      case 'LOCATION':
        return <MapPin className="w-4 h-4 text-forge-rose" />;
      case 'VEHICLE':
        return <Car className="w-4 h-4 text-forge-amber" />;
      case 'ORGANIZATION':
        return <Building className="w-4 h-4 text-forge-indigo" />;
      default:
        return <User className="w-4 h-4 text-forge-cyan" />;
    }
  };

  return (
    <aside className="w-80 bg-forge-panel border-l border-forge-border flex flex-col justify-between select-none shrink-0 z-20 overflow-y-auto">
      {/* Header */}
      <div className="p-3 border-b border-forge-border flex items-center justify-between bg-forge-card/50">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            DETAILS INSPECTOR
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => toggleRightPanel(false)}
            className="p-1 rounded text-forge-text-muted hover:text-white hover:bg-forge-card transition"
            title="Collapse Inspector"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Body Content */}
      <div className="p-4 space-y-4 flex-1">
        {/* 1. Selected Entity (Suspect / Phone / Account) */}
        {selectedEntity ? (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center space-x-2.5">
                <span className="p-2 rounded bg-forge-card border border-forge-border">
                  {getEntityIcon(selectedEntity.type)}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    {selectedEntity.name}
                  </h3>
                  <span className="text-[10px] font-mono text-forge-cyan uppercase">
                    {selectedEntity.type} · ID: {selectedEntity.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => selectEntity(null)}
                className="text-forge-text-muted hover:text-white p-1"
                title="Clear selection"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Risk Score Pill */}
            <div className="flex items-center justify-between p-2.5 rounded bg-forge-card border border-forge-border font-mono text-xs">
              <span className="text-forge-text-muted">RISK SCORE:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  selectedEntity.riskScore >= 75
                    ? 'bg-forge-rose/20 text-forge-rose border border-forge-rose/30'
                    : selectedEntity.riskScore >= 50
                    ? 'bg-forge-amber/20 text-forge-amber border border-forge-amber/30'
                    : 'bg-forge-emerald/20 text-forge-emerald border border-forge-emerald/30'
                }`}
              >
                {selectedEntity.riskScore}/100 ({selectedEntity.riskScore >= 75 ? 'HIGH' : 'EVALUATING'})
              </span>
            </div>

            {/* Attributes / Metadata List */}
            <div className="space-y-1.5 text-xs font-mono">
              <span className="text-[10px] uppercase text-forge-text-muted tracking-wider">
                KEY ATTRIBUTES
              </span>
              <div className="p-2.5 rounded bg-forge-card border border-forge-border space-y-1.5 text-[11px]">
                {selectedEntity.role && (
                  <div className="flex justify-between border-b border-forge-border/40 pb-1">
                    <span className="text-forge-text-muted">Role:</span>
                    <span className="text-white font-medium text-right truncate max-w-[150px]">{selectedEntity.role}</span>
                  </div>
                )}
                {selectedEntity.primaryIdentifier && (
                  <div className="flex justify-between border-b border-forge-border/40 pb-1">
                    <span className="text-forge-text-muted">Identifier:</span>
                    <span className="text-forge-cyan font-medium text-right truncate max-w-[150px]">{selectedEntity.primaryIdentifier}</span>
                  </div>
                )}
                {Object.entries(selectedEntity.metadata || {}).map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-forge-border/40 pb-1 last:border-0 last:pb-0">
                    <span className="text-forge-text-muted capitalize">{k}:</span>
                    <span className="text-white font-medium text-right truncate max-w-[150px]">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Connected Links in Network */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-forge-text-muted tracking-wider flex items-center justify-between">
                <span>CONNECTED NETWORK LINKS</span>
                <span className="text-forge-cyan font-bold">{relatedLinks.length}</span>
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {relatedLinks.length === 0 ? (
                  <p className="text-xs text-forge-text-muted italic">No direct links in current filter</p>
                ) : (
                  relatedLinks.map((rel: Relationship) => {
                    const targetEntity = investigationService.getEntityById(
                      rel.sourceId === selectedEntity.id ? rel.targetId : rel.sourceId
                    );
                    return (
                      <div
                        key={rel.id}
                        onClick={() => targetEntity && selectEntity(targetEntity)}
                        className="p-2 rounded bg-forge-card hover:bg-forge-cardHover border border-forge-border cursor-pointer transition text-xs flex items-center justify-between"
                      >
                        <div>
                          <div className="text-[10px] font-mono text-forge-cyan font-semibold">
                            {rel.label}
                          </div>
                          <div className="text-white text-[11px] font-medium truncate max-w-[160px]">
                            {targetEntity?.name || 'Linked Node'}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-forge-text-muted">
                          {rel.confidence}%
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 pt-2 border-t border-forge-border">
              <button
                onClick={() => {
                  runAiQuery(`Summarize all activities and connections for ${selectedEntity.name}`);
                  navigate('/ai');
                }}
                className="w-full py-1.5 px-3 rounded bg-forge-cyan/15 hover:bg-forge-cyan/25 text-forge-cyan border border-forge-cyan/30 text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Ask AI About This Entity</span>
              </button>
              <button
                onClick={() => navigate('/timeline')}
                className="w-full py-1.5 px-3 rounded bg-forge-card hover:bg-forge-cardHover border border-forge-border text-white text-xs font-medium flex items-center justify-center space-x-1.5 transition"
              >
                <Clock className="w-3.5 h-3.5 text-forge-amber" />
                <span>View in Suspect Timeline</span>
              </button>
            </div>
          </div>
        ) : selectedAlert ? (
          /* 2. Selected Risk Alert */
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-forge-rose" />
              <div>
                <h3 className="text-sm font-bold text-white">{selectedAlert.title}</h3>
                <span className="text-[10px] font-mono text-forge-rose uppercase">
                  SEVERITY: {selectedAlert.severity}
                </span>
              </div>
            </div>
            <p className="text-xs text-forge-text-secondary bg-forge-card p-3 rounded border border-forge-border leading-relaxed">
              {selectedAlert.description}
            </p>
            <div className="space-y-2 pt-2">
              <button
                onClick={() => navigate('/graph')}
                className="w-full py-1.5 px-3 rounded bg-forge-cyan text-black font-bold text-xs flex items-center justify-center space-x-1.5"
              >
                <span>View Alert in Graph</span>
              </button>
            </div>
          </div>
        ) : selectedEvidence ? (
          /* 3. Selected Evidence Exhibit */
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center space-x-2">
              <FileSearch className="w-5 h-5 text-forge-cyan" />
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">{selectedEvidence.title}</h3>
                <span className="text-[10px] font-mono text-forge-cyan">
                  {selectedEvidence.type} · CONFIDENCE: {selectedEvidence.confidence}%
                </span>
              </div>
            </div>
            <div className="text-xs text-forge-text-secondary bg-forge-card p-3 rounded border border-forge-border leading-relaxed font-mono">
              {selectedEvidence.description}
            </div>
            <button
              onClick={() => openEvidenceModal(selectedEvidence)}
              className="w-full py-1.5 px-3 rounded bg-forge-cyan hover:bg-forge-cyanLight text-black font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Full Exhibit Dossier</span>
            </button>
          </div>
        ) : (
          /* 4. Empty State Placeholder */
          <div className="py-12 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-forge-card border border-forge-border flex items-center justify-center mx-auto text-forge-text-muted">
              <User className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-white">No Item Selected</div>
            <p className="text-[11px] text-forge-text-muted max-w-[200px] mx-auto leading-normal">
              Click on any suspect node in the Network Graph, timeline event, or evidence exhibit to inspect details here.
            </p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-forge-border bg-forge-card/40 font-mono text-[10px] text-forge-text-muted flex justify-between">
        <span>INSPECTOR READY</span>
        <span className="text-forge-cyan">LIVE CONSOLE</span>
      </div>
    </aside>
  );
};
