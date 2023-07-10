const API_KEY = "37bda1798910c78bef5284aed9201d60";
const page = 5;

let searchImgs = [];
let basketNames = [];
let basketsImages = [];
let openBasket = "";
let dragImg = {};

const searchForm = document.querySelector(".images-form");
const searchInput = document.querySelector(".images-form__search");
const baskets = document.querySelector(".images-baskets");
const imagesBoard = document.querySelector(".images-board--big");
const basketBoard = document.querySelector(".images-board--small");

const modal = document.querySelector(".modal");
const modalClose = document.querySelector(".modal__close");
const modalText = document.querySelector(".modal__text");

function reset() {
  searchImgs = [];
  basketNames = [];
  basketsImages = [];
  openBasket = "";
  baskets.innerHTML = "";
  imagesBoard.innerHTML = "";
  basketBoard.innerHTML = "";
}

function submit(e) {
  e.preventDefault();

  reset();

  let imagesNames = searchInput.value.trim().split(" ");

  imagesNames = imagesNames.filter((el, index, array) => {
    return el.trim().length > 0 && array.indexOf(el.trim()) === index;
  });

  imagesNames.forEach((name) => {
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open(
        "GET",
        `https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=${API_KEY}&tags=${name}&format=json&nojsoncallback=1&per_page=${page}`
      );

      xhr.onload = function () {
        if (xhr.status !== 200) {
          reject();
        }
        resolve(JSON.parse(xhr.response));
      };

      xhr.send();
    })
      .then((data) => {
        if (data.photos.photo?.length > 0) {
          data.photos.photo.forEach((el) => {
            let obj = {
              // id: Date.now() + Math.random() * 15,
              title: name,
              img: el,
            };

            searchImgs.push(obj);
          });
        }

        imagesCreator(true);
        basketButtonCreator();
      })
      .catch(() => {
        openModal("Server error", "red");
      });
  });
}

function imagesCreator(random) {
  imagesBoard.innerHTML = "";

  if (random) {
    searchImgs = searchImgs.sort(() => Math.random() - 0.5);
  }

  searchImgs.forEach((el) => {
    const photo = document.createElement("img");
    const imageSrc = `http://farm${el.img.farm}.staticflickr.com/${el.img.server}/${el.img.id}_${el.img.secret}.jpg`;

    photo.classList.add(
      "images-board__photo",
      "images-board__photo--draggable"
    );
    photo.setAttribute("src", imageSrc);
    photo.setAttribute("alt", el.title);
    photo.setAttribute("data-id", el.img.id);
    photo.draggable = true;

    imagesBoard.appendChild(photo);
  });
}

function basketButtonCreator() {
  baskets.innerHTML = "";

  let basketsNames = [];

  searchImgs.forEach((el) => {
    if (el.img) {
      basketsNames.push(el.title);
    }
  });

  basketsNames = basketsNames.reduce((acc, el) => {
    if (acc.includes(el)) {
      return acc;
    }
    return [...acc, el];
  }, []);

  basketsNames.forEach((el) => {
    const basketButton = document.createElement("div");
    basketButton.classList.add("images-baskets__block");
    basketButton.innerText = el;
    baskets.appendChild(basketButton);
  });
}

function basketImagesCreator(title) {
  basketBoard.innerHTML = "";

  const groupName = document.createElement("p");
  groupName.classList.add("images-board__title", "title");
  groupName.innerText = title;
  basketBoard.appendChild(groupName);

  basketsImages.forEach((el) => {
    if (el.title === title) {
      el.imgs.forEach((img) => {
        const photo = document.createElement("img");
        photo.classList.add("images-board__photo");
        photo.setAttribute("src", img);
        basketBoard.appendChild(photo);
      });
    }
  });
}

function imgGoBasket() {
  searchImgs = searchImgs.filter((el) => el.img.id !== dragImg.id);
  imagesCreator();
}

function dragStart(e) {
  if (e.target !== e.currentTarget) {
    e.target.classList.add("images-board__photo--opacity");

    dragImg["title"] = e.target.alt;
    dragImg["src"] = e.target.src;
    dragImg["id"] = e.target.getAttribute("data-id");
  }
}

function dragLeave(e) {
  if (e.target !== e.currentTarget) {
    e.target.classList.remove("images-baskets__block--green");
    e.target.classList.remove("images-baskets__block--red");
  }
}

function dragOver(e) {
  e.preventDefault();
  if (e.target !== e.currentTarget) {
    if (e.target.innerText === dragImg.title) {
      e.target.classList.add("images-baskets__block--green");
    } else e.target.classList.add("images-baskets__block--red");
  }
}

function dragend(e) {
  e.target.classList.remove("images-board__photo--opacity");
}

function drop(e) {
  e.preventDefault();
  if (e.target !== e.currentTarget) {
    e.target.classList.remove("images-baskets__block--red");
    e.target.classList.remove("images-baskets__block--green");

    if (dragImg.title !== e.target.innerText) return (dragImg = {});

    const obj = basketsImages.find((el) => el.title === e.target.innerText);
    const newBasketsImg = {};

    if (basketsImages.length === 0 || !obj) {
      newBasketsImg["title"] = e.target.innerText;
      newBasketsImg["imgs"] = [dragImg.src];
      basketsImages.push(newBasketsImg);

      imgGoBasket(e.target.innerText);
      return (dragImg = {});
    }

    basketsImages = basketsImages.map((el) => {
      if (el.title === e.target.innerText) {
        const obj = {
          title: e.target.innerText,
          imgs: [...el.imgs, dragImg.src],
        };
        return obj;
      }
      return el;
    });

    imgGoBasket(e.target.innerText);
    dragImg = {};

    if (openBasket === e.target.innerText) {
      basketImagesCreator(e.target.innerText);
    }

    if (!searchImgs.length) {
      openModal("YAY)))) you are a great", "green");
    }
  }
}

function openModal(text, color) {
  modalText.innerText = text;
  modal.style.display = "block";
  modalText.style.color = color;
}

modalClose.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

searchForm.addEventListener("submit", submit);

imagesBoard.addEventListener("dragstart", dragStart);
imagesBoard.addEventListener("dragend", dragend);

baskets.addEventListener("dragleave", dragLeave);
baskets.addEventListener("dragover", dragOver);
baskets.addEventListener("drop", drop);

baskets.addEventListener("click", (e) => {
  if (e.target !== e.currentTarget) {
    if (openBasket === "") {
      openBasket = e.target.innerText;
    } else if (openBasket === e.target.innerText) {
      openBasket = "";
      basketBoard.innerHTML = "";
      return;
    } else openBasket = e.target.innerText;
    basketImagesCreator(e.target.innerText);
  }
});
