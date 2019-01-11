const configs:any = {
    testing: {
        notifierURL: 'https://localhost.rig.twitch.tv:8080/notifier.html',
        relayURL: 'https://docker.dev:3002'
    },
    hosted_test: {
        notifierURL: 'http://stream-requests-notifier-staging.s3-website-us-west-2.amazonaws.com',
        relayURL: 'https://stream-requests.com:8043'
    },
    released: {
        notifierURL: 'http://stream-requests-notifier.s3-website-us-west-2.amazonaws.com',
        relayURL: 'https://stream-requests.com'
    }
};

export default configs;