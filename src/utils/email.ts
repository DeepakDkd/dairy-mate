import nodemailer from 'nodemailer';

export const sendEmail = async ({to, subject, text, html}: {to: string, subject: string, text: string, html: string}): Promise<void> => {
    try {

        console.log(process.env.EMAIL_HOST, process.env.EMAIL_PORT, process.env.EMAIL_USER, process.env.EMAIL_PASS, to);
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            secure: process.env.EMAIL_SECURE === "true",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `ClassSync  <${process.env.EMAIL_FROM}>`,
            to,
            subject,
            text,
            html,
        });
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Email sending failed");
    }
}