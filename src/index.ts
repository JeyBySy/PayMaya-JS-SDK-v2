import {
    CreateCheckoutObject,
    CreateSinglePaymentObject,
    CreateWalletLinkObject,
    CreditCardFormOptions
} from './interfaces';

class PayMayaSDK {
    private publicKey: string = '';
    private isSandbox: boolean = true;
    private apiUrl: string = this.isSandbox ? 'https://pg-sandbox.paymaya.com' : 'https://pg.paymaya.com';

    public init(publicKey: string, isSandbox: boolean) {
        this.publicKey = btoa(publicKey);
        this.isSandbox = isSandbox;
    }

    private checkData(data: any) {
        if (!data) {
            throw Error()
        }
    }

    private checkIfInitialized() {
        if (this.publicKey === '') {
            throw Error('You must first run init() method!')
        }
    }

    private async genericRequestFn(requestMethod: string, requestBody: any, url: string) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${this.publicKey}`
            },
            method: requestMethod,
            body: JSON.stringify(requestBody)
        };
        const apiCall = await fetch(`${this.apiUrl}${url}`, config);
        const response = await apiCall.json();
        if (apiCall.status === 200 && response.redirectUrl !== undefined && response.redirectUrl !== '') {
            return response;
        } else {
            throw response
        }
    }

    // TODO: switch url compare value
    public getTransactionId(callback: (arg: string) => void) {
        try {
            this.checkIfInitialized();
            this.checkData({}.toString.call(callback) === '[object Function]');
            window.addEventListener('message', (event) => {
                if (event.origin === 'https://codingspace.atthouse.pl') {
                    const data = JSON.parse(event.data);
                    callback(data.paymentTokenId)
                }
            })
        } catch (e) {
            console.error(e);
            console.error('SDK: getTransactionId(callback) - callback must be a function')
        }

    }

    public async createCheckout(checkoutRequestObject: CreateCheckoutObject) {
        try {
            this.checkIfInitialized();
            const response = await this.genericRequestFn('POST', checkoutRequestObject, '/checkout/v1/checkouts');
            window.location.href = response.redirectUrl;
        } catch (e) {
            console.error(e);
        }
    }

    public async createWalletLink(walletLinkRequestObject: CreateWalletLinkObject) {
        try {
            this.checkIfInitialized();
            const response = await this.genericRequestFn('POST', walletLinkRequestObject, '/payby/v2/paymaya/link');
            window.location.href = response.redirectUrl;
        } catch (e) {
            console.error(e)
        }
    }

    public async createSinglePayment(singlePaymentRequestObject: CreateSinglePaymentObject) {
        try {
            this.checkIfInitialized();
            const response = await this.genericRequestFn('POST', singlePaymentRequestObject, '/payby/v2/paymaya/payments');
            window.location.href = response.redirectUrl;
        } catch (e) {
            console.error(e)
        }
    }

    public createCreditCardForm(targetHtmlElement: HTMLElement, options?: CreditCardFormOptions) {
        try {
            this.checkIfInitialized();
            this.checkData(targetHtmlElement instanceof HTMLElement);
            const iframeInstance = document.createElement('iframe');
            iframeInstance.setAttribute('id', 'paymaya-card-form');
            // TODO: switch url
            iframeInstance.setAttribute('src', `https://codingspace.atthouse.pl/?sandbox=${String(this.isSandbox)}&publicKey=${this.publicKey}&options=${JSON.stringify(options)}`);
            targetHtmlElement.appendChild(iframeInstance);
            return this;
        } catch (e) {
            console.error(e);
            console.error('SDK: createCreditCardform(targetHtmlElement, options) - targetHtmlElement must be an appendable html element');
        }

    }
}

export default new PayMayaSDK();
