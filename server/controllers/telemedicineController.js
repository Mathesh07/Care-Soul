import { v4 as uuidv4 } from "uuid";
import Appointment from "../models/Appointment.js";
import TelemedicineSession from '../models/TelemedicineSession.js';

export const createSession = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        const appointment =
            await Appointment.findById(appointmentId).populate("doctorId");

        if (!appointment) {
            return res.status(404).json({
                sucecss: false,
                message: "Appointment not found",
            });
        }

        const existingSession = await TelemedicineSession.findOne({
            appointmentId,
        });
        if (existingSession) {
            return res.status(200).json({ success: true, data: existingSession });
        }


        const roomId = `caresoul-${uuidv4()}`;

        const session = new TelemedicineSession({
            appointmentId,
            doctorId: appointment.doctorId._id,
            patientId: appointment.userId,
            roomId,
            status: 'scheduled'
        });

        await session.save();

        res.status(201).json({
            success: true,
            data: session,
            message: 'Session created',
        })

    } catch (error) {
        res.status(500).json({
            sucecss: false,
            message: error.message,
        });
    }
};


export const joinSession = async (req, res) => {
    try {
        const { roomId } = req.params;

        const session = await TelemedicineSession.findOne({ roomId })
            .populate('doctorId', 'name specialization')
            .populate('patientId', 'name email');

        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        if (session.status === 'scheduled') {
            session.status = 'active';
            session.startedAt = new Date();
            await session.save();
        }

        const meetingLink = `https://meet.jit.si/${roomId}`;

        res.status(200).json({
            success: true,
            data: {
                session,
                meetingLink,
                roomId
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const getSessionByAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;

        const session = await TelemedicineSession.findOne({ appointmentId });

        if (!session) {
            return res.status(404).json({ success: false, message: 'No session found' });
        }

        const meetingLink = `https://meet.jit.si/${session.roomId}`;

        res.status(200).json({
            success: true,
            data: { session, meetingLink }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};