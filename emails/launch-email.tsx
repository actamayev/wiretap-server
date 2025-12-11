/* eslint-disable max-len */
import React from "react"
import {
	Body,
	Container,
	Head,
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

// eslint-disable-next-line @typescript-eslint/naming-convention, max-lines-per-function
export default function LaunchEmail(): React.ReactNode {
	return (
		<Html>
			<Head>
				<link href="https://fonts.googleapis.com/css2?family=Young+Serif&display=swap" rel="stylesheet" />
				<meta name="color-scheme" content="light dark" />
				<meta name="supported-color-schemes" content="light dark" />
				<style>{`
					/* Force colors to stay consistent - works in Gmail */
					.wiretap-blue {
						color: #0041DC !important;
						-webkit-text-fill-color: #0041DC !important;
					}
					.cash-green {
						color: #4BC84B !important;
						-webkit-text-fill-color: #4BC84B !important;
					}
					/* Prevent image color filters in Gmail */
					img {
						filter: none !important;
						-webkit-filter: none !important;
						opacity: 1 !important;
					}
					@media (prefers-color-scheme: dark) {
						body {
							background-color: #00001E !important;
						}
						.wiretap-blue {
							color: #0041DC !important;
							-webkit-text-fill-color: #0041DC !important;
						}
						.cash-green {
							color: #4BC84B !important;
							-webkit-text-fill-color: #4BC84B !important;
						}
						/* Prevent image filters in dark mode */
						img {
							filter: none !important;
							-webkit-filter: none !important;
							opacity: 1 !important;
						}
					}
					@media screen and (max-width: 600px) {
						.footer-section {
							margin-left: auto !important;
							margin-right: auto !important;
							max-width: 90% !important;
						}
					}
					/* Gmail-specific fixes */
					u + .body .wiretap-blue {
						color: #0041DC !important;
						-webkit-text-fill-color: #0041DC !important;
					}
					u + .body .cash-green {
						color: #4BC84B !important;
						-webkit-text-fill-color: #4BC84B !important;
					}
					u + .body img {
						filter: none !important;
						-webkit-filter: none !important;
					}
				`}</style>
			</Head>
			<Preview>Paper trading is live on Wiretap</Preview>
			<Tailwind>
				<Body className="bg-white" style={{ fontFamily: "\"Young Serif\", Georgia, \"Times New Roman\", serif" }}>
					<Container className="mx-auto pb-[20px] pb-[48px] max-w-[560px]">
						{/* Bordered container for the main content */}
						<Section className="mb-[16px] text-center bordered-section">
							{/* Main content section */}
							<Section className="mb-[16px]">
								<Text className="main-text text-[16px] leading-[20px] font-semibold" style={{ color: "#00001E" }}>
									Hey,
								</Text>
							</Section>

							<Section className="mb-[16px]">
								<Text className="main-text text-[16px] leading-[20px] font-semibold" style={{ color: "#00001E" }}>
									Paper trading is live.
								</Text>
								<Text className="main-text text-[16px] leading-[20px] font-semibold" style={{ color: "#00001E" }}>
									Go to <Link href="https://wiretap.pro" className="wiretap-blue no-underline" style={{ color: "#0041DC", textDecoration: "none" }}>wiretap.pro</Link>, create an account, and you can start trading immediately.
								</Text>
							</Section>

							<Section className="mb-[16px]">
								<Text className="main-text text-[16px] leading-[20px] font-semibold" style={{ color: "#00001E" }}>
									Thank you for your interest in Wiretap.
								</Text>
								<Text className="main-text text-[16px] leading-[20px] font-semibold" style={{ color: "#00001E" }}>
									As you use it, please use the feedback button to let us know what you need or what's not working.
								</Text>
								<Text className="main-text text-[16px] leading-[20px] font-semibold" style={{ color: "#00001E" }}>
									We're shipping updates every day and building based on your feedback.
								</Text>
							</Section>

							<Section>
								<Text className="main-text text-[16px] leading-[20px] font-semibold" style={{ color: "#00001E" }}>
									Thanks,
								</Text>
								<Text className="main-text text-[16px] leading-[20px] font-semibold" style={{ color: "#00001E" }}>
									Levi & Ariel
								</Text>
							</Section>
						</Section>

						{/* Footer section - outside the border */}
						<Section className="footer-section mt-[40px]" style={{ marginTop: "50px", maxWidth: "400px", marginLeft: "auto", marginRight: "auto", textAlign: "center" }}>
							<div style={{ textAlign: "center", display: "inline-block" }}>
								<Row>
									<Column colSpan={4} style={{ paddingRight: "20px", textAlign: "center" }}>
										<Link href="https://wiretap.pro" style={{ display: "inline-block", width: "36px" }}>
											<Img
												alt="Wiretap logo"
												height="36"
												width="36"
												src="https://wiretap.pro/logo512.png"
											/>
										</Link>
										<Text className="my-[4px] font-semibold text-[16px] text-[#00001E] leading-[18px] main-text" style={{ color: "#00001E" }}>
										Wiretap
										</Text>
										<Text className="mt-[1px] mb-[0px] text-[16px] text-[#00001E] leading-[18px] main-text" style={{ color: "#00001E", visibility: "hidden" }}>
										&nbsp;
										</Text>
									</Column>
									<Column colSpan={4} style={{ paddingLeft: "20px", textAlign: "center" }}>
										<Link href="https://x.com/wiretap_pro" style={{ display: "inline-block", width: "36px" }}>
											<Img alt="X" height="36" width="36" src="https://react.email/static/x-logo.png" />
										</Link>
										<Text className="my-[4px] font-semibold text-[16px] text-[#00001E] leading-[18px] main-text" style={{ color: "#00001E" }}>
										New York, NY
										</Text>
										<Text className="mt-[1px] mb-[0px] text-[16px] text-[#00001E] leading-[18px] main-text" style={{ color: "#00001E" }}>
											<Link href="mailto:hello@wiretap.pro" className="text-[#00001E] no-underline main-text" style={{ color: "#00001E" }}>
											hello@wiretap.pro
											</Link>
										</Text>
									</Column>
								</Row>
							</div>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}
