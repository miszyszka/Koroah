"use strict";

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  onValue,
  push,
  get,
  set,
  ref,
  update,
  remove,
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
const createScreen8 = document.querySelector(".create-screen-8");

// BTN's
const goBackBTNs = document.querySelectorAll(".go-back-btn");
const newGameBTN = document.querySelector(".new-game-BTN");
const joinGameBTN = document.querySelector(".join-game-BTN");
const nextBtn8 = document.querySelector(".next-btn-8");

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
let hostIsPassing = false;

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
function generateTenDigitNumber() {
  const max = 9999999999; // Największa 10-cyfrowa liczba
  const min = 1000000000; // Najmniejsza 10-cyfrowa liczba
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomNumber;
}

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

function setHostIsPassing(value) {
  hostIsPassing = value;
  console.log("hostIsPassing changed:", value);

  if (hostIsPassing) {
    segmentJoinPlayer.classList.add("visible");
    Visibility(nextBtn7, "btn-active");
  } else {
    segmentJoinPlayer.classList.remove("visible");
    Visibility(nextBtn7, "btn-inactive");
  }
}

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

const clearFields = function (arg) {
  const allInputs = document.querySelectorAll(".input");

  allInputs.forEach((input) => {
    input.value = "";
  });
  circleButtons.forEach((button) => {
    button.classList.remove("selected");
  });

  // if (arg !== "retain currentGame") {
  //   currentGame = {};
  // }

  gameOrder = {};
  numberOfPlayersSelected = false;
  inputForNewGame = "";
  chairs.forEach((chair) => {
    chair.classList.remove("acalas", "umza", "raona", "hess");
    chair.style.display = "block";
  });
};

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

// Make warning
// Informacje podawane przy tworzeniu gry
const warningElements = document.querySelectorAll(".warning-element");
let hideTimer = null;
let isWarningActive = false;

function clearWarning() {
  if (!warningElements.length) return;

  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }

  warningElements.forEach((el) => {
    el.classList.remove("active");
    // po 0.5 sekundy (czas animacji fade-out) usuwamy tekst
    setTimeout(() => {
      el.innerHTML = "";
    }, 500);
  });

  isWarningActive = false;
}

function startWarningDisplay(message) {
  if (!warningElements.length) return;

  warningElements.forEach((el) => {
    el.innerHTML = `<h3>${message}</h3>`;
    el.classList.add("active");
  });

  isWarningActive = true;

  hideTimer = setTimeout(() => {
    clearWarning();
  }, 3000);
}

function makeWarning(message) {
  if (!warningElements.length) return;

  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }

  if (isWarningActive) {
    warningElements.forEach((el) => {
      el.classList.remove("active");
      el.style.transition = "none";
      el.innerHTML = `<h3>${message}</h3>`;
    });

    setTimeout(() => {
      warningElements.forEach((el) => {
        el.style.transition = "";
      });
      startWarningDisplay(message);
    }, 50);

    return;
  }

  startWarningDisplay(message);
}

//////////////////////////////
//////////////////////////////
//////////////////////////////
//////////////////////////////
//////////////////////////////
//////////////////////////////
// MANAGING SCREENS AND ELEMENTS
///////////////

let currentScreen = createScreen1;
// STOS HISTORII
const screenHistory = [];
// WAŻNE: Na początku dodaj pierwszy ekran do historii
screenHistory.push(currentScreen);

// VISIBILITY
///////////////
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

// Przyciski "dalej"
///////////////
allNavigateBtns.forEach((btn) => {
  btn.addEventListener("click", function (event) {
    if (this.classList.contains("btn-inactive")) {
      if (this.classList.contains("next-btn-2")) {
        // warunki jaki komunikat ma być jak się wciśnie przycisk dalej
        checkIfGameNameOK();

        const enteredGameName = nameGameInput.value.trim().toUpperCase();
        matchingGame = gamesArray.find((game) => game.name === enteredGameName);

        if (matchingGame) {
          Visibility(nextBtn2, "btn-inactive");
          makeWarning("taka gra juz istnieje");
        } else if (!inputForNewGame && !numberOfPlayersSelected) {
          makeWarning("wpisz nazwę gry i podaj liczbę graczy");
        } else if (!inputForNewGame && numberOfPlayersSelected) {
          makeWarning("podaj nazwę gry");
        } else if (inputForNewGame && !numberOfPlayersSelected) {
          makeWarning("wybiesz liczbę graczy");
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

    if (currentScreenElement === createScreen2) {
      // przejście dla hosta
      Visibility(currentScreenElement, "left", "hide");
      Visibility(createScreen7, "left", "show");
      currentScreen = createScreen7;
      setHostIsPassing(true);
      console.log("changing host is passing...");
    } else {
      Visibility(currentScreenElement, "left", "hide");
      Visibility(targetScreenElement, "left", "show");
      currentScreen = targetScreenElement;
    }

    if (screenHistory[screenHistory.length - 1] !== currentScreen) {
      screenHistory.push(currentScreen);
    }

    // Możesz dodać tu sekcję else if dla niestandardowych przycisków
    // if (btnClass === "join-game-BTN") {
    //   handleCustomNavigation(1, 5); // Przejście z 1 do 5
    // }
  });
});

// Przyciski "go back"
///////////////
goBackBTNs.forEach((btn) => {
  btn.addEventListener("click", () => {
    console.log("running going back...");
    console.log(screenHistory);

    if (screenHistory.length <= 1) return;

    screenHistory.pop();

    const lastScreen = screenHistory[screenHistory.length - 1];
    const lastScreenElement = lastScreen;

    Visibility(currentScreen, "right", "hide");
    Visibility(lastScreenElement, "right", "show");

    currentScreen = lastScreen;

    if (screenHistory.length === 1) {
      location.reload();
    }
  });
});

//////////////////////////////
//////////////////////////////
//////////////////////////////
//////////////////////////////
//////////////////////////////
//////////////////////////////
// Databases
///////////////

// UPDATE CURRENT GAME
// reading game from DB and making currentGamme & currentPlayer really current
///////////////
const updateCurrentGame = function (gameName) {
  console.log("=== START UPDATE CURRENT GAME ===");
  let passedGameName = gameName;
  console.log(passedGameName);
  if (!gameName) {
    passedGameName = currentGame.name;
  }

  const foundGame = gamesArray.find((game) => game.name === passedGameName);
  currentGame = foundGame;
  console.log(foundGame);

  if (currentPlayer && currentPlayer.id) {
    const gameOrderValues = Object.values(currentGame.gameOrder);
    const foundChair = gameOrderValues.find(
      (chair) => chair.id === currentPlayer.id
    );
    currentPlayer = foundChair;
    console.log("CURRENT PLAYER UPDATED");
  }

  // if (foundGame) {

  //   allNots = currentGame.notifications;
  //   // updatePrices("from = updateCurrentGame()");

  //   // usunięcie 0 z liczb dziesiętnych
  //   for (let i = 0; i < currentGame.prices.length; i++) {
  //     const value = parseFloat(currentGame.prices[i]);
  //     currentGame.prices[i] = value;
  //   }
  //   return foundGame;
  // } else {
  //   console.log("updateCurrentGame FAILED");
  // }

  if (hostIsPassing) {
    joinNameGameInput.value = currentGame.name;
    joinNameGameInput.disabled = true;
    joinNameGameInput.classList.add("input-disabled-style");
  }

  console.log("=== END UPDATE CURRENT GAME ===");
};

// UPDATE DB
///////////////
const updateDB = function () {
  console.log("================ UPDATING DB ===============");
  console.log(currentGame);
  const game = currentGame;
  const userRef = ref(database, `games/${game.id}`);
  update(userRef, game);
};

// //NASŁUCHIWANIE (zmiany w DB)
// onValue(gamesDB, (snapshot) => {
//   console.log("OCURRED CHANGE IN DB!");
//   const gamesData = snapshot.val();
//   gamesArray.length = 0;

//   if (gamesData) {
//     Object.keys(gamesData).forEach((gameId) => {
//       gamesArray.push({
//         id: gameId,
//         ...gamesData[gameId],
//       });
//     });
//   }
//   if (currentGame.name !== undefined) {
//     const name = currentGame.name;
//     // updateCurrentGame(name);
//     // updatePricesAndValues();
//     // updateUserScreen();
//   }
// });

// 🔹 Helper function — fills gamesArray from snapshot
function fillGamesArray(snapshot) {
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
}

// 🔹 First fill (once)
async function firstFillGamesArray(gamesDB) {
  try {
    const snapshot = await get(gamesDB);
    fillGamesArray(snapshot);
  } catch (error) {
    console.error("Error during first fill:", error);
  }
}

// 🔹 Live updates
onValue(gamesDB, (snapshot) => {
  console.log("Database changed!");
  fillGamesArray(snapshot);

  if (currentGame.name !== undefined) {
    const name = currentGame.name;
    updateCurrentGame(name);
    // updatePricesAndValues();
    // updateUserScreen();
  }
});

// 🔹 Run the first fill
firstFillGamesArray(gamesDB);

////////////////
////////////////
////////////////
////////////////
////////////////
////////////////
////////////////
////////////////
////////////////

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
const nameGameInput = document.querySelector(".name-game-input");
const playersContainer = document.querySelector(".circle-container");
const circleButtons = document.querySelectorAll(".circle-container .cricle");

let matchingGame;

const checkIfGameNameOK = function (input) {
  if (
    inputForNewGame.length > 0 &&
    numberOfPlayersSelected == true &&
    !matchingGame
  ) {
    Visibility(nextBtn2, "btn-active");
  } else {
    Visibility(nextBtn2, "btn-inactive");
  }
  if (inputForNewGame.length <= 0) {
    inputForNewGame = false;
  }
};

nameGameInput.addEventListener("input", function () {
  const enteredGameName = this.value.trim().toUpperCase();
  matchingGame = gamesArray.find((game) => game.name === enteredGameName);

  if (!matchingGame) {
    inputForNewGame = this.value.toUpperCase();
    checkIfGameNameOK(inputForNewGame);
  } else if (matchingGame) {
    Visibility(nextBtn2, "btn-inactive");
    makeWarning("taka gra juz istnieje");
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

// Przycisk do ustalenia nazwy i wybrania liczby graczy - stworzenia gry przez hosta
nextBtn2.addEventListener("click", function () {
  const activeBtn = playersContainer.querySelector(".btn-active");
  const textValue = activeBtn.textContent.trim();
  const numberOfPlayers = parseInt(textValue, 10);

  const createNewGame = function (numberOfPlayers, gameName) {
    const gameOrder = {}; // <--- tu jest różnica! tworzymy nowy obiekt
    for (let i = 1; i <= numberOfPlayers; i++) {
      const playerId = `player-${i}`;
      gameOrder[playerId] = {
        id: "", // ID gracza (null = wolne miejsce)
        name: "", // Nazwa gracza
        pin: "",
        ready: false,
        randomValue: "some value",
      };
    }

    currentGame = {
      id: generateTenDigitNumber(),
      name: gameName,
      maxPlayers: numberOfPlayers,
      status: "lobby",
      gameOrder: gameOrder,
    };
    updateDB();
    updateCurrentGame();
  };

  // Wywołanie funkcji
  createNewGame(numberOfPlayers, nameGameInput.value.toUpperCase());

  // const namingGameLable = function () {
  //   gameNameLabel.textContent = gameName;
  // };
  // namingGameLable();
});

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
// Ekran 7 - dołączanie do gry - nazwa i imię gracza
const segmentJoinPlayer = document.querySelector(".segment-join-player");
const joinNameGameInput = document.querySelector(".join-name-game-input");
const joinPlayerNameInput = document.querySelector(".join-player-name-input");
const nextBtn7 = document.querySelector(".next-btn-7");

// CHECK IF THERE IS A GAME TO JOIN
if (!hostIsPassing)
  joinNameGameInput.addEventListener("input", function () {
    const enteredGameName = this.value.trim().toUpperCase();
    matchingGame = gamesArray.find((game) => game.name === enteredGameName);
    currentGame = matchingGame;

    if (matchingGame) {
      Visibility(nextBtn7, "btn-active");
      segmentJoinPlayer.classList.add("visible");
    } else {
      Visibility(nextBtn7, "btn-inactive");
      segmentJoinPlayer.classList.remove("visible");
    }
  });

// JOINGAME FUNCTION

const joinGame = function (playerName) {
  console.log("...starting joying game", playerName);

  if (!currentGame) {
    makeWarning("nie ma takiej gry!");
  }
  const playerSlots = Object.keys(currentGame.gameOrder);

  for (const slotKey of playerSlots) {
    const slot = currentGame.gameOrder[slotKey];

    if (slot.id === "") {
      const slotNumber = parseInt(slotKey.trim().slice(-1), 10);
      slot.id = slotNumber;
      slot.name = playerName;

      currentPlayer = slot; // USTAWIENIE PO RAZ PIERWSZY currentPlayer

      console.log(
        `Gracz ${playerName} dołączył do gry na pozycji: ${slotNumber}`
      );
      break;
    }
  }
  updateDB();
  updateCurrentGame();
};

// przycisk po wpisaniu imienia gracza
nextBtn7.addEventListener("click", function () {
  const playerName = joinPlayerNameInput.value.trim().toUpperCase();

  if (!playerName) {
    alert("Podaj nazwę gracza!");
    return;
  }

  // sprawdzanie czy gracz istnieje
  let found = false;
  let existingPlayer = null;

  for (const playerKey in currentGame.gameOrder) {
    const player = currentGame.gameOrder[playerKey];
    if (player.name === playerName) {
      found = true;
      existingPlayer = player;
      currentPlayer = player;
      break;
    }
  }

  // tworzenie nowego ekranu potwierdzenia
  const confirmScreen = document.createElement("div");
  confirmScreen.className = "screen confirm-screen active";
  confirmScreen.innerHTML = `
    <div class="segment h20">
    </div>
    <div class="segment h20">
    </div>
    <div class="segment h20">
          <h2 class="label">
        ${
          found
            ? `Gracz ${existingPlayer.name} już istnieje </br> Czy to ty? `
            : "Czy chcesz stworzyć nowego gracza?"
        }
      </h2></div>
    <div class="segment h15"></div>
    <div class="segment h10" style="flex-direction: row">
          <div class="btn btn-half navigate-btn close-btn btn-active">Nie</div>
      <div class="btn btn-half navigate-btn confirm-btn btn-active">Tak</div>
    </div>
    <div class="segment h15"></div>
  `;

  // dodaj do DOM
  document.body.appendChild(confirmScreen);

  // obsługa przycisku potwierdzenia
  const confirmBtn = confirmScreen.querySelector(".confirm-btn");
  confirmBtn.addEventListener("click", () => {
    confirmScreen.remove();
    if (!found) {
      joinGame(playerName);
    }
  });

  // obsługa zamykania (kliknięcie X)
  const closeBtn = confirmScreen.querySelector(".close-btn");
  closeBtn.addEventListener("click", () => {
    confirmScreen.remove();
        screenHistory.pop();

    const lastScreen = screenHistory[screenHistory.length - 1];
    const lastScreenElement = lastScreen;

    Visibility(currentScreen, "right", "hide");
    Visibility(lastScreenElement, "right", "show");
  });
});

// ///////////////////////////
// Ekran 8 - PIN

const pinBox = document.querySelector(".pin-box");
const pinDots = document.querySelectorAll(".pin-dot");
const pinLabel = document.querySelector(".pin-label");
const keyboard = document.querySelector(".keyboard");
const keys = document.querySelectorAll(".key");
let ongoingPIN = "";

const checkPIN = function (pin, oryginalPin) {
  pin = formatInputValue(pin, "number");
  if (pin === oryginalPin) {
    console.log("podano PIN PRAWIDŁOWY ktory jest w db");
    return true;
  } else {
    console.log("NIEPRAWIDŁOWY PIN (ponizej podany i pin i oryginalny pin");
    console.log(pin, oryginalPin);
    pinBox.classList.add("invalid");
    setTimeout(() => {
      pinBox.classList.remove("invalid");
    }, 500);
    makeWarning("nieprawidłowy");
    return false;
  }
};

const createPIN = function (pin) {
  console.log("creating PIN START");
  Object.keys(currentGame.gameOrder).forEach((chairId) => {
    const player = currentGame.gameOrder[chairId].id;

    if (player === currentPlayer.id) {
      const pinRef = ref(
        database,
        `games/${currentGame.id}/gameOrder/${chairId}`
      );

      console.log(player);
      update(pinRef, {
        pin: pin,
      });
    }
  });
};

// ta fukncja jest uruchamiana po wejściu w okno pinScreen
const logIn = function () {
  const createIcons = function () {
    for (let i = 0; i < currentGame.gameOrder.length; i++) {
      const foundPlayer = currentGame.gameOrder[i];
      const iconDiv = document.createElement("div");
      iconDiv.className = `icon ${foundPlayer.player} ${classNumber[i]}`;
      iconContainer.appendChild(iconDiv);
    }
  };
  createIcons();

  // DODANIE EVENT LISTINEROW DO STWORZONYCH IKON
  const icons = document.querySelectorAll(".icon");
  let rollDown = true;

  icons.forEach((icon) => {
    icon.addEventListener("click", function () {
      const IconName = icon.classList[1];
      currentPlayer = currentGame.gameOrder.find(
        (game) => game.player === IconName
      );
      console.log(currentPlayer);

      if (rollDown === true) {
        icons.forEach((i) => {
          if (currentPlayer.pin) {
            pinLabel.innerHTML = "PODAJ PIN";
          } else {
            pinLabel.innerHTML = "STWÓRZ PIN";
          }

          Visibility(pinBox, "left", "show");
          Visibility(keyboard, "left", "show");
          i.classList.add("icon-up");
          i.style.zIndex = "1";
          if (i !== icon) {
            icon.style.zIndex = "2";
          }
        });
        rollDown = false;
      } else {
        icons.forEach((i) => {
          Visibility(pinBox, "right", "hide");
          Visibility(keyboard, "right", "hide");
          i.classList.remove("icon-up");
          i.style.zIndex = "1";
        });
        rollDown = true;
        ongoingPIN = "";
        pinDots.forEach((dot) => {
          dot.style.background = "var(--black)";
        });
      }
    });
  });
};

// Funkcja obsługi klawiszy i ekranu PIN
keys.forEach((key) => {
  key.addEventListener("click", function (event) {
    Visibility(nextBtn8, "btn-inactive");
    if (key.classList[2] === "del") {
      setTimeout(() => {
        key.style.filter = "var(--drop-shadow-item)";
      }, 200);
      const dotForFill = document.querySelector(
        `.pin-dot-${ongoingPIN.length - 1}`
      );
      dotForFill.style.background = "var(--black)";
      ongoingPIN = ongoingPIN.slice(0, -1);
      keys.forEach((key) => {
        key.classList.remove("btn-inactive");
        key.classList.add("btn-active");
        key.style.pointerEvents = "auto";
      });
      return;
    }
    ongoingPIN = ongoingPIN + event.target.classList[2];
    key.style.background = "var(--main-colour)";
    setTimeout(() => {
      key.style.filter = "none";
      key.style.background = "var(--black)";
    }, 200);
    const fillDots = function () {
      const length = ongoingPIN.length - 1;
      const dotForFill = document.querySelector(`.pin-dot-${length}`);
      dotForFill.style.background = "var(--main-colour)";
    };
    fillDots();
    if (ongoingPIN.length === 4) {
      Visibility(nextBtn8, "btn-active");
      keys.forEach((key) => {
        if (!key.classList.contains("del")) {
          key.classList.remove("btn-active");
          key.classList.add("btn-inactive");
          key.style.pointerEvents = "none";
        }
      });
    } else {
      Visibility(nextBtn8, "btn-inactive");
      keys.forEach((key) => {
        key.classList.remove("btn-inactive");
        key.classList.add("btn-active");
        key.style.pointerEvents = "auto";
      });
    }
  });
});

// Przycisk w ekranie 8
nextBtn8.addEventListener("click", function () {
  setTimeout(() => {
    nextBtn8.style.filter = "var(--drop-shadow-item)";
  }, 200);
  let enteredPin = formatInputValue(ongoingPIN, "number");
  if (nextBtn8.classList[3] === "btn-inactive") {
    pinBox.classList.add("invalid");
    setTimeout(() => {
      pinBox.classList.remove("invalid");
    }, 500);
    return;
  }
  if (currentPlayer.pin) {
    if (checkPIN(enteredPin, currentPlayer.pin)) {
    }
  } else {
    createPIN(enteredPin);
  }
});

// Funkcja startująca grę
// const reallyStart = function () {
//   const loadingScreen = function () {
//     const loadingScreenEL = document.querySelector(".loading-screen-EL");

//     loadingScreenEL.style.display = "flex";
//     pinScreen.style.display = "none";
//     setTimeout(() => {
//       loadingScreenEL.style.display = "none";
//     }, 1500);
//   };
//   loadingScreen();

//   setTimeout(() => {
//     setTimeout(() => {
//       startGame();
//     }, 500);
//     clearFields("retain currentGame");
//   }, 500);
// };

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

// const checkIfstandalone = function () {
//   console.log("checking");
//   if (window.navigator.standalone) {
//     makeWarning("standalone");
//   } else {
//     makeWarning("not standalone");
//   }
// };

///////// SKIP LOGIN
const skipLogin = function (arg) {
  setTimeout(() => {
    updateCurrentGame("1");
    Visibility(createScreen1, "left", "hide");
    Visibility(createScreen8, "right", "show");
    currentGame = gamesArray[gamesArray.length - 1];
    currentPlayer = currentGame.gameOrder["player-2"];
    console.log(currentPlayer, currentGame);
  }, 400);
};

// skipLogin();

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

const testBTN1 = document.querySelector(".testBTN1");
testBTN1.addEventListener("click", function () {
  console.log(currentPlayer);
});

const deleteAllGames = async () => {
  console.log("deleting all games");
  const db = getDatabase();
  const gamesRef = ref(db, "games");

  try {
    const snapshot = await get(gamesRef);
    if (snapshot.exists()) {
      const games = snapshot.val();
      const deletePromises = Object.keys(games).map((gameId) =>
        remove(ref(db, `games/${gameId}`))
      );
      await Promise.all(deletePromises);
      console.log("Wszystkie gry zostały usunięte z bazy danych.");
    } else {
      console.log("Brak gier do usunięcia.");
    }
  } catch (error) {
    console.error("Błąd podczas usuwania gier:", error);
  }
};

const testBTN2 = document.querySelector(".testBTN2");
testBTN2.addEventListener("click", function () {
  deleteAllGames();
});
