const wikiUrlAPI = 'https://en.wikipedia.org/api/rest_v1/page/summary/';
const mainSection = document.querySelector('section.people');
const addPersonForm = document.querySelector('#addPerson');
const formsButton = document.querySelector('button.btn');
const formsInput = document.querySelector('input.form-control');
const alertDiv = document.querySelector('div.alert');

// function to check if we received data successfully
function personExists(data) {
    if (!data.ok) {
        successAndErrorAlert('failed');
        throw new Error('Could not attain the person.')
    } else {
        successAndErrorAlert('success');
    }
    return data
}

// alert pop-up when you un(successfully) add a search result
function successAndErrorAlert(string) {
    if (string == 'success') {
        alertDiv.style.display = 'block';
        alertDiv.style.opacity = 1;
        alertDiv.className = "alert alert-success text-center";
        alertDiv.innerHTML = `You have successfully added <strong>${formsInput.value}!<i class="fas fa-times clickme"></i></strong>`
    } else if (string == 'failed') {
        alertDiv.style.display = 'block';
        alertDiv.style.opacity = 1;
        alertDiv.className = "alert alert-danger text-center";
        alertDiv.innerHTML = `<strong>${formsInput.value}</strong> was not found. Try again <i class="fas fa-times clickme"></i>`
    } else if (string == 'x') {
        alertDiv.style.opacity = 0;
        setTimeout(() => {
            alertDiv.style.display = 'none';
        }, 300)
    }
}

// call fetch API when we submit data (specific known person, country, religious and etc...)
addPersonForm.addEventListener('submit', (e) => {
    e.preventDefault();
    fetch(wikiUrlAPI + formsInput.value)
        .then(person => personExists(person))
        .then(person => person.json())
        .then(generateHTML)
        .catch(err => console.log(err))
        .finally(() => formsInput.value = '')
})



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

// this function creates profile div and passes it to the function  modifyAndAppendProfileToDOM which will
// take care of creating content for profile div and updating it to the DOM.
function generateHTML(person) {
    const div = document.createElement('div');
    div.className = "profile";
    const pictureExists = 'thumbnail' in person;
    modifyAndAppendProfileToDOM(div, person, pictureExists);
}

// event listener to make disappear ALERT MESSAGE (green/red alert message up the page)
alertDiv.addEventListener('click', (e) => {
    if (e.target.tagName == 'I') {
        successAndErrorAlert('x');
    }
})

// event listener for deleting a profile of search result (trash can icon)
mainSection.addEventListener('click', (e) => {
    if (e.target.tagName == 'I') {
        e.target.parentNode.remove();
    }
})