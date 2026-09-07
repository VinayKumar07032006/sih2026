import React, { useState } from 'react';
import { 
  Printer, 
  X, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  Truck, 
  ExternalLink, 
  Copy, 
  Check, 
  FileText, 
  HardHat, 
  QrCode,
  Sparkles,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export const WorkOrderModal = ({ issue, onClose, onStatusUpdate, showToast }) => {
  const [copied, setCopied] = useState(false);
  const [assignedCrew, setAssignedCrew] = useState(issue.assignedTo || 'Zone 3 Asphalt Quick-Response Team');
  const [priorityNote, setPriorityNote] = useState('');

  if (!issue) return null;

  // Derive SLA & priority metadata
  const priority = issue.severity || 'HIGH';
  let slaHours = 24;
  let priorityBg = 'bg-amber-500 text-white';
  let priorityBorder = 'border-amber-400';
  let priorityTitle = 'HIGH PRIORITY (SLA: 24h)';

  if (priority === 'CRITICAL') {
    slaHours = 12;
    priorityBg = 'bg-rose-600 text-white';
    priorityBorder = 'border-rose-500';
    priorityTitle = 'EMERGENCY CRITICAL (SLA: 12h Turnaround)';
  } else if (priority === 'MEDIUM') {
    slaHours = 48;
    priorityBg = 'bg-blue-600 text-white';
    priorityBorder = 'border-blue-500';
    priorityTitle = 'STANDARD MEDIUM (SLA: 48h)';
  } else if (priority === 'LOW') {
    slaHours = 168;
    priorityBg = 'bg-slate-600 text-white';
    priorityBorder = 'border-slate-500';
    priorityTitle = 'ROUTINE SCHEDULED (SLA: 7 Days)';
  }

  // Work Order Ref ID
  const workOrderId = `WO-2026-${issue.id ? issue.id.replace(/[^a-zA-Z0-9]/g, '') : '9842'}`;
  const coordinates = issue.latitude && issue.longitude 
    ? `${issue.latitude.toFixed(5)}, ${issue.longitude.toFixed(5)}`
    : '12.97160, 77.59460';

  const mapsUrl = `https://www.google.com/maps?q=${coordinates.replace(' ', '')}`;

  // Materials & Equipment recommendation based on defect type
  const getEquipmentList = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('pothole')) {
      return [
        { name: 'Cold-Mix Bitumen Asphalt (4x 25kg Bags)', qty: '100 kg', checked: true },
        { name: 'Pre-patch Tack Coat Emulsion', qty: '10 Liters', checked: true },
        { name: 'Vibratory Plate Compactor / Hand Roller', qty: '1 Unit', checked: true },
        { name: 'Traffic Safety Barricades & High-Vis Cones', qty: '6 Cones', checked: true },
      ];
    } else if (t.includes('water') || t.includes('drain')) {
      return [
        { name: 'High-Volume Submersible Sump Pump & Hose', qty: '1 Rig', checked: true },
        { name: 'Storm Drain De-silting Rods & Claws', qty: '1 Set', checked: true },
        { name: 'Gully Grating Replacement Spares', qty: '2 Grates', checked: true },
        { name: 'Reflective Hazard Warning Flasher', qty: '2 Units', checked: true },
      ];
    } else if (t.includes('divider') || t.includes('guardrail') || t.includes('barrier')) {
      return [
        { name: 'Pre-cast Concrete Median Blocks / Guardrail', qty: '3 Sections', checked: true },
        { name: 'Hydraulic Hoist Truck / Anchor Bolts', qty: '1 Rig', checked: true },
        { name: 'Retro-Reflective Yellow Prismatic Sheeting', qty: '10 Meters', checked: true },
        { name: 'Workzone Traffic Flare Indicators', qty: '4 Units', checked: true },
      ];
    } else {
      return [
        { name: 'Rapid Curing Road Repair Mortar & Sealant', qty: '50 kg', checked: true },
        { name: 'Surface Preparation Blower & Wire Brushes', qty: '1 Set', checked: true },
        { name: 'Traffic Safety Cones & High-Vis Flags', qty: '4 Cones', checked: true },
        { name: 'Hand Tamping Tool & Level Gauge', qty: '1 Set', checked: true },
      ];
    }
  };

  const equipmentList = getEquipmentList(issue.type);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`Municipal Work Order: ${workOrderId} - ${issue.type} at ${issue.location} (${coordinates}). Coordinates: ${mapsUrl}`);
    setCopied(true);
    if (showToast) showToast('Work Order dispatch summary copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDispatch = () => {
    if (onStatusUpdate) {
      onStatusUpdate(issue.id, 'Assigned', assignedCrew);
    }
    if (showToast) showToast(`Work order ${workOrderId} officially dispatched to ${assignedCrew}!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 my-auto print:border-none print:shadow-none print:max-w-none print:rounded-none print:m-0">
        
        {/* MODAL ACTION BAR (Hidden in print) */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-blue-400">{workOrderId}</div>
              <div className="text-xs font-semibold text-slate-200">Official Municipal Work Order Generator</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
              title="Copy dispatch summary"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE WORK ORDER CONTAINER */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-800 print:p-8 print:space-y-4 printable-work-order">
          
          {/* 1. OFFICIAL MUNICIPAL HEADER */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center font-black leading-none p-1.5 shrink-0 shadow-md">
                <span className="text-[9px] uppercase tracking-wider text-slate-300">GOVT OF</span>
                <span className="text-base font-black tracking-tight text-white">PWD</span>
                <span className="text-[8px] font-mono text-blue-400">URBAN</span>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase">
                  Municipal Corporation & Public Works
                </h1>
                <p className="text-xs font-semibold text-slate-600">
                  Urban Road Infrastructure Maintenance Division • Rapid Incident Response
                </p>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Automated Mobile Transit Sensing Dispatch System (AI-Edge Bus Telemetry)
                </div>
              </div>
            </div>

            {/* Work Order Docket Ref & Barcode simulation */}
            <div className="text-right flex flex-col items-start sm:items-end font-mono">
              <div className="text-xs text-slate-500 font-semibold uppercase">Work Order Docket</div>
              <div className="text-base font-black text-blue-600">{workOrderId}</div>
              <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                <span>Generated: {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>

          {/* 2. PRIORITY & SLA EMERGENCY BANNER */}
          <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${priorityBg} shadow-xs`}>
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-white shrink-0" />
              <div>
                <div className="text-xs font-black uppercase tracking-wider">{priorityTitle}</div>
                <div className="text-[11px] text-white/90">
                  Target Response Window: Must be completed within <strong>{slaHours} Hours</strong> of dispatch.
                </div>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-xs px-3 py-1 rounded-lg text-xs font-mono font-bold text-white uppercase shrink-0">
              Status: {issue.status || 'Assigned to Crew'}
            </div>
          </div>

          {/* 3. CORE TELEMETRY & INCIDENT DETAILS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left: Defect Specifics */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 pb-1.5 flex items-center justify-between">
                <span>Incident & Telemetry Dossier</span>
                <span className="font-mono text-blue-600">ID: {issue.id}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Defect Category</span>
                  <span className="font-bold text-slate-900 text-sm">{issue.type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">AI Edge Confidence</span>
                  <span className="font-bold font-mono text-emerald-600 text-sm">
                    {(issue.confidence * 100).toFixed(1)}% (Verified)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Sensing Bus Unit</span>
                  <span className="font-mono font-bold text-blue-600">{issue.busId || 'BUS-004 (Front Optical)'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Severity Rating</span>
                  <span className="font-bold text-rose-600">{priority}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Precise Physical Location</span>
                <div className="flex items-start gap-1.5 text-xs text-slate-900 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>{issue.location || 'Outer Ring Road, Sector 4 Junction'}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono text-[11px] text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    GPS: {coordinates}
                  </span>
                  <a 
                    href={mapsUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1 print:hidden"
                  >
                    Open GPS Map <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {issue.description && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">AI Diagnostic Note</span>
                  <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 italic leading-relaxed">
                    "{issue.description}"
                  </p>
                </div>
              )}
            </div>

            {/* Right: Photographic Evidence */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3 flex flex-col">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 pb-1.5 flex items-center justify-between">
                <span>AI Camera Visual Evidence</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200 font-semibold">
                  Edge Timestamped
                </span>
              </div>

              <div className="flex-1 rounded-xl overflow-hidden border border-slate-300 relative bg-slate-200 min-h-[160px] flex items-center justify-center">
                {issue.evidenceImage ? (
                  <img 
                    src={issue.evidenceImage} 
                    alt="Defect Evidence" 
                    className="w-full h-48 object-cover print:h-44" 
                  />
                ) : (
                  <div className="text-slate-400 text-xs font-semibold">No Image Available</div>
                )}
                <div className="absolute top-2 right-2 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-xs">
                  {issue.type} • {coordinates}
                </div>
              </div>

              <div className="text-[11px] text-slate-500 bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between">
                <span>Verification Method:</span>
                <span className="font-semibold text-slate-800">YOLOv8 Mobile Edge Vision</span>
              </div>
            </div>
          </div>

          {/* 4. CREW DISPATCH & EQUIPMENT REQUISITION */}
          <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <HardHat className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Assigned Crew & Material Requisition Checklist
                </h3>
              </div>
              <div className="text-xs text-slate-500 font-semibold">
                Assigned Unit: <span className="text-blue-600 font-bold">{assignedCrew}</span>
              </div>
            </div>

            {/* Checklist items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {equipmentList.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      defaultChecked={item.checked} 
                      className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500" 
                    />
                    <span className="font-medium text-slate-800">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-600 text-[11px] shrink-0 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {item.qty}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. FIELD CREW SIGN-OFF & VERIFICATION STAMP */}
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50/50 space-y-4">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Field Completion Verification & Quality Sign-Off
            </div>

            <div className="grid grid-cols-3 gap-4 text-xs">
              {/* Field Crew Lead */}
              <div className="space-y-6">
                <div className="text-[11px] text-slate-500 font-semibold">Repair Crew Foreman</div>
                <div className="border-b border-slate-400 h-6"></div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Sign & Name</span>
                  <span>Date: ___/___/2026</span>
                </div>
              </div>

              {/* Quality Inspector */}
              <div className="space-y-6">
                <div className="text-[11px] text-slate-500 font-semibold">PWD Quality Inspector</div>
                <div className="border-b border-slate-400 h-6"></div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Inspection Stamp</span>
                  <span>Date: ___/___/2026</span>
                </div>
              </div>

              {/* Resolution Confirmation Checkbox */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div className="text-[11px] font-bold text-slate-800">Job Resolution Checklist</div>
                <div className="space-y-1 text-[10px] text-slate-600">
                  <div>[ ] Defect Cleared & Leveled</div>
                  <div>[ ] Post-Repair Photo Uploaded</div>
                  <div>[ ] Barricades Removed</div>
                </div>
              </div>
            </div>
          </div>

          {/* 6. MODAL FOOTER BUTTONS (Hidden in print) */}
          <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Work Order ready for printing or instant field crew dispatch.</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
              >
                <Printer className="w-4 h-4 text-slate-600" /> Print Ticket
              </button>

              <button
                type="button"
                onClick={handleDispatch}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
              >
                <Truck className="w-4 h-4" /> Dispatch to Repair Crew
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
