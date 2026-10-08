/**
 * Bouragba Store - EmailJS Service
 * Sends transactional order notifications and contact emails
 * using EmailJS REST API (supports dynamic credentials from settings or .env)
 */

export async function sendEmail({ serviceId, templateId, publicKey, templateParams }) {
  if (!serviceId || !templateId || !publicKey) {
    console.warn('[EmailJS] Missing credentials. Email sending skipped.');
    return { success: false, reason: 'missing_credentials' };
  }

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: templateParams,
      }),
    });

    if (response.ok) {
      return { success: true };
    } else {
      const errText = await response.text();
      console.error('[EmailJS] Send error:', errText);
      return { success: false, error: errText };
    }
  } catch (error) {
    console.error('[EmailJS] Network error:', error);
    return { success: false, error: error.message };
  }
}

export default { sendEmail };
