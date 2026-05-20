import nodemailer from 'nodemailer';

export const sendEmail = async ({
    to,
    subject,
    text,
    html,
    fromName,
    replyTo,
}: {
    to: string,
    subject: string,
    text: string,
    html: string,
    fromName?: string,
    replyTo?: string,
}): Promise<void> => {
    try {
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
            from: `${fromName || "Dairy Mate"} <${process.env.EMAIL_FROM}>`,
            to,
            ...(replyTo ? { replyTo } : {}),
            subject,
            text,
            html,
        });
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Email sending failed");
    }
}
