Feature: Retry mechanism 
	
Scenario: Retry to execute an action that always fail
		When I try to execute an action that always fail, in interval: {"retryInterval": [1,1,1]}
		Then Total number of attempts is 4

Scenario: Retry to execute an action that succeed on last retry
		When I try to execute an action that succeed on last retry, in interval: {"retryInterval": [1,1,1]}
		Then Total number of attempts is 3
