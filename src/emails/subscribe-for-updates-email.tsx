import React from "react"
import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Link,
	Preview,
	Section,
	Text,
	Row,
	Column,
	Img,
	Tailwind,
} from "@react-email/components"

// eslint-disable-next-line @typescript-eslint/naming-convention
export default function WelcomeEmail(): React.ReactNode {
	return (
		<Html>
			<Head>
				<link href="https://fonts.googleapis.com/css2?family=Young+Serif&display=swap" rel="stylesheet" />
				<meta name="color-scheme" content="light dark" />
				<style>{`
					@media (prefers-color-scheme: dark) {
						body {
							background-color: #00001E !important;
						}
						.wiretap-blue {
							color: #0041DC !important;
						}
						.cash-green {
							color: #55AF55 !important;
						}
						.main-text {
							color: #FAFAFF !important;
						}
						.bordered-section {
							border-color: #FAFAFF !important;
						}
					}
					@media (prefers-color-scheme: light) {
						body {
							background-color: #FAFAFF !important;
						}
					}
				`}</style>
			</Head>
			<Preview>Welcome to Wiretap - Paper trading for Polymarket</Preview>
			<Tailwind>
				<Body className="bg-white" style={{ fontFamily: '"Young Serif", Georgia, "Times New Roman", serif', backgroundColor: "#FAFAFF" }}>
					<Container className="mx-auto py-[20px] pb-[48px] max-w-[560px]">
						{/* Bordered container for the three sections */}
						<Section className="mb-[40px] text-center bordered-section" style={{ border: "3px solid #00001E", borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: "24px", borderBottomRightRadius: "24px", padding: "24px" }}>
							{/* Section 1 */}
							<Section className="mb-[40px]">
								<Heading className="main-text text-[32px] font-extrabold p-0" style={{ color: "#00001E" }}>
									Welcome to <span className="wiretap-blue" style={{ color: "#0041DC" }}>Wiretap</span>
								</Heading>
								<Text className="main-text text-[16px] leading-[26px] font-semibold" style={{ color: "#00001E" }}>
									Paper trading for Polymarket
								</Text>
							</Section>

							{/* Section 2 */}
							<Section className="mb-[40px]">
								<Text className="main-text text-[16px] leading-[26px] font-semibold" style={{ color: "#00001E" }}>
									Test your forecasting skills
								</Text>
								<Text className="main-text text-[16px] leading-[26px] font-semibold" style={{ color: "#00001E" }}>
									and see if you can beat the market.
								</Text>
								<Text className="main-text text-[16px] leading-[26px] font-semibold" style={{ color: "#00001E" }}>
									All without putting up real <span className="cash-green" style={{ color: "#55AF55" }}>cash.</span>
								</Text>
							</Section>

							{/* Section 3 */}
							<Section>
								<Text className="main-text text-[16px] leading-[26px] font-semibold" style={{ color: "#00001E" }}>
									Launching in the next few weeks.
								</Text>
								<Text className="main-text text-[16px] leading-[26px] font-semibold" style={{ color: "#00001E" }}>
									We'll hit your inbox when we're live.
								</Text>
							</Section>
						</Section>

						{/* Footer section - outside the border */}
						<Section className="text-left mx-16">
							<Row>
								<Column colSpan={4}>
									<Link href="https://wiretap.pro" style={{ display: "inline-block", width: "36px" }}>
										<Img
											alt="Wiretap logo"
											height="36"
											width="36"
											src="https://wiretap.pro/logo512.png"
										/>
									</Link>
									<Text className="my-[8px] font-semibold text-[16px] text-[#00001E] leading-[24px] main-text" style={{ color: "#00001E" }}>
										Wiretap
									</Text>
									<Text className="mt-[4px] mb-[0px] text-[16px] text-[#00001E] leading-[24px] main-text" style={{ color: "#00001E" }}>
										Paper trading for Polymarket
									</Text>
								</Column>
								<Column colSpan={4}>
									<Link href="https://x.com/wiretap_pro" style={{ display: "inline-block", width: "36px" }}>
										<Img alt="X" height="36" width="36" src="https://react.email/static/x-logo.png" />
									</Link>
									<Text className="my-[8px] font-semibold text-[16px] text-[#00001E] leading-[24px] main-text" style={{ color: "#00001E" }}>
										New York, NY
									</Text>
									<Text className="mt-[4px] mb-[0px] text-[16px] text-[#00001E] leading-[24px] main-text" style={{ color: "#00001E" }}>
										<Link href="mailto:hello@wiretap.pro" className="text-[#00001E] no-underline main-text" style={{ color: "#00001E" }}>
											hello@wiretap.pro
										</Link>
									</Text>
								</Column>
							</Row>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}
