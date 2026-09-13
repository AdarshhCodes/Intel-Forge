import React from 'react';
import {
  Network,
  User,
  Phone,
  CreditCard,
  MapPin,
  Car,
  Building,
  CheckCircle2,
  XCircle,
  Clock,
  X,
} from 'lucide-react';
import { useInvestigationStore } from '../stores';
import { CytoscapeCanvas } from '../components/graph/CytoscapeCanvas';
import { investigationService, timelineService } from '../services';
import { EntityType } from '../types';

export const Connections: React.FC = () => {
  const {
    currentCase,
    selectedEntity,
    selectEntity,
    verifyRelationshipAction,
    rejectRelationshipAction,
  } = useInvestigationStore();

  // Related connections for the selected entity
  const connectedLinks = selectedEntity
    ? investigationService.getRelationshipsForEntity(selectedEntity.id, currentCase.id)
    : [];

  // Chronological activity timeline for the selected entity
  const entityTimeline = selectedEntity
    ? timelineService.getTimeline({ entityId: selectedEntity.id, order: 'desc' })
    : [];

  const handleConfirmLink = async (relId: string) => {
    await verifyRelationshipAction(relId);
  };

  const handleRemoveLink = async (relId: string) => {
    await rejectRelationshipAction(relId, 'Removed by investigator during review');
  };

  const getEntityIcon = (type?: EntityType) => {
    switch (type) {
      case 'PERSON':
        return <User className="w-4 h-4 text-forge-cyan" />;
      case 'PHONE':
        return <Phone className="w-4 h-4 text-forge-amber" />;
      case 'BANK_ACCOUNT':
        return <CreditCard className="w-4 h-4 text-forge-emerald" />;
      case 'LOCATION':
        return <MapPin className="w-4 h-4 text-forge-rose" />;
      case 'VEHICLE':
        return <Car className="w-4 h-4 text-forge-indigo" />;
      case 'ORGANIZATION':
        return <Building className="w-4 h-4 text-forge-indigo" />;
      default:
        return <User className="w-4 h-4 text-forge-cyan" />;
    }
  };

  return (
    <div className="h-full w-full flex flex-col relative overflow-hidden bg-forge-bg select-none">
      {/* Top Controls Bar */}
      <div className="h-12 border-b border-forge-border bg-forge-panel px-5 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Network className="w-4 h-4 text-forge-cyan" />
            <span className="font-mono font-bold text-xs text-white uppercase tracking-wider">
              Connections Graph
            </span>
          </div>
          <span className="text-forge-border">|</span>
          <span className="text-xs text-forge-text-secondary hidden sm:inline">
            Click any person or node to inspect details, links, and timeline
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-[11px] font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-forge-emerald inline-block" />
            <span className="text-forge-emerald font-semibold">Confirmed</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 border-b-2 border-dashed border-forge-amber inline-block" />
            <span className="text-forge-amber font-semibold">Suggested (Needs Review)</span>
          </div>
        </div>
      </div>

      {/* Main Area: Cytoscape Graph Canvas + Side Inspector Panel */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Cytoscape Canvas */}
        <div className="flex-1 h-full w-full relative">
          <CytoscapeCanvas />

          {/* Quick Helper Overlay if nothing is selected */}
          {!selectedEntity && (
            <div className="absolute top-4 left-4 bg-forge-panel/90 border border-forge-border rounded px-3 py-1.5 text-xs text-forge-text-secondary pointer-events-none shadow-sm font-mono">
              💡 Tip: Click on a person or account to view their timeline and review connections
            </div>
          )}
        </div>

        {/* Selected Entity Side Panel */}
        {selectedEntity && (
          <aside className="w-96 bg-forge-panel border-l border-forge-border h-full flex flex-col z-20 shadow-panel overflow-hidden animate-fadeIn">
            {/* Panel Header */}
            <div className="p-4 border-b border-forge-border flex items-start justify-between bg-forge-card/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded bg-forge-card border border-forge-border">
                  {getEntityIcon(selectedEntity.type)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    {selectedEntity.name}
                  </h3>
                  <div className="text-[10px] font-mono text-forge-cyan uppercase mt-0.5">
                    {selectedEntity.role || selectedEntity.type} · ID: {selectedEntity.id}
                  </div>
                </div>
              </div>
              <button
                onClick={() => selectEntity(null)}
                className="text-forge-text-muted hover:text-white p-1"
                title="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Entity Information Box */}
              <div className="space-y-1.5 text-xs font-mono">
                <span className="text-[10px] text-forge-text-muted uppercase tracking-wider">
                  Details
                </span>
                <div className="p-2.5 rounded bg-forge-card border border-forge-border space-y-1.5 text-[11px]">
                  {selectedEntity.primaryIdentifier && (
                    <div className="flex justify-between border-b border-forge-border/40 pb-1">
                      <span className="text-forge-text-muted">Identifier:</span>
                      <span className="text-forge-cyan font-medium">
                        {selectedEntity.primaryIdentifier}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-b border-forge-border/40 pb-1">
                    <span className="text-forge-text-muted">Risk Level:</span>
                    <span
                      className={`font-bold ${
                        selectedEntity.riskScore >= 75
                          ? 'text-forge-rose'
                          : selectedEntity.riskScore >= 50
                          ? 'text-forge-amber'
                          : 'text-forge-emerald'
                      }`}
                    >
                      {selectedEntity.riskScore}/100 ({selectedEntity.riskScore >= 75 ? 'High' : 'Medium'})
                    </span>
                  </div>
                  {Object.entries(selectedEntity.metadata || {}).map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-forge-border/40 pb-1 last:border-0 last:pb-0">
                      <span className="text-forge-text-muted capitalize">{k}:</span>
                      <span className="text-white truncate max-w-[170px]">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connected Links & Human Review Action */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-forge-text-muted uppercase tracking-wider">
                    Connected Links ({connectedLinks.length})
                  </span>
                  <span className="text-[10px] text-forge-text-muted font-mono">
                    Review Actions
                  </span>
                </div>

                <div className="space-y-2">
                  {connectedLinks.length === 0 ? (
                    <p className="text-xs text-forge-text-muted italic">No direct connections recorded.</p>
                  ) : (
                    connectedLinks.map((rel) => {
                      const otherId = rel.sourceId === selectedEntity.id ? rel.targetId : rel.sourceId;
                      const otherEntity = investigationService.getEntityById(otherId);
                      const isConfirmed = rel.verificationStatus === 'HUMAN_VERIFIED';
                      const isSuggested = rel.verificationStatus === 'AI_SUGGESTED';

                      return (
                        <div
                          key={rel.id}
                          className="p-2.5 rounded bg-forge-card border border-forge-border space-y-2 text-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-semibold text-white">
                                {otherEntity?.name || otherId}
                              </div>
                              <div className="text-[10px] font-mono text-forge-cyan">
                                {rel.label || rel.type}
                              </div>
                            </div>

                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                                isConfirmed
                                  ? 'bg-forge-emerald/20 text-forge-emerald border border-forge-emerald/30'
                                  : 'bg-forge-amber/20 text-forge-amber border border-forge-amber/30'
                              }`}
                            >
                              {isConfirmed ? 'Confirmed' : 'Suggested'}
                            </span>
                          </div>

                          {/* Review Action: Confirm / Remove buttons for Suggested links */}
                          {isSuggested && (
                            <div className="pt-1 border-t border-forge-border/40 flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleRemoveLink(rel.id)}
                                className="px-2 py-1 rounded bg-forge-rose/15 hover:bg-forge-rose/25 text-forge-rose border border-forge-rose/30 text-[10px] font-semibold flex items-center space-x-1 transition"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>Remove</span>
                              </button>
                              <button
                                onClick={() => handleConfirmLink(rel.id)}
                                className="px-2.5 py-1 rounded bg-forge-emerald hover:bg-forge-emerald/90 text-black text-[10px] font-bold flex items-center space-x-1 transition"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Confirm</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Suspect Activity Timeline */}
              <div className="space-y-2">
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-forge-cyan" />
                  <span className="text-[10px] font-mono text-forge-text-muted uppercase tracking-wider">
                    Suspect Activity Timeline ({entityTimeline.length})
                  </span>
                </div>

                <div className="space-y-2">
                  {entityTimeline.length === 0 ? (
                    <p className="text-xs text-forge-text-muted italic bg-forge-card p-3 rounded border border-forge-border">
                      No recorded chronological events for this person yet.
                    </p>
                  ) : (
                    entityTimeline.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded bg-forge-card border border-forge-border text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">{item.title}</span>
                          <span className="text-[10px] font-mono text-forge-text-muted">
                            {item.timestamp.split('T')[0]}
                          </span>
                        </div>
                        <p className="text-[11px] text-forge-text-secondary leading-relaxed font-mono">
                          {item.description}
                        </p>
                        <div className="text-[10px] font-mono text-forge-text-muted">
                          Type: {item.type} {item.location ? `· ${item.location}` : ''}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
