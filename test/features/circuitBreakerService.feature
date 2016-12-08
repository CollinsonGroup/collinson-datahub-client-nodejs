Feature: Circuit breaker
	
Scenario: Execute an action that always fails
		Given I configure circuit breaker to open after 4 attempt
		When I execute an action that always fail for 10 times
		Then Action is executed only 5 times
