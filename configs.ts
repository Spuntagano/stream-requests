const configs:any = {
    testing: {
        notifierURL: 'https://localhost.rig.twitch.tv:8080/notifier.html',
        relayURL: 'https://docker.dev:3002'
    },
    hosted_test: {
        notifierURL: 'https://notifier-staging.stream-requests.com',
        relayURL: 'https://api.stream-requests.com:8043'
    },
    in_review: {
        notifierURL: 'https://notifier-staging.stream-requests.com',
        relayURL: 'https://api.stream-requests.com:8043'
    },
    pending_action: {
        notifierURL: 'https://notifier-staging.stream-requests.com',
        relayURL: 'https://api.stream-requests.com:8043'
    },
    approved: {
        notifierURL: 'https://notifier-staging.stream-requests.com',
        relayURL: 'https://api.stream-requests.com:8043'
    },
    released: {
        notifierURL: 'https://notifier.stream-requests.com',
        relayURL: 'https://api.stream-requests.com'
    }
};

export default configs;