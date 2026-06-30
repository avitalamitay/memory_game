const MAX_CARDS = 12;
const memoryCardSelector = ".memoryCard";
const flipClass = "flip";

let lockBoard = false;
let hasFlippedCard = false;

let firstCard = null;
let secondCard = null;
let matchedPairs = 0;

document.addEventListener("DOMContentLoaded", () => {
  const cardElList = document.querySelectorAll(memoryCardSelector);
  const themeChoises = document.querySelector(".themeChoicesMenu");
  const memoryGame = document.querySelector(".memoryGame");
  const gameBoard = document.querySelector(".cards");
  const winScreen = document.querySelector(".winScreen");
  const currentTheme = document.querySelector(".currentTheme");
  const themeBtns = document.querySelectorAll(".btnChoice");

  themeBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const selectedTheme = e.currentTarget.dataset.btn;
      startGame(selectedTheme);
    });
  });

  const startGame = async (theme) => {
    matchedPairs = 0;
    memoryGame.classList.remove("theme-flags", "theme-dogs");
    themeChoises.style.display = "none";
    winScreen.style.display = "none";
    let themeChosen = theme;
    if (theme === "random") {
      const themesOptions = ["harryPotter", "dogs", "flags"];
      const randomIndex = Math.floor(Math.random() * themesOptions.length);
      theme = themesOptions[randomIndex]; 
      themeChosen = theme;
    }
    currentTheme.textContent = themeChosen;
    let selectedPics = [];
    if (theme === "dogs") {
      memoryGame.classList.add("theme-dogs");
      selectedPics = await getDogPics();
    } 
    else if (theme === "harryPotter") {
      currentTheme.textContent = "Harry Potter";
      selectedPics = await getHPPics();
    }
    else if (theme === "flags") {
      memoryGame.classList.add("theme-flags");
       selectedPics = await getFlagPics();
    }
    putPicsInCards(selectedPics);
    memoryGame.style.display = "flex";
    gameBoard.style.display = "flex";
  };

  const getDogPics = async () => {
    const apiAnswer = await fetch("https://dog.ceo/api/breeds/image/random/6");
    const readableJson = await apiAnswer.json();
    const picData = readableJson.message.map((dogUrl, index) => {
      return {
        url: dogUrl,
        name: `Dog number ${index + 1}` 
      };
    });
    return picData; 
  };

  const getHPPics = async () => {
    const apiAnswer = await fetch("https://hp-api.onrender.com/api/characters");
    const readableJson = await apiAnswer.json();
    const charactersWithPics = readableJson.filter((character) => character.image !== "");
    charactersWithPics.sort(() => 0.5 - Math.random());
    const selectedCharacters = charactersWithPics.slice(0, 6);
    const picData = selectedCharacters.map((character) => {
      return {
        url:character.image,
        name:character.name
      }
    }
  );
    return picData;
};

  const getFlagPics = async () => {
    const apiKey = "rc_live_3fb367a605dd473da9a2cf464f5ddb00";
    const apiAnswer = await fetch("https://api.restcountries.com/countries/v5", {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      })
    const jsonAnswer = await apiAnswer.json();     
    const readableJson = jsonAnswer.data.objects;
    readableJson.sort(() => 0.5 - Math.random());
    const selectedCountries = readableJson.slice(0, 6);
    const picData = selectedCountries.map((country) => {
      return {
        url:country.flag.url_png,
        name:country.names.common
      }
    }
  );
    return picData;
  };

  const putPicsInCards = (picUrls) => {
    const cardPairs = [...picUrls, ...picUrls];
    cardPairs.sort(() => 0.5 - Math.random());
    const cardElements = document.querySelectorAll(".memoryCard");  
    cardElements.forEach((card, index) => {
      const frontPic = card.querySelector(".frontFacePic");
      const frontText = card.querySelector(".frontFaceText");
      const currentItem = cardPairs[index];
      frontPic.src = currentItem.url;
      frontPic.alt = currentItem.name;
      frontText.textContent = currentItem.name;
      card.dataset.card = currentItem.name;
    });
  };

  const handleClickFlip = (e) => {
    const clickedCard = e.target.closest(memoryCardSelector);
    console.log(clickedCard);
    if (firstCard === clickedCard || lockBoard) {
      return;
    }
    clickedCard.classList.add(flipClass);
    if (!hasFlippedCard) {
      hasFlippedCard = true;
      firstCard = clickedCard;
      return;
    }
    secondCard = clickedCard;
    lockBoard = true;
    checkForMatch();
  };

  cardElList.forEach((card) => {
    card.addEventListener("click", handleClickFlip);
  });

  const checkForMatch = () => {
    const isMatch = firstCard.dataset.card === secondCard.dataset.card;
    isMatch ? disableMatchedCards() : flipCardsBack();
  };

  const disableMatchedCards = () => {
    firstCard.removeEventListener("click", handleClickFlip);
    secondCard.removeEventListener("click", handleClickFlip);
    matchedPairs++;
    if (matchedPairs === MAX_CARDS / 2) {
      setTimeout(() => {
        memoryGame.style.display = "none";
        winScreen.style.display = "flex";
      }, 1500); 
    }
    resetTurn();
  };

  const flipCardsBack = () => {
    setTimeout(() => {
      firstCard.classList.remove(flipClass);
      secondCard.classList.remove(flipClass);
      resetTurn();
    }, 1500);
  };

  const resetTurn = () => {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
  };

  const startOver = () => {
    cardElList.forEach((card) => {
      card.classList.remove(flipClass);
      card.addEventListener("click", handleClickFlip);
    });
    resetTurn();
    setTimeout(() => {
      memoryGame.style.display = "none";
      gameBoard.style.display = "none";
      winScreen.style.display = "none";
      themeChoises.style.display = "flex";
    }, 500);
  };
  document.querySelector(".startOverBtn").addEventListener("click", startOver);
  document.querySelector(".playAgainBtn").addEventListener("click", startOver);
});
