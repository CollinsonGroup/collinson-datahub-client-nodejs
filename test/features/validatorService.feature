@ORS-4

Feature: Validate json
	
Scenario: resourceVersion is validated
		When I send json: {"resourceVersion": "", "source": "12", "tenant": "123", "createdDateTime": "2016-11-25T15:43:12,8054165Z", "messageType": "1", "payload": "{amount:100}"}
		Then I get the error message: Resource Version is required!

Scenario: source is validated
		When I send json: {"resourceVersion": "1", "source": "", "tenant": "123", "createdDateTime": "2016-11-25T15:43:12,8054165Z", "messageType": "1", "payload": "{amount:100}"}
		Then I get the error message: Source is required!
		
Scenario: tenant is validated
		When I send json: {"resourceVersion": "1", "source": "12", "tenant": "", "createdDateTime": "2016-11-25T15:43:12,8054165Z", "messageType": "1", "payload": "{amount:100}"}
		Then I get the error message: Tenant is required!
		
Scenario: messageType is validated
		When I send json: {"resourceVersion": "1", "source": "12", "tenant": "123", "createdDateTime": "2016-11-25T15:43:12,8054165Z", "messageType": "", "payload": "{amount:100}"}
		Then I get the error message: MessageType is required!
		
Scenario: payload is validated
		When I send json: {"resourceVersion": "1", "source": "12", "tenant": "123", "createdDateTime": "2016-11-25T15:43:12,8054165Z", "messageType": "1", "payload": ""}
		Then I get the error message: Payload is not a valid json object!

Scenario: data hub host is validated
		When I send data hub options: {"host":"", "protocol":"http"}
		Then I get the error message: Data hub host is missing!

Scenario: data hub protocol is not empty
		When I send data hub options: {"host":"local.datahub.com", "protocol":""}
		Then I get the error message: Http protocol is missing!

Scenario: data hub protocol has a valid value
		When I send data hub options: {"host":"local.datahub.com", "protocol":"invalid"}
		Then I get the error message: Protocol possible value are : http or https!

Scenario: json is invalid
		When I send json with invalid payload: {"resourceVersion": "1", "source": "12", "tenant": "123", "createdDateTime": "2016-11-25T15:43:12,8054165Z", "messageType": "1", "payload": ""}
		Then I get the error message: Payload is not a valid json object!