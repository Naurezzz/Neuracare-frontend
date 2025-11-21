const axios = require('axios');

class AICallService {
  constructor() {
    this.vapiApiKey = process.env.VAPI_API_KEY;
    this.vapiPhoneNumber = process.env.VAPI_PHONE_NUMBER;
    this.vapiApiUrl = 'https://api.vapi.ai/call';
  }

  /**
   * Initiate AI call to book appointment
   */
  async bookAppointmentWithAI(appointmentData) {
    try {
      const {
        doctorPhone,
        patientName,
        patientPhone,
        preferredDateTime,
        reason,
        screeningType
      } = appointmentData;

      // Prepare AI assistant instructions
      const assistantInstructions = `
You are NeuraCare's appointment booking assistant. Your task is to call the doctor's office and book an appointment.

Details:
- Patient Name: ${patientName}
- Patient Phone: ${patientPhone}
- Preferred Date/Time: ${preferredDateTime}
- Reason for Visit: ${reason}
- Screening Result: ${screeningType}

Instructions:
1. Introduce yourself as NeuraCare's AI assistant
2. Request to book an appointment for the patient
3. Provide the preferred date/time
4. Explain the reason is a ${screeningType} screening that requires follow-up
5. Get confirmation and appointment details
6. If unavailable, ask for alternative times
7. End the call politely and summarize the booking

Be professional, clear, and concise.
      `.trim();

      // Call Vapi API
      const response = await axios.post(
        this.vapiApiUrl,
        {
          phoneNumber: doctorPhone,
          assistant: {
            model: 'gpt-3.5-turbo',
            voice: 'en-US-Neural2-A',
            instructions: assistantInstructions,
            firstMessage: `Hello, I'm calling from NeuraCare to book an appointment for ${patientName}.`
          },
          metadata: {
            patientName,
            patientPhone,
            preferredDateTime,
            reason
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.vapiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        callId: response.data.id,
        status: response.data.status,
        message: 'AI call initiated successfully'
      };
    } catch (error) {
      console.error('Vapi API Error:', error.response?.data || error.message);
      
      // Fallback: Return manual booking option
      return {
        success: false,
        error: 'AI call service unavailable',
        fallback: 'manual',
        message: 'Please call the doctor directly to book appointment'
      };
    }
  }

  /**
   * Get call status
   */
  async getCallStatus(callId) {
    try {
      const response = await axios.get(`${this.vapiApiUrl}/${callId}`, {
        headers: {
          'Authorization': `Bearer ${this.vapiApiKey}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Get call status error:', error);
      throw error;
    }
  }

  /**
   * Get call transcript
   */
  async getCallTranscript(callId) {
    try {
      const response = await axios.get(`${this.vapiApiUrl}/${callId}/transcript`, {
        headers: {
          'Authorization': `Bearer ${this.vapiApiKey}`
        }
      });

      return response.data.transcript;
    } catch (error) {
      console.error('Get transcript error:', error);
      return null;
    }
  }
}

module.exports = new AICallService();
