const API_KEY = "37bda1798910c78bef5284aed9201d60";
const page = 5;
let searchImgs = [];
let basketNames = [];
let basketsImages = [];
let openBasket = "";
let dragImg = {};

const searchForm = document.querySelector(".imgs-form");
const searchInput = document.querySelector(".imgs-form__search");
const baskets = document.querySelector(".imgs-baskets");
const imgsBoard = document.querySelector(".imgs-board--big");
const basketBoard = document.querySelector(".imgs-board--small");

const modal = document.querySelector(".modal");
const modalClose = document.querySelector(".modal__close");
const modalText = document.querySelector(".modal__text");

function submit(e) {
  e.preventDefault();

  searchImgs = [];
  basketNames = [];
  basketsImages = [];
  openBasket = "";
  baskets.innerHTML = "";
  imgsBoard.innerHTML = "";
  basketBoard.innerHTML = "";

  const imgsName = searchInput.value.trim().toLowerCase().split(" ");

  const uniqueObj = {};

  imgsName.forEach((el) => {
    if (el !== "" && !uniqueObj[el]) {
      uniqueObj[el] = null;
    }
  });

  Object.keys(uniqueObj).forEach((name) => {
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
              id: Date.now(),
              title: name,
              img: el,
            };

            searchImgs.push(obj);
          });
        }

        imgsCreator();
        basketNameCreator();
      })
      .catch(() => {
        openModal("Server error", "red");
      });
  });
}

function imgsCreator() {
  imgsBoard.innerHTML = "";

  searchImgs
    .sort(() => Math.random() - 0.5)
    .forEach((el) => {
      const photo = document.createElement("img");
      const imgSrc = `http://farm${el.img.farm}.staticflickr.com/${el.img.server}/${el.img.id}_${el.img.secret}.jpg`;

      photo.classList.add("imgs-board__photo", "imgs-board__photo--draggable");
      photo.setAttribute("src", imgSrc);
      photo.setAttribute("alt", el.title);
      photo.setAttribute("data-id", el.img.id);
      photo.draggable = true;

      imgsBoard.appendChild(photo);
    });
}

function basketNameCreator() {
  baskets.innerHTML = "";

  const uniqueObj = {};

  searchImgs.forEach((el) => {
    if (el.img && !uniqueObj[el.title]) {
      uniqueObj[el.title] = null;
    }
  });

  Object.keys(uniqueObj).forEach((el) => {
    const basketName = document.createElement("div");
    basketName.classList.add("imgs-baskets__block");
    basketName.innerText = el;
    baskets.appendChild(basketName);
  });
}

function basketImgsCreator(title) {
  basketBoard.innerHTML = "";

  const groupName = document.createElement("p");
  groupName.classList.add("imgs-board__title", "title");
  groupName.innerText = title;
  basketBoard.appendChild(groupName);

  basketsImages.forEach((el) => {
    if (el.title === title) {
      el.imgs.forEach((img) => {
        const photo = document.createElement("img");
        photo.classList.add("imgs-board__photo");
        photo.setAttribute("src", img);
        basketBoard.appendChild(photo);
      });
    }
  });
}

function imgGoBasket() {
  searchImgs = searchImgs.filter((el) => el.img.id !== dragImg.id);
  imgsCreator();
}

function dragStart(e) {
  if (e.target !== e.currentTarget) {
    e.target.classList.add("imgs-board__photo--opacity");

    dragImg["title"] = e.target.alt;
    dragImg["src"] = e.target.src;
    dragImg["id"] = e.target.getAttribute("data-id");
  }
}

function dragLeave(e) {
  if (e.target !== e.currentTarget) {
    e.target.classList.remove("imgs-baskets__block--green");
    e.target.classList.remove("imgs-baskets__block--red");
  }
}

function dragOver(e) {
  e.preventDefault();
  if (e.target !== e.currentTarget) {
    if (e.target.innerText === dragImg.title) {
      e.target.classList.add("imgs-baskets__block--green");
    } else e.target.classList.add("imgs-baskets__block--red");
  }
}

function dragend(e) {
  e.target.classList.remove("imgs-board__photo--opacity");
}

function drop(e) {
  e.preventDefault();
  if (e.target !== e.currentTarget) {
    e.target.classList.remove("imgs-baskets__block--red");
    e.target.classList.remove("imgs-baskets__block--green");

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
      basketImgsCreator(e.target.innerText);
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

imgsBoard.addEventListener("dragstart", dragStart);
imgsBoard.addEventListener("dragend", dragend);

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
    basketImgsCreator(e.target.innerText);
  }
});
