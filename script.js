"use strict";

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  onValue,
  push,
  ref,
  update,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// MAIN
const allNavigateBtns = document.querySelectorAll(".navigate-btn");
const allButtons = document.querySelectorAll(".btn");
const eSourceBTNs = document.querySelectorAll(".e-source-btn");

// screens
const allScreens = document.querySelectorAll(".screen");
const createScreen1 = document.querySelector(".create-screen-1");
const createScreen2 = document.querySelector(".create-screen-2");
const createScreen3 = document.querySelector(".create-screen-3");
const createScreen4 = document.querySelector(".create-screen-4");
const createScreen5 = document.querySelector(".create-screen-5");
const createScreen6 = document.querySelector(".create-screen-6");
const createScreen7 = document.querySelector(".create-screen-7");

// BTN's
const goBackBTNs = document.querySelectorAll(".go-back-btn");
const newGameBTN = document.querySelector(".new-game-BTN");
const joinGameBTN = document.querySelector(".join-game-BTN");

const testBTN = document.querySelector(".testBTN");
testBTN.addEventListener("click", function () {
  console.log(currentGame);
});

// DATABASE

const appSettings = {
  databaseURL:
    "https://koroah-947d1-default-rtdb.europe-west1.firebasedatabase.app/",
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
const gamesDB = ref(database, "games");
const gamesArray = [];
let allNots = {};

let allScreensArray = [];
allScreens.forEach((screen) => {
  allScreensArray.push(screen);
});

let currentGame = {}; // Object to store information about the created game
let gameOrder = {}; // Object to store information about the selected avatar for each chair-id
let currentPlayer;

let numberOfPlayersSelected = false;
let inputForNewGame = false;
let gameStarted = false;

const classNumber = {
  0: "one",
  1: "two",
  2: "three",
  3: "four",
  4: "five",
};

const sourceBTNS = {
  0: `
  <div class="small-circle ciecz">
    <img src="svg/ciecz.svg" alt="" />
  </div>`,
  1: `
  <div class="small-circle krysztal">
    <img src="svg/krysztal.svg" alt="" />
  </div>`,
  2: `
  <div class="small-circle skala">
    <img src="svg/skala.svg" alt="" />
  </div>`,
  3: `
  <div class="small-circle zelazo">
    <img src="svg/zelazo.svg" alt="" />
  </div>
`,
};

const allBuildingsArray = [
  { name: "Źródło", type: 0, activities: [0, 0, 0] },
  { name: "Gildia", type: 1, activities: [0, 0, 0] },
  { name: "Kopalnia", type: 2, activities: [0, 0, 0] },
  { name: "Huta", type: 2, activities: [0, 0, 0] },

  { name: "Generator", type: 0, activities: [0, 0, 0] },
  { name: "Sąd", type: 0, activities: [0, 0, 0] },

  { name: "Wieża", type: 1, activities: [0, 0, 0] },
  { name: "Orbita", type: 1, activities: [0, 0, 0] },
  { name: "Konwerter", type: 1, activities: [0, 0, 0] },
  { name: "Mała Świątynia", type: 1, activities: [0, 0, 0] },

  { name: "Krąg kupców", type: 2, activities: [0, 0, 0] },
  { name: "Monolit", type: 2, activities: [0, 0, 0] },

  { name: "Portale", type: 3, activities: [0, 0, 0] },
];

////////////////
// USEFULL FUNCTION
///////////////

allButtons.forEach((btn) => {
  btn.addEventListener("click", function () {
    if (!btn.classList.contains("toggle")) {
      btn.classList.add("selected");

      setTimeout(() => {
        btn.classList.remove("selected");
      }, 200);
    }
  });
});

// Handling going back in navigation
function goBack() {
  if (screenHistory.length <= 1) return;
  screenHistory.pop();
  const lastScreen = screenHistory[screenHistory.length - 1];
  const lastScreenElement = lastScreen;

  Visibility(currentScreen, "right", "hide");
  Visibility(lastScreenElement, "right", "show");
  currentScreen = lastScreen; // Aktualizacja na NUMER
}

goBackBTNs.forEach((btn) => {
  btn.addEventListener("click", goBack);
});

function formatInputValue(inputValue, arg) {
  inputValue = inputValue.toString();

  if (inputValue.charAt(0) === "-" && inputValue.length > 1) {
    inputValue = "-" + inputValue.substring(1).replace(/[^0-9.]/g, "");
  } else {
    // W przeciwnym razie wykonaj operacje jak dotychczas
    inputValue = inputValue.replace(/[^0-9.]/g, "");
  }

  const dotIndex = inputValue.indexOf(".");
  if (dotIndex !== -1 && inputValue.substring(dotIndex + 1).length > 1) {
    // Jeśli tak, ogranicz do jednego miejsca po przecinku
    inputValue = inputValue.substring(0, dotIndex + 2);
  }

  // Usuń zero na początku (jeśli istnieje więcej niż jedna cyfra)
  if (
    inputValue.length > 1 &&
    inputValue.charAt(0) === "0" &&
    inputValue.charAt(1) !== "."
  ) {
    inputValue = inputValue.substring(1);
  }
  if (arg === "number") {
    return parseFloat(inputValue);
  } else {
    return inputValue;
  }
}

function highestKey(obj) {
  // Sprawdź, czy obiekt nie jest pusty
  if (Object.keys(obj).length === 0) {
    return null; // Lub inna wartość w przypadku pustego obiektu
  }
  // Znajdź najwyższy klucz
  const maxKey = Math.max(...Object.keys(obj).map(Number));

  const objectWithMaxKey = obj[maxKey];
  return objectWithMaxKey;
}

const makeNotification = function (i) {
  const message = `Player ${i.player} ${i.action} ${i.value} ${i.resource}`;
  const notificationDiv = document.createElement("div");
  notificationDiv.textContent = message;

  if (notificationContainer.firstChild) {
    notificationContainer.insertBefore(
      notificationDiv,
      notificationContainer.firstChild
    );
  } else {
    // Jeśli kontener jest pusty, dodaj normalnie
    notificationContainer.appendChild(notificationDiv);
  }

  const moveOldNotifications = function () {
    const notificationDIVs = document.querySelectorAll(".notification");
    notificationDIVs.forEach((not) => {
      const oldClassList = not.classList[1].match(/\d+$/);
      let matchedNumber = parseInt(oldClassList);
      if (matchedNumber === 1) {
        not.style.transform = "translateY(20px)";
        not.classList.remove("position1");
        not.classList.add("position2");
      } else {
        const transformedValue = `translateY(calc(${matchedNumber} * 20px))`;
        const transformedOpacity = `calc(1 - ${matchedNumber * 0.15})`;
        not.style.transform = transformedValue;
        not.style.opacity = transformedOpacity;

        not.classList.remove(`position${matchedNumber}`);
        matchedNumber++;
        not.classList.add(`position${matchedNumber}`);
      }
    });
  };
  moveOldNotifications();

  notificationDiv.classList.add("notification");
  notificationDiv.classList.add("position1");
  notificationDiv.style.transform = "translateY(-100px)";

  setTimeout(() => {
    notificationDiv.style.transform = "translateY(0px)";
  }, 10);
};

const makeCircle = function () {
  const circleSign = document.querySelector(".circle-sign");
  circleSign.style.display = "flex";
  setTimeout(() => {
    circleSign.classList.add("newTurnSign");
    setTimeout(() => {
      circleSign.classList.remove("newTurnSign");
    }, 500);
    setTimeout(() => {
      circleSign.style.display = "none";
    }, 500);
  }, 500);

  setTimeout(() => {
    gameMenuBTNTurn.click();
  }, 1500);
};

function roundNumber(number, decimals) {
  var newnumber = new Number(number + "").toFixed(parseInt(decimals));
  return parseFloat(newnumber);
}

const changePrice = function (value, src) {
  // losuje od 15 do 30 sec.
  // const time = Math.floor((Math.random() * 5000) + 5000);
  const time = Math.floor(Math.random() * 1000);
  console.log("time", time);

  setTimeout(() => {
    /*
    let allExistingResources = 0;
    // Podliczenie ile łącznie jest danego surwca w grze
    Object.keys(currentGame.gameOrder).forEach((chairId) => {
      allExistingResources =
        allExistingResources + currentGame.gameOrder[chairId].resources[src];
    });
    console.log("all existing Resources = ", allExistingResources);

    // Transaction Importance to ile % surowca przybyło względem wszystkich dotychczasowych w grze.
    const transactionImportance =
      100 - ((allExistingResources + value) * 100) / allExistingResources;
    console.log(transactionImportance);

    const newValue = currentGame.prices[src] + -transactionImportance / 5;
    if (newValue > 1) {
      currentGame.prices[src] = newValue;
    } else {
      currentGame.prices[src] = 1;
    }
    */
    console.log(currentGame.prices[src]);
    const newValue = currentGame.prices[src] + value;
    currentGame.prices[src] = newValue;
    console.log(newValue);

    updateDB();
  }, time);
};

const warningElement1 = document.querySelector(".warning-element1");
const warningElement2 = document.querySelector(".warning-element2");

const hideTimers = [null, null, null];
const isWarningActive = [false, false, false];

function getWarningElement(place) {
    if (place === 1) {
        return warningElement1;
    } else if (place === 2) {
        return warningElement2;
    }
    console.error("Nieprawidłowa wartość argumentu 'place'. Użyj 1 lub 2.");
    return null;
}

function clearWarning(place) {
    const warningElement = getWarningElement(place);
    if (!warningElement) return;

    if (hideTimers[place]) {
        clearTimeout(hideTimers[place]);
        hideTimers[place] = null;
    }

    warningElement.classList.remove("active");
    isWarningActive[place] = false;

    setTimeout(() => {
        warningElement.innerHTML = "";
    }, 500);
}

function startWarningDisplay(message, place) {
    const warningElement = getWarningElement(place);
    if (!warningElement) return;

    warningElement.innerHTML = `<h3>${message}</h3>`;
    isWarningActive[place] = true;

    warningElement.classList.add("active");

    hideTimers[place] = setTimeout(() => {
        clearWarning(place);
    }, 3000);
}

function makeWarning(message, place) {
    const warningElement = getWarningElement(place);
    if (!warningElement) return;

    if (hideTimers[place]) {
        clearTimeout(hideTimers[place]);
        hideTimers[place] = null;
    }

    if (isWarningActive[place]) {
        warningElement.classList.remove("active");
        warningElement.style.transition = "none";

        warningElement.innerHTML = `<h3>${message}</h3>`;

        setTimeout(() => {
            warningElement.style.transition = "";
            startWarningDisplay(message, place);
        }, 50);
        return;
    }

    startWarningDisplay(message, place);
}

// UPDATE CURRENT GAME
// reading game from DB and making currentGamme & currentPlayer really current
///////////////
const updateCurrentGame = function (gameName) {
  let passedGameName = gameName;
  if (!gameName) {
    passedGameName = currentGame.name;
  }

  console.log("=== RUNNING FUNCTION updateCurrentGame ===");
  const foundGame = gamesArray.find((game) => game.name === passedGameName);

  console.log(foundGame);
  if (currentPlayer) {
    const foundPlayer = foundGame.gameOrder.find(
      (player) => player.player === currentPlayer.player
    );
    currentPlayer = foundPlayer;
    console.log("CURRENT PLAYER UPDATED");
  }

  if (foundGame) {
    currentGame = foundGame;

    allNots = currentGame.notifications;
    // updatePrices("from = updateCurrentGame()");

    // usunięcie 0 z liczb dziesiętnych
    for (let i = 0; i < currentGame.prices.length; i++) {
      const value = parseFloat(currentGame.prices[i]);
      currentGame.prices[i] = value;
    }
    return foundGame;
  } else {
    console.log("updateCurrentGame FAILED");
  }

  console.log("=== ENDING update === CURENT GAME IS:");
  console.log(currentGame);
};

///////////////////////////
// UPDATE DB

const updateDB = function () {
  console.log("================ UPDATING DB ===============");
  console.log(currentGame);
  const game = currentGame;
  const userRef = ref(database, `games/${game.id}`);
  update(userRef, game);
};

//NASŁUCHIWANIE (zmiany w DB)
onValue(gamesDB, (snapshot) => {
  console.log("OCURRED CHANGE IN DB!");
  const gamesData = snapshot.val();
  gamesArray.length = 0;

  if (gamesData) {
    Object.keys(gamesData).forEach((gameId) => {
      gamesArray.push({
        id: gameId,
        ...gamesData[gameId],
      });
    });
  }
  if (currentGame.name !== undefined) {
    const name = currentGame.name;
    updateCurrentGame(name);
    updatePricesAndValues();
    updateUserScreen();
  }
});

////////////////
////////////////
////////////////
////////////////
////////////////
////////////////
////////////////
////////////////
////////////////

// MANAGING SCREENS AND ELEMENTS
///////////////
let currentScreen = createScreen1;

// VISIBILITY
// Zmiana ekranów
///////////////

// STOS HISTORII
const screenHistory = [];

// WAŻNE: Na początku dodaj pierwszy ekran do historii
screenHistory.push(currentScreen);

const Visibility = function (item, direction, action) {
  if (direction === "btn-active") {
    item.classList.remove("btn-active");
    item.classList.remove("btn-inactive");
    item.classList.add("btn-active");
    return;
  }
  if (direction === "btn-inactive") {
    item.classList.remove("btn-active");
    item.classList.remove("btn-inactive");
    item.classList.add("btn-inactive");
    return;
  }

  const addNoActive = function (i) {
    setTimeout(() => {
      i.classList.add("no-active");
    }, 500);
  };

  item.classList.remove("hide-left");
  item.classList.remove("hide-right");
  item.classList.remove("active");
  item.classList.remove("no-active");

  if (action === "hide") {
    if (direction === "left") {
      item.classList.add("hide-left");
      addNoActive(item);
    }
    if (direction === "right") {
      item.classList.add("hide-right");
      addNoActive(item);
    }
    if (direction === "down") {
      item.classList.add("hide-down");
      addNoActive(item);
    }
  }
  if (action === "show") {
    if (direction === "right") {
      item.classList.add("hide-left");
      setTimeout(() => {
        item.classList.remove("hide-left");
        item.classList.add("active");
      }, 10);
    }
    if (direction === "left") {
      item.classList.add("hide-right");
      setTimeout(() => {
        item.classList.remove("hide-right");
        item.classList.add("active");
      }, 10);
    }
    if (direction === "down") {
      item.classList.add("hide-down");
      setTimeout(() => {
        item.classList.remove("hide-down");
        item.classList.add("active");
      }, 10);
    }
  }
};

allNavigateBtns.forEach((btn) => {
  btn.addEventListener("click", function (event) {
    if (this.classList.contains("btn-inactive")) {
      if (this.classList.contains("next-btn-2")) {
        // warunki jaki komunikat ma być jak się wciśnie przycisk dalej
        checkIfGameNameOK()
        if (inputForNewGame === false) {
          makeWarning("wpisz nazwę", 1);
          console.log("brak nazwy");
        }
        if (numberOfPlayersSelected === false) {
          console.log("brak liczby graczy");
          makeWarning("wybiesz liczbę graczy", 2);
        }
      }
      return;
    }

    const btnClass = event.target.classList[3];
    const currentScreenNumber = parseInt(btnClass.slice(9), 10);
    const targetScreenNumber = currentScreenNumber + 1;
    const currentScreenElement = document.querySelector(
      `.create-screen-${currentScreenNumber}`
    );
    const targetScreenElement = document.querySelector(
      `.create-screen-${targetScreenNumber}`
    );

    Visibility(currentScreenElement, "left", "hide");
    Visibility(targetScreenElement, "left", "show");
    currentScreen = targetScreenElement;
    screenHistory.push(currentScreen);

    // Możesz dodać tu sekcję else if dla niestandardowych przycisków
    // if (btnClass === "join-game-BTN") {
    //   handleCustomNavigation(1, 5); // Przejście z 1 do 5
    // }
  });
});

////////////////
////////////////
////////////////
////////////////
////////////////
////////////////
////////////////
////////////////
////////////////

// FIRST-CREATE-SCREEN - creating new game

const nextBtn2 = document.querySelector(".next-btn-2");
const nameInput = document.querySelector(".name-game-input");
const circleButtons = document.querySelectorAll(".circle-container .cricle");

let matchingGame;

const checkIfGameNameOK = function (input) {
  console.log("checking if game ok...");
  if (
    inputForNewGame.length > 0 &&
    numberOfPlayersSelected == true &&
    !matchingGame
  ) {
    Visibility(nextBtn2, "btn-active");
  } else {
    Visibility(nextBtn2, "btn-inactive");
  }
  if (inputForNewGame.length <= 0){
 inputForNewGame = false
  }
};

nameInput.addEventListener("input", function () {
  const enteredGameName = this.value.trim().toUpperCase();
  matchingGame = gamesArray.find((game) => game.name === enteredGameName);

  if (!matchingGame) {
    inputForNewGame = this.value.toUpperCase();
    checkIfGameNameOK(inputForNewGame);
  } else if (matchingGame) {
    Visibility(nextBtn2, "btn-inactive");
    // makeWarning("taka gra juz istnieje");
  }
});

circleButtons.forEach((button) => {
  button.addEventListener("click", function () {
    circleButtons.forEach((btn) => btn.classList.remove("btn-active"));
    this.classList.add("btn-active");
    numberOfPlayersSelected = true;
    checkIfGameNameOK();
  });
});

nextBtn2.addEventListener("click", function () {
  const selectedCircleButtons = document.querySelectorAll(
    ".circle-container .cricle.selected"
  );
  const numberOfPlayers = Array.from(selectedCircleButtons)
    .map((button) => parseInt(button.textContent))
    .reduce((total, value) => total + value, 0);

  const gameName = nameInput.value.toUpperCase();
  const gameNameLabel = document.querySelector(".game-name-label"); // Nazwa gry w kolejnym ekranie
  currentGame = {
    name: gameName,
    numberOfPlayers: numberOfPlayers,
  };

  const namingGameLable = function () {
    gameNameLabel.textContent = gameName;
  };
  namingGameLable();
});

// ///////////////////////////
// Ekran 3 - dodanie nazwy gracza (hosta)

// ///////////////////////////

// Ekran 5 - umiejscownie graczy
// const allChairs = document.querySelectorAll(".chair");
// const finalNewGameBTN = document.querySelector(".final-new-game-BTN");
// const avatarsContainer = document.querySelector(".avatars-container");
// const avatars = document.querySelectorAll(".avatar");
// const chairs = document.querySelectorAll(".chair");

//  (goToChairScreenBTN.classList[3] === "btn-inactive") {
//     goToChairScreenBTN.classList.add("invalid");
//     setTimeout(() => {
//       goToChairScreenBTN.classList.remove("invalid");
//     }, 500);
//     return;}

// ///////////////////////////
// ///////////////////////////
// ///////////////////////////
// ///////////////////////////
// ///////////////////////////
// ///////////////////////////
// ///////////////////////////
// ///////////////////////////
// ///////////////////////////
// ///////////////////////////
// ///////////////////////////
// ///////////////////////////
// ///////////////////////////

const checkIfstandalone = function () {
  console.log("checking");
  if (window.navigator.standalone) {
    makeWarning("standalone");
  } else {
    makeWarning("not standalone");
  }
};

/////////// SKIP LOGIN
// const skipLogin = function (arg) {
//   Visibility(createScreen1, "left", "hide");
//   Visibility(homeScreen, "right", "show");
//   currentGame = gamesArray[gamesArray.length - 1];

//   setTimeout(() => {
//     currentPlayer = currentGame.gameOrder[arg];
//     reallyStart();

//     setTimeout(() => {
//       allNots = currentGame.notifications;
//     }, 200);
//   }, 400);
// };

// setTimeout(() => {
//   // skipLogin(1);
// }, 1000);

// const skipLogin1 = document.querySelector(".skip-login-1");
// const skipLogin2 = document.querySelector(".skip-login-2");

// skipLogin1.addEventListener("click", function () {
//   skipLogin(1);
// });

// skipLogin2.addEventListener("click", function () {
//   skipLogin(2);
// });

/////////// PREVENT SLEEP
async function preventSleep() {
  try {
    const wakeLock = await navigator.wakeLock.request("screen");
    wakeLock.addEventListener("change", () => {
      if (wakeLock.active) {
        console.log("Blokada ekranu została aktywowana.");
      } else {
        console.log("Blokada ekranu została dezaktywowana.");
      }
    });
  } catch (error) {
    console.error(
      "Wystąpił błąd podczas uzyskiwania dostępu do API blokady ekranu:",
      error
    );
  }
}
preventSleep();

// setInterval(() => {
//   if (gameStarted) {
//     updateUserScreen();
//   }
// }, 5000);
