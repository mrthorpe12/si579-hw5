/**
 * Returns a list of objects grouped by some property. For example:
 * groupBy([{name: 'Steve', team:'blue'}, {name: 'Jack', team: 'red'}, {name: 'Carol', team: 'blue'}], 'team')
 *
 * returns:
 * { 'blue': [{name: 'Steve', team: 'blue'}, {name: 'Carol', team: 'blue'}],
 *    'red': [{name: 'Jack', team: 'red'}]
 * }
 *
 * @param {any[]} objects: An array of objects
 * @param {string|Function} property: A property to group objects by
 * @returns  An object where the keys representing group names and the values are the items in objects that are in that group
 */
function groupBy(objects, property) {
    // If property is not a function, convert it to a function that accepts one argument (an object) and returns that object's
    // value for property (obj[property])
    if (typeof property !== 'function') {
        const propName = property;
        property = (obj) => obj[propName];
    }

    const groupedObjects = new Map(); // Keys: group names, value: list of items in that group
    for (const object of objects) {
        const groupName = property(object);
        //Make sure that the group exists
        if (!groupedObjects.has(groupName)) {
            groupedObjects.set(groupName, []);
        }
        groupedObjects.get(groupName).push(object);
    }

    // Create an object with the results. Sort the keys so that they are in a sensible "order"
    const result = {};
    for (const key of Array.from(groupedObjects.keys()).sort()) {
        result[key] = groupedObjects.get(key);
    }
    return result;
}

// Initialize DOM elements that will be used.
const outputDescription = document.querySelector('#output_description');
const wordOutput = document.querySelector('#word_output');
const showRhymesButton = document.querySelector('#show_rhymes');
const showSynonymsButton = document.querySelector('#show_synonyms');
const wordInput = document.querySelector('#word_input');
const savedWords = document.querySelector('#saved_words');

// Stores saved words.
const savedWordsArray = [];

/**
 * Makes a request to Datamuse and updates the page with the
 * results.
 * 
 * Use the getDatamuseRhymeUrl()/getDatamuseSimilarToUrl() functions to make
 * calling a given endpoint easier:
 * - RHYME: `datamuseRequest(getDatamuseRhymeUrl(), () => { <your callback> })
 * - SIMILAR TO: `datamuseRequest(getDatamuseRhymeUrl(), () => { <your callback> })
 *
 * @param {String} url
 *   The URL being fetched.
 * @param {Function} callback
 *   A function that updates the page.
 */
function datamuseRequest(url, callback) {
    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            // This invokes the callback that updates the page.
            callback(data);
        }, (err) => {
            console.error(err);
        });
}

/**
 * Gets a URL to fetch rhymes from Datamuse
 *
 * @param {string} rel_rhy
 *   The word to be rhymed with.
 *
 * @returns {string}
 *   The Datamuse request URL.
 */
function getDatamuseRhymeUrl(rel_rhy) {
    return `https://api.datamuse.com/words?${(new URLSearchParams({ 'rel_rhy': wordInput.value })).toString()}`;
}

/**
 * Gets a URL to fetch 'similar to' from Datamuse.
 *
 * @param {string} ml
 *   The word to find similar words for.
 *
 * @returns {string}
 *   The Datamuse request URL.
 */
function getDatamuseSimilarToUrl(ml) {
    return `https://api.datamuse.com/words?${(new URLSearchParams({ 'ml': wordInput.value })).toString()}`;
}

/**
 * Add a word to the saved words array and update the #saved_words `<span>`.
 *
 * @param {string} word
 *   The word to add.
 */
const wordList = new Array();

function addToSavedWords(word) {
    savedWords.innerHTML = "";
    wordList.push(word);
    wordList.join();
    savedWords.append(wordList);
}

// Add additional functions/callbacks here.

function rhymeHandler() {
    outputDescription.innerHTML = `Words that rhyme with ${wordInput.value}`;
    datamuseRequest(getDatamuseRhymeUrl(wordInput.value), (result) => {

        groupedResult = groupBy(result, 'numSyllables');
        if (Object.keys(groupedResult).length == 0) {
            wordOutput.value = "(no results)";
        } else {
            for (let group in groupedResult) {
                let wordGroup = groupedResult[group];
                const groupHeader = document.createElement('h3');
                groupHeader.innerHTML = `Syllables: ${wordGroup[0].numSyllables}`
                wordOutput.append(groupHeader);

                for (let item in wordGroup) {
                    const listItem = document.createElement('li');
                    const saveButton = document.createElement('button');
                    const spanItem = document.createElement('span');

                    saveButton.className = 'save';
                    saveButton.innerHTML = 'Save';
                    saveButton.style.backgroundColor = 'green';

                    spanItem.textContent = wordGroup[item].word;
                    listItem.append(spanItem);
                    listItem.append(saveButton);
                    wordOutput.append(listItem);
                }
            }

        }
    });

    wordInput.innerHTML = "";
    wordOutput.textContent = "";
}

function synonymHandler() {
    outputDescription.innerHTML = `Words with a similar meaning to ${wordInput.value}`;
    datamuseRequest(getDatamuseSimilarToUrl(wordInput.value), (result) => {
        if (Object.keys(result).length == 0) {
            wordOutput.value = "(no results)";
        } else {
            for (let item in result) {
                const listItem = document.createElement('li');
                const saveButton = document.createElement('button');
                const spanItem = document.createElement('span');

                saveButton.className = 'save';
                saveButton.innerHTML = 'Save';
                saveButton.style.backgroundColor = 'green';

                spanItem.textContent = result[item].word;
                listItem.append(spanItem);
                listItem.append(saveButton);
                wordOutput.append(listItem);
            }
        }
    });

    wordInput.innerHTML = "";
    wordOutput.textContent = "";
}

// Add event listeners here.

showRhymesButton.addEventListener('click', rhymeHandler, false);
showSynonymsButton.addEventListener('click', synonymHandler, false);

wordInput.addEventListener('keydown', (e) => {
    if (e.key == "Enter") {
        rhymeHandler();
    }
}, false);

wordOutput.addEventListener('click', (e) => {
    if (e.target.className == 'save') {
        // console.log(e.target.parentElement.children[0].innerHTML);
        input = e.target.parentElement.children[0].innerHTML;
        addToSavedWords(input);
    }
})