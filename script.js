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
        }
    }
}

//Toggle lock status of a meal
function toggleLock() {
    if (lockedMeals.includes(this.dataset.meal)) {
        lockedMeals = lockedMeals.filter(m => m !== this.dataset.meal);
        this.classList.remove('locked');
        this.querySelector('span').textContent = 'Lock Meal';
    } else {
        lockedMeals.push(this.dataset.meal);
        this.classList.add('locked');
        this.querySelector('span').textContent = 'Locked';
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
        }
        else {
            savedFullMeals.push({...currentMeals});
        }
        localStorage.setItem('savedFullMeals', JSON.stringify(savedFullMeals));
    }

    if(this.classList.contains('save')) {
        if(savedMeals.includes(currentMeals[this.parentElement.id])) {
            savedMeals = savedMeals.filter(id => id !== currentMeals[this.parentElement.id]);
        }
        else {
            savedMeals.push({
                id: currentMeals[this.parentElement.id],
                category: this.parentElement.id
            });
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