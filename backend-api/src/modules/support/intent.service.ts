export const detectIntent = (message: string) => {
    const text = message.toLowerCase();

    if (
        text.includes('application') || 
        text.includes('pending') ||
        text.includes('stuck')
    ){
        return 'APPLICATION';
    }

    if (
        text.includes('payment') ||
        text.includes('refund') ||
        text.includes('money')
    ){
        return 'PAYMENT';
    }

    if (
        text.includes('kyc') ||
        text.includes('verification') ||
        text.includes('adhaar') ||
        text.includes('pan')
    ){
        return 'KYC';
    }

    if (
        text.includes('insurance') ||
        text.includes('claim')
    ) {
        return 'INSURANCE';
    }

    return 'UNKNOWN';
};