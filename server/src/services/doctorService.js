const axios = require('axios');
const Doctor = require('../models/Doctor');

class DoctorService {
  constructor() {
    this.hprApiUrl = process.env.HPR_API_URL;
    this.hprApiKey = process.env.HPR_API_KEY;
    this.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
  }

  /**
   * Search doctors from HPR (Healthcare Professional Registry)
   */
  async searchHPRDoctors(specialization, location = null) {
    try {
      // In production, call actual HPR API
      // For now, creating a mock implementation
      
      const params = {
        specialization,
        limit: 10
      };

      if (location) {
        params.city = location.city;
        params.state = location.state;
      }

      // Mock HPR API response
      // In production: const response = await axios.get(`${this.hprApiUrl}/search`, { params, headers: { 'X-API-Key': this.hprApiKey } });
      
      // For demo, return doctors from our database
      const doctors = await Doctor.find({
        'profile.specialization': { $in: [specialization] }
      }).limit(10);

      return doctors;
    } catch (error) {
      console.error('HPR API Error:', error);
      throw error;
    }
  }

  /**
   * Find nearby doctors using Google Maps Geolocation
   */
  async findNearbyDoctors(specialization, userLocation, radiusKm = 10) {
    try {
      const { lat, lng } = userLocation;

      // Find doctors within radius using MongoDB geospatial query
      const doctors = await Doctor.find({
        'profile.specialization': { $in: [specialization] },
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat]
            },
            $maxDistance: radiusKm * 1000 // Convert km to meters
          }
        }
      }).limit(10);

      // Calculate distance for each doctor
      const doctorsWithDistance = await Promise.all(
        doctors.map(async (doctor) => {
          const distance = await this.calculateDistance(
            userLocation,
            doctor.location.coordinates
          );

          return {
            ...doctor.toObject(),
            distance: {
              value: distance,
              unit: 'km',
              text: `${distance.toFixed(1)} km away`
            }
          };
        })
      );

      return doctorsWithDistance.sort((a, b) => a.distance.value - b.distance.value);
    } catch (error) {
      console.error('Nearby doctors search error:', error);
      throw error;
    }
  }

  /**
   * Get top-rated doctors across India
   */
  async getTopRatedDoctors(specialization, limit = 5) {
    try {
      const doctors = await Doctor.find({
        'profile.specialization': { $in: [specialization] },
        'ratings.average': { $gte: 4.5 },
        'metadata.isTopRated': true
      })
        .sort({ 'ratings.average': -1, 'ratings.count': -1 })
        .limit(limit);

      return doctors;
    } catch (error) {
      console.error('Top rated doctors error:', error);
      throw error;
    }
  }

  /**
   * Calculate distance between two coordinates
   */
  async calculateDistance(location1, location2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(location2.lat - location1.lat);
    const dLon = this.toRad(location2.lng - location1.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(location1.lat)) *
        Math.cos(this.toRad(location2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  toRad(value) {
    return (value * Math.PI) / 180;
  }

  /**
   * Get doctor details by ID
   */
  async getDoctorById(doctorId) {
    try {
      const doctor = await Doctor.findById(doctorId);
      return doctor;
    } catch (error) {
      console.error('Get doctor error:', error);
      throw error;
    }
  }

  /**
   * Verify doctor credentials from HPR blockchain
   */
  async verifyDoctorCredentials(hprId) {
    try {
      // In production, call HPR blockchain verification API
      // For now, mark as verified if HPR ID exists
      
      const doctor = await Doctor.findOneAndUpdate(
        { hprId },
        {
          $set: {
            verified: true,
            'metadata.isGovernmentVerified': true,
            'metadata.lastVerified': new Date()
          }
        },
        { new: true }
      );

      return doctor;
    } catch (error) {
      console.error('Doctor verification error:', error);
      throw error;
    }
  }
}

module.exports = new DoctorService();
