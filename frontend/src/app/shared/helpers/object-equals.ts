const ObjectEquals = (first: any, second: any, exclude: any): boolean => {
    if (typeof first === 'object' && typeof second === 'object') {
        for (const key in first) {
            if (exclude.includes(key)) {
                continue;
            }
            if (key && second.hasOwnProperty(key)) {
                const f_val: any = first[key];
                const s_val: any = second[key];
                if (Array.isArray(f_val)) {
                    if (!ArrayEquals(f_val, s_val, exclude)) return false
                }
                else if (typeof f_val === 'object') {
                    if (!ObjectEquals(f_val, s_val, exclude)) return false
                }
                else {
                    if (f_val !== s_val) return false
                }
            } else return false;
        }
        return true;
    } else return false;
}

const ArrayEquals = (first: any, second: any, exclude: any): boolean => {
    if (Array.isArray(first) && Array.isArray(second) && (first.length === second.length)) {
        for (let i: number = 0; i < first.length; i++) {
            if (first.hasOwnProperty(i) && second.hasOwnProperty(i)) {
                const f_val: any = first[i];
                const s_val: any = second[i];
                if (exclude.includes(f_val) || exclude.includes(s_val)) continue
                if (Array.isArray(f_val)) {
                    if (!ArrayEquals(f_val, s_val, exclude)) return false;
                }
                else if (typeof f_val === 'object') {
                    if (!ObjectEquals(f_val, s_val, exclude)) return false;
                }
                else {
                    if (f_val !== s_val) return false;
                }

            } else return false
        }
        return true;

    } else return false;
}

export { ObjectEquals };