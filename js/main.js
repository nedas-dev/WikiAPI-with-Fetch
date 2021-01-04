const wikiUrlAPI = 'https://en.wikipedia.org/api/rest_v1/page/summary/';
const mainSection = document.querySelector('section.people');
const addPersonForm = document.querySelector('#addPerson');
const formsButton = document.querySelector('button.btn');
const formsInput = document.querySelector('input.form-control');
const alertDiv = document.querySelector('div.alert');

// Alert messages
const SUCCESS = 'SUCCESS';
const FAILED = 'FAILED';
const X = 'X';

// function to check if we received data successfully
function searchExists(data) {
    if (!data.ok) {
        if (formsInput.value) {
            successAndErrorAlert(FAILED);
        }
        throw new Error('Could not attain the person.')
    }
    return data
}

// alert pop-up when you un(successfully) add a search result
function successAndErrorAlert(message) {
    const alert = {
        SUCCESS: () => {
            alertDiv.style.display = 'block';
            alertDiv.style.opacity = 1;
            alertDiv.className = "alert alert-success text-center";
            alertDiv.innerHTML = `You have successfully added <strong>${formsInput.value}!<i class="fas fa-times clickme"></i></strong>`
        },
        FAILED: () => {
            alertDiv.style.display = 'block';
            alertDiv.style.opacity = 1;
            alertDiv.className = "alert alert-danger text-center";
            alertDiv.innerHTML = `<strong>${formsInput.value}</strong> was not found. Try again <i class="fas fa-times clickme"></i>`
        },
        X: () => {
            alertDiv.style.opacity = 0;
            setTimeout(() => {
                alertDiv.style.display = 'none';
            }, 300)
        }
    }
    alert[message]()
}


// API to fetch from WikiAPI and append it to the page.
function fetchWikiAPI(string) {
    fetch(wikiUrlAPI + string)
        .then(person => searchExists(person))
        .then(person => person.json())
        .then(person => {
            if (formsInput.value) {
                successAndErrorAlert(SUCCESS);
                modifyLocalStorage(person['displaytitle']);
            }
            return person;
        })
        .then(generateHTML)
        .catch(err => console.log(err))
        .finally(() => formsInput.value = '')
}

// this function creates profile div and passes it to the function  modifyAndAppendProfileToDOM which will
// take care of creating content for profile div and updating it to the DOM.
function generateHTML(person) {
    const div = document.createElement('div');
    div.className = "profile";
    const pictureExists = 'thumbnail' in person;
    modifyAndAppendProfileToDOM(div, person, pictureExists);
}

// Function to create a profile for a search result and update it in the DOM.
// Why there are two different methods for profiles?
// The answer is - one for search result which contains an image and the other not.
function modifyAndAppendProfileToDOM(div, person, pictureExists) {
    if (pictureExists) {
        div.innerHTML = `
        <img src=${person.thumbnail.source}>
        <div class="description">
            <h2>${person.displaytitle}</h2>
            <p class="important"><strong>${person.description}</strong></p>
            <p class="regular">${person.extract}</p>
        </div>
        <i class="fas fa-trash-alt trash"></i>
        `
    } else {
        div.innerHTML = `
        <img width="280" height="340" src="https://st.depositphotos.com/2101611/3925/v/600/depositphotos_39258143-stock-illustration-businessman-avatar-profile-picture.jpg">
        <div class="description">
            <h2>${person.displaytitle}</h2>
            <p class="important>${person.description}</p>
            <p class="regular">${person.extract}</p>
        </div>
        <i class="fas fa-trash-alt trash"></i>
        `
    }
    // Every new added search will be added to the top of the list
    // instead of going down the list
    const profilesExist = mainSection.children.length > 0;
    if (profilesExist) {
        const firstChild = mainSection.firstElementChild;
        mainSection.insertBefore(div, firstChild)
    } else {
        mainSection.appendChild(div);
    }
}


// LOCAL STORAGE ------------------------------------------------------------
// Save all the search results for next time you will comeback.

// Checks if user's browser supports localStorage
function supportsLocalStorage() {
    return 'localStorage' in window && window['localStorage'] !== null;
}

// This function checks if browser supports local storage and if
// it does support appends the search result into the storage.
function modifyLocalStorage(fulltitle) {
    if (supportsLocalStorage()) {
        if (localStorage['profiles']) {
            checkAndAppendNewSearch(fulltitle);
        } else {
            localStorage.setItem('profiles', `["${fulltitle}"]`);
        }
    }
}

// This function checks if search result already exists in local storage else appends the new result.
function checkAndAppendNewSearch(inputValue) {
    const profileList = JSON.parse(localStorage.getItem('profiles'));
    if (profileList.indexOf(inputValue) == -1) {
        profileList.unshift(inputValue);
        localStorage.setItem('profiles', JSON.stringify(profileList));
    }
}


// Function to load all the profiles that were active before the page was closed
function loadProfiles() {
    if (supportsLocalStorage()) {
        if (localStorage['profiles']) {
            const profilesList = JSON.parse(localStorage.getItem('profiles'));
            profilesList.forEach(profile => {
                fetchWikiAPI(profile);
            })
        }
    }
}

// Event listener for deleting search result (profile) when pressing trash can icon
mainSection.addEventListener('click', (e) => {
    if (e.target.tagName == 'I') {
        const displaytitle = e.target.previousElementSibling.querySelector('h2').textContent;
        if (supportsLocalStorage()) {
            const profileList = JSON.parse(localStorage.getItem('profiles'))
            index = profileList.indexOf(displaytitle);
            if (index > -1) {
                profileList.splice(index, 1)
                localStorage.setItem('profiles', JSON.stringify(profileList));
            }
        }
        e.target.parentNode.remove();
    }
})


// call fetch API when we submit data (specific known person, country, religious and etc...)
addPersonForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (formsInput.value) {
        fetchWikiAPI(formsInput.value)
    }
})

// Once the page loads - we also want to load the profiles that were opened before the person closed the browser (or refreshed the page)
window.onload = () => {
    loadProfiles();
}

// event listener to remove ALERT MESSAGE (green/red alert message up the page)
alertDiv.addEventListener('click', (e) => {
    if (e.target.tagName == 'I') {
        successAndErrorAlert(X);
    }
})