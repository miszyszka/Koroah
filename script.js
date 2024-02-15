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
const keyboard = document.querySelector(".keyboard");

const keys = document.querySelectorAll(".key");

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
const gameScreenBG = document.querySelector(".game-screen-bg");
const gameScreenContent = document.querySelector(".game-screen-content");

const yourTurnMenu = document.querySelector(".your-turn");
const notYourTurnMenu = document.querySelector(".not-your-turn");
const gameMenuBtnPrices = document.getElementById("game-menu-btn-prices");
const gameMenuBtnTurn = document.getElementById("game-menu-btn-turn");

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
const allChairs = document.querySelectorAll(".chair");

// GAME
const gameMenuBTNs = document.querySelectorAll(".game-menu-btn");
const testBTN = document.querySelector(".testBTN");
const crystalInput = document.querySelector(".crystal-input");
const addCrystal = document.querySelector(".add-crystal");
const changeCrystal = document.querySelector(".change-crystal");
const exchangeBTNs = document.querySelectorAll(".SVG-exchange");

const allBuildingsContainer = document.querySelector(
  ".all-buildings-container"
);

// DECKS
const allDecks = document.querySelectorAll(".deck");
const deckPrices = document.querySelector(".deck-prices");
const deckUser = document.querySelector(".deck-user");
const deckTurn = document.querySelector(".deck-turn");

const daninaContainer = document.querySelector(".danina-container");

//MENU

const gameMenuBtnUser = document.getElementById("game-menu-btn-user");

// OTHER
const notificationContainer = document.querySelector(".notification-container");

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
// let characterPin;
let enteredPin;

let numberOfPlayersSelected = false;
let inputForNewGame;

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

// 0: "Źródło",
// 1: "Gildia",
// 2: "Kopalnia",
// 3: "Huta",
// 4: "Generator",
// 5: "Sąd",
// 6: "Wieża",
// 8: "Krąg kupców",
// 9: "Orbita"
// 9: "Konwerter",
// 10: "Monolit",
// 11: "Portal1",
// 12: "Portal2",


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

////////////////
// CODE
///////////////
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

const updateCurrentGame = function (gameName) {
  // reading game from DB and making currentGamme & currentPlayer really current
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
    updatePrices("from = updateCurrentGame()");

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
    if ((i === 0 || i === 4 || i === 5 || i === 6)) {
      kind = 0;
    }
    if ((i === 1 || i === 7 || i === 12)) {
      kind = 1;
    }
    if ((i === 2 || i === 8 || i === 9 || i === 10)) {
      kind = 2;
    }
    if ((i === 3 || i === 11 || i === 12)) {
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

const showPinBox = function (arg) {
  pinBox.classList.remove(`el-in${arg}`);
  pinBox.classList.remove(`el-${arg}`);
  pinBox.classList.add(`el-${arg}`);

  keyboard.classList.remove(`el-in${arg}`);
  keyboard.classList.remove(`el-${arg}`);
  keyboard.classList.add(`el-${arg}`);

  if (currentPlayer.pin) {
    pinLabel.innerHTML = "PODAJ PIN";
  } else {
    pinLabel.innerHTML = "STWÓRZ PIN";
  }

  keys.forEach((key) => {
    key.addEventListener("click", function (event) {
      const newValue = pinGameInput.value + event.target.classList[2];
      if (!pinGameInput) {
        pinGameInput.value = key.value;
      } else {
        pinGameInput.value = newValue.toString();
      }

      console.log(pinGameInput.value);
      if (pinGameInput.value.length > 3) {
        Visibility(finalJoinGameBTN, "visible");
        Visibility(keyboard, "invisible");
      } else {
        Visibility(finalJoinGameBTN, "invisible");
        Visibility(keyboard, "visible");
      }
    });
  });
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
    item.style.display = "flex";
  }

  setTimeout(() => {
    if (action === "visible") {
      item.classList.remove("btn-invisible");
      item.classList.add("btn-visible");
    }
    if (action === "invisible") {
      item.classList.remove("btn-visible");
      item.classList.add("btn-invisible");
      setTimeout(() => {
        item.style.display = "none";
      }, 30);
    }
  }, 10);
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

//Na razie niepotrzebna funkcja
// const makeActive = function (screen, arg) {
//   if (arg === "active") {
//     screen.style.display = "flex";
//     setTimeout(() => {
//       screen.classList.remove("no-active");
//       screen.classList.add("active");
//     }, 100);
//   }
//   if (arg === "inactive") {
//     screen.classList.add("no-active");
//     screen.classList.remove("active");

//     setTimeout(() => {
//       screen.style.display = "none";
//     }, 100);
//   }
// };

const goToPreviousScreen = function () {
  if (previousScreens.length > 0) {
    currentScreen.classList.add("no-active");
    currentScreen = previousScreens.pop();

    currentScreen.style.display = "flex";
    setTimeout(() => {
      currentScreen.classList.remove("no-active");
      currentScreen.classList.add("active");
    }, 100);
  }
  clearFields();
};

const goToScreen = function (screen) {
  previousScreens.push(currentScreen);

  currentScreen.classList.remove("active");
  currentScreen.classList.add("no-active");
  const oldScreen = currentScreen;
  currentScreen = screen;

  setTimeout(() => {
    oldScreen.style.display = "none";
  }, 100);

  currentScreen.style.display = "flex";
  setTimeout(() => {
    currentScreen.classList.remove("no-active");
    currentScreen.classList.add("active");
  }, 100);
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

// FIRST SCREEN (create game)

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

  goToScreen(finalNewGameScreen);
});

// SECOND SCREEN (create game)
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
  // avatarsContainer.style.display = "flex";
  avatarsContainer.classList.remove("no-active");
  avatarsContainer.classList.add("active");
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
  avatarsContainer.classList.remove("active");
  avatarsContainer.classList.add("no-active");

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
  matchingGame = gamesArray.find((game) => game.name === enteredGameName);
  currentGame = matchingGame;

  if (matchingGame) {
    Visibility(nextJoinGameBTN, "visible");
    updateCurrentGame(matchingGame);
  } else {
    Visibility(nextJoinGameBTN, "invisible");
  }
});

nextJoinGameBTN.addEventListener("click", function () {
  goToScreen(finalJoinGameScreen);
  logIn();
});

// SECOND SCREEN (join game)

pinGameInput.addEventListener("input", function () {
  pinGameInput.value = pinGameInput.value.replace(/\D/g, "").substring(0, 4);
  enteredPin = this.value;

  if (enteredPin.length > 3) {
    Visibility(finalJoinGameBTN, "visible");
  } else {
    Visibility(finalJoinGameBTN, "invisible");
  }
});

const reallyStart = function () {
  const loadingScreen = function () {
    const loadingScreenEL = document.querySelector(".loading-screen-EL");

    loadingScreenEL.style.display = "flex";
    setTimeout(() => {
      loadingScreenEL.style.display = "none";
    }, 1500);
  };
  loadingScreen();

  setTimeout(() => {
    goToScreen(gameScreen);
    setTimeout(() => {
      startGame();
    }, 500);
    clearFields("retain currentGame");
  }, 500);
};

finalJoinGameBTN.addEventListener("click", function () {
  if (currentPlayer.pin) {
    if (checkPIN(enteredPin, currentPlayer.pin)) {
      reallyStart();
    }
  } else {
    createPIN(enteredPin);
    reallyStart();
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

function sortBars() {
  const barsContainer = document.querySelector(".danina-container");
  const barContainers = Array.from(
    barsContainer.querySelectorAll(".bar-container")
  );

  // Sortowanie kontenerów na podstawie wartości h2
  barContainers.sort((a, b) => {
    const valueA = parseFloat(a.querySelector(".danina-bar-value").textContent);
    const valueB = parseFloat(b.querySelector(".danina-bar-value").textContent);
    return valueB - valueA; // Sortowanie malejąco
  });

  // Przeniesienie posortowanych kontenerów na początek kontenera .bars-container
  barContainers.forEach((barContainer) =>
    barsContainer.appendChild(barContainer)
  );
}

const updatePrices = function (origin) {
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

  // Wywołanie funkcji
  removeOldDots();

  const tokenCoinsValue = document.querySelector(".token-coins-value");
  const tokenMoveValue = document.querySelector(".token-move-value");

  const userResourcesUpdate = function () {
    for (const resource in currentPlayer.resources) {
      const id = parseInt(resource) + 1;
      let amount = currentPlayer.resources[resource];
      const element = document.querySelector(`.resource-value-${id}`);
      const calculatedElement = document.querySelector(
        `.calculated-value-${id}`
      );
      const position = id - 1;
      const calculatedValue = amount * currentGame.prices[position];
      calculatedElement.innerHTML = `${calculatedValue}`;
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
  setTimeout(() => {
    sortBars();
  }, 500);
};

const startGame = function () {
  console.log("starting GAME");

  const resetTurnDeck = function () {
    if (currentPlayer.turn === false) {
      gameMenuBtnPrices.click();
      yourTurnMenu.style.transform = "translateX(-100%)";
      deckTurn.style.transform = "translateX(-100%)";
      setTimeout(() => {
        yourTurnMenu.style.display = "none";
        deckTurn.style.display = "none";
      }, 1000);

      // PASSIVE MENU
      notYourTurnMenu.style.display = "flex";
      setTimeout(() => {
        notYourTurnMenu.style.transform = "translateX(0%)";
      }, 1000);
    }
  };

  resetTurnDeck();

  const duLabels = document.querySelectorAll(".du-label");
  duLabels.forEach((label) => {
    label.innerHTML = currentPlayer.player;
  });

  for (let i = 0; i < currentGame.gameOrder.length; i++) {
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
  updatePrices("from startGame()");
  updateUserScreen();
};

changeCrystal.addEventListener("click", function () {
  const crystalValue = parseFloat(crystalInput.value);
  currentPlayer.resources[2] = crystalValue;
  updateCurrentPlayerToDB();
  updateDB();
});

addCrystal.addEventListener("click", function () {
  const crystalValue = parseFloat(crystalInput.value);

  currentGame.prices = [2, 2, crystalValue.toFixed(1), 2]; // dodaj array do currenGame

  updateDB();

  const name = currentGame.name;
  updateCurrentGame(name);
});

///////////////////////////
///////////////////////////
// Handlers
///////////////////////////

testBTN.addEventListener("click", function () {
  // passTurn();
  console.log(currentGame);
  console.log(currentPlayer);
  addRandomActivity(2);
});

gameMenuBTNs.forEach((button) => {
  button.addEventListener("click", function () {
    gameMenuBTNs.forEach((btn) => btn.classList.remove("selected"));
    this.classList.toggle("selected");

    const choosenDeck = allDecksArray.find(
      (deck) => deck.classList[2] === this.classList[2]
    );

    if (choosenDeck.classList[2] === "prices") {
      gameScreenContent.style.display = "flex";
      setTimeout(() => {
        gameScreenContent.style.transform = "translateY(0%)";
        gameScreenContent.style.opacity = "1";
      }, 100);
    } else {
      gameScreenContent.style.transform = "translateY(150%)";
      setTimeout(() => {
        gameScreenContent.style.display = "none";
        gameScreenContent.style.opacity = "0";
      }, 100);
    }

    allDecks.forEach((d) => {
      d.style.display = "flex";
    });
    setTimeout(() => {
      allDecks.forEach((d) => {
        d.classList.remove("deck-active");
        d.classList.add("deck-inactive");
      });
      choosenDeck.classList.remove("deck-inactive");
      choosenDeck.classList.add("deck-active");
      const inactiveDecks = document.querySelectorAll(".deck-inactive");
      setTimeout(() => {
        inactiveDecks.forEach((d) => {
          d.style.display = "none";
        });
      }, 50);
    }, 10);
  });
});

////////////////
// EXCHANGING
///////////////

let sellSource;
let buySource;

const eSourceBTNs = document.querySelectorAll(".e-source-btn");
const eSourceBTNsSell = document.querySelectorAll(".e-source-btn-sell");
const eSourceBTNsBuy = document.querySelectorAll(".e-source-btn-buy");
const eSellInput = document.querySelector(".e-sell-input");
const eBuyInput = document.querySelector(".e-buy-input");

// whole e-elements = VALUE
const eValueSale = document.querySelector(".e-value-sale");
const eValueBuy = document.querySelector(".e-value-buy");

// informacje
const info1 = document.getElementById("info-1");
const info2 = document.getElementById("info-2");

const eInfoSellText = document.querySelector(".e-info-sell-text");
const eInfoBuyText = document.querySelector(".e-info-buy-text");

// Wstępne rozwinięcie wszystkich source BTN's
eSourceBTNs.forEach((i) => {
  const iconId = parseInt(i.classList[2].slice(-1));
  const translateValue = 60 * iconId - 90;
  i.style.transform = `translateX(${translateValue}px)`;
  i.style.zIndex = "1";
});

let rollOutsideSell = true;
let rollOutsideBuy = true;

const exchangeDealBTN = document.querySelector(".make-deal-btn");

exchangeDealBTN.addEventListener("click", function () {
  const sellSourceId = parseInt(sellSource.classList[2].slice(-1));
  const buySourceId = parseInt(buySource.classList[2].slice(-1));
  const sellValue = formatInputValue(eSellInput.value, "number");
  const buyValue = formatInputValue(eBuyInput.value, "number");

  currentPlayer.resources[sellSourceId] =
    currentPlayer.resources[sellSourceId] - eSellInput.value;
  currentPlayer.resources[buySourceId] =
    parseFloat(currentPlayer.resources[buySourceId]) +
    parseFloat(eBuyInput.value);
  gameMenuBtnUser.click();
  setTimeout(() => {
    updateCurrentPlayerToDB();
  }, 1000);
});

const makeConversion = function (input, direction) {
  console.log("starting makeCoversion.....");
  let choosenSellSource;
  let choosenBuySource;
  if (sellSource) {
    choosenSellSource = parseInt(sellSource.classList[2].slice(-1));
  }

  if (buySource) {
    choosenBuySource = parseInt(buySource.classList[2].slice(-1));
  }

  if (buySource && sellSource) {
    // uzupełnianie drugiego input field
    if (direction === "from-sell") {
      // sellValue (wartość sprzedawanego surowca w monetach)
      const sellValue =
        input * currentGame.prices[choosenSellSource] * currentPlayer.feeLevel;
      let sellSource = currentPlayer.resources[choosenSellSource];
      let buySource = currentPlayer.resources[choosenBuySource];

      let currentOffer = sellValue / currentGame.prices[choosenBuySource];
      if (currentOffer) {
        eBuyInput.value = formatInputValue(currentOffer);
      }
    }
    if (direction === "from-buy") {
      const buyValue =
        input * currentGame.prices[choosenBuySource] * currentPlayer.feeLevel;
      let currentOffer = buyValue / currentGame.prices[choosenSellSource];
      eSellInput.value = formatInputValue(currentOffer);
      if (currentOffer) {
        eSellInput.value = formatInputValue(currentOffer);
      }
    }
  }

  let properValue = false;
  let properValue2 = false;

  const checkIfProperValue = function () {
    if (formatInputValue(eSellInput.value, "number") >= 1) {
      properValue = true;
    } else if (
      formatInputValue(eSellInput.value, "number") < 5 &&
      formatInputValue(eSellInput.value, "number") > 0
    ) {
      makeWarning("za mała wartość");
      eSellInput.style.color = "var(--krysztal)";
      Visibility(exchangeDealBTN, "invisible");
      return;
    }

    if (
      formatInputValue(eSellInput.value, "number") <
      currentPlayer.resources[choosenSellSource]
    ) {
      properValue2 = true;
    } else if (
      formatInputValue(eSellInput.value, "number") >
      currentPlayer.resources[choosenSellSource]
    ) {
      makeWarning("niewystarczajca ilość surowców");
      eSellInput.style.color = "var(--krysztal)";
      Visibility(exchangeDealBTN, "invisible");
      return;
    }
    if (properValue && properValue2) {
      eSellInput.style.color = "var(--main-colour)";
      Visibility(exchangeDealBTN, "visible");
    }
  };
  checkIfProperValue();

  const displayDealBTN = function () {
    console.log("checking if DEAL BTN posiible....");
    if (
      !rollOutsideBuy &&
      !rollOutsideSell &&
      (eSellInput.value !== undefined || eBuyInput.value !== undefined)
    ) {
      Visibility(exchangeDealBTN, "visible");
    } else {
      Visibility(exchangeDealBTN, "invisible");
    }
  };
  displayDealBTN();
};

///////////////
const inputAction = function (event, origin) {
  clearWarning();
  let inputValue = event.target.value;
  if (!inputValue) {
    inputValue = 0;
  }
  inputValue = formatInputValue(inputValue, "number");
  event.target.value = inputValue;
  makeConversion(inputValue, origin);
};

eSellInput.addEventListener("input", function (event) {
  const origin = "form-sell";
  inputAction(event, origin);
});

eBuyInput.addEventListener("input", function (event) {
  const origin = "from-buy";
  inputAction(event, origin);
});

// ADDING AND SUBSTRACTING 1 and 0.1
const manipulateBTNs = document.querySelectorAll(".manipulate");

manipulateBTNs.forEach((btn) => {
  btn.addEventListener("click", function () {
    const choosenEL = btn.classList[3];
    let choosenValueInput = btn.parentElement.querySelector(".e-value");
    let newValue;
    if (choosenEL === "sub01") {
      newValue = formatInputValue(choosenValueInput.value, "number") - 0.1;
    }
    if (choosenEL === "sub1") {
      newValue = formatInputValue(choosenValueInput.value, "number") - 1;
    }
    if (choosenEL === "add1") {
      newValue = formatInputValue(choosenValueInput.value, "number") + 1;
    }
    if (choosenEL === "add01") {
      newValue = formatInputValue(choosenValueInput.value, "number") + 0.1;
    }

    choosenValueInput.value = formatInputValue(newValue, "number");
    console.log(choosenValueInput.classList[1]);
    let origin;
    if (choosenValueInput.classList[1] === "e-buy-input") {
      origin = "from-buy";
    } else {
      origin = "from-sell";
    }
    makeConversion(choosenValueInput.value, origin);
  });
});

// Uzupełnianie tekstu
const updateInfoBar = function (id, bar) {
  if (bar === "sell") {
    const resourceId = parseInt(id.classList[2].slice(-1));
    const userResources = currentPlayer.resources[resourceId];

    eInfoSellText.innerHTML = `<div><h2>Dostępne ${userResources}</h2></div> ${sourceBTNS[resourceId]}`;
  }
  if (bar === "buy") {
    const resourceId = parseInt(id.classList[2].slice(-1));
    const userResources = currentPlayer.resources[resourceId];

    eInfoBuyText.innerHTML = `<div><h2>Dostępne ${userResources}</h2></div> ${sourceBTNS[resourceId]}`;
  }
};

eSourceBTNs.forEach((icon) => {
  icon.addEventListener("click", function () {
    // UPPER BAR
    if (icon.classList[4] === "e-source-btn-sell") {
      if (rollOutsideSell === false) {
        eSourceBTNsSell.forEach((i) => {
          // ROZWIJANIE
          const iconId = parseInt(i.classList[2].slice(-1));
          const translateValue = 60 * iconId - 90;
          i.style.transform = `translateX(${translateValue}px)`;
          i.style.zIndex = "1";
          sellSource = "";
        });
        rollOutsideSell = true;
        Visibility(eValueSale, "invisible");
        Visibility(eInfoSellText, "invisible");
        Visibility(info1, "visible");
      } else {
        eSourceBTNsSell.forEach((i) => {
          // ZWIJANIE
          i.style.transform = `translateY(0px)`;
          icon.style.zIndex = "2";
          sellSource = icon;
        });
        rollOutsideSell = false;
        Visibility(eValueSale, "visible");
        Visibility(eInfoSellText, "visible");
        Visibility(info1, "invisible");
        updateInfoBar(sellSource, "sell");
        makeConversion(eSellInput.value, "from-sell");
      }
    }

    // DOWN BAR
    if (icon.classList[4] === "e-source-btn-buy") {
      if (rollOutsideBuy === false) {
        // ROZWIJANIE
        eSourceBTNsBuy.forEach((i) => {
          const iconId = parseInt(i.classList[2].slice(-1));
          const translateValue = 60 * iconId - 90;
          i.style.transform = `translateX(${translateValue}px)`;
          i.style.zIndex = "1";
          buySource = "";
          makeConversion(eBuyInput.value, "from-buy");
          Visibility(eValueBuy, "invisible");
          Visibility(eInfoBuyText, "invisible");
          Visibility(info2, "visible");
        });
        rollOutsideBuy = true;
      } else {
        eSourceBTNsBuy.forEach((i) => {
          // ZWIJANIE
          i.style.transform = `translateY(0px)`;
          icon.style.zIndex = "2";
          buySource = icon;

          Visibility(eValueBuy, "visible");
          Visibility(eInfoBuyText, "visible");
          Visibility(info2, "invisible");
        });
        rollOutsideBuy = false;
        makeConversion(eBuyInput.value, "from-buy");
        updateInfoBar(buySource, "buy");
      }
    }
  });
});

// exchangeDirectionBTN.addEventListener('click', function(event){
//   let inputValue = eSellInput
//   makeConversion(inputValue, 'from-sell')
// })

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

let allDecksArray = [];
allDecks.forEach((deck) => {
  allDecksArray.push(deck);
});

//////////////////////
// UPDATE USER SCREEN

let lastNotification;
let alreadyActive = false;
let alreadyPassive = false;

const updateUserScreen = function () {
  if (allNots) {
    const newestNotification = highestKey(allNots);
    if (newestNotification && newestNotification !== lastNotification) {
      makeNotification(newestNotification);
    }
  }

  updateBuildingsScreen();

  // CHECK IF IT'S MY TURN
  if (currentPlayer.turn === true && alreadyActive === false) {
    alreadyActive = true;
    alreadyPassive = false;

    // ACTIVE MENU
    yourTurnMenu.style.transform = "translateX(100%)";
    yourTurnMenu.style.display = "flex";
    deckTurn.style.transform = "translateX(100%)";
    deckTurn.style.display = "flex";
    deckPrices.style.transform = "translateX(-100%)";
    setTimeout(() => {
      yourTurnMenu.style.transform = "translateX(0%)";
      deckTurn.style.transform = "translateX(0%)";
      deckPrices.style.display = "none";
      deckPrices.style.transform = "translateX(100%)";
    }, 1000);

    // PASSIVE MENU
    notYourTurnMenu.style.transform = "translateX(-100%)";
    setTimeout(() => {
      notYourTurnMenu.style.display = "none";
      notYourTurnMenu.style.transform = "translateX(100%)";
    }, 1000);
    setTimeout(() => {
      gameMenuBtnTurn.click();
    }, 2000);
  }
  // CHECK IF IT"S NOT MY TURN
  if (currentPlayer.turn === false && alreadyPassive === false) {
    alreadyPassive = true;
    alreadyActive = false;
    gameMenuBtnPrices.click();
    yourTurnMenu.style.transform = "translateX(-100%)";
    deckTurn.style.transform = "translateX(-100%)";
    deckPrices.style.display = "flex";
    setTimeout(() => {
      deckPrices.style.transform = "translateX(0%)";
      yourTurnMenu.style.display = "none";
      deckTurn.style.display = "none";
    }, 1000);

    // PASSIVE MENU
    notYourTurnMenu.style.display = "flex";
    setTimeout(() => {
      notYourTurnMenu.style.transform = "translateX(0%)";
    }, 1000);
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
};

const passTurnBTN = document.querySelector(".pass-turn-btn");
passTurnBTN.addEventListener("click", function () {
  passTurn();
});

// addCrystal.addEventListener("click", function () {
//   const crystalValue = crystalInput.value;
//   console.log("ADDING CRYSTALS");

//   Object.keys(currentGame.gameOrder).forEach((chairId) => {
//     const player = currentGame.gameOrder[chairId].player;

//     if (player === currentPlayer.player) {
//       const desiredChair = `${chairId}`;
//       currentGame.gameOrder[desiredChair].crystal = crystalValue;
//     }
//   });

//   // Assuming allNots is an object
//   let newNotId = 0;
//   if (allNots) {
//     newNotId = Object.keys(allNots).length;
//   } else {
//     newNotId = 0;
//   }

//   const notification = {
//     id: newNotId + 1, // Assuming IDs start from 1
//     player: currentPlayer.player,
//     value: crystalValue,
//     action: "added",
//     resource: "crystal",
//   };

//   if (!allNots) {
//     allNots = {}; // Na wypadek pierwszego notification w grze
//   }
//   allNots[newNotId + 1] = notification; // dodaj notyfikacje do array

//   currentGame.notifications = allNots; // dodaj array do currenGame

//   updateDB();

//   const name = currentGame.name;
//   updateCurrentGame(name);
// });

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

// document.addEventListener(
//   "touchmove",
//   function (event) {
//     // Zapobiegaj domyślnemu przewijaniu dotykowego zdarzenia (overscroll)
//     event.preventDefault();
//   },
//   { passive: false }
// );

/////////// SKIP LOGIN
const skipLogin = function (arg) {
  goToScreen(gameScreen);
  currentGame = gamesArray[0];

  setTimeout(() => {
    currentPlayer = currentGame.gameOrder[arg];

    setTimeout(() => {
      allNots = currentGame.notifications;
      startGame();
    }, 200);
  }, 400);
};

setTimeout(() => {
  // skipLogin();
}, 1500);

const joinGameBTN1 = document.querySelector(".join-game-BTN1");
const joinGameBTN2 = document.querySelector(".join-game-BTN2");
const joinGameBTN3 = document.querySelector(".join-game-BTN3");

joinGameBTN1.addEventListener("click", function () {
  skipLogin(0);
});

joinGameBTN2.addEventListener("click", function () {
  skipLogin(1);
});

joinGameBTN3.addEventListener("click", function () {
  skipLogin(2);
});

async function zapobiegajWygaszaniuEkranu() {
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

zapobiegajWygaszaniuEkranu();

setInterval(() => {
  updateUserScreen();
}, 10000);
// function domReady(fn) {
//   if (document.readyState === 'complete' || document.readyState === 'interactive') {
//     setTimeout(fn, 1);
//   } else {
//     document.addEventListener('DOMContentLoaded', fn);
//   }
// }

// let config = {
//   fps: 10,
//   qrbox: {width: 100, height: 100},
//   rememberLastUsedCamera: true,
//   preferredCamera: "environment",
//   // Only support camera scan type.
//   supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
// };

// domReady(function() {
//   let myQr = document.querySelector('.my-qr-reader');
//   let lastResult, countResults = 0;

//   function onScanSuccess(decodeText, decodeResult) {
//     if (decodeText !== lastResult) {
//       ++countResults;
//       lastResult = decodeText;

//       alert('Your QR is ' + decodeText);
//     }
//   }

//   var htmlScanner = new Html5QrcodeScanner('my-qr-reader', config);
//   htmlScanner.render(onScanSuccess);
// });
