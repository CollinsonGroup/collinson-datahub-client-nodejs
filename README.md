# event-publisher
<h1>A small package used to publish event to a data-hub</h1>
<p>In order to send an event, need to provide eventData and options.</p>
<ul>
<li>eventData - represent a json with metadata and payload</li>
<li>options - define the host url,http protocol for data hub,API key if required,retry interval and metadata validation mode</li>
</ul>
<p>Event is sent to Data Hub Api that redirects it to amazon kinesis. <br /> 
In case event failed to publish, the event-publisher will retry to send it again. <br /> 
By default retry interval is [1000,2000,4000]. That means event will be republished after 1,2 and 4 seconds.<br /> 
Of course it will stop resending once the event is published with success.</p>

<p> Besides the retry mechanism, the package uses a circuit breaker to avoid sending messages <br/>
when data hub api is down for a long period of time. The following implementation is used https://github.com/yammer/circuit-breaker-js<br />
Please check this short video that explains how circuit breaker is working https://www.youtube.com/watch?v=DOocsQj4M9o </p>
## Installation

```sh
$ npm install https://github.com/CollinsonGroup/collinson-datahub-client-nodejs --save-dev
```

## Usage

```js
var eventPublisher = require('event-publisher');
var eventData =  {
	resourceVersion: 1, // The int value of the specific version of metadata that the service is sending in it's messages.
	source: "offer.api", // The name of the originating service that is sending the event message.
	tenant: "1", // The name of the client that the service created the event for.
	messageType: "order", //  The name of the event that the message holds information about.
	payload: {       // event data
		amount:100,
		count:3,
		productId:1
	}
};

var options = {
	datahub: {
		host: 'qa.datahub-api.latitude-dev.local', // the data hub host
		protocol: 'http', //possible value http and https
		apiKey: 'dGVzdEFwaUtleQ==' // API key if required by data hub install (optional)
	},
	// the npm package support retries in case an event failed to publish
	// default interval is [1000,2000,4000] that represent the time in milliseconds.
	// the package allow to ovveride the interval by setting a custom one
	retry: {
		interval: [1000, 2000]
	}
	// in case medatata fields should not be validated we can set validation strictMode to false. By default is set to true 
	validation: {
        strictMode: true
    }
	// we may define ovveride default values for circuit breaker
	 circuitBreaker: {
        windowDuration: 5000,
        numBuckets: 5,
        timeoutDuration: 10000,
        errorThreshold: 50,
        volumeThreshold: 5
    },
}

//Publish method returns a promise that gives an result {data:integer, errors:string[]}
//If there are any errors we can log them. Data is the saved event id.
eventPublisher().publish(eventData,options).then(function(result){
	if(result.errors.length > 0)
	{
		//write into log files
	}
	return result.data;
});
 
```

<p>To avoid sending event metadata and options every time need to send an event, a proxy module can be defined.<br />
The proxy module requires the package and set the metadata and options values.<br />
When sending an event, need to pass the payload and messageType to the proxyModule.<br />
For example:</p>

```js

// let say we have the config file
var config = {
	medatada: {
		resourceVersion: 1,
		source: 'SourceName',
		tenant: 'tenantKey',
	},
	options: {
		datahub: {
			host: 'localhost.datahub.local',
			protocol: 'http'
		},
		// ovveride retry with custom interval if required
		retry: {
			interval: [1000, 2000, 4000]
		},
		// ovveride validation strict mode if required
		validation: {
        	strictMode: false
    	}
	}
};

//create a proxy module that accept an object with messageType and payload
var config = require('config');
var eventPublisher = require('event-publisher');

var eventPublisherProxy = function eventPublisherProxy() {

	function publish(eventMsg) {
		var eventToPublish = buildEventToPublish();
		return eventPublisher().publish(eventToPublish, config.options)
	}

	function buildEventToPublish(eventMsg) {
		var eventToPublish = config.medatada;
		eventToPublish.messageType = eventMsg.messageType;
		eventToPublish.payload = eventMsg.payload;
		return eventToPublish;
	}

	return {
		publish: publish
	};
};

module.exports = eventPublisherProxy;

//require the proxy module wherever a event message need to be published
var eventPublisherProxy = require('eventPublisherProxy');
var eventMsg = {
	messageType: "order",
	payload: {
		productSku:"sku",
		amount:"100",
		count:"3"
	}
}
eventPublisherProxy().publish(eventMsg);

```

## License

MIT

## Release History

* 0.1.0 Initial release