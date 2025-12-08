import PrismaClientClass from "../../../classes/prisma-client"

export default async function createUserFeedback(userId: number, feedback: string): Promise<void> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		await prismaClient.user_feedback.create({
			data: {
				user_id: userId,
				feedback: feedback
			}
		})
	} catch (error) {
		console.error("Error creating user feedback:", error)
		throw error
	}
}
