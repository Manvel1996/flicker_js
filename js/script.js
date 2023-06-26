const API_KEY = "37bda1798910c78bef5284aed9201d60";
let searchImgs = [];
let basketNames = [];
let basketsImages = [];
let basketIsOpen = "";
let dndImg = {};

const searchForm = document.querySelector(".imgs-tool__form");
const searchInput = document.querySelector(".imgs-tool__form-search");
const baskets = document.querySelector(".imgs-tool__baskets");
const imgsBoard = document.querySelectorAll(".imgs-tool__board")[0];
const basketBoard = document.querySelectorAll(".imgs-tool__board")[1];

const modal = document.querySelector(".modal");
const modalClose = document.querySelector(".modal__close");
const modalText = document.querySelector(".modal__text");

function makeRequest(url) {
    return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();

        xhr.open("GET", url);

        xhr.onload = function () {
            if (xhr.status !== 200) {
                return openModal("Not a found");
            }
            resolve(JSON.parse(xhr.response));
        };

        xhr.send();
    });
}

function submit(e) {
    e.preventDefault();

    searchImgs = [];
    basketNames = [];
    basketsImages = [];
    basketIsOpen = "";
    baskets.innerHTML = "";
    imgsBoard.innerHTML = "";
    basketBoard.innerHTML = "";

    const imgsName = searchInput.value.trim();
    const imgsNameArr = Array.from(new Set(imgsName.split(" "))).filter((el) => el !== "");

    Promise.all(
        imgsNameArr.map((name) => {
            return makeRequest(
                `https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=${API_KEY}&tags=${name}&format=json&nojsoncallback=1&per_page=5`
            );
        })
    )
        .then((data) => {
            data.forEach((el, idx) => {
                let obj = {
                    title: imgsNameArr[idx],
                    imgs: el.photos.photo,
                };
                searchImgs.push(obj);
            });
            imgsCreator();
            basketNameCreator();
        })
        .catch((err) => {
            openModal(err.message, "red");
        });
}

function imgsCreator() {
    imgsBoard.innerHTML = "";
    let noResult = true;

    searchImgs.forEach((el) => {
        el.imgs.forEach((img) => {
            const photo = document.createElement("img");
            const imgSrc = `http://farm${img.farm}.staticflickr.com/${img.server}/${img.id}_${img.secret}.jpg`;
            photo.classList.add("imgs-tool__photo");
            photo.classList.add("imgs-tool__photo--draggable");
            photo.setAttribute("src", imgSrc);
            photo.setAttribute("alt", el.title);
            photo.setAttribute("data-id", img.id);
            photo.draggable = true;

            imgsBoard.appendChild(photo);
        });

        if (el.imgs.length > 0) {
            noResult = false;
        }
    });

    if (noResult) {
        openModal("No result", "red");
    }
}

function basketNameCreator() {
    searchImgs.forEach((el) => {
        if (el.imgs.length > 0) {
            const basketName = document.createElement("div");
            basketName.classList.add("imgs-tool__baskets-name");
            basketName.innerText = el.title;
            baskets.appendChild(basketName);
        }
    });
}

function basketImgsCreator(title) {
    basketBoard.innerHTML = "";

    const groupName = document.createElement("p");
    groupName.classList.add("imgs-tool--imgs-group");
    groupName.innerText = title;
    basketBoard.appendChild(groupName);

    basketsImages.forEach((el) => {
        if (el.title === title) {
            el.imgs.forEach((img) => {
                const photo = document.createElement("img");
                photo.classList.add("imgs-tool__photo");
                photo.setAttribute("src", img);
                basketBoard.appendChild(photo);
            });
        }
    });
}

function imgGoBasket(title) {
    searchImgs = searchImgs.map((obj) => {
        if (obj.title === title) {
            const newImgs = obj.imgs.filter((el) => el.id !== dndImg.id);
            const newObj = {
                title,
                imgs: newImgs,
            };
            return newObj;
        }
        return obj;
    });
    imgsCreator();
}

function dragStart(e) {
    if (e.target !== e.currentTarget) {
        e.target.style.opacity = "50%";

        dndImg["title"] = e.target.alt;
        dndImg["src"] = e.target.src;
        dndImg["id"] = e.target.getAttribute("data-id");
    }
}

function dragLeave(e) {
    if (e.target !== e.currentTarget) {
        e.target.style.backgroundColor = "rgb(0, 132, 255)";
    }
}

function dragOver(e) {
    e.preventDefault();
    if (e.target !== e.currentTarget) {
        if (e.target.innerText === dndImg.title) {
            e.target.style.backgroundColor = "green";
        } else e.target.style.backgroundColor = "red";
    }
}

function dragend(e) {
    e.target.style.opacity = "100%";
}

function drop(e) {
    e.preventDefault();
    if (e.target !== e.currentTarget) {
        e.target.style.backgroundColor = "rgb(0, 132, 255)";

        if (dndImg.title !== e.target.innerText) return (dndImg = {});

        const obj = basketsImages.find((el) => el.title === e.target.innerText);
        const newBasketsImg = {};

        if (basketsImages.length === 0 || !obj) {
            newBasketsImg["title"] = e.target.innerText;
            newBasketsImg["imgs"] = [dndImg.src];
            basketsImages.push(newBasketsImg);
            imgGoBasket(e.target.innerText);
            return (dndImg = {});
        }

        basketsImages = basketsImages.map((el) => {
            if (el.title === e.target.innerText) {
                const obj = {
                    title: e.target.innerText,
                    imgs: [...el.imgs, dndImg.src],
                };
                return obj;
            }
            return el;
        });

        imgGoBasket(e.target.innerText);
        dndImg = {};

        if (basketIsOpen === e.target.innerText) {
            basketImgsCreator(e.target.innerText);
        }

        let clearBoard = false;
        searchImgs.forEach((el) => {
            if (el.imgs.length > 0) clearBoard = true;
        });
        if (!clearBoard) {
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
        if (basketIsOpen === "") {
            basketIsOpen = e.target.innerText;
        } else if (basketIsOpen === e.target.innerText) {
            basketIsOpen = "";
            basketBoard.innerHTML = "";
            return;
        } else basketIsOpen = e.target.innerText;
        basketImgsCreator(e.target.innerText);
    }
});
