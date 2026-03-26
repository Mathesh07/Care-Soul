import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Video, ExternalLink } from 'lucide-react';
import { Navbar } from '../components/ui/navbar';
import { telemedicineService } from '../services/telemedicineService';

const VideoConsultation = () => {
    // useParams reads URL parameters
    // If URL is /consultation/abc-123, then appointmentId = "abc-123"
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const navigate = useNavigate();

    const [session, setSession] = useState<any>(null);
    const [meetingLink, setMeetingLink] = useState('');
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        checkExistingSession();
    }, [appointmentId]);

    // Check if a session already exists for this appointment
    const checkExistingSession = async () => {
        try {
            const response = await telemedicineService.getSessionByAppointment(appointmentId!);
            if (response.success) {
                setSession(response.data.session);
                setMeetingLink(response.data.meetingLink);
            }
        } catch {
            // No session exists yet — that's fine
        } finally {
            setLoading(false);
        }
    };

    // Create a new session
    const handleCreateSession = async () => {
        try {
            setCreating(true);
            setError('');
            const response = await telemedicineService.createSession(appointmentId!);
            if (response.success) {
                setSession(response.data);
                // Generate the Jitsi link
                setMeetingLink(`https://meet.jit.si/${response.data.roomId}`);
            }
        } catch (err: any) {
            setError('Failed to create session. Please try again.');
        } finally {
            setCreating(false);
        }
    };

    // Open Jitsi in a new tab
    const handleJoinCall = () => {
        if (meetingLink) {
            window.open(meetingLink, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <Navbar />
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <div className="max-w-2xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-foreground mb-6">Video Consultation</h1>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {/* No session yet */}
                {!session && (
                    <div className="bg-card border border-border/60 rounded-lg shadow-md p-8 text-center">
                        <Video className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Start Video Consultation</h2>
                        <p className="text-foreground/70 mb-6">
                            Create a secure video room for this appointment
                        </p>
                        <button
                            onClick={handleCreateSession}
                            disabled={creating}
                            className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 font-medium"
                        >
                            {creating ? 'Creating room...' : 'Create Video Room'}
                        </button>
                    </div>
                )}

                {/* Session exists */}
                {session && meetingLink && (
                    <div className="bg-card border border-border/60 rounded-lg shadow-md p-8">

                        {/* Session info */}
                        <div className="flex items-center justify-between mb-6 p-4 bg-green-50 rounded-lg">
                            <div>
                                <p className="font-semibold text-green-800">Room Ready</p>
                                <p className="text-sm text-green-600">Room ID: {session.roomId}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${session.status === 'active'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}>
                                {session.status}
                            </span>
                        </div>

                        {/* Instructions */}
                        <div className="mb-6">
                            <h3 className="font-semibold mb-3">How it works:</h3>
                            <ul className="space-y-2 text-sm text-foreground/70">
                                <li className="flex items-start gap-2">
                                    <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                                    Click "Join Video Call" below
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                                    Jitsi Meet opens in a new tab (free, no account needed)
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                                    Share the room ID with the other person so they can join the same room
                                </li>
                            </ul>
                        </div>

                        {/* Share room ID */}
                        <div className="bg-foreground/5 rounded-lg p-4 mb-6">
                            <p className="text-sm text-foreground/70 mb-2">Share this Room ID:</p>
                            <div className="flex items-center gap-2">
                                <code className="bg-background border border-border px-3 py-2 rounded text-sm flex-1 font-mono">
                                    {session.roomId}
                                </code>
                                <button
                                    onClick={() => navigator.clipboard.writeText(session.roomId)}
                                    className="px-3 py-2 border border-border rounded hover:bg-foreground/5 text-sm"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>

                        {/* Join button */}
                        <button
                            onClick={handleJoinCall}
                            className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 flex items-center justify-center gap-3"
                        >
                            <Video className="h-6 w-6" />
                            Join Video Call
                            <ExternalLink className="h-5 w-5" />
                        </button>

                        <p className="text-xs text-center text-foreground/60 mt-3">
                            Opens in a new tab using Jitsi Meet (free, secure, no download required)
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoConsultation;