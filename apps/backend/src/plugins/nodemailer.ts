import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import nodemailer from 'nodemailer';
import { config } from '../config.js';

export interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

declare module 'fastify' {
    interface FastifyInstance {
        mailer: {
            sendMail: (options: EmailOptions) => Promise<any>;
        };
    }
}

export default fp(async (fastify: FastifyInstance) => {
    const transporter = nodemailer.createTransport({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT,
        auth: {
            user: config.SMTP_USER,
            pass: config.SMTP_PASS
        },
        from: config.SMTP_USER
    });

    try {
        await transporter.verify();
        fastify.log.info('SMTP connection established successfully');
    } catch (error) {
        fastify.log.error('Failed to establish SMTP connection', error);
    }

    const mailer = {
        sendMail: async (options: EmailOptions) => {
            const mailOptions = {
                ...options
            };

            return transporter.sendMail(mailOptions);
        }
    };

    fastify.decorate('mailer', mailer);
});
