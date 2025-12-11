import PrismaClientClass from "../../../classes/prisma-client"

export default async function doesEmailExist(email: string): Promise<boolean> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const user = await prismaClient.credentials.findFirst({
			where: {
				email
			},
			select: {
				user_id: true
			}
		})
		return user !== null
	} catch (error) {
		console.error(error)
		throw error
	}
}
