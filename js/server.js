const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config({ path: '../config.env' });

const app = express();
const PORT = 8080;

// Debugging: Check if environment variables are loaded
console.log("Email User:", process.env.EMAIL_USER);
console.log("Email Pass:", process.env.EMAIL_PASS ? "Loaded" : "Not Loaded");  // Hides actual password
console.log("Email Receiver:", process.env.EMAIL_RECEIVER);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../')));

// Serve index.html correctly
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Email transporter configuration (Use your email credentials)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,  // Your email address
        pass: process.env.EMAIL_PASS   // Your email password or App Password
    }
});

// Route for booking
app.post('/book', (req, res) => {
    const { name, email, phone, destination, message } = req.body;

    if (!name || !email || !phone || !destination) {
        return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    // Email to myself(Booking notification)
    const mailOptionsAdmin = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_RECEIVER, // Your email where you want to receive bookings
        subject: '📩 New Booking Request',
        text: `You have a new booking:
        
        Name: ${name}
        Email: ${email}
        phone: ${phone}
        Destination: ${destination}
        Message: ${message || 'No message provided'}`
    };

    // 📩 **Email to Client (Confirmation)**
    const mailOptionsClient = {
        from: process.env.EMAIL_USER,
        to: email,  // Send confirmation to the client
        subject: '🌴 Your Punta Cana Tour is Confirmed with DL Tours! 🌊🚗',
        text: `Hello ${name}, 

Thanks you for booking your adventure with DL Tours!🌴
We're excited to take you on an unforgettable journey in Punta Cana.
  
  📌 Booking Details: 
- **Tour:** ${destination} 
- **Name:** ${name}
- **Email:** ${email}
- **Phone:** ${phone} 
- **Date, Time & info :** ${message || 'No message provided'}

✅ What’s Next? 
We’ll reach out to confirm your pickup details and answer any questions you may have.  

🚙 Pickup & Meeting Point:
We will send exact pickup details soon. If you have any questions, feel free to contact us.  

🎒 What to Bring:
- Comfortable clothing & shoes  
- Sunglasses & sunscreen 🕶️☀️  
- A sense of adventure! 🚀  

📞 Need Assistance?
If you need to modify your booking or have any questions, feel free to contact us:  
📧 Email: dltrasnportservices@gmail.com  
📲 WhatsApp: 829-406-4776/ 809-231-7677

Get ready for an amazing experience in Punta Cana! 🌊🐠🌴  

See you soon,  
DL Tours
[Your Website or Social Media]  
  `
    };
    // Send email
    transporter.sendMail(mailOptionsAdmin, (error, info) => {
        if (error) {
            console.error('Error sending booking email:', error);
            return res.status(500).json({ message: 'Failed to send booking email.' });
        }
        console.log('Admin email sent:', info.response);

        // Now send confirmation email to the client
        transporter.sendMail(mailOptionsClient, (err, infoClient) => {
            if (err) {
                console.error('Error sending confirmation email:', err);
                return res.status(500).json({ message: 'Booking confirmed, but failed to send confirmation email.' });
            }
            console.log('Confirmation email sent:', infoClient.response);
    });

        // Send JSON response to the client
        res.json({
            status: 'success',
            message: 'Booking successful! You will receive a confirmation email.',
            bookingDetails: {
                name,
                email,
                phone,
                destination,
                message: message || 'No message provided'
            }
        });
    });
 });

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
