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

// Deal btn
const exchangeDealBTN = document.querySelector(".deal");
const arrowDown = document.querySelector(".arrow-down-svg");

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
    toggle01btn.style.color = "var(--main-colour)";
  } else {
    toggle01btn.style.filter = "var(--drop-shadow-item)";
    toggle01btn.style.color = "var(--zelazo)";
  }
});

// ADDING AND SUBSTRACTING 1 and 0.1
const manipulateBTNs = document.querySelectorAll(".manipulate");

manipulateBTNs.forEach((btn) => {
  btn.addEventListener("click", function () {
    const choosenEL = btn.classList[2];

    function myCalculation(number, direction) {
      if (direction === "plus") {
        return parseFloat(sellAmount.innerHTML) + parseFloat(number);
      }
      if (direction === "minus") {
        return parseFloat(sellAmount.innerHTML) - parseFloat(number);
      }
    }

    if (!toggle01) {
      if (choosenEL === "minus") {
        sellAmount.innerHTML = roundNumber(myCalculation(1, "minus"), 3);
      }
      if (choosenEL === "add") {
        sellAmount.innerHTML = roundNumber(myCalculation(1, "plus"), 3);
      }
    }
    if (toggle01) {
      if (choosenEL === "minus") {
        sellAmount.innerHTML = roundNumber(myCalculation(0.1, "minus"), 3);
      }
      if (choosenEL === "add") {
        sellAmount.innerHTML = roundNumber(myCalculation(0.1, "plus"), 3);
      }
    }

    checkIfExchangeCorrect();
  });
});

exchangeDealBTN.addEventListener("click", function () {
  if (exchangeDealBTN.classList.contains("btn-active")) {
    const buyVAL = roundNumber(buyAmount.innerHTML, 2);
    const sellVAL = roundNumber(sellAmount.innerHTML, 2);

    currentPlayer.resources[choosenBuySource] =
      roundNumber(currentPlayer.resources[choosenBuySource], 2) + buyVAL;

    currentPlayer.resources[choosenSellSource] =
      roundNumber(currentPlayer.resources[choosenSellSource], 2) - sellVAL;

    updateDB();
    checkIfExchangeCorrect();
    changePrice(sellVAL, choosenBuySource, choosenSellSource);
  }
});

const checkIfExchangeCorrect = function () {
  console.log("checkin if correct");
  choosenSellSource = sellSource.classList[2].slice(-1);
  choosenBuySource = buySource.classList[2].slice(-1);
  const sellValue = parseFloat(sellAmount.innerHTML);
  const userResources = roundNumber(
    currentPlayer.resources[choosenSellSource],
    2
  );

  if (sellValue >= 0.1 && sellValue <= userResources) {
    sellAmount.style.color = "var(--main-colour)";
    buyAmount.style.transform = "translateX(0px)";
    Visibility(exchangeDealBTN, "btn-active");
    calculateOffer();
  } else {
    sellAmount.style.color = "var(--krysztal)";
    buyAmount.style.transform = "translateX(-200px)";
    Visibility(exchangeDealBTN, "btn-inactive");
  }
};

const calculateOffer = function () {
  // sellValue (wartość sprzedawanego surowca w monetach)
  const sellValue =
    roundNumber(sellAmount.innerHTML, 3) *
    currentGame.prices[choosenSellSource] *
    currentPlayer.feeLevel;

  let currentOffer = sellValue / currentGame.prices[choosenBuySource];
  buyAmount.innerHTML = roundNumber(currentOffer, 1);
};

const readyForExchange = function () {
  setTimeout(() => {
    sellAmount.innerHTML = "1";
  }, 100);
  exchangeElement.style.width = "300px";
  if (!rollOutsideBuy && !rollOutsideSell) {
    checkIfExchangeCorrect();
    Visibility(exchangeDealBTN, "btn-active");
    arrowDown.style.transform = "translateX(-105px)";
    exchangeContainer.style.transform = "translateX(0px)";
    exchangeContainer.style.opacity = "1";
    exchangeValueContainer.style.transform = "translateX(0px)";
    exchangeValueContainer.style.opacity = "1";
    exchangeElement.style.width = "120vw";
    choosenSellSource = sellSource.classList[2].slice(-1);
    choosenBuySource = buySource.classList[2].slice(-1);
  } else {
    arrowDown.style.transform = "translateX(0px)";
    exchangeContainer.style.transform = "translateX(300px)";
    exchangeContainer.style.opacity = "0";
    exchangeValueContainer.style.transform = "translateX(-100px)";
    exchangeValueContainer.style.opacity = "0";
  }
  calculateOffer();
};

eSourceBTNs.forEach((icon) => {
  icon.addEventListener("click", function () {
    // UPPER BAR
    if (icon.classList[3] === "e-source-btn-sell") {
      // id other bar has duplicate
      if (
        buySource &&
        parseInt(icon.classList[2].slice(-1)) ===
          parseInt(buySource.classList[2].slice(-1))
      ) {
        buySource.click();
        buySource = "";
      }
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
      // id other bar has duplicate
      if (
        sellSource &&
        parseInt(icon.classList[2].slice(-1)) ===
          parseInt(sellSource.classList[2].slice(-1))
      ) {
        sellSource.click();
        sellSource = "";
      }

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