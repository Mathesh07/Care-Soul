import { useState } from 'react';
import { AlertTriangle, Phone, MapPin, Loader } from 'lucide-react';
import { Navbar } from '../components/ui/navbar';
import { emergencyService } from '../services/emergencyService';

const EmergencyPage = () => {
    // Track what's happening
    const [status, setStatus] = useState<'idle' | 'locating' | 'sending' | 'sent'>('idle');
    const [location, setLocation] = useState<string>('');
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [emailSent, setEmailSent] = useState(false);

    // Get user's GPS location
    const getLocation = (): Promise<GeolocationPosition> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }
            // Browser asks user for permission, then gives coordinates
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
    };

    const handleEmergency = async () => {
        try {
            setStatus('locating');
            setError('');

            let lat = null, lng = null, locationStr = 'Location not available';

            // Try to get GPS coordinates
            try {
                const position = await getLocation();
                lat = position.coords.latitude;
                lng = position.coords.longitude;
                locationStr = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
                setCoords({ lat, lng });
                setLocation(locationStr);
            } catch {
                // GPS failed — that's okay, we still send the alert
                locationStr = 'Location not available';
                setLocation(locationStr);
            }

            setStatus('sending');

            // Send emergency to backend
            const response = await emergencyService.raiseAlert({
                location: locationStr,
                latitude: lat,
                longitude: lng,
                description: description || 'Emergency assistance needed'
            });

            if (response.success) {
                setEmailSent(response.emailSent || false);
                setStatus('sent');
            }
        } catch (err: any) {
            setError('Failed to send alert. Please call 102 directly.');
            setStatus('idle');
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 py-10">

                {/* Header */}
                <div className="relative overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-500/10 via-card to-red-500/5 p-6 md:p-8 mb-8 shadow-premium-md">
                    <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-red-500/20 blur-3xl" />
                    <div className="relative text-center">
                        <AlertTriangle className="h-14 w-14 text-red-500 mx-auto mb-4" />
                        <h1 className="text-3xl md:text-4xl font-bold text-red-600 dark:text-red-400">Emergency Services</h1>
                        <p className="text-foreground/70 mt-2">Get immediate medical assistance and alert response teams quickly.</p>
                    </div>
                </div>

                {/* Emergency contacts — always visible */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <a href="tel:102" className="rounded-xl p-5 text-center border border-red-500/30 bg-red-500 text-white hover:bg-red-600 transition shadow-premium-sm">
                        <Phone className="h-6 w-6 mx-auto mb-2" />
                        <p className="font-bold text-lg">102</p>
                        <p className="text-sm opacity-90">Ambulance</p>
                    </a>
                    <a href="tel:100" className="rounded-xl p-5 text-center border border-primary/30 bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-premium-sm">
                        <Phone className="h-6 w-6 mx-auto mb-2" />
                        <p className="font-bold text-lg">100</p>
                        <p className="text-sm opacity-90">Police</p>
                    </a>
                </div>

                {/* Alert sent confirmation */}
                {status === 'sent' ? (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center shadow-premium-sm">
                        <div className="text-4xl mb-3">✅</div>
                        <h2 className="text-xl font-bold text-green-700 dark:text-green-400">Alert Sent!</h2>
                        <p className="text-green-700/90 dark:text-green-300 mt-2">
                            Your emergency has been reported. Help is on the way.
                        </p>
                        {emailSent && (
                            <p className="text-blue-600 dark:text-blue-400 mt-2 text-sm">
                                📧 Emergency contact has been notified via email.
                            </p>
                        )}
                        {!emailSent && (
                            <p className="text-amber-600 dark:text-amber-400 mt-2 text-sm">
                                💡 Tip: Add an emergency contact email in your profile to notify them automatically.
                            </p>
                        )}
                        {coords && (
                            <div className="mt-4 flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
                                <MapPin className="h-4 w-4" />
                                <span className="text-sm">{location}</span>
                            </div>
                        )}
                        <button
                            onClick={() => { setStatus('idle'); setEmailSent(false); }}
                            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                            Send Another Alert
                        </button>
                    </div>
                ) : (
                    /* Emergency Form */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-card rounded-xl border border-border/60 shadow-premium-sm p-6">
                            <h2 className="text-xl font-semibold mb-2">Send Emergency Alert</h2>
                            <p className="text-sm text-foreground/70 mb-5">Press the emergency button to notify the response team immediately.</p>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
                                    {error}
                                </div>
                            )}

                            {/* Optional description */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-foreground/80 mb-2">
                                    Describe your emergency (optional)
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="e.g., Chest pain, difficulty breathing..."
                                    rows={3}
                                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-red-500/40"
                                />
                            </div>

                            {/* Location status */}
                            {location && (
                                <div className="flex items-center gap-2 text-foreground/70 mb-4 text-sm bg-foreground/5 rounded-lg p-3">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    <span>{location}</span>
                                </div>
                            )}

                            {/* Big red emergency button */}
                            <button
                                onClick={handleEmergency}
                                disabled={status !== 'idle'}
                                className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-3 shadow-premium-md"
                            >
                                {status === 'locating' && (
                                    <><Loader className="h-5 w-5 animate-spin" /> Getting your location...</>
                                )}
                                {status === 'sending' && (
                                    <><Loader className="h-5 w-5 animate-spin" /> Sending alert...</>
                                )}
                                {status === 'idle' && (
                                    <><AlertTriangle className="h-5 w-5" /> Send Emergency Alert</>
                                )}
                            </button>

                            <p className="text-xs text-foreground/60 text-center mt-3">
                                This will immediately alert our emergency response team
                            </p>
                        </div>

                        <div className="bg-card rounded-xl border border-border/60 shadow-premium-sm p-6">
                            <h3 className="font-semibold mb-3">Safety Checklist</h3>
                            <ul className="space-y-3 text-sm text-foreground/70">
                                <li className="flex gap-2"><span className="text-red-500">•</span> Stay calm and provide accurate details.</li>
                                <li className="flex gap-2"><span className="text-red-500">•</span> Keep your phone line available.</li>
                                <li className="flex gap-2"><span className="text-red-500">•</span> Share visible landmarks if possible.</li>
                                <li className="flex gap-2"><span className="text-red-500">•</span> Call 102 directly for severe emergencies.</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmergencyPage;