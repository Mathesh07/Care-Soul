import nodemailer from 'nodemailer';

// Create reusable transporter using SMTP
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendEmergencyEmail = async (to, patientName, location, description, timestamp) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"CARE SOUL Emergency" <${process.env.SMTP_USER}>`,
      to: to,
      subject: '🚨 EMERGENCY ALERT - Patient Needs Immediate Help',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #dc2626; border-radius: 10px;">
          <div style="background-color: #dc2626; color: white; padding: 15px; text-align: center; border-radius: 5px 5px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🚨 EMERGENCY ALERT</h1>
          </div>
          
          <div style="padding: 20px; background-color: #fef2f2;">
            <p style="font-size: 16px; margin-bottom: 15px;">
              <strong>${patientName}</strong> has pressed the emergency button and needs immediate assistance.
            </p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr style="background-color: white;">
                <td style="padding: 12px; border: 1px solid #fee2e2; font-weight: bold;">Patient Name:</td>
                <td style="padding: 12px; border: 1px solid #fee2e2;">${patientName}</td>
              </tr>
              <tr style="background-color: white;">
                <td style="padding: 12px; border: 1px solid #fee2e2; font-weight: bold;">Time:</td>
                <td style="padding: 12px; border: 1px solid #fee2e2;">${new Date(timestamp).toLocaleString()}</td>
              </tr>
              <tr style="background-color: white;">
                <td style="padding: 12px; border: 1px solid #fee2e2; font-weight: bold;">Location:</td>
                <td style="padding: 12px; border: 1px solid #fee2e2;">${location || 'Unknown'}</td>
              </tr>
              <tr style="background-color: white;">
                <td style="padding: 12px; border: 1px solid #fee2e2; font-weight: bold;">Description:</td>
                <td style="padding: 12px; border: 1px solid #fee2e2;">${description || 'Emergency assistance needed'}</td>
              </tr>
            </table>
            
            <p style="font-size: 14px; color: #991b1b; margin-top: 20px;">
              Please contact the patient immediately or call emergency services if needed.
            </p>
            
            <div style="text-align: center; margin-top: 25px;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/emergencies" 
                 style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Emergency Dashboard
              </a>
            </div>
          </div>
          
          <div style="padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #fee2e2;">
            This is an automated emergency alert from CARE SOUL Healthcare Platform.
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Emergency email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending emergency email:', error);
    return { success: false, error: error.message };
  }
};
