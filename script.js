const input = document.querySelector('.input__search');
const autocompleteList = document.querySelector('.autocomplete-list');
const repoList = document.querySelector('.repo-list');
const loader = document.querySelector('.loader');

let repos = [];

const fetchRepositories = async (query) => {
    if (!query) {
        autocompleteList.textContent = "";
        return;
    }
    loader.classList.toggle("loader-active");

    const response = await fetch(`https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=5`);
    const data = await response.json();

    loader.classList.toggle("loader-active");

    displayAutocomplete(data.items);
};
const displayAutocomplete = (items) => {
    let arrayDivs = [];
    autocompleteList.textContent = "";

    for(let i = 0; i < items.length; i++) {
        const div = document.createElement("div");
        div.textContent = items[i].name;
        div.classList.add("autocomplete-item");
        arrayDivs.push(div);
    }

    autocompleteList.addEventListener("click", (event) => {
        if (event.target.classList.value === 'autocomplete-item') {
            addRepository(items.find(elem => elem.name === event.target.textContent));
            input.value = "";
            autocompleteList.textContent = "";
        }
    });
    autocompleteList.append(...arrayDivs);
};
const addRepository = (repo) => {
    if (!repos.find((r) => r.id === repo.id)) {
        repos.push({
            id: repo.id, name: repo.name, owner: repo.owner.login, stars: repo.stargazers_count,
        });
        renderRepoList();
    }
};

const renderRepoList = () => {
    repoList.textContent = "";

    repos.forEach((repo) => {
        const div = document.createElement("div");
        const span = document.createElement("span");
        const btn = document.createElement("button");

        div.classList.add("repo-item");
        span.textContent = `${repo.name} by ${repo.owner} ( ⭐ ${repo.stars} )`;
        div.append(span);
        btn.classList.add("remove-button");
        btn.dataset.id = repo.id;
        btn.textContent = 'Удалить';
        div.appendChild(btn);

        repoList.appendChild(div);
    });
    setupRemoveButtons();
};
const setupRemoveButtons = () => {
    const removeButtons = document.querySelectorAll(".remove-button");
    removeButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            const repoId = parseInt(e.target.dataset.id, 10);
            removeRepository(repoId);
        });
    });
};
const removeRepository = (id) => {
    repos = repos.filter((repo) => repo.id !== id);
    renderRepoList();
};

input.addEventListener("input", debounce((event) => {
    if (event.key === " " && input.value.trim() === "") {
        event.preventDefault();
    } else fetchRepositories(event.target.value);
}, 400));

document.addEventListener("click", (e) => {
    if (!autocompleteList.contains(e.target) && e.target !== input) {
        autocompleteList.textContent = "";
    } else if (e.target === input) {
        fetchRepositories(e.target.value);
    }
});

function debounce(func, delay) {
    let timer;
    return function (...args) {
        const context = this;
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(context, args), delay);
    };
}