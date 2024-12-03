function generateTimeSlots(startTime, endTime, interval) {
    const slots = [];
    let [startHour, startMinute] = startTime.split(':').map(Number);
    let [endHour, endMinute] = endTime.split(':').map(Number);

    let current = new Date(0, 0, 0, startHour, startMinute);
    const end = new Date(0, 0, 0, endHour, endMinute);

    while (current <= end) {
        const hours = String(current.getHours()).padStart(2, '0');
        const minutes = String(current.getMinutes()).padStart(2, '0');
        slots.push(`${hours}:${minutes}`);

        // Add interval in minutes"
        current.setMinutes(current.getMinutes() + interval);
    }

    return slots;
}

module.exports = { generateTimeSlots }