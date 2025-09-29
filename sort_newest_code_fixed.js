// Fixed Sort Newest Code with Error Handling
const allItems = $input.all();

if (allItems.length <= 1) {
  return allItems;
}

const newest = allItems.reduce((latest, current) => {
  // Parse DD/MM/YYYY format properly with error handling
  const parseDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') {
      console.log('Invalid date string:', dateStr);
      return new Date(0); // Return epoch if invalid
    }

    const [datePart, timePart = '00:00:00'] = dateStr.split(' ');
    if (!datePart) {
      console.log('No date part found:', dateStr);
      return new Date(0);
    }

    const dateParts = datePart.split('/');
    if (dateParts.length !== 3) {
      console.log('Invalid date format:', datePart);
      return new Date(0);
    }

    const [day, month, year] = dateParts;
    return new Date(`${year}-${month}-${day} ${timePart}`);
  };

  // Check multiple possible timestamp fields
  const getTimestamp = (item) => {
    return item.json.Timestamp ||
           item.json.timestamp ||
           item.json['Date Created'] ||
           item.json.created_at ||
           new Date().toISOString();
  };

  const latestTimestamp = getTimestamp(latest);
  const currentTimestamp = getTimestamp(current);

  const latestTime = parseDate(latestTimestamp);
  const currentTime = parseDate(currentTimestamp);

  console.log('Comparing dates:', {
    latest: latestTime,
    current: currentTime,
    latestRaw: latestTimestamp,
    currentRaw: currentTimestamp,
    currentIsNewer: currentTime > latestTime
  });

  return currentTime > latestTime ? current : latest;
});

console.log('Selected newest item:', newest.json);
return [newest];