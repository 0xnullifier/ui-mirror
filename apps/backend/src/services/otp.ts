import crypto from 'crypto';
import { FastifyInstance } from 'fastify';
import { config } from '../config.js';

export class OtpService {
    private fastify: FastifyInstance;

    constructor(fastify: FastifyInstance) {
        this.fastify = fastify;
    }

    // Generate a 6-digit OTP
    generateOtp(): string {
        return crypto.randomInt(100000, 999999).toString();
    }

    // Create or update OTP for a user
    async createOtp(email: string): Promise<string> {
        const otp = this.generateOtp();

        // Get the user or create if not exists
        const user = await this.fastify.prisma.user.upsert({
            where: { email },
            update: {},
            create: { email }
        });

        // Remove any existing OTPs for this user
        await this.fastify.prisma.oTP.deleteMany({
            where: { userId: user.id }
        });

        // Create a new OTP record
        await this.fastify.prisma.oTP.create({
            data: {
                userId: user.id,
                otp,
                createdAt: new Date()
            }
        });

        return otp;
    }

    // Verify if OTP is valid and not expired
    async verifyOtp(email: string, inputOtp: string): Promise<boolean> {
        const user = await this.fastify.prisma.user.findUnique({
            where: { email },
            include: {
                OTP: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        if (!user || user.OTP.length === 0) {
            return false;
        }

        const otpRecord = user.OTP[0];
        const isValid = otpRecord.otp === inputOtp;

        // Check if OTP is expired (10 minutes)
        const expiryTime = new Date(otpRecord.createdAt);
        expiryTime.setMinutes(expiryTime.getMinutes() + config.OTP_EXPIRY_MINUTES);
        const isExpired = new Date() > expiryTime;

        if (isValid && !isExpired) {
            // Remove the used OTP
            await this.fastify.prisma.oTP.delete({
                where: { id: otpRecord.id }
            });

            return true;
        }

        return false;
    }
}
