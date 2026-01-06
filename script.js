"use strict";

const fullMealSave = $('#fullMealSave');
const generateMeal = $('#generateMeal');

let lockedMeals = [];

let savedFullMeals = [];
let savedMeals = [];

savedMeals = JSON.parse(localStorage.getItem('savedMeals')) || [];
savedFullMeals = JSON.parse(localStorage.getItem('savedFullMeals')) || [];

const foodCategories = {
                        'Breakfast': ['Breakfast'],
                        'Lunch': ['Chicken', 'Beef', 'Vegetarian', 'Seafood'],
                        'Dinner': ['Chicken', 'Beef', 'Seafood', 'Pasta'],
                        'Dessert': ['Dessert']
                    };

let currentMeals = {
    'Breakfast': "",
    'Lunch': "",
    'Dinner': "",
    'Dessert': ""
};

async function fetchRandomMeal(category) {
    let allMeals = [];
    for(let cat of category) {
        let url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${cat}`;
        const response = await fetch(url);
        if(response.ok){
            const mealData = await response.json();
            const meals = mealData.meals;
            console.log(meals);
            allMeals.push(...meals);

        } else {
            console.error("Error fetching random meal:", response.status);
        }
    }
    const randomMeals = allMeals[Math.floor(Math.random() * allMeals.length)];
    return randomMeals;
}

//Generate random meals for each meal type
async function randomMeals() {
    let mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Dessert'];
    for (let meal of mealTypes) {
        if (!(lockedMeals.includes(meal))) {
            let randomMeal = await fetchRandomMeal(foodCategories[meal]);
            $(`#${meal}`).find('h4').text(randomMeal.strMeal);
            $(`#${meal}`).find('img').attr('src', randomMeal.strMealThumb);
            $(`#${meal}`).find('img').attr('alt', randomMeal.strMeal);

            const detailResp = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${randomMeal.idMeal}`);
            const data = await detailResp.json();
            const fullMeal = data.meals[0];

            const sourceLink = fullMeal.strSource;
            if (sourceLink) {
                $(`#${meal}`).find('a').attr('href', sourceLink);
            } else {
                $(`#${meal}`).find('a').attr('href', `https://www.themealdb.com/meal/${randomMeal.idMeal}`);
            }

            currentMeals[meal] = randomMeal.idMeal;

            //Update bookmark button status
            const btn = $(`#${meal} .save`)[0]; // get the button for this meal
            if (btn) {
                const isSaved = savedMeals.some(m => m.id === currentMeals[meal]);
                if (isSaved) {
                    btn.innerHTML = `<span class="hidden">Remove Bookmarked Meal</span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M192 64C156.7 64 128 92.7 128 128L128 544C128 555.5 134.2 566.2 144.2 571.8C154.2 577.4 166.5 577.3 176.4 571.4L320 485.3L463.5 571.4C473.4 577.3 485.7 577.5 495.7 571.8C505.7 566.1 512 555.5 512 544L512 128C512 92.7 483.3 64 448 64L192 64z"/></svg>`;
                } else {
                    btn.innerHTML = `<span class="hidden">Bookmark Meal</span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M128 128C128 92.7 156.7 64 192 64L448 64C483.3 64 512 92.7 512 128L512 545.1C512 570.7 483.5 585.9 462.2 571.7L320 476.8L177.8 571.7C156.5 585.9 128 570.6 128 545.1L128 128zM192 112C183.2 112 176 119.2 176 128L176 515.2L293.4 437C309.5 426.3 330.5 426.3 346.6 437L464 515.2L464 128C464 119.2 456.8 112 448 112L192 112z"/></svg>`;
                }
            }
        }
    }
    //Update full meal bookmark button status
    const fullMealBtn = document.getElementById('fullMealSave');
    if (fullMealBtn) {
        const isFullMealSaved = savedFullMeals.some(mealSet =>
            mealsMatch(mealSet, currentMeals)
        );
        fullMealBtn.innerText = isFullMealSaved ? 'Remove Saved Full Meal' : 'Save Full Meal';
    }
}

//Toggle lock status of a meal
function toggleLock() {
    if (lockedMeals.includes(this.dataset.meal)) {
        lockedMeals = lockedMeals.filter(m => m !== this.dataset.meal);
        this.classList.remove('locked');
        // this.querySelector('span').textContent = 'Lock Meal';
        this.innerHTML = `<span class="hidden">Lock Meal</span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M416 160C416 124.7 444.7 96 480 96C515.3 96 544 124.7 544 160L544 192C544 209.7 558.3 224 576 224C593.7 224 608 209.7 608 192L608 160C608 89.3 550.7 32 480 32C409.3 32 352 89.3 352 160L352 224L192 224C156.7 224 128 252.7 128 288L128 512C128 547.3 156.7 576 192 576L448 576C483.3 576 512 547.3 512 512L512 288C512 252.7 483.3 224 448 224L416 224L416 160z"/></svg>`;
    } else {
        lockedMeals.push(this.dataset.meal);
        this.classList.add('locked');
        // this.querySelector('span').textContent = 'Locked';
        this.innerHTML = `<span class="hidden">Locked</span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M256 160L256 224L384 224L384 160C384 124.7 355.3 96 320 96C284.7 96 256 124.7 256 160zM192 224L192 160C192 89.3 249.3 32 320 32C390.7 32 448 89.3 448 160L448 224C483.3 224 512 252.7 512 288L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 288C128 252.7 156.7 224 192 224z"/></svg>`;
    }
}

//Check if full meal is already saved
function mealsMatch(saved, current) {
    return saved.Breakfast === current.Breakfast &&
           saved.Lunch === current.Lunch &&
           saved.Dinner === current.Dinner &&
           saved.Dessert === current.Dessert;
}

//Toggle bookmark status of a meal or meals
function toggleBookmark() {
    if(this.id === 'fullMealSave') {
        if(savedFullMeals.some(mealSet => mealsMatch(mealSet, currentMeals))) {
            savedFullMeals = savedFullMeals.filter(mealSet => !mealsMatch(mealSet, currentMeals));
            this.innerText = 'Save Full Meal';
        }
        else {
            savedFullMeals.push({...currentMeals});
            this.innerText = 'Remove Saved Full Meal';
        }
        localStorage.setItem('savedFullMeals', JSON.stringify(savedFullMeals));
    }

    if(this.classList.contains('save')) {
        if(savedMeals.some(m => m.id === currentMeals[this.parentElement.id])) {
            savedMeals = savedMeals.filter(m => m.id !== currentMeals[this.parentElement.id]);
            this.innerHTML = `<span class="hidden">Bookmark Meal</span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M128 128C128 92.7 156.7 64 192 64L448 64C483.3 64 512 92.7 512 128L512 545.1C512 570.7 483.5 585.9 462.2 571.7L320 476.8L177.8 571.7C156.5 585.9 128 570.6 128 545.1L128 128zM192 112C183.2 112 176 119.2 176 128L176 515.2L293.4 437C309.5 426.3 330.5 426.3 346.6 437L464 515.2L464 128C464 119.2 456.8 112 448 112L192 112z"/></svg>`;
        }
        else {
            savedMeals.push({
                id: currentMeals[this.parentElement.id],
                category: this.parentElement.id
            });
            this.innerHTML = `<span class="hidden">Remove Bookmarked Meal</span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M192 64C156.7 64 128 92.7 128 128L128 544C128 555.5 134.2 566.2 144.2 571.8C154.2 577.4 166.5 577.3 176.4 571.4L320 485.3L463.5 571.4C473.4 577.3 485.7 577.5 495.7 571.8C505.7 566.1 512 555.5 512 544L512 128C512 92.7 483.3 64 448 64L192 64z"/></svg>`;

        }
        localStorage.setItem('savedMeals', JSON.stringify(savedMeals));
    }
}

//add saved meals to page
async function loadSavedMeals() {
    let savedHTML = {
        'Breakfast': '',
        'Lunch': '',
        'Dinner': '',
        'Dessert': ''
    }

    for (let save of savedMeals) {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${save.id}`);
        if(response.ok){
            const mealData = await response.json();
            const meal = mealData.meals[0];
            let categorySection = save.category;
            savedHTML[categorySection] += `
                        <article class="saved-meal" data-id="${meal.idMeal}" data-category="${categorySection}">
                            <h4>${meal.strMeal}</h4>
                            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                            <a href="${meal.strSource ? meal.strSource : `https://www.themealdb.com/meal/${meal.idMeal}`}">Details</a>
                            <button class="remove">Unsave</button>
                        </article>
                    `;
        }
    }

    for (let category in savedHTML) {
        $(`#fullMealsAccordion #${category}`).append(savedHTML[category]);
    }
}

//Add full meals to page
async function loadSavedFullMeals() {
    let savedFullMealsHTML = '';
    for (let mealSet of savedFullMeals) {
        savedFullMealsHTML += `<section>`;
        for (let category in mealSet) {
            let mealID = mealSet[category];
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealID}`);
            
            if(response.ok){
                const mealData = await response.json();
                const meal = mealData.meals[0];
                savedFullMealsHTML += `
                            <article class="saved-meal" data-id="${meal.idMeal}" data-category="${category}">
                                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                                <div>
                                <h4>${meal.strMeal}</h4>
                                <a href="${meal.strSource ? meal.strSource : `https://www.themealdb.com/meal/${meal.idMeal}`}">Details</a>
                                </div>
                            </article>
                    `;
            }
        }
        savedFullMealsHTML += `<button class="removeFullMeal">Unsave</button>
        </section>`;
    }
    $('#savedFullMeals').append(savedFullMealsHTML);
}

//Remove saved meal
function removeSavedMeal() {
    const article = this.closest('article');
    const mealId = article.dataset.id;       // get id stored in data-id
    const category = article.dataset.category;

    // Remove from savedMeals array
    savedMeals = savedMeals.filter(m => m.id !== mealId);
    localStorage.setItem('savedMeals', JSON.stringify(savedMeals));

    article.remove();
}

//Remove saved full meal
function removeSavedFullMeal() {
    const section = this.closest('section');

    // Build a mealSet object from the articles inside the section
    const mealSet = {};
    section.querySelectorAll('article').forEach(article => {
        const cat = article.dataset.category;
        const id = article.dataset.id;
        if (cat && id) mealSet[cat] = id;
    });

    // Remove the matching meal set from savedFullMeals
    savedFullMeals = savedFullMeals.filter(set => !mealsMatch(set, mealSet));
    localStorage.setItem('savedFullMeals', JSON.stringify(savedFullMeals));

    // Remove section from DOM
    section.remove();
}

if($('#generateMeal').length){
    randomMeals();
    generateMeal.on('click', randomMeals);
    $(".lock").on('click', toggleLock);
    fullMealSave.on('click', toggleBookmark);
    $(".save").on('click', toggleBookmark);
}

if($('#savedFullMeals').length){
    loadSavedMeals();
    loadSavedFullMeals();
    $(document).on('click', '.remove', removeSavedMeal);
    $(document).on('click', '.removeFullMeal', removeSavedFullMeal);
}


$(function() {
    $("#fullMealsAccordion").accordion({
        collapsible: true,
        heightStyle: "content",
        active: false
    });
});