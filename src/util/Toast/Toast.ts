import './sass/toast.scss';

export default class Toast{
    public toast: (options: any) => void;

    constructor() {
        // @ts-ignore
        this.toast = M.toast;
    }

    show(options: any) {
        this.toast(options);
    }
}