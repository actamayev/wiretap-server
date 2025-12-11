import Encryptor from "../../../classes/encryptor"
import PrismaClientClass from "../../../classes/prisma-client"

export default async function addEmailUpdateSubscriber(
	email: string,
	ipAddress: string | undefined,
	userAgent: string | undefined
): Promise<void> {
	try {
		const encryptor = new Encryptor()
		const encryptedEmail = await encryptor.deterministicEncrypt(email, "EMAIL_ENCRYPTION_KEY")

		const prismaClient = await PrismaClientClass.getPrismaClient()

		await prismaClient.email_update_subscriber.create({
			data: {
				email,
				email__encrypted: encryptedEmail,
				ip_address: ipAddress,
				user_agent: userAgent
			}
		})
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		if (error.code === "P2002") {
			throw error
		}
		console.error("Error adding email update subscriber:", error)
		throw error
	}
}
