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
					<Container className="mx-auto py-[20px] pb-[48px] max-w-[560px]">
						<Heading className="text-[#00001E] text-[24px] font-bold my-[40px] p-0">
							Welcome to <span className="text-[#0041DC]">Wiretap</span> Paper trading for Polymarket.
						</Heading>
						<Text className="text-[#00001E] text-[16px] leading-[26px]">
							Test your forecasting skills
						</Text>
						<Text className="text-[#00001E] text-[16px] leading-[26px]">
							and see if you can beat the market.
						</Text>
						<Text className="text-[#00001E] text-[16px] leading-[26px]">
							All without putting up real cash.
						</Text>
						<Text className="text-[#00001E] text-[16px] leading-[26px]">
							Launching in the next few weeks.
						</Text>
						<Text className="text-[#00001E] text-[16px] leading-[26px]">
							We'll hit your inbox when we're live.
						</Text>
						<Section className="py-[27px]">
							<Button className="bg-black rounded-lg text-[#00001E] text-[16px] no-underline text-center block px-5 py-3" href="https://wiretap.pro">
								Get Started
							</Button>
						</Section>
						<Section>
							<Row>
								<Column colSpan={4}>
									<Img
										alt="Wiretap logo"
										height="42"
										src="https://react.email/static/logo-without-background.png"
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
