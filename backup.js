///////////////////////////
///////////////////////////
// Handlers
///////////////////////////



// gameMenuBTNs.forEach((button) => {
//   button.addEventListener("click", function () {
//     gameMenuBTNs.forEach((btn) => btn.classList.remove("selected"));
//     this.classList.toggle("selected");

//     const choosenDeck = allDecksArray.find(
//       (deck) => deck.classList[2] === this.classList[2]
//     );

//     if (choosenDeck.classList[2] === "prices") {
//       gameScreenContent.style.display = "flex";
//       setTimeout(() => {
//         gameScreenContent.style.transform = "translateY(0%)";
//         gameScreenContent.style.opacity = "1";
//       }, 100);
//     } else {
//       gameScreenContent.style.transform = "translateY(150%)";
//       setTimeout(() => {
//         gameScreenContent.style.display = "none";
//         gameScreenContent.style.opacity = "0";
//       }, 100);
//     }

//     allDecks.forEach((d) => {
//       d.style.display = "flex";
//     });
//     setTimeout(() => {
//       allDecks.forEach((d) => {
//         d.classList.remove("deck-active");
//         d.classList.add("deck-inactive");
//       });
//       choosenDeck.classList.remove("deck-inactive");
//       choosenDeck.classList.add("deck-active");
//       const inactiveDecks = document.querySelectorAll(".deck-inactive");
//       setTimeout(() => {
//         inactiveDecks.forEach((d) => {
//           d.style.display = "none";
//         });
//       }, 50);
//     }, 10);
//   });
// });




// changeCrystal.addEventListener("click", function () {
//   const crystalValue = parseFloat(crystalInput.value);
//   currentPlayer.resources[2] = crystalValue;
//   updateCurrentPlayerToDB();
//   updateDB();
// });

// addCrystal.addEventListener("click", function () {
//   const crystalValue = parseFloat(crystalInput.value);

//   currentGame.prices = [2, 2, crystalValue.toFixed(1), 2]; // dodaj array do currenGame

//   updateDB();

//   const name = currentGame.name;
//   updateCurrentGame(name);
// });



  // const resetTurnDeck = function () {
  //   if (currentPlayer.turn === false) {
  //     gameMenuBtnPrices.click();
  //     yourTurnMenu.style.transform = "translateX(-100%)";
  //     deckTurn.style.transform = "translateX(-100%)";
  //     setTimeout(() => {
  //       yourTurnMenu.style.display = "none";
  //       deckTurn.style.display = "none";
  //     }, 1000);

  //     // PASSIVE MENU
  //     notYourTurnMenu.style.display = "flex";
  //     setTimeout(() => {
  //       notYourTurnMenu.style.transform = "translateX(0%)";
  //     }, 1000);
  //   }
  // };

  // resetTurnDeck();
  // updatePrices("from startGame()");


  // do wywalenia???
// const updatePrices = function (origin) {
//   /////// CURRENT USER VALUES
//   function removeOldDots() {
//     const allPluses = document.querySelectorAll(".plus");
//     const allBoxes = document.querySelectorAll(".resource-box");

//     allPluses.forEach((plus) => {
//       plus.style.opacity = "0";
//     });
//     allBoxes.forEach((box) => {
//       box.style.opacity = "1";
//     });
//     const dots = document.querySelectorAll(".dot");
//     dots.forEach((dot) => {
//       dot.parentNode.removeChild(dot);
//     });
//   }

//   // Wywołanie funkcji
//   removeOldDots();

//   const tokenCoinsValue = document.querySelector(".token-coins-value");
//   const tokenMoveValue = document.querySelector(".token-move-value");

//   /////// GLOBAL VALUES

//   const priceBarValues = document.querySelectorAll(".price-bar-value");
//   const daninaBarValues = document.querySelectorAll(".danina-bar-value");

//   priceBarValues.forEach((price) => {
//     const resourceId = parseInt(price.classList[1].slice(-1));
//     const element = document.querySelectorAll(`.price-${resourceId}`);
//     const bar = document.querySelector(`.measure-${resourceId}`);
//     const currentPrice = currentGame.prices[resourceId - 1];
//     const max = Math.max(...currentGame.prices);
//     let multiplier = function (max) {
//       if (max < 10) {
//         return 20;
//       } else if (max >= 10 && max < 15) {
//         return 12;
//       } else if (max >= 15 && max < 25) {
//         return 7;
//       } else if (max >= 25 && max < 35) {
//         return 4;
//       } else {
//         return 2;
//       }
//     };
//     multiplier = multiplier(max);
//     bar.style.height = currentPrice * multiplier + "px";
//     element.forEach((el) => {
//       el.innerHTML = formatInputValue(currentPrice, "number");
//     });
//   });

//   daninaBarValues.forEach((danina) => {
//     const daninaId = parseFloat(danina.classList[1].slice(-1));
//     const element = document.querySelector(`.danina-${daninaId}`);
//     const bar = document.querySelector(`.danina-measure-${daninaId}`);
//     const currentDanina = currentGame.gameOrder[daninaId].danina;
//     bar.style.height = currentDanina * 8 + "px";
//     element.innerHTML = `${currentGame.gameOrder[daninaId].danina}`;
//   });

//   function sortBars() {
//     const barsContainer = document.querySelector(".danina-container");
//     const barContainers = Array.from(
//       barsContainer.querySelectorAll(".bar-container")
//     );

//     // Sortowanie kontenerów na podstawie wartości h2
//     barContainers.sort((a, b) => {
//       const valueA = parseFloat(
//         a.querySelector(".danina-bar-value").textContent
//       );
//       const valueB = parseFloat(
//         b.querySelector(".danina-bar-value").textContent
//       );
//       return valueB - valueA; // Sortowanie malejąco
//     });

//     // Przeniesienie posortowanych kontenerów na początek kontenera .bars-container
//     barContainers.forEach((barContainer) =>
//       barsContainer.appendChild(barContainer)
//     );
//   }
//   setTimeout(() => {
//     sortBars();
//   }, 500);
// };
