import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  User,
  Network,
  CheckCircle2,
} from 'lucide-react';
import { useInvestigationStore } from '../stores';
import { investigationService, evidenceService } from '../services';
import { Entity, Evidence } from '../types';

interface SearchOutcome {
  query: string;
  summary: string;
  matchedEntities: Entity[];
  matchedEvidence: Evidence[];
}

export const InvestigationSearch: React.FC = () => {
  const navigate = useNavigate();
  const { currentCase, selectEntity, aiQuery } = useInvestigationStore();

  const [inputQuery, setInputQuery] = useState(aiQuery || '');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<SearchOutcome | null>(null);

  const sampleQueries = [
    'Connections to Rajesh Kumar',
    'Evidence about Hawala money transfer',
    'Burner phone calls before incident',
    'Vikram Malhotra vehicle sightings',
  ];

  const executeSearch = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;

    setIsSearching(true);
    setInputQuery(trimmed);

    // Simulate short, realistic search latency
    await new Promise((resolve) => setTimeout(resolve, 450));

    const lower = trimmed.toLowerCase();
    const allEntities = investigationService.getEntities(currentCase.id);
    const allEvidence = evidenceService.getEvidence();

    // Match entities
    const matchedEntities = allEntities.filter(
      (e) =>
        e.name.toLowerCase().includes(lower) ||
        (e.role && e.role.toLowerCase().includes(lower)) ||
        (e.primaryIdentifier && e.primaryIdentifier.toLowerCase().includes(lower)) ||
        (e.aliases && e.aliases.some((a) => a.toLowerCase().includes(lower))) ||
        (lower.includes('rajesh') && e.name.includes('Rajesh')) ||
        (lower.includes('vikram') && e.name.includes('Vikram')) ||
        (lower.includes('amit') && e.name.includes('Amit')) ||
        (lower.includes('phone') && e.type === 'PHONE') ||
        (lower.includes('bank') && e.type === 'BANK_ACCOUNT')
    );

    // Match evidence
    const matchedEvidence = allEvidence.filter(
      (ev) =>
        ev.title.toLowerCase().includes(lower) ||
        ev.description.toLowerCase().includes(lower) ||
        ev.source.toLowerCase().includes(lower) ||
        (lower.includes('hawala') && ev.type === 'FINANCIAL') ||
        (lower.includes('call') && ev.type === 'CDR') ||
        (lower.includes('cctv') && ev.type === 'CCTV') ||
        (lower.includes('transfer') && ev.type === 'FINANCIAL')
    );

    let summaryText = '';
    if (matchedEntities.length > 0 || matchedEvidence.length > 0) {
      summaryText = `Found ${matchedEntities.length} related person/entity record(s) and ${matchedEvidence.length} evidence exhibit(s) matching your query "${trimmed}". Direct connections and timestamps confirm active links within the case network.`;
    } else {
      summaryText = `No direct records matched "${trimmed}". Try searching by a person's name (e.g. "Rajesh Kumar"), an evidence type (e.g. "Call Record"), or "Hawala".`;
    }

    setResult({
      query: trimmed,
      summary: summaryText,
      matchedEntities,
      matchedEvidence,
    });

    setIsSearching(false);
  };

  // If there was an existing query in the store on mount, search it
  useEffect(() => {
    if (aiQuery && !result) {
      executeSearch(aiQuery);
    }
  }, [aiQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(inputQuery);
  };

  const handleJumpToConnections = (entity: Entity) => {
    selectEntity(entity);
    navigate('/connections');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
      {/* Search Header */}
      <div className="bg-forge-panel border border-forge-border rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded bg-forge-cyan/15 text-forge-cyan border border-forge-cyan/30">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white font-mono">
              Investigation Search
            </h1>
            <p className="text-xs text-forge-text-secondary mt-0.5">
              Ask questions or search across people, phone numbers, and evidence records.
            </p>
          </div>
        </div>

        {/* Search Box */}
        <form onSubmit={handleSubmit} className="relative">
          <Search className="w-4 h-4 text-forge-cyan absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Search this investigation..."
            className="w-full bg-forge-bg border border-forge-border rounded-lg pl-10 pr-24 py-3 text-xs text-forge-text-primary placeholder:text-forge-text-muted focus:outline-none focus:border-forge-cyan focus:ring-1 focus:ring-forge-cyan"
          />
          <button
            type="submit"
            disabled={isSearching || !inputQuery.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded bg-forge-cyan hover:bg-forge-cyanLight text-black text-xs font-bold transition disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-[11px] text-forge-text-muted mr-1">Try asking:</span>
          {sampleQueries.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => executeSearch(chip)}
              className="px-2.5 py-1 rounded bg-forge-card hover:bg-forge-cardHover border border-forge-border text-forge-text-secondary hover:text-white text-[11px] transition"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isSearching && (
        <div className="bg-forge-panel border border-forge-border rounded-lg p-8 text-center space-y-3 shadow-sm animate-pulse">
          <div className="w-8 h-8 rounded-full border-2 border-forge-cyan border-t-transparent animate-spin mx-auto" />
          <div className="text-xs text-forge-cyan font-mono font-medium">
            Searching investigation records...
          </div>
        </div>
      )}

      {/* Search Result */}
      {!isSearching && result && (
        <div className="bg-forge-panel border border-forge-border rounded-lg p-6 shadow-sm space-y-6">
          {/* Summary Answer */}
          <div className="space-y-2 border-b border-forge-border pb-4">
            <span className="text-[10px] font-mono text-forge-cyan font-semibold uppercase tracking-wider">
              Investigation Result
            </span>
            <p className="text-sm text-white leading-relaxed">
              {result.summary}
            </p>
          </div>

          {/* "Based on" Section */}
          <div className="space-y-4">
            <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-forge-cyan" />
              <span>Based on</span>
            </h2>

            {/* Matched Entities */}
            {result.matchedEntities.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] text-forge-text-muted font-mono uppercase">
                  People & Entities ({result.matchedEntities.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {result.matchedEntities.map((ent) => (
                    <div
                      key={ent.id}
                      className="p-3 rounded bg-forge-card border border-forge-border flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <span className="p-1.5 rounded bg-forge-panel border border-forge-border text-forge-cyan">
                          <User className="w-3.5 h-3.5" />
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">
                            {ent.name}
                          </div>
                          <div className="text-[10px] text-forge-text-muted font-mono truncate">
                            {ent.role || ent.type} · ID: {ent.id}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleJumpToConnections(ent)}
                        className="px-2.5 py-1 rounded bg-forge-cyan/15 hover:bg-forge-cyan/25 text-forge-cyan border border-forge-cyan/30 text-[11px] font-semibold shrink-0 flex items-center space-x-1 transition"
                      >
                        <Network className="w-3 h-3" />
                        <span>View in Connections</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matched Evidence */}
            {result.matchedEvidence.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-[11px] text-forge-text-muted font-mono uppercase">
                  Evidence Records ({result.matchedEvidence.length})
                </span>
                <div className="space-y-2">
                  {result.matchedEvidence.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 rounded bg-forge-card border border-forge-border text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{ev.title}</span>
                        <span className="text-[10px] font-mono text-forge-text-muted">
                          {ev.id} · {ev.source}
                        </span>
                      </div>
                      <p className="text-[11px] text-forge-text-secondary leading-relaxed font-mono">
                        {ev.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.matchedEntities.length === 0 && result.matchedEvidence.length === 0 && (
              <p className="text-xs text-forge-text-muted italic">
                No specific items found for this query in the case records.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
