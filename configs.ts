const configs:any = {
    testing: {
        notifierURL: 'http://localhost:3005',
        relayURL: 'https://docker.dev:3002'
    },
    hosted_test: {
        notifierURL: 'http://stream-requests-notifier-staging.s3-website-us-west-2.amazonaws.com',
        relayURL: 'https://104.248.117.94:8043'
    },
    released: {
        notifierURL: 'http://stream-requests-notifier.s3-website-us-west-2.amazonaws.com',
        relayURL: 'https://104.248.117.94'
    }
};

export default configs;