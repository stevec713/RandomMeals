"use strict";

const fullMealSave = $('#fullMealSave');
const generateMeal = $('#generateMeal');

let lockedMeals = [];

const foodCategories = {
                        'Breakfast': ['Breakfast'],
                        'Lunch': ['Chicken', 'Beef', 'Vegetarian', 'Seafood'],
                        'Dinner': ['Chicken', 'Beef', 'Seafood', 'Pasta'],
                        'Dessert': ['Dessert']
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
            $(`#${meal}`).find('p').text(fullMeal.strInstructions);

            const sourceLink = fullMeal.strSource;
            if (sourceLink) {
                $(`#${meal}`).find('a').attr('href', sourceLink);
            } else {
                $(`#${meal}`).find('a').attr('href', `https://www.themealdb.com/meal/${randomMeal.idMeal}`);
            }
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

//Toggle bookmark status of a meal or meals
/*function toggleBookmark(meal) {

}*/

$(generateMeal).on('click', randomMeals);
$(".lock").on('click', toggleLock);

//add current breakfast, lunch, dinner, desserts