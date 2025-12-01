import React from "react"
import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Link,
	Preview,
	Section,
	Text,
} from "@react-email/components"

// eslint-disable-next-line @typescript-eslint/naming-convention
export default function WelcomeEmail(): React.ReactNode {
	return (
		<Html>
			<Head />
			<Preview>Welcome to Wiretap - Start learning robotics today</Preview>
			<Body style={main}>
				<Container style={container}>
					<Heading style={h1}>Welcome to Wiretap</Heading>
					<Text style={text}>
						Hi there,
					</Text>
					<Text style={text}>
						Thanks for subscribing for updates. We'll
					</Text>
					<Text style={text}>
						You'll receive updates about new lessons, features, and ways to get the most out of your Pip robot.
					</Text>
					<Section style={buttonContainer}>
						<Button style={button} href="https://wiretap.pro">
							Get Started
						</Button>
					</Section>
					<Text style={footer}>
						Wiretap · New York, NY
						<br />
						<Link href="https://wiretap.pro/unsubscribe" style={link}>
							Unsubscribe
						</Link>
					</Text>
				</Container>
			</Body>
		</Html>
	)
}

const main = {
	backgroundColor: "#ffffff",
	fontFamily: "apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,\"Helvetica Neue\",Ubuntu,sans-serif",
}

const container = {
	margin: "0 auto",
	padding: "20px 0 48px",
	maxWidth: "560px",
}

const h1 = {
	color: "#333",
	fontSize: "24px",
	fontWeight: "bold",
	margin: "40px 0",
	padding: "0",
}

const text = {
	color: "#333",
	fontSize: "16px",
	lineHeight: "26px",
}

const buttonContainer = {
	padding: "27px 0",
}

const button = {
	backgroundColor: "#000",
	borderRadius: "8px",
	color: "#fff",
	fontSize: "16px",
	textDecoration: "none",
	textAlign: "center" as const,
	display: "block",
	padding: "12px 20px",
}

const footer = {
	color: "#8898aa",
	fontSize: "12px",
	lineHeight: "16px",
	marginTop: "32px",
}

const link = {
	color: "#8898aa",
	textDecoration: "underline",
}
