import { SystemCredentials, Subscriber } from '.'

export interface Product {
	code: string
	body: string
}

export interface XMLWrapperOptions {
	system: SystemCredentials
	subscriber: Subscriber
	product: Product
	production: boolean
}

export const XMLWrapper = ({ system, subscriber, product, production }: XMLWrapperOptions) => {
	const processingEnvironment = production === true ? 'production' : 'standardTest'
	return `<?xml version="1.0" encoding="utf-8"?>
	<xmlrequest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope" xmlns="http://www.netaccess.transunion.com/namespace">
		<systemId>${system.id}</systemId>
		<systemPassword>${system.password}</systemPassword>
		<productrequest>
			<creditBureau xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://www.transunion.com/namespace" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<document>request</document>
				<version>2.33</version>
				<transactionControl>
					<subscriber>
						<industryCode>${subscriber.industryCode}</industryCode>
						<memberCode>${subscriber.memberCode}</memberCode>
						<inquirySubscriberPrefixCode>${subscriber.prefix}</inquirySubscriberPrefixCode>
						<password>${subscriber.password}</password>
					</subscriber>
					<options>
						<processingEnvironment>${processingEnvironment}</processingEnvironment>
						<country>us</country>
						<language>en</language>
						<contractualRelationship>individual</contractualRelationship>
						<pointOfSaleIndicator>none</pointOfSaleIndicator>
					</options>
				</transactionControl>
				<product>
					<code>${product.code}</code>
					${product.body}
					<responseInstructions>
						<returnErrorText>true</returnErrorText>
					</responseInstructions>
					<permissiblePurpose>
						<code>CI</code>
						<inquiryECOADesignator>individual</inquiryECOADesignator>
					</permissiblePurpose>
				</product>
			</creditBureau>
		</productrequest>
	</xmlrequest>`
}
