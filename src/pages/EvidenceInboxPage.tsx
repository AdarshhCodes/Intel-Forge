import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Inbox,
  FileText,
  Video,
  PhoneCall,
  DollarSign,
  Mic,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useInvestigationStore } from '../stores';
import { Evidence, EvidenceType, VerificationStatus } from '../types';

interface PresetTemplate {
  name: string;
  type: EvidenceType;
  title: string;
  source: string;
  content: string;
  confidence: number;
  extractedEntities: { name: string; type: string }[];
}

const DEMO_TEMPLATES: PresetTemplate[] = [
  {
    name: 'Sample CCTV Sighting',
    type: 'CCTV',
    title: 'CCTV Cam-04: Rohini Toll Booth Sighting',
    source: 'Delhi Traffic Police CCTV Feed (NH-44)',
    content:
      'Black Mahindra Scorpio (DL-08-AB-9921) captured crossing at 23:42 hrs. Driver visually matches Vikram Malhotra (POI-02). Passenger seen handing parcel to driver.',
    confidence: 68,
    extractedEntities: [
      { name: 'Vikram Malhotra', type: 'PERSON' },
      { name: 'DL-08-AB-9921', type: 'VEHICLE' },
      { name: 'Rohini Toll Plaza', type: 'LOCATION' },
    ],
  },
  {
    name: 'Sample Audio Wiretap',
    type: 'AUDIO',
    title: 'Wiretap Intercept: Target Line +91-98101-99882',
    source: 'Authorized Intercept Warrant W-2024-88',
    content:
      'Speaker 1 (identified as Rajesh Kumar): "Consignment arrives at Chandni Chowk godown by midnight. Transfer the 25 lakhs through Amit Sharma to HDFC account 40992819."',
    confidence: 89,
    extractedEntities: [
      { name: 'Rajesh Kumar', type: 'PERSON' },
      { name: 'Amit Sharma', type: 'PERSON' },
      { name: '+91-98101-99882', type: 'PHONE' },
      { name: 'Chandni Chowk Godown', type: 'LOCATION' },
      { name: 'HDFC-40992819', type: 'BANK_ACCOUNT' },
    ],
  },
  {
    name: 'Sample FIR Document',
    type: 'FIR',
    title: 'Supplementary FIR No. 342/24 (Special Cell)',
    source: 'Cyber & Narcotics Crime Branch, Special Cell',
    content:
      'Statement of key witness confirming covert money mules operating under shell company Golden Horizon Exim. Managed by suspect Vikram Malhotra and funded from Dubai accounts.',
    confidence: 94,
    extractedEntities: [
      { name: 'Vikram Malhotra', type: 'PERSON' },
      { name: 'Golden Horizon Exim', type: 'ORGANIZATION' },
      { name: 'FIR-342/24', type: 'DOCUMENT' },
    ],
  },
  {
    name: 'Sample Bank Transfer Log',
    type: 'FINANCIAL',
    title: 'Suspicious Transaction Report: Hawala Node TX-8821',
    source: 'Financial Intelligence Unit (FIU-IND) Gateway',
    content:
      'Rapid sequential transfer of INR 45,00,000 split across 6 intermediary accounts within 4 minutes, culminating into beneficiary account belonging to Rajesh Kumar.',
    confidence: 62,
    extractedEntities: [
      { name: 'Rajesh Kumar', type: 'PERSON' },
      { name: 'INR 45,00,000 Hawala Transfer', type: 'TRANSACTION' },
    ],
  },
];

export const EvidenceInboxPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentCase, addEvidenceAction } = useInvestigationStore();

  const [selectedType, setSelectedType] = useState<EvidenceType>('FIR');
  const [title, setTitle] = useState('');
  const [source, setSource] = useState('');
  const [content, setContent] = useState('');
  const [confidence, setConfidence] = useState(78);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto-fill template helper
  const handleApplyTemplate = (tmpl: PresetTemplate) => {
    setSelectedType(tmpl.type);
    setTitle(tmpl.title);
    setSource(tmpl.source);
    setContent(tmpl.content);
    setConfidence(tmpl.confidence);
  };

  // Submission handler
  const handleIngestEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const needsReview = confidence < 75;
    const verificationStatus: VerificationStatus = needsReview ? 'AI_SUGGESTED' : 'HUMAN_VERIFIED';

    const newEvidence: Evidence = {
      id: `EV-${Date.now().toString().slice(-4)}`,
      title: title.trim(),
      type: selectedType,
      source: source.trim() || 'Field Investigation Unit',
      confidence,
      timestamp: new Date().toISOString(),
      description: content.trim(),
      contentSnippet: content.trim().substring(0, 160) + '...',
      verificationStatus,
      entityIds: ['IF-P-001'], // Connected to main case suspect
      hash: `sha256_${Math.random().toString(36).substring(2, 12)}`,
      chainOfCustody: [
        {
          step: 1,
          officer: 'Insp. Vikramaditya Rathore',
          badgeNumber: 'DL-88219',
          agency: 'Cyber Crime Investigation Unit',
          action: 'Initial Evidence Ingestion & Parsing',
          timestamp: new Date().toISOString(),
          hashSignature: `sig_${Math.random().toString(36).substring(2, 8)}`,
        },
      ],
      metadata: {
        rawLength: content.length,
        intakeChannel: 'Evidence Inbox Form',
      },
    };

    await addEvidenceAction(newEvidence);
    setIsProcessing(false);

    if (needsReview) {
      setSuccessMessage(
        `Exhibit ingested! Confidence is ${confidence}% (< 75%), so it was sent to the Review Gate (HITL) for officer approval.`
      );
    } else {
      setSuccessMessage(
        `Exhibit ingested successfully with high confidence (${confidence}%) and added directly to the case network!`
      );
    }

    // Reset form
    setTitle('');
    setSource('');
    setContent('');
  };

  const typeConfig: Record<
    EvidenceType,
    { label: string; icon: React.ElementType; color: string; bg: string }
  > = {
    FIR: { label: 'FIR / Document', icon: FileText, color: 'text-forge-cyan', bg: 'bg-forge-cyan/10' },
    CCTV: { label: 'CCTV Footage', icon: Video, color: 'text-forge-amber', bg: 'bg-forge-amber/10' },
    CDR: { label: 'Call Log (CDR)', icon: PhoneCall, color: 'text-forge-emerald', bg: 'bg-forge-emerald/10' },
    FINANCIAL: { label: 'Bank / Hawala', icon: DollarSign, color: 'text-forge-purple', bg: 'bg-forge-purple/10' },
    AUDIO: { label: 'Audio Wiretap', icon: Mic, color: 'text-forge-rose', bg: 'bg-forge-rose/10' },
    DOCUMENT: { label: 'Doc / Report', icon: FileText, color: 'text-forge-indigo', bg: 'bg-forge-indigo/10' },
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-forge-panel border border-forge-border p-5 rounded-lg shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded bg-forge-cyan/15 text-forge-cyan border border-forge-cyan/30">
              <Inbox className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white font-mono tracking-wide">
              EVIDENCE INPUT INBOX
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-forge-cyan/20 text-forge-cyan font-mono font-semibold">
              STEP 1: INTAKE
            </span>
          </div>
          <p className="text-xs text-forge-text-secondary mt-1.5 max-w-2xl">
            Drop or submit raw investigative data (CCTV, audio wiretaps, FIR documents, and call records).
            The AI automatically extracts entities and routes uncertain evidence to the Review Gate.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/review-gate')}
            className="flex items-center space-x-1.5 px-3 py-2 rounded bg-forge-amber/15 text-forge-amber border border-forge-amber/30 text-xs font-medium hover:bg-forge-amber/25 transition"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Open Review Gate (HITL)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 rounded-lg bg-forge-emerald/15 border border-forge-emerald/40 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2.5 text-forge-emerald font-medium">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-forge-text-muted hover:text-white text-xs px-2 py-1 font-mono"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Main Grid: Upload Form + Demo Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Input Form */}
        <div className="lg:col-span-2 bg-forge-panel border border-forge-border rounded-lg p-5 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-forge-border pb-3">
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center space-x-2">
              <UploadCloud className="w-4 h-4 text-forge-cyan" />
              <span>Submit New Evidence Exhibit</span>
            </h2>
            <span className="text-[11px] text-forge-text-muted font-mono">
              ACTIVE CASE: <strong className="text-forge-cyan">{currentCase.code}</strong>
            </span>
          </div>

          <form onSubmit={handleIngestEvidence} className="space-y-4">
            {/* Evidence Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-forge-text-secondary uppercase mb-2">
                Select Evidence Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(Object.keys(typeConfig) as EvidenceType[]).map((typeKey) => {
                  const cfg = typeConfig[typeKey];
                  const Icon = cfg.icon;
                  const isSelected = selectedType === typeKey;
                  return (
                    <button
                      key={typeKey}
                      type="button"
                      onClick={() => setSelectedType(typeKey)}
                      className={`flex flex-col items-center justify-center p-3 rounded-md border text-center transition ${
                        isSelected
                          ? 'border-forge-cyan bg-forge-cyan/15 text-white font-semibold shadow-sm'
                          : 'border-forge-border bg-forge-card text-forge-text-secondary hover:text-white hover:bg-forge-cardHover'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-forge-cyan' : cfg.color}`} />
                      <span className="text-[11px]">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Exhibit Title */}
            <div>
              <label className="block text-xs font-semibold text-forge-text-secondary uppercase mb-1">
                Exhibit Title / File Name
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. CCTV Toll Booth Sighting at 23:42 hrs"
                className="w-full bg-forge-bg border border-forge-border rounded px-3 py-2 text-xs text-forge-text-primary placeholder:text-forge-text-muted focus:outline-none focus:border-forge-cyan focus:ring-1 focus:ring-forge-cyan"
              />
            </div>

            {/* Source Agency */}
            <div>
              <label className="block text-xs font-semibold text-forge-text-secondary uppercase mb-1">
                Evidence Source / Agency
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. Delhi Traffic Police CCTV Feed / Cyber Cell Intercept"
                className="w-full bg-forge-bg border border-forge-border rounded px-3 py-2 text-xs text-forge-text-primary placeholder:text-forge-text-muted focus:outline-none focus:border-forge-cyan"
              />
            </div>

            {/* Raw Transcript or OCR Content */}
            <div>
              <label className="block text-xs font-semibold text-forge-text-secondary uppercase mb-1">
                Evidence Text / Transcript / OCR Extract
              </label>
              <textarea
                required
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste the statement, call transcript, vehicle sighting report, or transaction memo here..."
                className="w-full bg-forge-bg border border-forge-border rounded p-3 text-xs text-forge-text-primary placeholder:text-forge-text-muted focus:outline-none focus:border-forge-cyan font-mono"
              />
            </div>

            {/* AI Confidence Slider */}
            <div className="bg-forge-card p-3 rounded border border-forge-border">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-forge-text-secondary flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-forge-amber" />
                  <span>Estimated AI Parsing Confidence:</span>
                </span>
                <span
                  className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                    confidence >= 75
                      ? 'bg-forge-emerald/20 text-forge-emerald'
                      : 'bg-forge-amber/20 text-forge-amber'
                  }`}
                >
                  {confidence}% {confidence >= 75 ? '(Auto-Commit to Graph)' : '(Routes to Review Gate)'}
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="99"
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <p className="text-[10px] text-forge-text-muted mt-1 font-mono">
                Items with confidence below 75% require mandatory Human-in-the-Loop review before entering the main graph.
              </p>
            </div>

            {/* Ingest Action Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-2.5 rounded bg-forge-cyan hover:bg-forge-cyanLight text-black font-bold text-xs uppercase tracking-wider transition flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing & Extracting Entities...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Process & Ingest Evidence</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Col: Quick Demo Preset Templates */}
        <div className="space-y-4">
          <div className="bg-forge-panel border border-forge-border rounded-lg p-5 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center space-x-2 border-b border-forge-border pb-2">
              <Sparkles className="w-3.5 h-3.5 text-forge-cyan" />
              <span>1-Click Test Templates</span>
            </h3>
            <p className="text-xs text-forge-text-secondary">
              Click any sample below to immediately test simulated multimodal extraction:
            </p>

            <div className="space-y-2.5 pt-1">
              {DEMO_TEMPLATES.map((tmpl, idx) => (
                <div
                  key={idx}
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="p-3 rounded bg-forge-card hover:bg-forge-cardHover border border-forge-border hover:border-forge-cyan/50 cursor-pointer transition group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white group-hover:text-forge-cyan transition">
                      {tmpl.name}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        tmpl.confidence >= 75
                          ? 'bg-forge-emerald/20 text-forge-emerald'
                          : 'bg-forge-amber/20 text-forge-amber'
                      }`}
                    >
                      {tmpl.confidence}% Conf.
                    </span>
                  </div>
                  <p className="text-[11px] text-forge-text-muted line-clamp-2">
                    {tmpl.content}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {tmpl.extractedEntities.map((ent, eIdx) => (
                      <span
                        key={eIdx}
                        className="text-[9px] px-1.5 py-0.2 rounded bg-forge-panel border border-forge-border text-forge-text-secondary font-mono"
                      >
                        {ent.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Architecture Reference Box */}
          <div className="bg-forge-panel border border-forge-border rounded-lg p-4 font-mono text-[11px] text-forge-text-secondary space-y-2">
            <div className="flex items-center space-x-1.5 text-forge-cyan font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>INTEGRITY PIPELINE (PPT SLIDE 3)</span>
            </div>
            <p className="text-[10px] text-forge-text-muted leading-relaxed">
              1. <strong>Intake:</strong> CCTV / Audio / FIRs / CDR logs<br />
              2. <strong>AI NLP/CV:</strong> Auto-extract suspects & accounts<br />
              3. <strong>Data Gate:</strong> High conf. → Graph / Low conf. → HITL review
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
