export const config = {
  email: {
    host: process.env.EMAIL_HOST || 'sandbox.smtp.mailtrap.io',
    port: parseInt(process.env.EMAIL_PORT || '2525'),
    secure: process.env.EMAIL_SECURE === 'false',
    user: process.env.EMAIL_USER || 'c06387b4680003',
    password: process.env.EMAIL_PASSWORD || 'b2d31a6bbad66e',
    from: process.env.EMAIL_FROM || 'noreply@recruitai.com',
  },
  appUrl: process.env.APP_URL || 'http://localhost:3000',
}; 