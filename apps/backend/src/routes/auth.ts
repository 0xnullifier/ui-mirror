import { FastifyInstance } from 'fastify';
import { OtpService } from '../services/otp.js';
import { config } from '../config.js';

interface SendOtpRequest {
    Body: {
        email: string;
    };
}

interface VerifyOtpRequest {
    Body: {
        email: string;
        otp: string;
    };
}

export default async function (fastify: FastifyInstance) {
    const otpService = new OtpService(fastify);

    fastify.post<SendOtpRequest>('/auth/send-otp', async (request, reply) => {
        const { email } = request.body;

        if (!email || !isValidEmail(email)) {
            return reply.code(400).send({
                success: false,
                message: 'Invalid email address'
            });
        }

        try {
            const otp = await otpService.createOtp(email);

            await fastify.mailer.sendMail({
                to: email,
                subject: 'Your Login OTP',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Login Verification</h2>
            <p>Hello,</p>
            <p>Your one-time password (OTP) for login is:</p>
            <div style="background-color: #f0f0f0; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
              <strong>${otp}</strong>
            </div>
            <p>This OTP is valid for ${config.OTP_EXPIRY_MINUTES} minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
            <p>Best regards,<br>NetZero</p>
          </div>
        `
            });

            return { success: true, message: 'OTP sent to email' };
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({
                success: false,
                message: 'Failed to send OTP'
            });
        }
    });

    // Verify OTP and login
    fastify.post<VerifyOtpRequest>('/auth/verify-otp', async (request, reply) => {
        const { email, otp } = request.body;

        if (!email || !isValidEmail(email)) {
            return reply.code(400).send({
                success: false,
                message: 'Invalid email address'
            });
        }

        if (!otp || otp.length !== 6) {
            return reply.code(400).send({
                success: false,
                message: 'Invalid OTP format'
            });
        }

        try {
            // Verify OTP
            const isValid = await otpService.verifyOtp(email, otp);

            if (!isValid) {
                return reply.code(400).send({
                    success: false,
                    message: 'Invalid or expired OTP'
                });
            }

            // Get user
            let user = await fastify.prisma.user.findUnique({
                where: { email }
            });

            if (!user) {
                // If user does not exist, create a new user
                user = await fastify.prisma.user.create({
                    data: {
                        email
                    }
                });
                request.log.info(`New user created: ${user.email}`);
            }

            // Generate JWT token
            const token = fastify.jwt.sign({
                userId: user.id,
                email: user.email
            });


            reply
                .setCookie('token', token, {
                    domain: 'localhost:16001',
                    path: '/',
                    secure: true, // send cookie over HTTPS only
                    httpOnly: true,
                    sameSite: true // alternative CSRF protection
                })

                .send({
                    success: true,
                    message: 'OTP verified successfully',
                    user: {
                        id: user.id,
                        email: user.email
                    },
                    token
                });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({
                success: false,
                message: 'Verification failed'
            });
        }
    });

    // Get current user
    fastify.get('/api/user', {
        preValidation: async (request, reply) => {
            console.log(request.cookies)
            try {
                await request.jwtVerify();
            } catch (err) {
                console.log(err)
                reply.code(401).send({
                    success: false,
                    message: 'Unauthorized'
                });
            }
        }
    }, async (request) => {
        const userId = (request.user as any).userId;

        const user = await fastify.prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        return {
            success: true,
            user: {
                id: user.id,
                email: user.email
            }
        };
    });
}

// Helper function to validate email
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
