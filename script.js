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

// ELEMENTS
const allButtons = document.querySelectorAll(".btn");

const iconContainer = document.querySelector(".icon-container");

// screens
const mainScreen = document.querySelector(".main-screen");
const firstCreateScreen = document.querySelector(".first-create-screen");
const chairScreen = document.querySelector(".chair-screen");
const pinScreen = document.querySelector(".pin-screen");
const firstJoinScreen = document.querySelector(".first-join-screen");

const allScreens = document.querySelectorAll(".screen");
const homeScreen = document.querySelector(".home-screen");
const turnScreen = document.querySelector(".turn-screen");
const buildingScreen = document.querySelector(".building-screen");
const exchangeScreen = document.querySelector(".exchange-screen");

const gameMenuBar = document.querySelector(".game-menu-bar");

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
let inputForNewGame;
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
  "Źródło",
  "Gildia",
  "Kopalnia",
  "Huta",
  "Generator",
  "Sąd",
  "Wieża",
  "Krąg kupców",
  "Orbita",
  "Konwerter",
  "Monolit",
  "Portal",
];

const testBTN = document.querySelector(".test-btn");
testBTN.addEventListener("click", function () {
  console.log(currentGame);
  console.log(currentPlayer);
  passTurn();
  updatePricesAndValues();
});

////////////////
// USEFULL FUNCTION
///////////////

allButtons.forEach((btn) => {
  btn.addEventListener("click", function () {
    if (!btn.classList.contains("toggle")) {
      setTimeout(() => {
        btn.style.filter = "var(--drop-shadow-item)";
      }, 200);
    }
  });
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

////////////////
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

// UPDATE DB
///////////////////////////

const updateDB = function () {
  console.log("================ UPDATING DB ===============");
  console.log(currentGame);
  const game = currentGame;
  const userRef = ref(database, `games/${game.id}`);
  update(userRef, game);
};

const updateCurrentPlayerToDB = function () {
  Object.keys(currentGame.gameOrder).forEach((chairId) => {
    const player = currentGame.gameOrder[chairId].player;

    for (const resource in currentPlayer.resources) {
      currentPlayer.resources[resource] = formatInputValue(
        currentPlayer.resources[resource],
        "number"
      );
    }

    if (player === currentPlayer.player) {
      const pinRef = ref(
        database,
        `games/${currentGame.id}/gameOrder/${chairId}`
      );

      update(pinRef, {
        ...currentPlayer, // Rozpakowanie obiektu currentPlayer
      });
    }
  });
};

////////////////
// MANAGING SCREENS AND ELEMENTS
///////////////
let currentScreen;

allNavigateBtns.forEach((btn) => {
  btn.addEventListener("click", function (event) {
    let btnName = event.target.classList[2];

    console.log(btnName);

    if (btnName === "new-game-BTN") {
      Visibility(mainScreen, "left", "hide");
      Visibility(firstCreateScreen, "left", "show");
      currentScreen = firstCreateScreen;
    }
    if (btnName === "join-game-BTN") {
      Visibility(mainScreen, "left", "hide");
      Visibility(firstJoinScreen, "left", "show");
      currentScreen = firstJoinScreen;
    }

    if (btnName === "exchange" && currentScreen !== exchangeScreen) {
      Visibility(currentScreen, "left", "hide");
      Visibility(exchangeScreen, "left", "show");
      currentScreen = exchangeScreen;
    }

    if (btnName === "buildings" && currentScreen !== buildingScreen) {
      console.log(currentScreen.classList[2]);
      if (currentScreen.classList[2] === "exchange") {
        Visibility(currentScreen, "right", "hide");
        Visibility(buildingScreen, "right", "show");
      } else {
        Visibility(currentScreen, "left", "hide");
        Visibility(buildingScreen, "left", "show");
      }
      currentScreen = buildingScreen;
    }

    if (btnName === "turn" && currentScreen !== turnScreen) {
      Visibility(currentScreen, "right", "hide");
      Visibility(turnScreen, "right", "show");
      currentScreen = turnScreen;
    }

    if (btnName === "home" && currentScreen !== homeScreen) {
      Visibility(currentScreen, "right", "hide");
      Visibility(homeScreen, "right", "show");
      currentScreen = homeScreen;
    }
  });
});

const goToMain = document.querySelectorAll(".go-to-main");
const goToFirst = document.querySelector(".go-to-first-screen");

goToMain.forEach((btn) => {
  btn.addEventListener("click", function () {
    Visibility(currentScreen, "right", "hide");
    Visibility(mainScreen, "right", "show");
  });
});

goToFirst.addEventListener("click", function () {
  Visibility(chairScreen, "right", "hide");
  Visibility(firstCreateScreen, "right", "show");
});

////////////////
// CREATING GAME ELEMENTS
///////////////

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
    const player = currentGame.gameOrder[chairId].player;

    if (player === currentPlayer.player) {
      const pinRef = ref(
        database,
        `games/${currentGame.id}/gameOrder/${chairId}`
      );

      update(pinRef, {
        pin: pin,
      });
    }
  });
};

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

let isWarning = false;

function clearWarning() {
  messageContainer.style.transform = "translateY(-200px)";
  isWarning = false;
  setTimeout(() => {
    messageContainer.innerHTML = "";
  }, 50);
}

function makeWarning(message) {
  if (isWarning) {
    console.log("there is an old warning");
    clearWarning();
    setTimeout(() => {
      makeWarning(message);
    }, 200);
  }

  setTimeout(() => {
    messageContainer.style.display = "flex";
    messageContainer.innerHTML = `<h3>${message}</h3>`;
    setTimeout(() => {
      messageContainer.style.transform = "translateY(0px) ";
    }, 30);
    setTimeout(() => {
      clearWarning();
    }, 3000);
  }, 100);
}

///////////
///////////
// FIRST-CREATE-SCREEN - creating new game

const goToChairScreenBTN = document.querySelector(".go-to-chair-screen-BTN");
const nameInput = document.querySelector(".name-game-input");
const circleButtons = document.querySelectorAll(".circle-container .cricle");
const allChairs = document.querySelectorAll(".chair");
const finalNewGameBTN = document.querySelector(".final-new-game-BTN");
const avatarsContainer = document.querySelector(".avatars-container");
const avatars = document.querySelectorAll(".avatar");
const chairs = document.querySelectorAll(".chair");
let matchingGame;

const checkIfFirsScreenGood = function (input) {
  if (
    inputForNewGame.length > 0 &&
    numberOfPlayersSelected == true &&
    !matchingGame
  ) {
    Visibility(goToChairScreenBTN, "btn-active");
  } else {
    Visibility(goToChairScreenBTN, "btn-inactive");
  }
};

nameInput.addEventListener("input", function () {
  const enteredGameName = this.value.trim().toUpperCase();
  matchingGame = gamesArray.find((game) => game.name === enteredGameName);

  if (!matchingGame) {
    inputForNewGame = this.value.toUpperCase();
    checkIfFirsScreenGood(inputForNewGame);
  } else if (matchingGame) {
    Visibility(nextNewGameBTN, "btn-inactive");
    // makeWarning("taka gra juz istnieje");
  }
});

circleButtons.forEach((button) => {
  button.addEventListener("click", function () {
    circleButtons.forEach((btn) => btn.classList.remove("selected"));
    this.classList.toggle("selected");
    numberOfPlayersSelected = true;
    checkIfFirsScreenGood();
  });
});

goToChairScreenBTN.addEventListener("click", function () {
  if (goToChairScreenBTN.classList[3] === "btn-inactive") {
    goToChairScreenBTN.classList.add("invalid");
    setTimeout(() => {
      goToChairScreenBTN.classList.remove("invalid");
    }, 500);
    return;
  }

  const selectedCircleButtons = document.querySelectorAll(
    ".circle-container .cricle.selected"
  );
  const numberOfPlayers = Array.from(selectedCircleButtons)
    .map((button) => parseInt(button.textContent))
    .reduce((total, value) => total + value, 0);

  const gameName = nameInput.value.toUpperCase();

  currentGame = {
    name: gameName,
    numberOfPlayers: numberOfPlayers,
  };

  // NUBER OF CHAIRS NEEDED

  allChairs.forEach((chair) => {
    const chairId = parseInt(chair.classList[1].slice(-1));

    let angle;
    switch (numberOfPlayers) {
      case 3:
        angle = chairId * 120;
        break;
      case 4:
        angle = chairId * 90;
        break;
      case 5:
        angle = chairId * 72;
        break;
    }
    chair.style.transform = `rotate(${angle}deg) translateY(-120px)`;
  });

  Visibility(firstCreateScreen, "left", "hide");
  Visibility(chairScreen, "left", "show");
});

// CHAIR SCREEN (create game)

let choosenChair;

function hasDuplicates(obj) {
  const players = Object.values(obj).map((item) => item.player);
  return new Set(players).size !== players.length;
}

const checkIfAllGood = function () {
  if (
    !hasDuplicates(gameOrder) &&
    Object.keys(gameOrder).length === currentGame.numberOfPlayers
  ) {
    Visibility(finalNewGameBTN, "btn-active");
  } else {
    Visibility(finalNewGameBTN, "btn-inactive");
  }
};

function handleChairClick(chair) {
  console.log("starta");
  const chairId = chair.target.getAttribute("data-chair-id");
  choosenChair = chairId;
  Visibility(avatarsContainer, "left", "show");
}

function handleAvatarClick() {
  const selectedAvatar = this.getAttribute("id").replace("avatar-", "");
  gameOrder[choosenChair] = {};
  gameOrder[choosenChair].player = selectedAvatar;

  const selectedChair = document.querySelector(
    `[data-chair-id="${choosenChair}"]`
  );
  if (selectedChair) {
    selectedChair.classList.remove("acalas", "umza", "raona", "hess", "layao");
    selectedChair.classList.add(selectedAvatar);
  }
  Visibility(avatarsContainer, "right", "hide");
  checkIfAllGood();
}

chairs.forEach((chair) => {
  chair.addEventListener("click", handleChairClick);
});

avatars.forEach((avatar) => {
  avatar.addEventListener("click", handleAvatarClick);
});

// ADDING GAME TO DATABASE
finalNewGameBTN.addEventListener("click", function () {
  let rearangedGameOrder = {};
  Object.keys(gameOrder).forEach((key, index) => {
    rearangedGameOrder[index] = gameOrder[key];
    rearangedGameOrder[index].danina = 2;
    rearangedGameOrder[index].resources = [5, 5, 5, 5];
    rearangedGameOrder[index].feeLevel = 0.8;
    if (index === 0) {
      rearangedGameOrder[index].turn = true;
    } else {
      rearangedGameOrder[index].turn = false;
    }
  });

  currentGame.gameOrder = rearangedGameOrder;
  currentGame.prices = [2, 2, 2, 2];

  let buildings = {};

  for (let i = 0; i < allBuildingsArray.length; i++) {
    buildings[i] = { build: false, activities: [] };
  }

  currentGame.buildings = buildings;

  push(gamesDB, currentGame);
  updateCurrentGame();
  logIn();
  clearFields("retain currentGame");

  Visibility(chairScreen, "left", "hide");
  Visibility(pinScreen, "left", "show");
});

//////////////////////
//////////////////////
// JOIN GAME

const joinGameInput = document.querySelector(".join-game-input");

const pinGameInput = document.querySelector(".pin-game-input");
const goToPinBNT = document.querySelector(".go-to-pin-BTN");
const finalJoinGameBTN = document.querySelector(".final-join-game-BTN");

// CHECK IF THERE IS A GAME TO JOIN
joinGameInput.addEventListener("input", function () {
  const enteredGameName = this.value.trim().toUpperCase();
  matchingGame = gamesArray.find((game) => game.name === enteredGameName);
  currentGame = matchingGame;

  if (matchingGame) {
    Visibility(goToPinBNT, "btn-active");
    updateCurrentGame(matchingGame);
  } else {
    Visibility(goToPinBNT, "btn-inactive");
  }
});

// Przycisk do wejścia w ekran PIN
goToPinBNT.addEventListener("click", function () {
  if (goToPinBNT.classList[3] === "btn-inactive") {
    goToPinBNT.classList.add("invalid");
    setTimeout(() => {
      goToPinBNT.classList.remove("invalid");
    }, 500);
    return;
  }
  Visibility(firstJoinScreen, "left", "hide");
  Visibility(pinScreen, "left", "show");
  logIn();
});

//////////////////////
//////////////////////
// PIN SCREEN

const pinBox = document.querySelector(".pin-box");
const pinDots = document.querySelectorAll(".pin-dot");
const pinLabel = document.querySelector(".pin-label");
const keyboard = document.querySelector(".keyboard");
const keys = document.querySelectorAll(".key");

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

let ongoingPIN = "";

// Funkcja obsługi klawiszy i ekranu PIN
keys.forEach((key) => {
  key.addEventListener("click", function (event) {
    Visibility(finalJoinGameBTN, "btn-inactive");
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
    console.log(ongoingPIN);
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
      Visibility(finalJoinGameBTN, "btn-active");
      keys.forEach((key) => {
        if (!key.classList.contains("del")) {
          key.classList.remove("btn-active");
          key.classList.add("btn-inactive");
          key.style.pointerEvents = "none";
        }
      });
    } else {
      Visibility(finalJoinGameBTN, "btn-inactive");
      keys.forEach((key) => {
        key.classList.remove("btn-inactive");
        key.classList.add("btn-active");
        key.style.pointerEvents = "auto";
      });
    }
  });
});

// Funkcja startująca grę
const reallyStart = function () {
  const loadingScreen = function () {
    const loadingScreenEL = document.querySelector(".loading-screen-EL");

    loadingScreenEL.style.display = "flex";
    pinScreen.style.display = "none";
    setTimeout(() => {
      loadingScreenEL.style.display = "none";
    }, 1500);
  };
  loadingScreen();

  setTimeout(() => {
    setTimeout(() => {
      startGame();
    }, 500);
    clearFields("retain currentGame");
  }, 500);
};

// Przycisk do rozpoczęcia gry
finalJoinGameBTN.addEventListener("click", function () {
  setTimeout(() => {
    finalJoinGameBTN.style.filter = "var(--drop-shadow-item)";
  }, 200);
  let enteredPin = formatInputValue(ongoingPIN, "number");
  console.log(ongoingPIN);
  if (finalJoinGameBTN.classList[3] === "btn-inactive") {
    pinBox.classList.add("invalid");
    setTimeout(() => {
      pinBox.classList.remove("invalid");
    }, 500);
    return;
  }
  if (currentPlayer.pin) {
    if (checkPIN(enteredPin, currentPlayer.pin)) {
      reallyStart();
    }
  } else {
    createPIN(enteredPin);
    reallyStart();
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
// GAME

const gameMenuBTNs = document.querySelectorAll(".game-menu-btn");
const gameMenuBTNTurn = document.getElementById("game-menu-btn-turn");
const gameMenuBTNHome = document.getElementById("game-menu-btn-home");

////////////////
// SMALL FUNCTIONS & HANDLERS

// funkcja ktora sprawdzi ile jest neutralnych, pozytywnych i negatywnych w building.activity
const summaryBuilidingActivities = function (id) {
  let neutrals = 0;
  let positives = 0;
  let negatives = 0;

  for (let i = 0; i < currentGame.buildings[id].activities.length; i++) {
    switch (currentGame.buildings[id].activities[i]) {
      case 0:
        neutrals++;
        break;
      case 1:
        positives++;
        break;
      case 2:
        negatives++;
        break;
      default:
        // Ignoruj inne wartości
        break;
    }
  }
  return [neutrals, positives, negatives];
};

// funkcja która doda losową aktywność do building.activity
const addRandomActivity = function (id) {
  function losujLiczbe() {
    const losowaLiczba = Math.random(); // Losuje liczbę z przedziału [0, 1)

    if (losowaLiczba < 0.5) {
      return 0; // 50% szans na 0
    } else if (losowaLiczba < 0.75) {
      return 1; // 25% szans na 1
    } else {
      return 2; // 25% szans na 2
    }
  }

  // Add Activity do CurrentGame
  Object.keys(currentGame.buildings).forEach((buildingId) => {
    const building = currentGame.buildings[buildingId];

    if (buildingId === id.toString()) {
      if (!building.activities) {
        building.activities = []; // dodaj array jeśli jeszcze go nie ma
      }
      building.activities.push(losujLiczbe());
      updateDB();
    }
  });

  // Add Dot
};

gameMenuBTNs.forEach((button) => {
  button.addEventListener("click", function () {
    gameMenuBTNs.forEach((btn) => btn.classList.remove("selected"));
    this.classList.toggle("selected");
    const choosenScreen = allScreensArray.find(
      (screen) => screen.classList[2] === this.classList[1]
    );
  });
});

//////////////////////
//////////////////////
//////////////////////
// UPDATE PRICES (prices and values - ta funkcja jest updatowana tylko jezeli jest zmiana w bazie danych)
const updatePricesAndValues = function (origin) {
  /////// CURRENT USER VALUES
  function removeOldDots() {
    const allPluses = document.querySelectorAll(".plus");
    const allBoxes = document.querySelectorAll(".resource-box");

    allPluses.forEach((plus) => {
      plus.style.opacity = "0";
    });
    allBoxes.forEach((box) => {
      box.style.opacity = "1";
    });
    const dots = document.querySelectorAll(".dot");
    dots.forEach((dot) => {
      dot.parentNode.removeChild(dot);
    });
  }
  removeOldDots();

  const updateBuildingsScreen = function () {
    const removeOldList = function () {
      const buildings = document.querySelectorAll(".bu-container");
      buildings.forEach((building) => {
        building.parentNode.removeChild(building);
      });
    };
    removeOldList();

    for (let i = 0; i < allBuildingsArray.length; i++) {
      let kind;
      if (i === 0 || i === 4 || i === 5 || i === 6) {
        kind = 0;
      }
      if (i === 1 || i === 7 || i === 12) {
        kind = 1;
      }
      if (i === 2 || i === 8 || i === 9 || i === 10) {
        kind = 2;
      }
      if (i === 3 || i === 11 || i === 12) {
        kind = 3;
      }

      const newBuildingDiv = document.createElement("div");
      newBuildingDiv.innerHTML = `
      <div class="bu-container">
      <h2 class="bu-label">${allBuildingsArray[i]}</h2>
      ${sourceBTNS[kind]}
      <div class="bu-bar bu-bar-id-${i}"></div>
      <div class="btn-container ">
        <div class="btn btn-super-small">...</div>
      </div>
    </div>`;
      if (i === 4) {
        newBuildingDiv.style = "margin-top: 40px";
      }
      allBuildingsContainer.appendChild(newBuildingDiv);
      const targetBar = document.querySelector(`.bu-bar-id-${i}`);
      const newDot = document.createElement("div");
      newDot.className = "bu-dot";

      if (
        currentGame.buildings[i].activities &&
        currentGame.buildings[i].activities.length > 0
      ) {
        for (let j = 0; j < currentGame.buildings[i].activities.length; j++) {
          const newDot = document.createElement("div");
          newDot.className = "bu-dot";
          targetBar.appendChild(newDot);
        }
      }
    }
  };
  // updateBuildingsScreen();

  const tokenCoinsValue = document.querySelector(".token-coins-value");
  const tokenMoveValue = document.querySelector(".token-move-value");

  const userResourcesUpdate = function () {
    for (const resource in currentPlayer.resources) {
      const id = parseInt(resource) + 1;
      let amount = currentPlayer.resources[resource];
      const element = document.querySelector(`.resource-value-${id}`);

      const position = id - 1;
      element.innerHTML = `${amount}`;

      if (amount > 40) {
        amount = 40;
      }

      for (let i = 0; i < amount; i++) {
        const dot = document.createElement("div");
        dot.className = "dot";
        const box = document.querySelector(`.box-${id}`);
        box.appendChild(dot);

        if (amount <= 10) {
          box.style.transform = "translateX(-10px)";
        } else if (amount > 10 && amount <= 20) {
          box.style.transform = "translateX(-5px)";
        } else if (amount > 20 && amount <= 30) {
          box.style.transform = "translateX(0px)";
        } else if (amount > 30) {
          box.style.transform = "translateX(5px)";
        }
        const plus = document.querySelector(`.plus-${id}`);
        if (amount >= 40) {
          plus.style.opacity = "1";
          box.style.opacity = "0.2";
        }
      }
    }
  };
  userResourcesUpdate();

  /////// GLOBAL VALUES

  const priceBarValues = document.querySelectorAll(".price-bar-value");
  const daninaBarValues = document.querySelectorAll(".danina-bar-value");

  priceBarValues.forEach((price) => {
    const resourceId = parseInt(price.classList[1].slice(-1));
    const element = document.querySelectorAll(`.price-${resourceId}`);
    const bar = document.querySelector(`.measure-${resourceId}`);
    const currentPrice = currentGame.prices[resourceId - 1];
    const max = Math.max(...currentGame.prices);
    let multiplier = function (max) {
      if (max < 10) {
        return 20;
      } else if (max >= 10 && max < 15) {
        return 12;
      } else if (max >= 15 && max < 25) {
        return 7;
      } else if (max >= 25 && max < 35) {
        return 4;
      } else {
        return 2;
      }
    };
    multiplier = multiplier(max);
    bar.style.height = currentPrice * multiplier + "px";
    element.forEach((el) => {
      el.innerHTML = formatInputValue(currentPrice, "number");
    });
  });

  daninaBarValues.forEach((danina) => {
    const daninaId = parseFloat(danina.classList[1].slice(-1));
    const element = document.querySelector(`.danina-${daninaId}`);
    const bar = document.querySelector(`.danina-measure-${daninaId}`);
    const currentDanina = currentGame.gameOrder[daninaId].danina;
    bar.style.height = currentDanina * 8 + "px";
    element.innerHTML = `${currentGame.gameOrder[daninaId].danina}`;
  });

  function sortBars() {
    const barsContainer = document.querySelector(".danina-container");
    const barContainers = Array.from(
      barsContainer.querySelectorAll(".bar-container")
    );

    // Sortowanie kontenerów na podstawie wartości h2
    barContainers.sort((a, b) => {
      const valueA = parseFloat(
        a.querySelector(".danina-bar-value").textContent
      );
      const valueB = parseFloat(
        b.querySelector(".danina-bar-value").textContent
      );
      return valueB - valueA; // Sortowanie malejąco
    });

    // Przeniesienie posortowanych kontenerów na początek kontenera .bars-container
    barContainers.forEach((barContainer) =>
      barsContainer.appendChild(barContainer)
    );
  }

  const cloneElementsToHomeScreen = function () {
    const originalContainerPrices = document.getElementById(
      "originalContainerPrices"
    );
    const originalContainerDanina = document.getElementById(
      "originalContainerDanina"
    );

    const clonedContainerPrices = originalContainerPrices.cloneNode(true);
    const clonedContainerDanina = originalContainerDanina.cloneNode(true);

    const mirroredContainerPrices = document.querySelector(
      ".mirrored-container-prices"
    );
    const mirroredContainerDanina = document.querySelector(
      ".mirrored-container-danina"
    );

    // Usuń stare elementy
    while (mirroredContainerPrices.firstChild) {
      mirroredContainerPrices.removeChild(mirroredContainerPrices.firstChild);
    }

    while (mirroredContainerDanina.firstChild) {
      mirroredContainerDanina.removeChild(mirroredContainerDanina.firstChild);
    }

    mirroredContainerPrices.appendChild(clonedContainerPrices);
    mirroredContainerDanina.appendChild(clonedContainerDanina);
  };

  setTimeout(() => {
    sortBars();
    cloneElementsToHomeScreen();
  }, 500);
};

//////////////////////
//////////////////////
//////////////////////
// UPDATE USER SCREEN

let lastNotification;
let alreadyActive = false;
let alreadyPassive = false;

const updateUserScreen = function () {
  console.log("Updating user screen...");
  if (allNots) {
    const newestNotification = highestKey(allNots);
    if (newestNotification && newestNotification !== lastNotification) {
      // makeNotification(newestNotification);
    }
  }

  // CHECK IF IT'S MY TURN
  if (currentPlayer.turn === true && alreadyActive === false) {
    alreadyActive = true;
    alreadyPassive = false;

    Visibility(gameMenuBTNTurn, "down", "show");
    setTimeout(() => {
      Visibility(turnScreen, "left", "show");
    }, 300);

    makeCircle();

    // PASSIVE MENU
    Visibility(gameMenuBTNHome, "down", "hide");
    setTimeout(() => {
      Visibility(homeScreen, "left", "hide");
    }, 300);
  }
  // CHECK IF IT"S NOT MY TURN
  if (currentPlayer.turn === false && alreadyPassive === false) {
    alreadyPassive = true;
    alreadyActive = false;

    Visibility(gameMenuBTNTurn, "down", "hide");
    setTimeout(() => {
      Visibility(turnScreen, "left", "hide");
    }, 300);

    // PASSIVE MENU
    Visibility(gameMenuBTNHome, "down", "show");
    setTimeout(() => {
      Visibility(homeScreen, "left", "show");
    }, 300);
  }
};

//////////////////////
// PASSING TURN

const passTurn = function () {
  let nextPlayerId = "";

  // ZMIANA GRACZA
  Object.keys(currentGame.gameOrder).forEach((chairId) => {
    const playerOnTurn = currentGame.gameOrder[chairId].turn;
    if (playerOnTurn === true) {
      currentGame.gameOrder[chairId].turn = false;
      const numberOfPlayers = Object.keys(currentGame.gameOrder).length;
      if (parseInt(chairId) === numberOfPlayers - 1) {
        nextPlayerId = 0;
      } else {
        nextPlayerId = parseInt(chairId) + 1;
      }
    }
  });
  currentGame.gameOrder[nextPlayerId].turn = true;
  updateDB();
  updateUserScreen();
};

//////////////////////
// STARTING GAME

const startGame = function () {
  gameStarted = true;
  console.log("starting GAME");
  currentScreen = homeScreen;

  updatePricesAndValues();

  gameMenuBar.style.display = "flex";

  // Uzupełnij imię gracza na wszystkich ekranach
  const nameLabels = document.querySelectorAll(".name-label");
  nameLabels.forEach((label) => {
    label.innerHTML = currentPlayer.player;
  });

  // ta funkcja wrzuca aktualną liczbę elementów do konterów danina-container
  const fillDaninaContainer = function () {
    for (let i = 0; i < currentGame.gameOrder.length; i++) {
      const daninaContainer = document.querySelector(".danina-container");
      const foundPlayer = currentGame.gameOrder[i];
      const className = `${foundPlayer.player} ${classNumber[i]}`;
      const myHtml = `
        <div class="bar-container bar-${className}">
        <div class="measure danina-measure-${i} ${className}"></div>
        <div class="small-circle ${className}">
        </div>
        <h2 class="danina-bar-value danina-${i}"></h2>
        </div>`;
      const barContainerDiv = document.createElement("div");
      barContainerDiv.innerHTML = myHtml;
      daninaContainer.appendChild(barContainerDiv.firstElementChild);
    }
  };
  fillDaninaContainer();
  updateUserScreen();
};

///////////////////////////
///////////////////////////
// EXCHANGE
///////////////////////////

let sellSource; // string - nazwa surowca
let buySource; // string - nazwa surowca

let choosenSellSource; // liczba przyporządkowana konkretnemu surowcowi
let choosenBuySource; // liczba przyporządkowana konkretnemu surowcowi

const eSourceBTNs = document.querySelectorAll(".e-source-btn");
const eSourceBTNsSell = document.querySelectorAll(".e-source-btn-sell");
const eSourceBTNsBuy = document.querySelectorAll(".e-source-btn-buy");

// caly element "exchange"
const exchangeElement = document.getElementById("exchange-element");

const toggle01btn = document.getElementById("toggle0.1");

// dwa elementy które wjezdzaja jezeli jest ready for exchange
const exchangeContainer = document.querySelector(".exchange-container");
const exchangeValueContainer = document.querySelector(
  ".exchange-value-container"
);

// Wartości wyświetlane na ekranie
const sellAmount = document.querySelector(".sell-amount");
const buyAmount = document.querySelector(".buy-amount");

// Wstępne rozwinięcie wszystkich source BTN's
eSourceBTNs.forEach((i) => {
  const iconId = parseInt(i.classList[2].slice(-1));
  const translateValue = 68 * iconId;
  i.style.transform = `translateX(${translateValue}px)`;
  i.style.zIndex = "1";
});

let rollOutsideSell = true;
let rollOutsideBuy = true;
let toggle01 = false;

toggle01btn.addEventListener("click", function () {
  toggle01 = !toggle01;
  if (toggle01) {
    toggle01btn.style.filter = "var(--drop-shadow-active)";
    toggle01btn.style.color = 'var(--main-colour)'
  } else {
    toggle01btn.style.filter = "var(--drop-shadow-item)";
    toggle01btn.style.color = 'var(--zelazo)'
  }
});

const calculateOffer = function () {
  // sellValue (wartość sprzedawanego surowca w monetach)
  const sellValue =
    sellAmount * currentGame.prices[choosenSellSource] * currentPlayer.feeLevel;

  sellSource = currentPlayer.resources[choosenSellSource];
  buySource = currentPlayer.resources[choosenBuySource];

  let currentOffer = sellValue / currentGame.prices[choosenBuySource];
  if (currentOffer) {
    eBuyInput.value = formatInputValue(currentOffer);
  }
};

const readyForExchange = function () {
  exchangeElement.style.width = "300px";
  if (!rollOutsideBuy && !rollOutsideSell) {
    console.log("starting makeCoversion.....");
    exchangeContainer.style.transform = "translateX(0px)";
    exchangeContainer.style.opacity = "1";
    exchangeValueContainer.style.transform = "translateX(0px)";
    exchangeValueContainer.style.opacity = "1";
    exchangeElement.style.width = "120vw";
    choosenSellSource = sellSource.classList[2].slice(-1);
    choosenBuySource = buySource.classList[2].slice(-1);
  } else {
    exchangeContainer.style.transform = "translateX(300px)";
    exchangeContainer.style.opacity = "0";
    exchangeValueContainer.style.transform = "translateX(-100px)";
    exchangeValueContainer.style.opacity = "0";
  }
};
readyForExchange()

eSourceBTNs.forEach((icon) => {
  icon.addEventListener("click", function () {
    // UPPER BAR
    if (icon.classList[3] === "e-source-btn-sell") {
      if (rollOutsideSell === false) {
        eSourceBTNsSell.forEach((i) => {
          // ROZWIJANIE
          const iconId = parseInt(i.classList[2].slice(-1));
          const translateValue = 68 * iconId;
          i.style.transform = `translateX(${translateValue}px)`;
          i.style.filter = "var(--drop-shadow-item)";
          i.style.zIndex = "1";
          sellSource = "";
        });
        rollOutsideSell = true;
        readyForExchange();
      } else {
        eSourceBTNsSell.forEach((i) => {
          // ZWIJANIE
          i.style.transform = `translateY(0px)`;
          i.style.filter = "none";
          icon.style.zIndex = "2";
          sellSource = icon;
        });
        rollOutsideSell = false;
        readyForExchange();
      }
    }

    // LOWER BAR
    if (icon.classList[3] === "e-source-btn-buy") {
      if (rollOutsideBuy === false) {
        eSourceBTNsBuy.forEach((i) => {
          // ROZWIJANIE
          const iconId = parseInt(i.classList[2].slice(-1));
          const translateValue = 68 * iconId;
          i.style.transform = `translateX(${translateValue}px)`;
          i.style.filter = "var(--drop-shadow-item)";
          i.style.zIndex = "1";
        });
        rollOutsideBuy = true;
        readyForExchange();
      } else {
        eSourceBTNsBuy.forEach((i) => {
          // ZWIJANIE
          i.style.transform = "translateY(0px)";
          i.style.filter = "none";
          icon.style.zIndex = "2";
          buySource = icon;
        });
        rollOutsideBuy = false;
        readyForExchange();
      }
    }
  });
});

// END OF EXCHANGE
///////////////////////////
///////////////////////////
///////////////////////////

/////////// NASŁUCHIWANIE
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

const checkIfstandalone = function () {
  console.log("checking");
  if (window.navigator.standalone) {
    makeWarning("standalone");
  } else {
    makeWarning("not standalone");
  }
};

// setInterval(() => {
//   checkIfstandalone();
// }, 3000);

/////////// SKIP LOGIN
const skipLogin = function (arg) {
  Visibility(mainScreen, "left", "hide");
  Visibility(homeScreen, "right", "show");
  currentGame = gamesArray[0];

  setTimeout(() => {
    currentPlayer = currentGame.gameOrder[arg];
    reallyStart();

    setTimeout(() => {
      allNots = currentGame.notifications;
    }, 200);
  }, 400);
};

setTimeout(() => {
  skipLogin(1);
}, 1000);

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

setInterval(() => {
  if (gameStarted) {
    updateUserScreen();
  }
}, 5000);
