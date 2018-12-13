import {MouseEvent} from 'react';

type Action = {
    text: string,
    onClick: (e: MouseEvent<HTMLAnchorElement>) => void
}

export default Action;