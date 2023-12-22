const building = document.getElementById("building");
const lift = document.getElementById("lift");
const controlPanel = document.getElementById("control-panel");
const liftLeftDoor = document.querySelector(".left-door");
const liftRightDoor = document.querySelector(".right-door");
const closeButton = document.getElementById("close-button");
const openButton = document.getElementById("open-button");

let currentFloor = 1;
let doorsIsClosed = true;
let transitionDuration = null;
let visitFloors = [];
let visitFloorsDown = [];
let liftIsActive = false;
let durationOfVisitingObj = {};
let startingDelay = 0;
let delay = 0;
let liftTimeoutID = null;
let isFirstFloorVisited = true;
let isFirstFloorPushed = false;

function drawBuildingAndControlPanel() {
  for (let i = 10; i > 0; i--) {
    const floor = document.createElement("div");
    const floorNumber = document.createElement("span");
    const controlPanelButton = document.createElement("div");

    floor.classList.add("floor");

    floorNumber.textContent = `${i} Floor`;
    controlPanelButton.textContent = `${i}`;
    controlPanelButton.dataset.floor = `${i}`;

    controlPanelButton.addEventListener("click", (e) => {
      // debugger;
      const floorNumber = +e.target.textContent;
      if (!visitFloors.includes(floorNumber) && currentFloor !== floorNumber) {

        if (!isFirstFloorPushed) {
          visitFloors.push(floorNumber);
          isFirstFloorPushed = true;
        } else {
          if (Math.min(...visitFloors) < floorNumber) {
            visitFloors.push(floorNumber);
          } else {
            visitFloorsDown.push(floorNumber);
            console.log(visitFloorsDown, "secondVisitFloors");
          }
        }
        controlPanelButton.classList.add("active");
        sortVisitFloors();
        console.log(visitFloors, "visirFloors");
        if (!liftIsActive) {
          liftIsActive = true;
          liftTimeoutID = setTimeout(() => {
            closeDoors();
            setTimeout(() => {
              startVisitingFloors();
            }, 2000);
          }, 3000);
        }
      }
    });

    controlPanel.append(controlPanelButton);
    floor.append(floorNumber);
    building.append(floor);
  }
}

function toggleClasses(class1, class2) {
  liftLeftDoor.classList.toggle(class1);
  liftRightDoor.classList.toggle(class2);
}

function showDoors() {
  liftLeftDoor.style.display = "block";
  liftRightDoor.style.display = "block";
}

function openDoors() {
  if (doorsIsClosed) {
    toggleClasses("left-door-open", "right-door-open");
    setTimeout(() => {
      toggleClasses("left-door-open", "right-door-open");
      liftLeftDoor.style.display = "none";
      liftRightDoor.style.display = "none";
      doorsIsClosed = false;
    }, 2000);
  }
}

function closeDoors() {
  if (!doorsIsClosed) {
    toggleClasses("left-door-close", "right-door-close");
    showDoors();
    setTimeout(() => {
      toggleClasses("left-door-close", "right-door-close");
      doorsIsClosed = true;
    }, 2000);
  }
}

function closeButtonHandler() {
  if (visitFloors.length !== 0) {
    startVisitingFloors();
  } else {
    closeDoors();
  }
}

function startVisitingFloors(i = 0) {
  if (visitFloors.length === 0 && visitFloorsDown.length !== 0) {
    visitFloors = [...visitFloorsDown];
    visitFloorsDown = [];
    visitFloors.sort((a, b) => b - a);
  }
  if (visitFloors.length === 0) {
    visitFloors = [];
    durationOfVisitingObj = {};
    delay = 0;
    liftIsActive = false;
    isFirstFloorVisited = true;
    startingDelay = 0;
    isFirstFloorPushed = false;
    setCloseAndOpenButtonEvents();
    return;
  } else {
    if (isFirstFloorVisited) {
      startingDelay = 0;
      isFirstFloorVisited = false;
    } else {
      startingDelay = 2000;
    }

    removeCloseAndOpenButtonEvents();
    clearTimeout(liftTimeoutID);
    setTimeout(() => {
      moveLift(visitFloors[0]);
      delay = durationOfVisitingObj[visitFloors[0]] + 3000;
      return startVisitingFloors();
    }, delay);
  }
}

function setCloseAndOpenButtonEvents() {
  closeButton.addEventListener("click", closeButtonHandler);
  openButton.addEventListener("click", openDoors);
}

function sortVisitFloors() {
  if (currentFloor <= visitFloors[0]) {
    visitFloors.sort((a, b) => a - b);
  } else {
    visitFloors.sort((a, b) => b - a);
  }
}

function removeCloseAndOpenButtonEvents() {
  closeButton.removeEventListener("click", closeButtonHandler);
  openButton.removeEventListener("click", openDoors);
}

function moveLift(floorNumber) {
  const floor = document.querySelector(".floor");
  const controlPanelButton = document.querySelectorAll(`[data-floor="${floorNumber}"]`);
  if (doorsIsClosed && currentFloor !== floorNumber && visitFloors.length !== 0) {
    if (floorNumber > currentFloor) {
      transitionDuration = (floorNumber - currentFloor) * 1000;
      lift.style.top = `${lift.offsetTop - (floor.offsetHeight * (floorNumber - currentFloor))}px`;
    } else {
      transitionDuration = (currentFloor - floorNumber) * 1000;
      lift.style.top = `${lift.offsetTop + (floor.offsetHeight * (currentFloor - floorNumber))}px`;
    }


    durationOfVisitingObj[floorNumber] = transitionDuration;
    lift.style.transitionDuration = `${transitionDuration}ms`;
    currentFloor = floorNumber;

    setTimeout(() => {

      openDoors();
      setTimeout(() => {
        closeDoors(true, floorNumber);
        controlPanelButton[0].classList.remove("active");
        delete durationOfVisitingObj[floorNumber];
        visitFloors.splice(visitFloors.indexOf(floorNumber), 1);
        console.log(visitFloors);
      }, 2500);
    }, transitionDuration);
  }
}

drawBuildingAndControlPanel();
setCloseAndOpenButtonEvents();