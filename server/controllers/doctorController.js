import Doctor from '../models/Doctor.js';

export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ name: 1 });
    console.log(doctors);
    res.status(200).json({
      success: true,
      data: doctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching doctors',
      error: error.message
    });
  }
};

export const searchDoctors = async (req, res) => {
  try {
    const { location, specialization } = req.query;
    
    let query = {};
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }
    
    const doctors = await Doctor.find(query).sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      data: doctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching doctors',
      error: error.message
    });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor',
      error: error.message
    });
  }
};
