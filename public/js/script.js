let hoursUS = ['8:00 AM', '8:15 AM', '8:30 AM', '8:45 AM', '9:00 AM', '9:15 AM', '9:30 AM', '9:45 AM', '10:00 AM', '10:15 AM', '10:30 AM', '10:45 AM', '11:00 AM', '11:15 AM', '11:30 AM', '11:45 AM', '12:00 PM', '12:15 PM', '12:30 PM', '12:45 PM', '1:00 PM', '1:15 PM', '1:30 PM', '1:45 PM', '2:00 PM', '2:15 PM', '2:30 PM', '2:45 PM', '3:00 PM', '3:15 PM', '3:30 PM', '3:45 PM', '4:00 PM', '4:15 PM', '4:30 PM', '4:45 PM', '5:00 PM', '5:15 PM', '5:30 PM', '5:45 PM', '6:00 PM', '6:15 PM', '6:30 PM', '6:45 PM', '7:00 PM', '7:15 PM', '7:30 PM', '7:45 PM', '8:00 PM', '8:15 PM', '8:30 PM', '8:45 PM'];

const API_ENDPOINT = "http://127.0.0.1:4002/";

let startingDateObject = new Date("2022, 12, 12"); // I am going to add here the function which checks current date and looks for the last Monday in purpose of showing the current week
let lastMonday = new Date("2022, 12, 12"); // This variable will be used for tracking date of monday of currently shown week schedule

const popUpForm = document.getElementById('popUpForm');
const submitButton = document.getElementById('submitBtn');
const changeButton = document.getElementById('changeBtn');
const deleteButton = document.getElementById('deleteBtn');
let popUpInputs = document.getElementsByClassName('popUpInputs');
let schedule = document.getElementById('schedule');

const rightArrow = document.getElementById('rightArrow');
const leftArrow = document.getElementById('leftArrow');

let currentSlot; // Slot which will be clicked as the last one, will be assigned to that variable

    //  Function responsible for clearing out all inputs in the pop up window
const clearAll = (inputsToClear) => {
    for (let d = 0; d < inputsToClear.length; d++) {
        inputsToClear[d].value = '';
    };
}
    // The function responsible for setting buttons back to default state
const setDefaultButtons = () => {
    submitButton.removeAttribute('disabled');
    submitButton.style.backgroundColor = '#3da219';

    changeButton.setAttribute('disabled', '');
    changeButton.style.backgroundColor = '#A9A9A9';

    deleteButton.setAttribute('disabled', '');
    deleteButton.style.backgroundColor = '#A9A9A9';
}

    // Function taking a date object for created week's monday and returning an array of dates (as strings) for six days in that week
const datesForWeekCreator = (mondayDate) => {
    let mondayDayString = mondayDate.toLocaleDateString();
    let datesArray = [mondayDayString];

    for (let xd = 1; xd < 6; xd ++) {
        let anotherDate = new Date(mondayDate); // By default, assigns current date and time. The value will be changed in the next line
        anotherDate.setDate(mondayDate.getDate() + xd);
        datesArray.push(anotherDate.toLocaleDateString());
    }
    return datesArray;
}

    // After clicking on any arrow, there is rendered schedule with new batch of dates for a certain week
rightArrow.onclick = function () {
    lastMonday.setDate(lastMonday.getDate() + 7);
    invoker(hoursUS, lastMonday);
}

leftArrow.onclick = function() {
    lastMonday.setDate(lastMonday.getDate() - 7);
    invoker(hoursUS, lastMonday);
}

    // Function responsible for checking if there are already data cells in the schedule - if so, it deletes
const scheduleCleaner = () => {
    let anySlots = document.querySelector(".scheduleRow");
    if (!anySlots) return;
        // Removing previously viewed rows
    let previousRows = document.getElementsByClassName('scheduleRow');
    Array.from(previousRows).forEach(oldRow => {
        schedule.removeChild(oldRow);
    });
}

    // The function takes the array with hours as the first argument and creates as many rows as the length of array is, fullfilling columns. As the second argument, the function takes object - the date of monday which schedule will involve
async function createSchedule (array, mondayForWeek) {
        // Getting dates for days
    let datesToImplement = datesForWeekCreator(mondayForWeek);
        // Getting slots for fullfilling
    let datesSlots = document.getElementsByClassName('dates');
        // Fullfilling slots with dates
    for (let q = 0; q < 6; q++) {
        datesSlots[q].innerHTML = datesToImplement[q];
    }

        // Getting data from the database
    const getResponse = await fetch(`${API_ENDPOINT}getting`, {
        method: 'GET'
    });
    let visitsFromDb = await getResponse.json();

        // If there are already cells in the schedule - delete them and make space for a new group
    await scheduleCleaner();

        // Generating cells for a certain week
    await array.forEach(time => {
            // Creating rows
        let row = document.createElement('tr');
        row.classList.add('scheduleRow');
            // Creating cells with time
        let timeSlot = document.createElement('td');
        timeSlot.classList.add('timeSlot', 'firstColumn');
            // Joining elements
        row.appendChild(timeSlot);
        schedule.appendChild(row);

        timeSlot.innerHTML = time;

            // Creating empty slots for 6 days in the row
        for (let i = 0; i < 6; i++) {

            let slot = document.createElement('td');
            row.appendChild(slot);
            slot.classList.add('slot', 'cells');
                //Assigning information about time and date to each slot
            slot.setAttribute('data-day', datesToImplement[i]);
            slot.setAttribute('data-hours', time);

                // Function checks if slot with coordinates assigned above has coordinates like any one in database and if so - fullfill respectively the cell
            visitsFromDb.forEach((bookedSlot, index) => {
                if (bookedSlot.day === datesToImplement[i] && bookedSlot.time === time) {
                    slot.style.backgroundColor = 'red';
                    slot.style.paddingLeft = '10px';
                    slot.innerHTML = bookedSlot.surname;
                        // Assigning data sets in purpose of providing information for a front-end user in more dynamic way
                    slot.setAttribute('data-name', bookedSlot.name);
                    slot.setAttribute('data-surname', bookedSlot.surname);
                    slot.setAttribute('data-phone_number', bookedSlot.phone_number);
                    slot.setAttribute('data-ssn', bookedSlot.SSN);
                }
            });
        }
    });
}

    // Adding the listener which open the pop-up window after clicking on a slot
const booking = () => {
    let allSlots = document.getElementsByClassName('slot');

    Array.from(allSlots).forEach(function(slot) {
        slot.addEventListener('click', (event) => {
            document.getElementById('popUpBackground').style.display = 'flex';

            currentSlot = event.target;

                // Checking if clicked slot is booked. If so - get data from element's data set and display in pop up window. Disable submit button and unlock the rest
            if (currentSlot.style.backgroundColor !== 'red') return;

            document.getElementById('name').value = currentSlot.dataset.name;
            document.getElementById('surname').value = currentSlot.dataset.surname;
            document.getElementById('number').value = currentSlot.dataset.phone_number;
            document.getElementById('ssn').value = currentSlot.dataset.ssn;
                // Allowing for changing and deleting and preventing submitting
            submitButton.setAttribute('disabled', '');
            submitButton.style.backgroundColor = '#A9A9A9';

            changeButton.removeAttribute('disabled');
            changeButton.style.backgroundColor = 'orange';

            deleteButton.removeAttribute('disabled');
            deleteButton.style.backgroundColor = 'red';
        });
    });
}

    // Hiding pop-up window
document.getElementById('close').addEventListener('click', () => {
    document.getElementById('popUpBackground').style.display = 'none';
        // Clearing all input fields after hiding pop up window
    clearAll(popUpInputs);

        // Setting buttons back to normal
    if (submitButton.hasAttribute('disabled')  === false) return;
    setDefaultButtons();
});

    // POST
submitButton.addEventListener('click', async function(e) {
    e.preventDefault();
        // FormData returns object with data from inputs
    let allInputs =  await new FormData(popUpForm);
    let inputsArray = [];

        // .entries iterates through the object and returns short arrays (each consists only form name and value of an input)
    for (let pair of allInputs.entries()) {
        inputsArray.push(pair[1]);
    }

        // Day and time are pushed to inputsArray
    inputsArray.push(currentSlot.dataset.day);
    inputsArray.push(currentSlot.dataset.hours);

    const response = await fetch(`${API_ENDPOINT}posting`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(inputsArray)
    });

    if (response.status === 201) {
            // Instead of reloading page (which has been generating unpleasant flashes) and fetching data from the database each time, I've decided to implement dynamic marking using dataset attributes
        currentSlot.style.backgroundColor = 'red';
        currentSlot.style.paddingLeft = '10px';
        currentSlot.innerHTML = inputsArray[1];
        currentSlot.setAttribute('data-name', inputsArray[0]);
        currentSlot.setAttribute('data-surname', inputsArray[1]);
        currentSlot.setAttribute('data-phone_number', inputsArray[2]);
        currentSlot.setAttribute('data-ssn', inputsArray[3]);
    } else {
        alert('Server error');
    }
    document.getElementById('popUpBackground').style.display = 'none';

    clearAll(popUpInputs);
});
    // PUT
changeButton.addEventListener('click', async function(e) {
    e.preventDefault();
    let allInputsChange = await new FormData(popUpForm);

    let inputsArrayChange = [];

    for (let pair of allInputsChange.entries()) {
        inputsArrayChange.push(pair[1]);
    }

    inputsArrayChange.push(currentSlot.dataset.day);
    inputsArrayChange.push(currentSlot.dataset.hours);

    const response = await fetch(`${API_ENDPOINT}change`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(inputsArrayChange)
    });

    if (response.status === 201) {
        currentSlot.innerHTML = inputsArrayChange[1];
        currentSlot.dataset.name = inputsArrayChange[0];
        currentSlot.dataset.surname = inputsArrayChange[1];
        currentSlot.dataset.phone_number = inputsArrayChange[2];
        currentSlot.dataset.ssn = inputsArrayChange[3];
    } else {
        alert('Server error');
    }
    document.getElementById('popUpBackground').style.display = 'none';

    setDefaultButtons();

    clearAll(popUpInputs);
});

    // Adding submit listener adding a DELETE fetch to the pop up window
deleteButton.addEventListener('click', async function(e) {
    e.preventDefault();

        // Asigning date and time of slot which will be cleared
    let dayId = currentSlot.dataset.day;
    let timeId = currentSlot.dataset.hours;

    const response = await fetch(`${API_ENDPOINT}day/${dayId}/time/${timeId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (response.status === 204) {
        currentSlot.style.backgroundColor = 'hsl(180, 57%, 59%)';
        currentSlot.style.paddingLeft = '0px';
        currentSlot.innerHTML = '';
    } else {
        alert('Server error');
    }

    document.getElementById('popUpBackground').style.display = 'none';

    setDefaultButtons();

    clearAll(popUpInputs);
});
    // "booking" function must be invoked after creating schedule
const invoker = async (visitsIntervals, dateOfMonday) => {
    await createSchedule(visitsIntervals, dateOfMonday);
    await booking();
}
invoker(hoursUS, lastMonday);