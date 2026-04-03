import React, { useState, useEffect } from 'react';
import { Search, MapPin, Stethoscope, Clock, Star, Loader } from 'lucide-react';
import { doctorService } from '../services/doctorService';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/ui/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  location: string;
  availableSlots: string[];
  experience?: string;
  rating?: number;
}

const DoctorListing = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchSpecialization, setSearchSpecialization] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await doctorService.getAllDoctors();
      if (response.success) {
        setDoctors(response.data);
      } else {
        setError('Failed to fetch doctors');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setSearching(true);
      setError('');
      const response = await doctorService.searchDoctors({
        location: searchLocation,
        specialization: searchSpecialization
      });
      if (response.success) {
        setDoctors(response.data);
      } else {
        setError('Failed to search doctors');
      }
    } catch (err) {
      setError('Error searching doctors');
    } finally {
      setSearching(false);
    }
  };

  const handleBookAppointment = (doctorId: string) => {
    navigate(`/patient/book-appointment/${doctorId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
            <Loader className="h-8 w-8 text-primary animate-spin" />
          </div>
          <p className="text-foreground/70 font-medium">Finding doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-foreground">Find a Doctor</h1>
          <p className="text-foreground/60 mt-2">Browse through our network of healthcare professionals</p>
        </div>
        
        {/* Search Filters */}
        <Card className="mb-10 overflow-hidden border border-primary/20 shadow-lg shadow-primary/5">
          <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-xl">Search Filters</CardTitle>
                <p className="mt-1 text-sm text-foreground/60">
                  Narrow results by city and specialty to find the right doctor faster.
                </p>
              </div>
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Search className="h-3.5 w-3.5" />
                Smart Search
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="space-y-2 lg:col-span-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/65">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/50" />
                  <input
                    type="text"
                    placeholder="Enter city"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        void handleSearch();
                      }
                    }}
                    className="w-full rounded-xl border border-border/80 bg-background px-4 py-3 pl-10 text-foreground outline-none transition-all placeholder:text-foreground/40 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2 lg:col-span-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/65">
                  Specialization
                </label>
                <div className="relative">
                  <Stethoscope className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/50" />
                  <input
                    type="text"
                    placeholder="Enter specialization"
                    value={searchSpecialization}
                    onChange={(e) => setSearchSpecialization(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        void handleSearch();
                      }
                    }}
                    className="w-full rounded-xl border border-border/80 bg-background px-4 py-3 pl-10 text-foreground outline-none transition-all placeholder:text-foreground/40 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-4 lg:items-end">
                <Button
                  onClick={handleSearch}
                  disabled={searching}
                  className="h-11 gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-500 text-white shadow-md shadow-primary/20"
                >
                  {searching ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Search
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => {
                    setSearchLocation('');
                    setSearchSpecialization('');
                    void fetchDoctors();
                  }}
                  variant="outline"
                  className="h-11 rounded-xl border-primary/30 text-primary hover:bg-primary/5"
                >
                  Reset
                </Button>
              </div>
            </div>

            {(searchLocation || searchSpecialization) && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground/50">
                  Active filters:
                </span>
                {searchLocation ? (
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    Location: {searchLocation}
                  </span>
                ) : null}
                {searchSpecialization ? (
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                    Specialization: {searchSpecialization}
                  </span>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-xl mb-8 flex items-start gap-3">
            <div className="flex-1">{error}</div>
            <button onClick={() => setError('')} className="text-destructive hover:text-destructive/80 font-bold">×</button>
          </div>
        )}

        {/* Doctor Cards Grid */}
        {doctors.length > 0 ? (
          <div>
            <p className="text-foreground/60 mb-6 font-medium">{doctors.length} doctor{doctors.length !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <Card key={doctor._id} className="flex flex-col overflow-hidden hover:scale-105 transition-transform duration-300">
                  <CardContent className="p-0 flex-1 flex flex-col">
                    <div className="h-2 bg-gradient-to-r from-primary to-accent" />
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-foreground">{doctor.name}</h3>
                          <p className="text-sm text-foreground/60 font-medium mt-1">{doctor.specialization}</p>
                        </div>
                        {doctor.rating && (
                          <div className="flex items-center gap-1 ml-2 bg-accent/10 px-2.5 py-1 rounded-lg whitespace-nowrap">
                            <Star className="h-4 w-4 text-accent fill-accent" />
                            <span className="text-sm font-bold text-foreground">{doctor.rating}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-3 mb-6 flex-1">
                        <div className="flex items-center gap-2 text-foreground/70 text-sm">
                          <MapPin className="h-4 w-4 flex-shrink-0 text-primary/60" />
                          <span>{doctor.location}</span>
                        </div>
                        {doctor.experience && (
                          <div className="flex items-center gap-2 text-foreground/70 text-sm">
                            <Clock className="h-4 w-4 flex-shrink-0 text-primary/60" />
                            <span className="font-medium">{doctor.experience} experience</span>
                          </div>
                        )}
                      </div>
                      
                      {doctor.availableSlots.length > 0 && (
                        <div className="mb-6">
                          <p className="text-xs font-semibold text-foreground/60 mb-2 uppercase tracking-wider">Available Slots</p>
                          <div className="flex flex-wrap gap-2">
                            {doctor.availableSlots.slice(0, 2).map((slot: string, index: number) => (
                              <span key={index} className="bg-green-500/10 text-green-600 text-xs px-2.5 py-1.5 rounded-md font-medium border border-green-500/20">
                                {slot}
                              </span>
                            ))}
                            {doctor.availableSlots.length > 2 && (
                              <span className="text-foreground/50 text-xs font-medium px-2 py-1">
                                +{doctor.availableSlots.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="border-t border-border/50 p-6 pt-6">
                      <Button 
                        onClick={() => handleBookAppointment(doctor._id)}
                        className="w-full"
                      >
                        Book Appointment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : searching ? (
          <div className="text-center py-16">
            <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
              <Loader className="h-8 w-8 text-primary animate-spin" />
            </div>
            <p className="text-foreground/70 font-medium">Searching doctors...</p>
          </div>
        ) : !loading ? (
          <div className="text-center py-16">
            <div className="inline-flex p-4 bg-foreground/5 rounded-full mb-4">
              <Stethoscope className="h-8 w-8 text-foreground/30" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No doctors found</h3>
            <p className="text-foreground/60 mb-6">Try adjusting your search criteria or browse all available doctors</p>
            <Button onClick={fetchDoctors} variant="outline">
              View All Doctors
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default DoctorListing;
