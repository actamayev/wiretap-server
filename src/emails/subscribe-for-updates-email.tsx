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
			<Head />
			<Preview>Welcome to Wiretap - Paper trading for Polymarket</Preview>
			<Tailwind>
				<Body className="bg-white font-sans">
					<Container className="mx-auto py-[20px] pb-[48px] max-w-[560px] text-center">
						{/* Section 1 */}
						<Section className="mb-[40px]">
							<Heading className="text-[#00001E] text-[24px] font-bold p-0">
								Welcome to <span className="text-[#0041DC]">Wiretap</span>
							</Heading>
							<Text className="text-[#00001E] text-[16px] leading-[26px]">
								Paper trading for Polymarket
							</Text>
						</Section>

						{/* Section 2 */}
						<Section className="mb-[40px]">
							<Text className="text-[#00001E] text-[16px] leading-[26px]">
								Test your forecasting skills
							</Text>
							<Text className="text-[#00001E] text-[16px] leading-[26px]">
								and see if you can beat the market.
							</Text>
							<Text className="text-[#00001E] text-[16px] leading-[26px]">
								All without putting up real <span className="text-[#55AF55]">cash.</span>
							</Text>
						</Section>

						{/* Section 3 */}
						<Section className="mb-[40px]">
							<Text className="text-[#00001E] text-[16px] leading-[26px]">
								Launching in the next few weeks.
							</Text>
							<Text className="text-[#00001E] text-[16px] leading-[26px]">
								We'll hit your inbox when we're live.
							</Text>
						</Section>
						<Section>
							<Row>
								<Column colSpan={4}>
									<Img
										alt="Wiretap logo"
										height="42"
										src="https://wiretap.pro/logo512.png"
									/>
									<Text className="my-[8px] font-semibold text-[16px] text-[#00001E] leading-[24px]">
										Wiretap
									</Text>
									<Text className="mt-[4px] mb-[0px] text-[16px] text-[#00001E] leading-[24px]">
										Paper trading for Polymarket
									</Text>
								</Column>
								<Column align="left" className="table-cell align-bottom">
									<Row className="table-cell h-[44px] w-[56px] align-bottom">
										<Column className="pr-[8px]">
											<Link href="x.com/wiretap_pro">
												<Img alt="X" height="36" src="https://react.email/static/x-logo.png" width="36" />
											</Link>
										</Column>
									</Row>
									<Row>
										<Text className="my-[8px] font-semibold text-[16px] text-[#00001E] leading-[24px]">
											New York, NY
										</Text>
									</Row>
								</Column>
							</Row>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}
