import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Search, 
  MapPin, 
  Star, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  Sparkles, 
  UserCheck 
} from 'lucide-react';
import { REHAB_PROTOCOLS, SPECIALISTS } from '../../data/neuroData';
import { Specialist, RehabProtocol } from '../../types/neuro';

export const RehabDirectory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'protocols' | 'specialists'>('protocols');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCondition, setSelectedCondition] = useState<string>('All');
  const [expandedProtocolId, setExpandedProtocolId] = useState<string | null>(REHAB_PROTOCOLS[0].id);
  const [bookingSpecialist, setBookingSpecialist] = useState<Specialist | null>(null);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [intakeForm, setIntakeForm] = useState({
    patientName: '',
    email: '',
    phone: '',
    primaryCondition: 'Stroke Recovery',
    preferredDate: '',
    clinicalNotes: ''
  });

  const conditionOptions = ['All', 'Stroke', 'Concussion', 'ADHD', 'Burnout'];

  const filteredSpecialists = SPECIALISTS.filter(spec => {
    const matchesSearch = spec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spec.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      spec.institution.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCondition = selectedCondition === 'All' || 
      spec.specialties.some(s => s.toLowerCase().includes(selectedCondition.toLowerCase()));

    return matchesSearch && matchesCondition;
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSubmitted(true);
    setTimeout(() => {
      setBookingSubmitted(false);
      setBookingSpecialist(null);
      setIntakeForm({
        patientName: '',
        email: '',
        phone: '',
        primaryCondition: 'Stroke Recovery',
        preferredDate: '',
        clinicalNotes: ''
      });
    }, 2800);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold uppercase tracking-wider mb-2">
          <HeartHandshake className="w-4 h-4" />
          <span>Compassionate Care & Recovery Support</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Recovery & Specialist Directory
        </h1>
        <p className="text-slate-300 text-sm max-w-2xl mt-2 leading-relaxed">
          Gentle, supportive recovery routines and verified specialist connections for stroke survivors, trauma recovery, and anyone working through brain fog or executive burnout. You are not alone on this journey.
        </p>

        {/* Segmented Switcher */}
        <div className="flex items-center gap-2 mt-6 p-1 bg-slate-950 rounded-xl border border-slate-800 w-fit">
          <button
            onClick={() => setActiveTab('protocols')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'protocols'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Guided Recovery Routines
          </button>
          <button
            onClick={() => setActiveTab('specialists')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'specialists'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Find a Caring Specialist
          </button>
        </div>
      </div>

      {/* Protocols View */}
      {activeTab === 'protocols' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Evidence-Based Clinical Pathways</h2>
              <p className="text-xs text-slate-400">Structured multi-week rehabilitation regimens</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">
              4 Tiered Protocols
            </span>
          </div>

          <div className="space-y-4">
            {REHAB_PROTOCOLS.map(proto => {
              const isExpanded = expandedProtocolId === proto.id;

              return (
                <div
                  key={proto.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="font-mono text-cyan-400 font-semibold">{proto.badge}</span>
                        <span aria-hidden="true">·</span>
                        <span>{proto.durationWeeks} Weeks</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-400 font-medium">{proto.evidenceTier}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white">{proto.condition}</h3>
                      <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                        {proto.description}
                      </p>
                    </div>

                    <button
                      onClick={() => setExpandedProtocolId(isExpanded ? null : proto.id)}
                      className="py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-2 cursor-pointer self-start md:self-auto shrink-0"
                    >
                      <span>{isExpanded ? 'Hide Protocol Phases' : 'View Phased Pathway'}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Target Brain Areas */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                    <span className="text-slate-500">Target Neural Networks:</span>
                    {proto.targetAreas.map((area, i) => (
                      <span key={i} className="text-slate-300 font-medium bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {area}
                      </span>
                    ))}
                  </div>

                  {/* Phased Breakdown (Collapsible) */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-slate-800 space-y-3">
                      <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block">
                        Phased Clinical Milestones:
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {proto.phases.map(phase => (
                          <div key={phase.phase} className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                            <span className="text-xs font-bold text-white block">
                              {phase.title}
                            </span>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                              {phase.focus}
                            </p>
                            <div className="pt-2 border-t border-slate-800/80 space-y-1">
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Target Drills:</span>
                              {phase.exercises.map((ex, ei) => (
                                <div key={ei} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                                  <span className="text-cyan-400">•</span>
                                  <span>{ex}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Specialists Directory View */}
      {activeTab === 'specialists' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Vetted Neuro-Rehab Clinicians</h2>
              <p className="text-xs text-slate-400">Board-certified neurologists, neuropsychologists, and therapists</p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search clinician, specialty..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Condition Filter Controls */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
            <span>Filter Condition:</span>
            {conditionOptions.map(cond => (
              <button
                key={cond}
                onClick={() => setSelectedCondition(cond)}
                className={`px-3 py-1 rounded-md transition cursor-pointer ${
                  selectedCondition === cond
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                {cond}
              </button>
            ))}
          </div>

          {/* Specialist Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredSpecialists.map(spec => (
              <div
                key={spec.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-white">{spec.name}</h3>
                        {spec.verified && (
                          <span title="Verified Board Credentials">
                            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-cyan-400 font-medium block">{spec.title}</span>
                      <span className="text-[11px] text-slate-400 block">{spec.institution}</span>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800 text-xs text-amber-400 font-mono">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{spec.rating}</span>
                      <span className="text-slate-500">({spec.reviewCount})</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {spec.bio}
                  </p>

                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Clinical Specialties:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {spec.specialties.map((s, idx) => (
                        <span key={idx} className="text-[11px] bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{spec.location}</span>
                    </div>
                    <span className="font-mono text-white font-semibold">{spec.consultationFee}</span>
                  </div>

                  <button
                    onClick={() => setBookingSpecialist(spec)}
                    className="w-full py-2.5 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-cyan-500/10"
                  >
                    <Calendar className="w-4 h-4" />
                    Request Clinical Intake
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Consultation Modal */}
      {bookingSpecialist && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Clinical Telehealth Intake</span>
                <h3 className="text-lg font-bold text-white mt-0.5">Consult with {bookingSpecialist.name}</h3>
              </div>
              <button
                onClick={() => setBookingSpecialist(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-xs"
              >
                ✕
              </button>
            </div>

            {bookingSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">Intake Request Transmitted</h4>
                <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                  Your clinical history and cognitive challenge telemetry have been securely packaged. 
                  {bookingSpecialist.name}'s clinic coordinator will reach out within 24 hours to confirm appointment time.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Patient Full Name</label>
                  <input
                    type="text"
                    required
                    value={intakeForm.patientName}
                    onChange={e => setIntakeForm({ ...intakeForm, patientName: e.target.value })}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={intakeForm.email}
                      onChange={e => setIntakeForm({ ...intakeForm, email: e.target.value })}
                      placeholder="alex@example.com"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Preferred Date</label>
                    <input
                      type="date"
                      required
                      value={intakeForm.preferredDate}
                      onChange={e => setIntakeForm({ ...intakeForm, preferredDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Primary Condition / Recovery Focus</label>
                  <select
                    value={intakeForm.primaryCondition}
                    onChange={e => setIntakeForm({ ...intakeForm, primaryCondition: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Stroke Recovery">Post-Stroke Cognitive Recovery</option>
                    <option value="TBI & Concussion">Mild TBI / Post-Concussion Syndrome</option>
                    <option value="Adult ADHD">Adult ADHD & Executive Dysfunction</option>
                    <option value="Burnout & Neuro-Inflammation">Cognitive Burnout & Brain Fog</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Clinical Notes & Symptoms</label>
                  <textarea
                    rows={3}
                    value={intakeForm.clinicalNotes}
                    onChange={e => setIntakeForm({ ...intakeForm, clinicalNotes: e.target.value })}
                    placeholder="Briefly describe your cognitive symptoms, timeline of injury, or primary goals..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Intake Consultation Fee:</span>
                  <span className="font-mono text-cyan-400 font-bold">{bookingSpecialist.consultationFee}</span>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setBookingSpecialist(null)}
                    className="flex-1 py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold cursor-pointer transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold cursor-pointer transition shadow-md"
                  >
                    Confirm Intake Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
