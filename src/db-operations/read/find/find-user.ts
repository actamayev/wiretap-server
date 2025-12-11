import isNull from "lodash/isNull"
import PrismaClientClass from "../../../classes/prisma-client"

export async function findUserById(userId: number): Promise<ExtendedCredentials | null> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const user = await prismaClient.credentials.findUnique({
			where: {
				user_id: userId,
				is_active: true
			},
			select: {
				user_id: true,
				username: true,
				password: true,
				is_active: true,
				auth_method: true,
				email: true,
				created_at: true,
				updated_at: true,
			}
		})

		if (isNull(user)) return null

		return user as ExtendedCredentials
	} catch (error) {
		console.error("Error finding user by Id:", error)
		throw error
	}
}

export async function findUserByWhereCondition(
	whereCondition:
		{ username?: { equals: string, mode: "insensitive" } } |
		{ email?: { equals: string } }
): Promise<ExtendedCredentials | null> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const user = await prismaClient.credentials.findFirst({
			where: {
				...whereCondition,
				is_active: true,
			},
			select: {
				user_id: true,
				username: true,
				password: true,
				is_active: true,
				auth_method: true,
				email: true,
				created_at: true,
				updated_at: true,
			}
		})

		if (isNull(user)) return null

		return user as ExtendedCredentials
	} catch (error) {
		console.error("Error finding user:", error)
		throw error
	}
}
