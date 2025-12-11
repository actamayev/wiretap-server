import { Response, Request } from "express"
import PrismaClientClass from "../../classes/prisma-client"
import Encryptor from "../../classes/encryptor"

// eslint-disable-next-line max-lines-per-function
export default async function migrateEncryptedEmails(_req: Request, res: Response): Promise<void> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()
		const encryptor = new Encryptor()

		const users = await prismaClient.credentials.findMany({
			where: {
				email: null
			},
			select: {
				user_id: true,
				email__encrypted: true
			}
		})

		console.log(`📧 Found ${users.length} users to migrate`)

		let successCount = 0
		let failedCount = 0
		const errors: Array<{ user_id: number; error: string }> = []

		for (const user of users) {
			try {
				const decryptedEmail = await encryptor.deterministicDecrypt(
					user.email__encrypted as DeterministicEncryptedString,
					"EMAIL_ENCRYPTION_KEY"
				)

				await prismaClient.credentials.update({
					where: { user_id: user.user_id },
					data: { email: decryptedEmail }
				})

				successCount++
			} catch (error) {
				console.error(`Failed to migrate user ${user.user_id}:`, error)
				failedCount++
				errors.push({
					user_id: user.user_id,
					error: error instanceof Error ? error.message : "Unknown error"
				})
			}
		}

		console.log(`✅ Migration complete: ${successCount} successful, ${failedCount} failed`)

		res.status(200).json({
			success: true,
			totalUsers: users.length,
			successCount,
			failedCount,
			errors: errors.length > 0 ? errors : undefined
		})
	} catch (error) {
		console.error("Error in migrateEncryptedEmails:", error)
		res.status(500).json({ error: "Internal Server Error: Unable to migrate emails" } satisfies ErrorResponse)
	}
}
