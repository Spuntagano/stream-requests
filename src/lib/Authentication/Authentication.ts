import * as jwt from 'jsonwebtoken';

type State = {
    token: string,
    opaque_id: string,
    user_id: string,
    isMod: boolean,
    role: string,
    channel_id: string,
    client_id: string
};
/**
 * Helper class for authentication against an EBS service. Allows the storage of a token to be accessed across componenents.
 * This is not meant to be a source of truth. Use only for presentational purposes.
 */
export default class Authentication{
    public state: State;

    constructor(token?: string, opaque_id?: string){
        this.state={
            token,
            opaque_id,
            user_id:"",
            isMod:false,
            role:"",
            channel_id:"",
            client_id:""
        }
    }

    isLoggedIn(){
        return this.state.opaque_id[0] === 'U';
    }

    // This does guarantee the user is a moderator- this is fairly simple to bypass - so pass the JWT and verify
    // server-side that this is true. This, however, allows you to render client-side UI for users without holding on a backend to verify the JWT.
    // Additionally, this will only show if the user shared their ID, otherwise it will return false.
    isModerator(){
        return this.state.isMod;
    }

    // similar to mod status, this isn't always verifiable, so have your backend verify before proceeding.
    hasSharedId(){
        return !!this.state.user_id;
    }

    getUserId(){
        return this.state.user_id;
    }

    getChannelId(){
        return this.state.channel_id;
    }

    getOpaqueId(){
        return this.state.opaque_id;
    }

    // set the token in the authentication componenent state
    // this is naive, and will work with whatever token is returned. under no circumstances should you use this logic to trust private data- you should always verify the token on the backend before displaying that data.
    setToken(token: string, opaque_id: string, channel_id: string, client_id: string){
        let isMod = false;
        let role = "";
        let user_id = "";

        try {
            let decoded:any = jwt.decode(token);

            if(decoded.role === 'broadcaster' || decoded.role === 'moderator'){
                isMod = true;
            }

            user_id = decoded.user_id;
            role = decoded.role;
        } catch (e) {
            token='';
            opaque_id='';
            channel_id='';
            client_id='';
        }

        this.state={
            token,
            opaque_id,
            isMod,
            user_id,
            role,
            channel_id,
            client_id
        };
    }

    // checks to ensure there is a valid token in the state
    isAuthenticated(){
        return !!(this.state.token && this.state.opaque_id);
    }

    /**
     * Makes a call against a given endpoint using a specific method.
     *
     * Returns a Promise with the Request() object per fetch documentation.
     *
     */

    makeCall(url: string, method: string = "GET", body: object = undefined): Promise<object> {
        return new Promise<object>((resolve: any, reject: any)=>{
            if(this.isAuthenticated()){
                let headers={
                    'clientId':this.state.client_id,
                    'Content-Type':'application/json',
                    'Authorization': `Bearer ${this.state.token}`
                };

                fetch(url,
                    {
                        method,
                        body: JSON.stringify(body),
                        headers,
                    })
                    .then((response) => {
                        if (response.ok) {
                            resolve(response);
                        } else {
                            reject(response);
                        }
                    })
                    .catch(e => reject(e))
            }else{
                reject('Unauthorized')
            }
        })
    }
}
