@ORS-20

Feature: Publish an event to datahub
	
Scenario: When a valid payload is published 
		When I publish a payload:  {"messageType": "order","payload": {"amount": "1000","count": "4"}}
		Then I get an eventId greater than 0

Scenario: When a valid payload is published using invalid data hub host
		When I publish a payload using unexisting data hub host:  {"messageType": "order","payload": {"amount": "1000","count": "4"}}
		Then I get an eventId equal to 0