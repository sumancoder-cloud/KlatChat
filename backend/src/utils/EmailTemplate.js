const EmailTemplate = (username) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Account Created</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:40px 0;">
      <tr>
        <td align="center">
          
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
            
            <!-- Header -->
            <tr>
              <td style="background-color:#4f46e5; padding:30px; text-align:center;">
                <h1 style="color:#ffffff; margin:0;">Welcome to KlatChat/h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:40px 30px;">
                <h2 style="margin-top:0; color:#333;">Hi ${username},</h2>
                
                <p style="color:#555; line-height:1.6;">
                  Your account has been successfully created. We're excited to have you on board!
                </p>

                <p style="color:#555; line-height:1.6;">
                  You can now start chatting securely, connect with friends, and explore all the features we offer.
                </p>

                <div style="text-align:center; margin:30px 0;">
                  <a href="http://localhost:5173/login" 
                     style="background-color:#4f46e5; color:#ffffff; padding:12px 25px; 
                     text-decoration:none; border-radius:5px; font-weight:bold; display:inline-block;">
                    Login to Your Account
                  </a>
                </div>

                <p style="color:#999; font-size:14px;">
                  If you did not create this account, please ignore this email.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color:#f9fafb; padding:20px; text-align:center;">
                <p style="margin:0; font-size:12px; color:#888;">
                  © ${new Date().getFullYear()} KlatChat. All rights reserved.
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
};

module.exports = EmailTemplate;