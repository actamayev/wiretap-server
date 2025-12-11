
import React from "react"
import {
	Body,
	Container,
	Head,
	Html,
	Preview,
	Section,
	Text,
	Tailwind,
} from "@react-email/components"

interface FeedbackEmailProps {
	username: string | null
	userEmail: string
	feedback: string
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export default function FeedbackEmail({ username, userEmail, feedback }: FeedbackEmailProps): React.ReactNode {
	return (
		<Html>
			<Head>
				<link href="https://fonts.googleapis.com/css2?family=Young+Serif&display=swap" rel="stylesheet" />
				<meta name="color-scheme" content="light dark" />
				<meta name="supported-color-schemes" content="light dark" />
			</Head>
			<Preview>New user feedback from Wiretap</Preview>
			<Tailwind>
				<Body className="bg-white" style={{ fontFamily: "\"Young Serif\", Georgia, \"Times New Roman\", serif" }}>
					<Container className="mx-auto pb-[20px] pb-[48px] max-w-[560px]">
						<Section className="mb-[16px] text-center bordered-section">
							<Section className="mb-[16px]">
								<Text className="main-text text-[16px] leading-[20px] font-semibold" style={{ color: "#00001E" }}>
									New feedback from Wiretap user
								</Text>
							</Section>

							<Section className="mb-[16px]">
								<Text className="main-text text-[14px] leading-[18px]" style={{ color: "#00001E" }}>
									<strong>User:</strong> {username || "No username"} ({userEmail})
								</Text>
							</Section>

							<Section className="mb-[16px]">
								<Text className="main-text text-[14px] leading-[18px]" style={{ color: "#00001E" }}>
									<strong>Feedback:</strong>
								</Text>
								<Text className="main-text text-[14px] leading-[20px]" style={{ color: "#00001E", whiteSpace: "pre-wrap" }}>
									{feedback}
								</Text>
							</Section>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}
