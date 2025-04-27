const nodemailer = require('nodemailer');

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Function to send newsletter
const sendNewsletter = async (subscribers, subject, content) => {
    try {
        // Create email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            subject: subject,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${subject}</title>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                            line-height: 1.6;
                            color: #212529;
                            margin: 0;
                            padding: 0;
                            background-color: #f8f9fa;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            background-color: #1a2634;
                            color: #ffffff;
                            padding: 20px;
                            text-align: center;
                            border-radius: 8px 8px 0 0;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 24px;
                            font-weight: 700;
                            letter-spacing: 1px;
                        }
                        .header .accent {
                            color: #0dcaf0;
                        }
                        .content {
                            background-color: #ffffff;
                            padding: 30px;
                            border-radius: 0 0 8px 8px;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        }
                        .content p {
                            margin: 0 0 20px 0;
                            font-size: 16px;
                            color: #212529;
                        }
                        .footer {
                            text-align: center;
                            padding: 20px;
                            color: #6c757d;
                            font-size: 14px;
                        }
                        .footer a {
                            color: #0dcaf0;
                            text-decoration: none;
                        }
                        .footer a:hover {
                            text-decoration: underline;
                        }
                        .button {
                            display: inline-block;
                            padding: 12px 24px;
                            background-color: #0dcaf0;
                            color: #1a2634;
                            text-decoration: none;
                            border-radius: 6px;
                            font-weight: 600;
                            margin-top: 20px;
                            transition: all 0.2s ease;
                        }
                        .button:hover {
                            background-color: #0bbad8;
                            transform: translateY(-2px);
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                        }
                        .divider {
                            height: 1px;
                            background-color: #dee2e6;
                            margin: 20px 0;
                        }
                        .tagline {
                            font-size: 14px;
                            color: #6c757d;
                            margin-top: 5px;
                        }
                        @media (max-width: 600px) {
                            .container {
                                padding: 10px;
                            }
                            .header {
                                padding: 15px;
                            }
                            .content {
                                padding: 20px;
                            }
                            .header h1 {
                                font-size: 20px;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Trading<span class="accent">Platform</span></h1>
                            <div class="tagline">Your trusted partner in trading</div>
                        </div>
                        <div class="content">
                            <h2 style="color: #0dcaf0; margin-top: 0;">${subject}</h2>
                            <div class="divider"></div>
                            ${content}
                            <div class="divider"></div>
                            <a href="http://localhost:3000" class="button">Visit Our Platform</a>
                        </div>
                        <div class="footer">
                            <p>This email was sent from your trading platform.</p>
                            <p>To unsubscribe, please <a href="http://localhost:3000/settings">visit your account settings</a>.</p>
                            <p style="margin-top: 20px; font-size: 12px;">© 2024 TradingPlatform. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        // Send email to each subscriber
        const sendPromises = subscribers.map(subscriber => {
            const subscriberMailOptions = {
                ...mailOptions,
                to: subscriber.email
            };
            return transporter.sendMail(subscriberMailOptions);
        });

        // Wait for all emails to be sent
        await Promise.all(sendPromises);

        return {
            success: true,
            message: `Newsletter sent successfully to ${subscribers.length} subscribers`
        };
    } catch (error) {
        console.error('Error sending newsletter:', error);
        throw new Error('Failed to send newsletter');
    }
};

module.exports = {
    sendNewsletter
}; 