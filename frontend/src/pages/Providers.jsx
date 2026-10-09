import { useState, useEffect } from 'react'
import {
  Stethoscope,
  Search,
  MapPin,
  Star,
  Phone,
  Building2,
  Navigation,
  ShieldAlert,
  SlidersHorizontal,
  CheckCircle,
} from 'lucide-react'
import Card from '@/components/common/Card.jsx'
import LoadingState from '@/components/common/LoadingState.jsx'
import { searchProviders } from '@/services/api.js'
import { cn } from '@/utils/classNames.js'

const SPECIALTIES = [
  'All Specialties',
  'Cardiology',
  'Physical Therapy',
  'General Medicine',
  'Orthopedic Surgery',
  'Nephrology',
  'Diagnostic Tests',
]

const DEFAULT_PROVIDERS = [
  {
    id: 'prov-002',
    name: 'Dr. Priya Sharma, MD',
    specialty: 'Cardiology',
    facilityType: 'Hospital',
    address: 'Apollo Heart Institute, Greams Road',
    distanceKm: 3.8,
    distance: '3.8 km',
    rating: 4.9,
    contact: '+91-44-2829-0200',
  },
  {
    id: 'prov-003',
    name: 'Dr. Aris Thorne, MD, FAAOS',
    specialty: 'Orthopedic Surgery',
    facilityType: 'Hospital',
    address: 'Apex Pavilion Suite 410, Metro Health Campus',
    distanceKm: 1.5,
    distance: '1.5 km',
    rating: 4.9,
    contact: '+1-555-014-9922',
  },
  {
    id: 'prov-006',
    name: 'Dr. Vikram Patel, MD, FACC',
    specialty: 'Cardiology',
    facilityType: 'Hospital',
    address: 'Advanced Heart Institute, 420 Cardiac Way',
    distanceKm: 2.7,
    distance: '2.7 km',
    rating: 4.9,
    contact: '+1-555-017-3344',
  },
  {
    id: 'prov-001',
    name: 'Dr. Marcus Vance, MD',
    specialty: 'General Medicine',
    facilityType: 'Clinic',
    address: 'Metro Health Clinic, Suite 300, 450 Health Parkway',
    distanceKm: 2.1,
    distance: '2.1 km',
    rating: 4.8,
    contact: '+1-555-019-2831',
  },
]

export default function Providers() {
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties')
  const [searchLocation, setSearchLocation] = useState('')
  const [radiusKm, setRadiusKm] = useState(10)
  const [providers, setProviders] = useState([])
  const [disclaimer, setDisclaimer] = useState('')
  const [loading, setLoading] = useState(true)
  const [contactedId, setContactedId] = useState(null)

  const fetchProviders = async () => {
    setLoading(true)
    try {
      const specialtyParam = selectedSpecialty === 'All Specialties' ? null : selectedSpecialty
      const locationParam = searchLocation.trim() || null
      const res = await searchProviders({
        specialty: specialtyParam,
        location: locationParam,
        radiusKm,
      })
      if (res.providers && res.providers.length > 0) {
        setProviders(res.providers)
      } else {
        // Fallback default sample if empty filter
        setProviders(DEFAULT_PROVIDERS)
      }
      setDisclaimer(res.disclaimer || '')
    } catch (err) {
      console.warn('Failed to fetch providers:', err)
      setProviders(DEFAULT_PROVIDERS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProviders()
  }, [selectedSpecialty, radiusKm])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchProviders()
  }

  const handleSimulateContact = (id) => {
    setContactedId(id)
    setTimeout(() => setContactedId(null), 3000)
  }

  return (
    <div className="mx-auto max-w-5xl py-4 sm:py-6 space-y-6 animate-fade-in">
      {/* Header */}
      <header className="border-b border-white/10 pb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Stethoscope className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Post-Discharge Care Network
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Provider Finder
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Locate recommended follow-up clinics, diagnostic laboratories, and specialists matched with your discharge requirements.
          </p>
        </div>
        <div className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
          {providers.length} {providers.length === 1 ? 'Provider' : 'Providers'} Found
        </div>
      </header>

      {/* Safety Notice */}
      <div className="flex items-start gap-3 rounded-2xl p-4 text-xs text-amber-300 bg-[#14120b] border border-amber-500/30">
        <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-200">Demonstration Provider Directory</p>
          <p className="mt-0.5 text-amber-400/80">
            {disclaimer || 'Synthetic data match. Availability, appointment slots, and network participation are not guaranteed. Always confirm insurance coverage directly.'}
          </p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <Card className="p-5">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Location Input */}
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Location (e.g. Metro City, Chennai)"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full rounded-full pl-10 pr-4 py-2.5 text-xs bg-[#28282a] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-white/40"
              />
            </div>

            {/* Specialty Select */}
            <div className="relative">
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full appearance-none rounded-full px-4 py-2.5 text-xs bg-[#28282a] border border-white/10 text-white focus:outline-none focus:border-white/40 cursor-pointer"
              >
                {SPECIALTIES.map((spec) => (
                  <option key={spec} value={spec} className="bg-black text-white">
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            {/* Radius & Search Button */}
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 rounded-full px-3.5 py-2 bg-[#28282a] border border-white/10">
                <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                <span className="text-xs text-zinc-400 shrink-0">Radius:</span>
                <select
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer w-full"
                >
                  <option value={5} className="bg-black text-white">5 km</option>
                  <option value={10} className="bg-black text-white">10 km</option>
                  <option value={25} className="bg-black text-white">25 km</option>
                  <option value={50} className="bg-black text-white">50 km</option>
                </select>
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-white shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_0_18px_rgba(255,255,255,0.25)] hover:bg-[#e4e4e6] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shrink-0"
              >
                <Search className="h-3.5 w-3.5" />
                Filter
              </button>
            </div>
          </div>
        </form>
      </Card>

      {/* Provider Results */}
      {loading ? (
        <div className="py-12">
          <LoadingState label="Searching matched care providers..." />
        </div>
      ) : providers.length === 0 ? (
        <Card className="p-8 text-center">
          <Building2 className="mx-auto h-12 w-12 text-zinc-600 mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No providers found within {radiusKm} km</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
            Try adjusting your specialty or widening your search radius to find nearby medical centers.
          </p>
          <button
            type="button"
            onClick={() => { setSelectedSpecialty('All Specialties'); setRadiusKm(25); setSearchLocation('') }}
            className="rounded-full px-4 py-2 text-xs font-semibold text-white bg-[#28282a] border border-white/10 hover:bg-[#323234] transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {providers.map((p) => {
            const isContacted = contactedId === p.id
            return (
              <Card
                key={p.id}
                className="p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20"
              >
                <div>
                  {/* Category & Rating */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-300 bg-[#28282a] border border-white/10">
                      {p.specialty}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{p.rating?.toFixed(1) || '4.8'}</span>
                    </div>
                  </div>

                  {/* Provider Name */}
                  <h3 className="text-base font-bold text-white tracking-tight">{p.name}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{p.facilityType}</p>

                  {/* Address */}
                  <div className="mt-3 flex items-start gap-2 text-xs text-zinc-400">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-500 mt-0.5" />
                    <span>{p.address}</span>
                  </div>

                  {/* Distance */}
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <Navigation className="h-3 w-3" />
                    <span>{p.distance || `${p.distanceKm} km`} away</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Phone className="h-3.5 w-3.5" />
                    <span className="font-mono text-[11px] text-zinc-400">{p.contact || '+1-555-019-2831'}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSimulateContact(p.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer',
                      isContacted
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-white text-black shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_0_15px_rgba(255,255,255,0.2)] hover:bg-[#e4e4e6] hover:scale-[1.02]',
                    )}
                  >
                    {isContacted ? (
                      <>
                        <CheckCircle className="h-3.5 w-3.5" />
                        Requested
                      </>
                    ) : (
                      'Request Appointment'
                    )}
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
