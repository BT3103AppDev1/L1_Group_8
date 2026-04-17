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

// Get milliseconds until the first day of next month in Singapore Timezone with a buffer (default 1 minute) to ensure it's next month in SGT when the timer triggers
export function getMsToSgtNextMonth(bufferMs = 60000) {
    const now = new Date();
    const sgtYrMonth = getSgtYearMonth();
    const [year, month] = sgtYrMonth.split('-').map(Number);

    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;

    const nextMonthDate = new Date(nextYear, nextMonth - 1, 1); 
    return nextMonthDate - now + bufferMs; // add buffer to ensure it's next month in SGT
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

// Convert "YYYY-MM" string to a more readable format like "Month YYYY"
export function getMonthYearString(sgtYearMonth) {
    const [year, month] = sgtYearMonth.split('-');
    const monthName = new Date(year, month - 1).toLocaleString('en-SG', { month: 'long' });
    return `${monthName} ${year}`;
}

export function getYearMonthFromOffset(offset) {
    const sgtYrMonth = getSgtYearMonth();
    const [year, month] = sgtYrMonth.split('-').map(Number);
    const targetMonth = month + offset;
    const adjustedYear = year + Math.floor((targetMonth - 1) / 12);
    const adjustedMonth = ((targetMonth - 1) % 12 + 12) % 12 + 1;
    return {year: adjustedYear, month: adjustedMonth};
}

export function getMonthKeyFromOffset(offset) {
    const { year, month } = getYearMonthFromOffset(offset);
    return `${year}-${String(month).padStart(2, '0')}`;
}

export function getMonthLabelsFromOffset() {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthBeforePrev = getYearMonthFromOffset(-2).month;
    const prevMonth = getYearMonthFromOffset(-1).month;
    const currentMonth = getYearMonthFromOffset(0).month;
    const monthBeforePrevLabel = months[monthBeforePrev - 1];
    const prevMonthLabel = months[prevMonth - 1];
    const currentMonthLabel = months[currentMonth - 1];
    return [monthBeforePrevLabel, prevMonthLabel, currentMonthLabel];
}

export function formatListingDate(createdAt) {
    if (!createdAt) {
        return 'N/A';
    }
    
    let date;
    if (createdAt.toDate) {
        date = createdAt.toDate();
    } else if (createdAt instanceof Date) {
        date = createdAt;
    } else {
        date = new Date(createdAt);
    }

    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Singapore",
        year: "numeric",
        month: "short",
        day: "numeric",
    }).formatToParts(date);
    const getPart = (type) => parts.find(p => p.type === type)?.value ?? '-';
    return `${getPart('day')} ${getPart('month')} ${getPart('year')}`;
}
