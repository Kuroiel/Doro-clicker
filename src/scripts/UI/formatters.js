export class Formatters {
    formatNumber(num, decimalPlaces = 0, scientificThreshold = null, roundDown = false, context = 'default') {
        if (num === null || num === undefined || typeof num !== 'number' || isNaN(num)) {
            return '0';
        }

        let threshold;
        switch(context.toLowerCase()) {
            case 'score': threshold = 1000000000; break;
            case 'cost': threshold = 1000000; break;
            case 'dps': threshold = 100000; break;
            default: threshold = 1000000;
        }
        
        if (scientificThreshold !== null) {
            threshold = scientificThreshold;
        }

        let processedNum = roundDown ? Math.floor(num) : num;
        
        if (Math.abs(processedNum) >= threshold) {
            return processedNum.toExponential(2);
        }

        const options = {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces
        };
        
        if (typeof processedNum.toLocaleString === 'function') {
            return processedNum.toLocaleString(undefined, options);
        }

        const parts = processedNum.toFixed(decimalPlaces).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.length > 1 ? parts.join('.') : parts[0];
    }

    formatUpgradeCost(cost) {
        try {
            const costValue = typeof cost === 'function' ? cost() : cost;
            return this.formatNumber(costValue, 0, null, true, 'cost');
        } catch (error) {
            console.error('Error formatting upgrade cost:', error);
            return '0';
        }
    }
}