import PrismaClientClass from "../../../classes/prisma-client"

export async function addLocalUser(data: NewLocalUserFields): Promise<number> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const user = await prismaClient.credentials.create({
			data
		})

		return user.user_id
	} catch (error) {
		console.error(error)
		throw error
	}
}

export async function addGoogleUser(email: string): Promise<number> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const user = await prismaClient.credentials.create({
			data: {
				email,
				auth_method: "GOOGLE"
			}
		})

		return user.user_id
	} catch (error) {
		console.error(error)
		throw error
	}
}
