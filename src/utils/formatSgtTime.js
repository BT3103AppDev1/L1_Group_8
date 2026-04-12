// format current date to "YYYY-MM-DD" in Singapore Timezone
export function getSgtDateKey() {
    const now = new Date();
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Singapore",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(now); // returns "YYYY-MM-DD"
}

// format current date to "YYYY-MM-DD_HH" in Singapore Timezone (for hourly click tracking)
export function getSgtHourKey() {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Singapore",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        hour12: false,
    }).formatToParts(now);
    const get = (type) => parts.find(p => p.type === type)?.value ?? '00';
    const hour = get('hour') === '24' ? '00' : get('hour');
    return `${get('year')}-${get('month')}-${get('day')}_${hour}`;
}

// format current date to "YYYY-MM" in Singapore Timezone
export function getSgtYearMonth() {
    const now = new Date();
    const sgtYrMonth = new Intl.DateTimeFormat("en-CA", { 
        timeZone: "Asia/Singapore",
        year: "numeric",
        month: "2-digit",
    }).format(now);
    return sgtYrMonth;
}

// Get last month in "YYYY-MM" format in Singapore Timezone
export function getLastMonthKey() {
    const sgtYrMonth = getSgtYearMonth();
    const [year, month] = sgtYrMonth.split('-').map(Number);

    const lastMonth = month === 1 ? 12 : month - 1;
    const lastYear = month === 1 ? year - 1 : year;

    return `${lastYear}-${String(lastMonth).padStart(2, '0')}`;
}

// Get milliseconds until the first day of next month midnight 00:00:00 in Singapore Timezone
export function getMsToSgtNextMonth() {
    const now = new Date();
    const sgtYrMonth = getSgtYearMonth();
    const [year, month] = sgtYrMonth.split('-').map(Number);

    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;

    const nextMonthDate = new Date(nextYear, nextMonth - 1, 1); 
    return nextMonthDate - now;
}

// format USC timestamp to "DD/MM/YYYY HH:mm:ss" in Singapore Timezone
export function formatTimestamp(timestamp) {
    if (!timestamp) {
        return '-';
    }

    let date;
    if (timestamp.toDate) {
        date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
        date = timestamp;
    } else {
        date = new Date(timestamp);
    }

    const parts = new Intl.DateTimeFormat("en-GB", { 
        timeZone: "Asia/Singapore",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    }).formatToParts(date);
    const getPart = (type) => parts.find(p => p.type === type)?.value ?? '-';
    return `${getPart('day')}/${getPart('month')}/${getPart('year')} ${getPart('hour')}:${getPart('minute')}:${getPart('second')}`;
}