// First step: select the concerned elements
const addBtn = document.querySelector(".add-btn");
const removeBtn = document.querySelector(".remove-btn");
const modalCont = document.querySelector(".modal-cont");
const mainCont = document.querySelector(".main-cont");
const textArea = document.querySelector(".textarea-cont");
// const ticketCont = document.querySelectorAll(".ticket-cont")
const allPriorityColors = document.querySelectorAll(".priority-color");
const allFilterColors = document.querySelectorAll(".color");

let addTaskFlag = false;
let removeFlag = false;
let modalPriorityColor = "black";

const colorArray = ["lightpink", "lightgreen", "lightblue", "black"];
const taskArray = [];

// Check if we already have some data in my local storage
// and call create ticket if there is

if( localStorage.getItem("tickets") ) {
    try {
        const ticketsArray = JSON.parse(localStorage.getItem("tickets"));
        ticketsArray.forEach((ticketItem) => {
            createTicket(ticketItem.ticketColor, ticketItem.taskContent, ticketItem.taskId, true);
        });
    } catch (error) {
        console.log("There seems to be some error.");
        localStorage.removeItem("tickets");
    }
}

addBtn.addEventListener('click', () => {
    addTaskFlag = !addTaskFlag;
    if(addTaskFlag) {
        modalCont.style.display = "flex";
        addBtn.style.color = "red";
    } else {
        modalCont.style.display = "none";
        addBtn.style.color = "white";
    }
});

removeBtn.addEventListener("click", () => {
    removeFlag = !removeFlag;
    if(removeFlag) {
        alert("Delete mode has been activated!");
        removeBtn.style.color = "red";
    } else {
        alert("Delete mode deactivated!");
        removeBtn.style.color = "white";
    }
});

allFilterColors.forEach((colorElem) => {
    // handle single click to show filtered tasks
    colorElem.addEventListener("click", (e) => {
        const selectedFilterColor = e.target.classList[0];
        // Create the filtered array
        const filteredArray = taskArray.filter((currentStepTask) => currentStepTask.ticketColor == selectedFilterColor);

        // Remove all tasks from the screen
        mainCont.innerHTML = "";

        // Add back tasks from filteredArray
        filteredArray.forEach((taskElementCurrent) => {
            createTicket(taskElementCurrent.ticketColor, taskElementCurrent.taskContent, taskElementCurrent.taskId, false);
        });
    })
    // handle double click to show all tasks again
    colorElem.addEventListener("dblclick", (e) => {
        // Remove all tasks from the screen
        mainCont.innerHTML = "";

        // Add back tasks from taskArray
        taskArray.forEach((taskElementCurrent) => {
            createTicket(taskElementCurrent.ticketColor, taskElementCurrent.taskContent, taskElementCurrent.taskId, false);
        });
    })
});

// Function to handle removal
function handleRemoval(ticket, taskId) {
    ticket.addEventListener('click', () => {
        if(removeFlag) {
            ticket.remove();

            // Remove task from the taskArray
            const currentTaskIdx = taskArray.findIndex((currentStepTask) => currentStepTask.taskId == taskId)
            taskArray.splice(currentTaskIdx, 1);
            
            localStorage.setItem('tickets', JSON.stringify(taskArray));
        }
    });
}

// Function to handle the locking mechanism
function handleLock(ticket, taskId) {
    // Select the lock container element
    const ticketLockElement = ticket.querySelector(".ticket-lock");

    // Select the task area
    const ticketTaskElement = ticket.querySelector(".task-area");

    // Select the actual icon element
    const ticketLockIcon = ticketLockElement.children[0];

    ticketLockIcon.addEventListener("click", () => {
        // Check if the lock icon contains fa-lock class
        if(ticketLockIcon.classList.contains("fa-lock")) {
            ticketLockIcon.classList.remove("fa-lock");
            ticketLockIcon.classList.add("fa-lock-open");
            // make the task content editable
            ticketTaskElement.setAttribute("contenteditable", true);
        } else {
            ticketLockIcon.classList.remove("fa-lock-open");
            ticketLockIcon.classList.add("fa-lock");
            // make the task content non editable
            ticketTaskElement.setAttribute("contenteditable", false);

            // Find out the current value of the ticketTaskElement and update the taskArray
            const currentTask = taskArray.find((currentStepTask) => currentStepTask.taskId == taskId);
            currentTask.taskContent = ticketTaskElement.innerText;

            localStorage.setItem('tickets', JSON.stringify(taskArray));
        }
    });

}

// Function to toggle task/ticket priority
function handleColor(ticket, taskId) {
    // Select the color element
    const colorElem = ticket.querySelector(".ticket-color");
    // Now add an event listener
    colorElem.addEventListener("click", () => {
        // Get the current color
        const currentColor = colorElem.classList[1];

        // Figure out the index in the color array
        let currentColorIndex = colorArray.findIndex((currentStepColor) => currentStepColor == currentColor);

        currentColorIndex++;

        const newColorIdx = currentColorIndex % colorArray.length;
        const newColor = colorArray[newColorIdx];

        // Update the color
        colorElem.classList.remove(currentColor);
        colorElem.classList.add(newColor);

        // Update the taskArray with the updated color
        // find the exact task that we want
        const currentTask = taskArray.find((currentStepTask) => currentStepTask.taskId == taskId);
        currentTask.ticketColor = newColor;

        localStorage.setItem('tickets', JSON.stringify(taskArray));
    });
}

// Function to add a new ticket/task
function createTicket(ticketColor, taskContent, taskId, shouldAddToArray) {
    // Create a new ticket container element
    const ticketCont = document.createElement("div");
    // Setting the class
    ticketCont.setAttribute("class", "ticket-cont shadow");

    ticketCont.innerHTML = `
        <div class="ticket-color ${ticketColor}"></div>
        <div class="ticket-id">${taskId}</div>
        <div class="task-area">${taskContent}</div>
        <div class="ticket-lock">
            <i class="fa-solid fa-lock"></i>
        </div>
    `;

    // Adding event listeners
    // Add removal functionality to the new ticket
    handleRemoval(ticketCont, taskId);
    // Add lock/unlock functionality to the new ticket
    handleLock(ticketCont, taskId);
    // Handle ticket color/category
    handleColor(ticketCont, taskId);

    // Add the task inside of taskArray
    if(shouldAddToArray){   
        taskArray.push({taskId, ticketColor, taskContent});
    }

    // Storing tasks in local storage
    localStorage.setItem('tickets', JSON.stringify(taskArray));

    mainCont.appendChild(ticketCont);
}

modalCont.addEventListener("keydown", (e) => {
    // Using 'Alt' key to create ticket
    if(e.key == 'Alt') {
        const taskContent = textArea.value;
        const taskId = shortid();
        // Passing the required fields to createTicket()
        createTicket(modalPriorityColor, taskContent, taskId, true);

        // Hide the modal
        modalCont.style.display = "none";
        addTaskFlag = !addTaskFlag;
        addBtn.style.color = "white";

        // Clear the textarea field
        textArea.value = "";
    }
});

// Add event listener to all the priority colors in the modal
allPriorityColors.forEach((colorElem) => {
    colorElem.addEventListener('click', function() {
        // Remove active class from all color containers
        allPriorityColors.forEach((colorElemCurrent) => {
            colorElemCurrent.classList.remove("active");
        });
        // Add active class to the current containers
        colorElem.classList.add("active");

        // Implement logic to assign the selected color to the task
        // Using shortcut to fetch color from classList
        // preferred way -> add attribute 'data-color' to the div and fetch value from it
        modalPriorityColor = colorElem.classList[0];
    });
});

// find task/ticket using taskId, if exist -- additional
function findTask(taskId) {
    const taskIdx = taskArray.findIndex((currentStepTask) => currentStepTask.taskId == taskId);
    if( taskIdx == -1 ) {
        return null;
    }

    return taskArray[taskIdx];
}