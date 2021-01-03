const astronautsUrlAPI = 'json/data.json';
const wikiUrlAPI = 'https://en.wikipedia.org/api/rest_v1/page/summary/';
const mainSection = document.querySelector('section.people');
const submitButton = document.querySelector('button')

/* This function gets and prepares JSON file ready to use from any online API */
function getJSON(url) {
    return new Promise((resolve, reject) => {
        const xml = new XMLHttpRequest();
        xml.onload = () => {
            if (xml.status == 200) {
                resolve(JSON.parse(xml.responseText));
            } else {
                reject(Error('Could not get the JSON file'));
            }

        }
        xml.onerror = () => {
            reject(Error('Network error. Did you type in the correct link?'));
        }
        xml.open('GET', url);
        xml.send();
    })
}

// Gets json files from wiki API about cosmonauts that are in data variable
function getProfiles(data) {
    const promisesList = data.people.map(people => {
        return getJSON(wikiUrlAPI + people.name)
    })
    return Promise.all(promisesList);
}

// This func prepares each profile (div) with information about each astronaut and appends it the the DOM
function modifyAndAppendDivToDOM(div, person, pictureExists) {
    if (pictureExists) {
        div.innerHTML = `
        <img src=${person.thumbnail.source}>
        <div>
            <h2>${person.displaytitle}</h2>
            <p class="important"><strong>${person.description}</strong></p>
            <p class="regular">${person.extract}</p>
        </div>
        `
        const profilesExist = mainSection.children.length > 0;
        if (profilesExist) {
            const firstChild = mainSection.firstElementChild;
            mainSection.insertBefore(div, firstChild)
        } else {
            mainSection.appendChild(div);
        }
    } else {
        div.innerHTML = `
        <img width="260" height="340" src="https://i.pinimg.com/736x/96/34/62/9634629ee6707f329d6194ceded5f0fe.jpg">
        <div>
            <h2>${person.displaytitle}</h2>
            <p class="important>${person.description}</p>
            <p class="regular">${person.extract}</p>
        </div>
        `
        mainSection.appendChild(div);
    }
}

// from getProfiles here data gives us a list of wiki API summary about each cosmonaut so we want to extract json files, generate and add - HTML for our "website"
function generateHTML(data) {
    data.forEach(person => {
        const div = document.createElement('div');
        div.className = "profile";
        const pictureExists = 'thumbnail' in person;
        modifyAndAppendDivToDOM(div, person, pictureExists);
    });
}


// Each function will be completed in sequence (That is how Promises work because we are trying to get an asynchronous data)
// .then() will run each time it will be successfully completed (Resolved)
// .catch() will run if it will run into reject() function which means something failed in the Promise.
// .finally() will only run if all promises were resolved successfully (all ran into resolve())
const activateRequest = (event) => {
    getJSON(astronautsUrlAPI)
        .then(getProfiles)
        .then(generateHTML)
        .catch(error => {
            mainSection.innerHTML = "<h3 style='text-align: center; padding: 20px; background-color:white;'>Something went wrong...</h3>"
        })
        .finally(() => event.target.remove())
}

submitButton.addEventListener('click', (e) => {
    e.target.textContent = "Loading...";
    activateRequest(e);
})
