"use strict";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  onValue,
  push,
  ref,
  update,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// ELEMENTS in DOM

const bodyElement = document.body;

// ALL BTNS
// MAIN
const newGameBTN = document.querySelector(".new-game-BTN");
const joinGameBTN = document.querySelector(".join-game-BTN");
// NEXT
const nextNewGameBTN = document.querySelector(".next-new-game-BTN");
const nextJoinGameBTN = document.querySelector(".next-join-game-BTN");
// FINAL
const finalNewGameBTN = document.querySelector(".final-new-game-BTN");
const finalJoinGameBTN = document.querySelector(".final-join-game-BTN");

const circleButtons = document.querySelectorAll(".circle-container .cricle");

// screens
const mainScreen = document.querySelector(".main-screen");
const nextNewGameScreen = document.querySelector(".next-new-game-screen");
const finalNewGameScreen = document.querySelector(".final-new-game-screen");
const nextJoinGameScreen = document.querySelector(".next-join-game-screen");
const finalJoinGameScreen = document.querySelector(".final-join-game-screen");

const gameScreen = document.querySelector(".game-screen");

// ELEMENTS
const backBTN = document.querySelectorAll(".go-back");
const homeBTN = document.querySelectorAll(".go-home");

const allInputs = document.querySelectorAll(".input");
const messageContainer = document.querySelector(".message-container");
const iconContainer = document.querySelector(".icon-container");
const pinLabel = document.querySelector(".pin-label");
const joinGameInput = document.querySelector(".join-game-input");
const pinBox = document.querySelector(".pin-box");
const pinGameInput = document.querySelector(".pin-game-input");

// CHAIRS
const chairTop = document.querySelector(".chair-top");
const chairRight = document.querySelector(".chair-right");
const chairBottom = document.querySelector(".chair-bottom");
const chairLeft = document.querySelector(".chair-left");

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

let currentGame = {}; // Object to store information about the created game
let gameOrder = {}; // Object to store information about the selected avatar for each chair-id
let currentPlayer;
let characterPin;
let enteredPin;

let numberOfPlayersSelected = false;
let inputForNewGame;

const classNumber = {
  0: "one",
  1: "two",
  2: "three",
  3: "four",
};

////////////////
// CODE
///////////////

const updateCurrentGame = function (gameName) {
  console.log("=== RUNNING FUNCTION updateCurrentGame() ===");
  const foundGame = gamesArray.find((game) => game.name === gameName);

  if (foundGame) {
    currentGame = foundGame;
    allNots = currentGame.notifications;
    return foundGame;
  } else {
    console.log("updateCurrentGame FAILED");
  }
  console.log("=== ENDING update === CURENT GAME IS:");
  console.log(currentGame);
};

///////////////////////////
///////////////////////////
// UPDATE DB
///////////////////////////

const updateDB = function () {
  console.log("================ UPDATING DB ===============");
  console.log(currentGame);
  const game = currentGame;
  const userRef = ref(database, `games/${game.id}`);
  update(userRef, game);
};

const showPinBox = function (arg) {
  pinBox.classList.remove(`el-in${arg}`);
  pinBox.classList.remove(`el-${arg}`);
  pinBox.classList.add(`el-${arg}`);

  if (currentPlayer.pin) {
    pinLabel.innerHTML = "PODAJ PIN";
  } else {
    pinLabel.innerHTML = "STWÓRZ PIN";
  }
};

const checkPIN = function (pin, oryginalPin) {
  if (pin === oryginalPin) {
    console.log("podano PIN PRAWIDŁOWY ktory jest w db");
    return true;
  } else {
    console.log("NIEPRAWIDŁOWY PIN (ponizej podany i pin i oryginalny pin");
    console.log(pin, oryginalPin);
    pinGameInput.classList.add("invalid");
    setTimeout(() => {
      pinGameInput.classList.remove("invalid");
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
  allInputs.forEach((input) => {
    input.value = "";
  });
  circleButtons.forEach((button) => {
    button.classList.remove("selected");
    Visibility(nextNewGameBTN, "invisible");
  });
  Visibility(nextJoinGameBTN, "invisible");

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
  showPinBox("invisible");
};

const Visibility = function (item, action) {
  if (action === "visible") {
    item.classList.remove("btn-invisible");
    item.classList.add("btn-visible");
  }
  if (action === "invisible") {
    item.classList.remove("btn-visible");
    item.classList.add("btn-invisible");
  }
};

function makeWarning(message) {
  messageContainer.innerHTML = `<h3>${message}</h3>`;
  messageContainer.style.transform = "translateY(0px) ";
  setTimeout(() => {
    messageContainer.style.transform = "translateY(200px)";
  }, 3000);
  setTimeout(() => {
    messageContainer.innerHTML = "";
  }, 4000);
}

function clearWarning() {
  messageContainer.style.transform = "translateY(200px)";
}

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

      if (rollDown === true) {
        showPinBox("visible");
        icons.forEach((i) => {
          i.classList.add("icon-up");
          i.style.zIndex = "1";
          if (i !== icon) {
            icon.style.zIndex = "2";
          }
        });
        rollDown = false;
      } else {
        showPinBox("invisible");
        icons.forEach((i) => {
          i.classList.remove("icon-up");
          i.style.zIndex = "1";
        });
        rollDown = true;
      }
    });
  });
};

// SCREENS MANAGING
///////////////

let currentScreen = mainScreen;
let previousScreens = [];

const goToPreviousScreen = function () {
  if (previousScreens.length > 0) {
    currentScreen.classList.add("no-active");
    currentScreen = previousScreens.pop();
    currentScreen.classList.remove("no-active");
    currentScreen.classList.add("active");
  }
  clearFields();
};

const goToScreen = function (screen) {
  previousScreens.push(currentScreen);
  currentScreen.classList.remove("active");
  currentScreen.classList.add("no-active");
  currentScreen = screen;
  currentScreen.classList.remove("no-active");
  currentScreen.classList.add("active");
};

backBTN.forEach((element) => {
  element.addEventListener("click", function () {
    goToPreviousScreen();
  });
});

homeBTN.forEach((button) => {
  button.addEventListener("click", function () {
    location.reload();
  });
});

// MAIN MENU
newGameBTN.addEventListener("click", function () {
  goToScreen(nextNewGameScreen);
});

joinGameBTN.addEventListener("click", function () {
  goToScreen(nextJoinGameScreen);
});

///////////////
///////////////
///////////////
///////////////
///////////////

///////////
///////////
// NEW GAME

const nameInput = document.querySelector(".name-game-input");
const avatarsContainer = document.querySelector(".avatars-container");
const avatars = document.querySelectorAll(".avatar");
const chairs = document.querySelectorAll(".chair");
let matchingGame;

// FIRST SCREEN

const checkIfFirsScreenGood = function (input) {
  if (
    inputForNewGame.length > 0 &&
    numberOfPlayersSelected == true &&
    !matchingGame
  ) {
    Visibility(nextNewGameBTN, "visible");
  } else {
    Visibility(nextNewGameBTN, "invisible");
  }
};

nameInput.addEventListener("input", function () {
  const enteredGameName = this.value.trim().toUpperCase();
  matchingGame = gamesArray.find((game) => game.name === enteredGameName);

  if (!matchingGame) {
    inputForNewGame = this.value.toUpperCase();
    checkIfFirsScreenGood(inputForNewGame);
    clearWarning();
  } else if (matchingGame) {
    Visibility(nextNewGameBTN, "invisible");
    makeWarning("taka gra juz istnieje");
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

nextNewGameBTN.addEventListener("click", function () {
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
  if (numberOfPlayers === 2) {
    chairBottom.style.display = "none";
    chairTop.style.display = "none";
  } else if (numberOfPlayers === 3) {
    chairBottom.style.display = "none";
  }

  goToScreen(finalNewGameScreen);
});

// SECOND SCREEN
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
    Visibility(finalNewGameBTN, "visible");
  } else {
    Visibility(finalNewGameBTN, "invisible");
  }
};

function handleChairClick(chair) {
  const chairId = chair.target.getAttribute("data-chair-id");
  choosenChair = chairId;
  avatarsContainer.style.display = "flex";
}

function handleAvatarClick() {
  const selectedAvatar = this.getAttribute("id").replace("avatar-", "");
  gameOrder[choosenChair] = {};
  gameOrder[choosenChair].player = selectedAvatar;

  const selectedChair = document.querySelector(
    `[data-chair-id="${choosenChair}"]`
  );
  if (selectedChair) {
    selectedChair.classList.remove("acalas", "umza", "raona", "hess");
    selectedChair.classList.add(selectedAvatar);
  }
  avatarsContainer.style.display = "none";
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
  });

  currentGame.gameOrder = rearangedGameOrder;

  push(gamesDB, currentGame);
  goToScreen(finalJoinGameScreen);

  updateCurrentGame();

  logIn();
  clearFields("retain currentGame");
});

///////////
///////////
// JOIN GAME

// CHECK IF THERE IS A GAME TO JOIN

joinGameInput.addEventListener("input", function () {
  const enteredGameName = this.value.trim().toUpperCase();
  const matchingGame = updateCurrentGame(enteredGameName);

  if (matchingGame) {
    Visibility(nextJoinGameBTN, "visible");
  } else {
    Visibility(nextJoinGameBTN, "invisible");
  }
});

nextJoinGameBTN.addEventListener("click", function () {
  goToScreen(finalJoinGameScreen);
  logIn();
});

// SECOND SCREEN

pinGameInput.addEventListener("input", function () {
  pinGameInput.value = pinGameInput.value.replace(/\D/g, "").substring(0, 4);
  enteredPin = this.value;

  if (enteredPin.length > 3) {
    Visibility(finalJoinGameBTN, "visible");
  } else {
    Visibility(finalJoinGameBTN, "invisible");
  }
});

finalJoinGameBTN.addEventListener("click", function () {
  if (currentPlayer.pin) {
    if (checkPIN(enteredPin, currentPlayer.pin)) {
      goToScreen(gameScreen);
      clearFields("retain currentGame");
    }
  } else {
    createPIN(enteredPin);
  }
});

//////////////////////
//////////////////////
//////////////////////
//////////////////////
//////////////////////
//////////////////////
//////////////////////
// GAME
//////////////////////
//////////////////////

///////////////////////////
///////////////////////////
// Handlers
///////////////////////////

testBTN.addEventListener("click", function () {
  console.log(currentGame);
  console.log(currentGame.notifications);
  console.log(allNots);
  console.log(Object.keys(allNots).length);
});

gameMenuBTNs.forEach((button) => {
  button.addEventListener("click", function () {
    gameMenuBTNs.forEach((btn) => btn.classList.remove("selected"));
    this.classList.toggle("selected");

    const choosenDeck = allDecksArray.find(
      (deck) => deck.classList[2] === this.classList[2]
    );
    allDecks.forEach((d) => {
      d.classList.remove("deck-active");
      d.classList.add("deck-inactive");
    });
    choosenDeck.classList.remove("deck-inactive");
    choosenDeck.classList.add("deck-active");
  });
});

//////////////////////
// SMALL FUNCTIONS
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

const moveOldNotifications = function () {
  const notificationDIVs = document.querySelectorAll(".notification");
  notificationDIVs.forEach((not) => {
    const oldClassList = not.classList[1].match(/\d+$/);
    let matchedNumber = parseInt(oldClassList);
    if (matchedNumber === 1) {
      not.style.transform = "translateY(20px)";
      not.classList.remove('position1');
      not.classList.add('position2');
    } else {
      const transformedValue = `translateY(calc(${matchedNumber} * 20px))`;
      const transformedOpacity = `calc(1 - ${matchedNumber*0.15})`
      not.style.transform = transformedValue;
      not.style.opacity = transformedOpacity

      not.classList.remove(`position${matchedNumber}`);
      matchedNumber++;
      not.classList.add(`position${matchedNumber}`);
    }
  });
};

const makeNotification = function (i) {
  const message = `Player ${i.player} ${i.action} ${i.value} ${i.resource}`;
  console.log(message);
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

  moveOldNotifications();

  notificationDiv.classList.add("notification");
  notificationDiv.classList.add("position1");
  notificationDiv.style.transform = "translateY(-100px)";

  setTimeout(() => {
    notificationDiv.style.transform = "translateY(0px)";
  }, 10);
};

let allDecksArray = [];
allDecks.forEach((deck) => {
  allDecksArray.push(deck);
});

//////////////////////
// MAIN FUNCTIONS

let lastNotification;

const updateUserScreen = function () {
  const newestNotification = highestKey(allNots);
  if (newestNotification !== lastNotification) {
    makeNotification(newestNotification);
    console.log(newestNotification);
  }
};

addCrystal.addEventListener("click", function () {
  const crystalValue = crystalInput.value;
  console.log("ADDING CRYSTALS");

  Object.keys(currentGame.gameOrder).forEach((chairId) => {
    const player = currentGame.gameOrder[chairId].player;

    if (player === currentPlayer.player) {
      const desiredChair = `${chairId}`;
      currentGame.gameOrder[desiredChair].crystal = crystalValue;
    }
  });

  // Assuming allNots is an object
  let newNotId = 0;
  if (allNots) {
    newNotId = Object.keys(allNots).length;
  } else {
    newNotId = 0;
  }

  const notification = {
    id: newNotId + 1, // Assuming IDs start from 1
    player: currentPlayer.player,
    value: crystalValue,
    action: "added",
    resource: "crystal",
  };

  if (!allNots) {
    allNots = {}; // Na wypadek pierwszego notification w grze
  }
  allNots[newNotId + 1] = notification; // dodaj notyfikacje do array

  currentGame.notifications = allNots; // dodaj array do currenGame

  updateDB();

  const name = currentGame.name;
  updateCurrentGame(name);
});

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
    updateUserScreen();
  }
});


/////////// SKIP LOGIN
setTimeout(() => {
  const skipLogin = function () {

      goToScreen(gameScreen);
      currentGame = gamesArray[11];

      setTimeout(() => {
        allNots = currentGame.notifications;
      }, 500);

      setTimeout(() => {
        currentPlayer = currentGame.gameOrder["1"];
      }, 1000);
  };
  skipLogin();
}, 1500);

window.updateCurrentGame = updateCurrentGame;
window.updateDB = updateDB;
window.allNots = allNots;
window.gamesArray = gamesArray;
window.currentGame = currentGame;
window.updateUserScreen = updateUserScreen;

///////// NA POZNIEJ - FUNKCJA DO DODAWANIA NA ZYWO DANYCH Z DB
/*
// Utwórz funkcję, która będzie aktualizować widok gier na podstawie danych z bazy
function updateGamesView(gamesArray) {
  // Wybierz kontener, w którym będą wyświetlane gry
  const gamesContainer = document.querySelector(".games-container");

  // Wyczyść aktualny widok gier
  gamesContainer.innerHTML = "";

  // Iteruj przez gry i dodawaj divy do kontenera
  gamesArray.forEach((game) => {
    const gameDiv = document.createElement("div");
    gameDiv.textContent = game.name;
    gamesContainer.appendChild(gameDiv);
  });
}
*/

// if (player === currentPlayer.player) {
//   const pinRef = ref(
//     database,
//     `games/${currentGame.id}/gameOrder/${chairId}/resources/`
//   );

//   update(pinRef, {
//     crystal: crystalValue,
//   });
// }
