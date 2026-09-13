import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Folder,
  AlertTriangle,
  Clock,
  ArrowRight,
  Inbox,
  Network,
  Users,
  ShieldAlert,
} from 'lucide-react';
import { useInvestigationStore } from '../stores';
import { investigationService, alertService, evidenceService } from '../services';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentCase, selectEntity, historyEvents } = useInvestigationStore();

  const entities = investigationService.getEntities(currentCase.id);
  const evidenceList = evidenceService.getEvidence();
  const relationships = investigationService.getRelationships(currentCase.id);
  const alerts = alertService.getAlerts();

  const handleOpenAlert = (entityId?: string) => {
    if (entityId) {
      const entity = investigationService.getEntityById(entityId);
      if (entity) selectEntity(entity);
    }
    navigate('/connections');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto w-full space-y-6">
      {/* 1. Case Overview Header */}
      <div className="bg-forge-panel border border-forge-border rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-forge-border pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded bg-forge-cyan/15 text-forge-cyan border border-forge-cyan/30">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-white font-mono">
                  {currentCase.name}
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-forge-emerald/20 text-forge-emerald font-semibold">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-forge-text-secondary mt-0.5">
                Case ID: {currentCase.code} · Primary Investigation
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate('/evidence-inbox')}
              className="flex items-center space-x-1.5 px-3 py-2 rounded bg-forge-cyan hover:bg-forge-cyanLight text-black text-xs font-semibold transition"
            >
              <Inbox className="w-4 h-4" />
              <span>Add Evidence</span>
            </button>
            <button
              onClick={() => navigate('/connections')}
              className="flex items-center space-x-1.5 px-3 py-2 rounded bg-forge-card hover:bg-forge-cardHover border border-forge-border text-white text-xs font-semibold transition"
            >
              <Network className="w-4 h-4 text-forge-cyan" />
              <span>View Connections</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            onClick={() => navigate('/connections')}
            className="p-3 rounded bg-forge-card border border-forge-border hover:border-forge-cyan/50 cursor-pointer transition"
          >
            <div className="flex items-center justify-between text-xs text-forge-text-muted">
              <span>People & Entities</span>
              <Users className="w-3.5 h-3.5 text-forge-cyan" />
            </div>
            <div className="text-xl font-bold text-white font-mono mt-1">
              {entities.length}
            </div>
          </div>

          <div
            onClick={() => navigate('/evidence-inbox')}
            className="p-3 rounded bg-forge-card border border-forge-border hover:border-forge-cyan/50 cursor-pointer transition"
          >
            <div className="flex items-center justify-between text-xs text-forge-text-muted">
              <span>Evidence Items</span>
              <Inbox className="w-3.5 h-3.5 text-forge-cyan" />
            </div>
            <div className="text-xl font-bold text-white font-mono mt-1">
              {evidenceList.length}
            </div>
          </div>

          <div
            onClick={() => navigate('/connections')}
            className="p-3 rounded bg-forge-card border border-forge-border hover:border-forge-cyan/50 cursor-pointer transition"
          >
            <div className="flex items-center justify-between text-xs text-forge-text-muted">
              <span>Connections</span>
              <Network className="w-3.5 h-3.5 text-forge-cyan" />
            </div>
            <div className="text-xl font-bold text-white font-mono mt-1">
              {relationships.length}
            </div>
          </div>

          <div
            onClick={() => navigate('/reports')}
            className="p-3 rounded bg-forge-card border border-forge-border hover:border-forge-cyan/50 cursor-pointer transition"
          >
            <div className="flex items-center justify-between text-xs text-forge-text-muted">
              <span>Risk Alerts</span>
              <ShieldAlert className="w-3.5 h-3.5 text-forge-rose" />
            </div>
            <div className="text-xl font-bold text-forge-rose font-mono mt-1">
              {alerts.length}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column: Risk Alerts + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Alerts */}
        <div className="bg-forge-panel border border-forge-border rounded-lg p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-forge-border pb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-forge-rose" />
              <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Risk Alerts ({alerts.length})
              </h2>
            </div>
            <span className="text-[10px] text-forge-text-muted font-mono">
              Items needing attention
            </span>
          </div>

          {alerts.length === 0 ? (
            <div className="p-8 text-center text-xs text-forge-text-muted border border-dashed border-forge-border rounded">
              No active risk alerts at this time.
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => handleOpenAlert(alert.entityIds[0])}
                  className="p-3.5 rounded bg-forge-card hover:bg-forge-cardHover border border-forge-border cursor-pointer transition space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-white group-hover:text-forge-cyan transition">
                      {alert.title}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-forge-rose/20 text-forge-rose'
                          : 'bg-forge-amber/20 text-forge-amber'
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>

                  <p className="text-xs text-forge-text-secondary leading-relaxed">
                    {alert.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-forge-cyan">
                    <span className="font-mono text-forge-text-muted text-[10px]">
                      {alert.timestamp.split('T')[0]}
                    </span>
                    <span className="flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
                      <span>View in Connections</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-forge-panel border border-forge-border rounded-lg p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-forge-border pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-forge-cyan" />
              <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Recent Activity
              </h2>
            </div>
            <button
              onClick={() => navigate('/reports')}
              className="text-[10px] font-mono text-forge-cyan hover:underline"
            >
              Full History →
            </button>
          </div>

          {historyEvents.length === 0 ? (
            <div className="p-8 text-center text-xs text-forge-text-muted border border-dashed border-forge-border rounded">
              No recent activity recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {historyEvents.slice(0, 5).map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded bg-forge-card border border-forge-border text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{evt.action}</span>
                    <span className="text-[10px] font-mono text-forge-text-muted">
                      {evt.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-forge-text-secondary leading-relaxed">
                    {evt.description}
                  </p>
                  <div className="text-[10px] font-mono text-forge-text-muted">
                    By: {evt.actor}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
